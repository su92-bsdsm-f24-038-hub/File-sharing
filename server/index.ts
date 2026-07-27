import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import * as admin from "firebase-admin";

// Load .env.local manually since ts-node doesn't do it by default
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, "utf-8");
    // Match KEY="...multi-line..." or KEY=value
    const re = /^([\w.]+)\s*=\s*("[\s\S]*?"|[^\n]*)/gm;
    let m: RegExpExecArray | null;
    while ((m = re.exec(raw)) !== null) {
      const key = m[1];
      let value = m[2];
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/\\n/g, "\n");
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
} catch (e) {
  console.log("Could not load .env.local");
}

if (!admin.apps.length && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const app = express();
const httpServer = createServer(app);

const FRONTEND_URLS = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ["http://localhost:3000", "https://quickdrop.agent0s.dev", "http://quickdrop.agent0s.dev"];
const PORT = parseInt(process.env.SOCKET_PORT || "4000", 10);
const ROOM_EXPIRY_MS_FREE = 5 * 60 * 1000; // 5 minutes
const ROOM_EXPIRY_MS_PRO = 30 * 60 * 1000; // 30 minutes
const MAX_FILE_SIZE_FREE = 50 * 1024 * 1024; // 50 MB
const MAX_FILE_SIZE_PRO = 200 * 1024 * 1024; // 200 MB
const MAX_DEVICES_FREE = 2;
const MAX_DEVICES_PRO = 4;
const CHUNK_SIZE = 256 * 1024; // 256 KB
const MAX_ROOMS_PER_MINUTE = 5;

const ALLOWED_EXTENSIONS = new Set([
  "jpg","jpeg","png","gif","webp","svg",
  "pdf","txt","md","csv","json","xml",
  "zip","tar","gz","7z",
  "mp4","webm","mp3","ogg","wav","m4a",
  "doc","docx","xls","xlsx","ppt","pptx",
  "ts","js","html","css","py","rb","go","rs","java",
]);

// ─── Types ────────────────────────────────────────────────────────────────────

interface PendingFile {
  transferId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  totalChunks: number;
  receivedChunks: number;
  chunks: Buffer[];
  senderId: string;
}

type DeviceType = "desktop" | "mobile" | "tablet";

interface RoomDevice {
  socketId: string;
  deviceName: string;
  deviceType: DeviceType;
  joinedAt: number;
}

interface Room {
  id: string;
  pin: string;
  createdAt: number;
  lastActivity: number;
  devices: Map<string, RoomDevice>; // max 2 for free, 4 for pro
  pendingFiles: Map<string, PendingFile>;
  expiryTimer: ReturnType<typeof setTimeout>;
  isPro: boolean;
  ownerId: string;
}

// ─── State ────────────────────────────────────────────────────────────────────

const rooms = new Map<string, Room>();
const roomCreationLog = new Map<string, number[]>(); // userId -> timestamps

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function sanitizeText(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

function isAllowedExtension(filename: string): boolean {
  return ALLOWED_EXTENSIONS.has(getFileExtension(filename));
}

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const windowStart = now - 60_000;
  const history = roomCreationLog.get(userId) || [];
  const recent = history.filter((t) => t > windowStart);
  if (recent.length >= MAX_ROOMS_PER_MINUTE) return false;
  recent.push(now);
  roomCreationLog.set(userId, recent);
  return true;
}

function scheduleRoomExpiry(roomId: string): ReturnType<typeof setTimeout> {
  const room = rooms.get(roomId);
  const expiryMs = room && room.isPro ? ROOM_EXPIRY_MS_PRO : ROOM_EXPIRY_MS_FREE;
  return setTimeout(() => {
    const r = rooms.get(roomId);
    if (!r) return;
    r.devices.forEach((_, socketId) => {
      io.to(socketId).emit("room:expired", { reason: "inactivity" });
    });
    rooms.delete(roomId);
  }, expiryMs);
}

function broadcastRoomState(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;
  const devices = Array.from(room.devices.values());
  io.to(roomId).emit("room:state", { devices });
}

function resetRoomExpiry(room: Room): void {
  clearTimeout(room.expiryTimer);
  room.lastActivity = Date.now();
  room.expiryTimer = scheduleRoomExpiry(room.id);
}

function deleteRoom(roomId: string): void {
  const room = rooms.get(roomId);
  if (room) {
    clearTimeout(room.expiryTimer);
    rooms.delete(roomId);
  }
}

// ─── CORS & Health ────────────────────────────────────────────────────────────

app.use(cors({ origin: FRONTEND_URLS, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", rooms: rooms.size, ts: Date.now() });
});

app.get("/api/room-by-pin/:pin", (req, res) => {
  const pin = req.params.pin;
  for (const [roomId, room] of rooms.entries()) {
    if (room.pin === pin) {
      return res.json({ success: true, roomId });
    }
  }
  res.status(404).json({ success: false, error: "room_not_found" });
});

// ─── Socket.IO ────────────────────────────────────────────────────────────────

const io = new Server(httpServer, {
  cors: { origin: FRONTEND_URLS, credentials: true },
  maxHttpBufferSize: CHUNK_SIZE + 4096, // chunk + metadata headroom
});

io.on("connection", (socket: Socket) => {
  console.log(`[+] Socket connected: ${socket.id}`);

  // ── Room Creation ────────────────────────────────────────────────────────

  socket.on(
    "room:create",
    async (
      { token, deviceName, deviceType }: { token: string; deviceName: string; deviceType: DeviceType },
      callback: (res: { success: boolean; roomId?: string; pin?: string; error?: string }) => void
    ) => {
      if (!token) return callback({ success: false, error: "unauthenticated" });
      
      let userId: string;
      let isPro = false;
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        userId = decodedToken.uid;
        isPro = decodedToken.plan === "pro";
      } catch (e) {
        return callback({ success: false, error: "invalid_token" });
      }

      if (!checkRateLimit(userId)) {
        return callback({ success: false, error: "rate_limit_exceeded" });
      }

      // Check max rooms (Free: 1 active room, Pro: unlimited)
      if (!isPro) {
        let activeCount = 0;
        for (const r of rooms.values()) {
          if (r.ownerId === userId) activeCount++;
        }
        if (activeCount >= 1) {
          return callback({ success: false, error: "free_plan_room_limit" });
        }
      }

      const roomId = crypto.randomUUID();
      const pin = generatePin();

      const room: Room = {
        id: roomId,
        pin,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        devices: new Map([[socket.id, { socketId: socket.id, deviceName: deviceName || "Unknown", deviceType: deviceType || "desktop", joinedAt: Date.now() }]]),
        pendingFiles: new Map(),
        expiryTimer: setTimeout(() => {}, 0), // Will be overridden immediately below
        isPro,
        ownerId: userId,
      };

      rooms.set(roomId, room);
      room.expiryTimer = scheduleRoomExpiry(roomId);
      socket.join(roomId);
      socket.data.roomId = roomId;

      console.log(`[room:create] ${roomId} by ${userId}`);
      callback({ success: true, roomId, pin });
      
      broadcastRoomState(roomId);
    }
  );

  // ── Room Join ────────────────────────────────────────────────────────────

  socket.on(
    "room:join",
    (
      { roomId, pin, deviceName, deviceType }: { roomId: string; pin: string; deviceName: string; deviceType: DeviceType },
      callback: (res: { success: boolean; error?: string }) => void
    ) => {
      const room = rooms.get(roomId);
      if (!room) return callback({ success: false, error: "room_not_found" });
      const maxDevices = room.isPro ? MAX_DEVICES_PRO : MAX_DEVICES_FREE;
      if (room.devices.size >= maxDevices) return callback({ success: false, error: "room_full" });
      if (room.pin !== pin) return callback({ success: false, error: "invalid_pin" });

      room.devices.set(socket.id, { socketId: socket.id, deviceName: deviceName || "Unknown", deviceType: deviceType || "desktop", joinedAt: Date.now() });
      socket.join(roomId);
      socket.data.roomId = roomId;

      resetRoomExpiry(room);

      socket.to(roomId).emit("room:peer_joined", { socketId: socket.id });
      broadcastRoomState(roomId);

      console.log(`[room:join] ${socket.id} joined ${roomId}`);
      callback({ success: true });
    }
  );

  // ── Text Transfer ─────────────────────────────────────────────────────────

  socket.on(
    "transfer:text",
    (
      { roomId, id, text, targetId }: { roomId: string; id: string; text: string; targetId?: string },
      callback: (res: { success: boolean; error?: string }) => void
    ) => {
      const room = rooms.get(roomId);
      if (!room || !room.devices.has(socket.id)) {
        return callback({ success: false, error: "not_in_room" });
      }

      const safe = text.slice(0, 10_000);
      resetRoomExpiry(room);

      const payload = {
        id,
        text: safe,
        senderId: socket.id,
        timestamp: Date.now(),
      };

      if (targetId && targetId !== "all") {
        socket.to(targetId).emit("transfer:text_received", payload);
      } else {
        socket.to(roomId).emit("transfer:text_received", payload);
      }

      callback({ success: true });
    }
  );

  // ── File Transfer: Initiate ───────────────────────────────────────────────

  socket.on(
    "transfer:file_init",
    (
      {
        roomId,
        transferId,
        fileName,
        fileType,
        fileSize,
        totalChunks,
        targetId,
      }: {
        roomId: string;
        transferId: string;
        fileName: string;
        fileType: string;
        fileSize: number;
        totalChunks: number;
        targetId?: string;
      },
      callback: (res: { success: boolean; error?: string }) => void
    ) => {
      const room = rooms.get(roomId);
      if (!room || !room.devices.has(socket.id)) {
        return callback({ success: false, error: "not_in_room" });
      }

      const maxFileSize = room.isPro ? MAX_FILE_SIZE_PRO : MAX_FILE_SIZE_FREE;
      if (fileSize > maxFileSize) {
        return callback({ success: false, error: "file_too_large" });
      }

      if (!room.isPro) {
        if (fileType.startsWith("video/") || fileName.endsWith(".zip") || fileType.includes("zip")) {
          return callback({ success: false, error: "pro_plan_required" });
        }
      }

      if (!isAllowedExtension(fileName)) {
        return callback({ success: false, error: "file_type_not_allowed" });
      }

      const pending: PendingFile = {
        transferId,
        fileName,
        fileType,
        fileSize,
        totalChunks,
        receivedChunks: 0,
        chunks: new Array(totalChunks),
        senderId: socket.id,
      };
      room.pendingFiles.set(transferId, pending);
      resetRoomExpiry(room);

      const payload = {
        transferId,
        fileName,
        fileType,
        fileSize,
        totalChunks,
        senderId: socket.id,
      };

      if (targetId && targetId !== "all") {
        socket.to(targetId).emit("transfer:file_incoming", payload);
      } else {
        socket.to(roomId).emit("transfer:file_incoming", payload);
      }

      callback({ success: true });
    }
  );

  // ── File Transfer: Chunk ──────────────────────────────────────────────────

  socket.on(
    "transfer:file_chunk",
    (
      {
        roomId,
        transferId,
        chunkIndex,
        data,
        targetId,
      }: {
        roomId: string;
        transferId: string;
        chunkIndex: number;
        data: ArrayBuffer | Buffer;
        targetId?: string;
      },
      callback: (res: { success: boolean; chunkIndex?: number; error?: string }) => void
    ) => {
      const room = rooms.get(roomId);
      if (!room || !room.devices.has(socket.id)) {
        return callback({ success: false, error: "not_in_room" });
      }

      const pending = room.pendingFiles.get(transferId);
      if (!pending) return callback({ success: false, error: "transfer_not_found" });

      pending.chunks[chunkIndex] = Buffer.isBuffer(data) ? data : Buffer.from(data);
      pending.receivedChunks++;
      resetRoomExpiry(room);

      callback({ success: true, chunkIndex });

      const payload = {
        transferId,
        chunkIndex,
        data: pending.chunks[chunkIndex],
        receivedChunks: pending.receivedChunks,
        totalChunks: pending.totalChunks,
      };

      if (targetId && targetId !== "all") {
        socket.to(targetId).emit("transfer:file_chunk_received", payload);
      } else {
        socket.to(roomId).emit("transfer:file_chunk_received", payload);
      }

      if (pending.receivedChunks === pending.totalChunks) {
        const completePayload = {
          transferId,
          fileName: pending.fileName,
          fileType: pending.fileType,
          fileSize: pending.fileSize,
        };
        if (targetId && targetId !== "all") {
          socket.to(targetId).emit("transfer:file_complete", completePayload);
        } else {
          socket.to(roomId).emit("transfer:file_complete", completePayload);
        }
        socket.emit("transfer:file_complete_ack", { transferId });
        room.pendingFiles.delete(transferId);
      }
    }
  );

  // ── Transfer: Reactions ──────────────────────────────────────────────────

  socket.on(
    "transfer:react",
    (
      { roomId, targetId, messageId, emoji, deviceName }: { roomId: string; targetId?: string; messageId: string; emoji: string; deviceName: string },
      callback: (res: { success: boolean; error?: string }) => void
    ) => {
      const room = rooms.get(roomId);
      if (!room || !room.devices.has(socket.id)) {
        return callback({ success: false, error: "not_in_room" });
      }

      resetRoomExpiry(room);

      const payload = { messageId, emoji, deviceName };

      if (targetId && targetId !== "all") {
        socket.to(targetId).emit("transfer:reaction_received", payload);
      } else {
        socket.to(roomId).emit("transfer:reaction_received", payload);
      }

      callback({ success: true });
    }
  );

  // ── Transfer: Delete ─────────────────────────────────────────────────────

  socket.on(
    "transfer:delete",
    (
      { roomId, targetId, messageId }: { roomId: string; targetId?: string; messageId: string },
      callback: (res: { success: boolean; error?: string }) => void
    ) => {
      const room = rooms.get(roomId);
      if (!room || !room.devices.has(socket.id)) {
        return callback({ success: false, error: "not_in_room" });
      }

      resetRoomExpiry(room);

      const payload = { messageId };

      if (targetId && targetId !== "all") {
        socket.to(targetId).emit("transfer:delete_received", payload);
      } else {
        socket.to(roomId).emit("transfer:delete_received", payload);
      }

      callback({ success: true });
    }
  );

  // ── Disconnect ────────────────────────────────────────────────────────────

  socket.on("disconnect", () => {
    console.log(`[-] Socket disconnected: ${socket.id}`);
    const roomId = socket.data.roomId as string | undefined;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    room.devices.delete(socket.id);

    if (room.devices.size === 0) {
      deleteRoom(roomId);
    } else {
      io.to(roomId).emit("room:peer_left", {
        socketId: socket.id,
      });
      broadcastRoomState(roomId);
    }
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`🚀 Sync Socket Server running on http://localhost:${PORT}`);
});
