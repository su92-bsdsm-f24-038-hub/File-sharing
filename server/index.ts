import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import crypto from "crypto";

const app = express();
const httpServer = createServer(app);

const FRONTEND_URLS = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ["http://localhost:3000", "https://quickdrop.agent0s.dev", "http://quickdrop.agent0s.dev"];
const PORT = parseInt(process.env.SOCKET_PORT || "4000", 10);
const ROOM_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
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
  devices: Map<string, RoomDevice>; // max 4
  pendingFiles: Map<string, PendingFile>;
  expiryTimer: ReturnType<typeof setTimeout>;
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
  return setTimeout(() => {
    const room = rooms.get(roomId);
    if (!room) return;
    room.devices.forEach((_, socketId) => {
      io.to(socketId).emit("room:expired", { reason: "inactivity" });
    });
    rooms.delete(roomId);
  }, ROOM_EXPIRY_MS);
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
    (
      { userId, deviceName, deviceType }: { userId: string; deviceName: string; deviceType: DeviceType },
      callback: (res: { success: boolean; roomId?: string; pin?: string; error?: string }) => void
    ) => {
      if (!userId) return callback({ success: false, error: "unauthenticated" });
      if (!checkRateLimit(userId)) {
        return callback({ success: false, error: "rate_limit_exceeded" });
      }

      const roomId = crypto.randomUUID();
      const pin = generatePin();

      const expiryTimer = scheduleRoomExpiry(roomId);

      const room: Room = {
        id: roomId,
        pin,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        devices: new Map([[socket.id, { socketId: socket.id, deviceName: deviceName || "Unknown", deviceType: deviceType || "desktop", joinedAt: Date.now() }]]),
        pendingFiles: new Map(),
        expiryTimer,
      };

      rooms.set(roomId, room);
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
      if (room.devices.size >= 4) return callback({ success: false, error: "room_full" });
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
      if (fileSize > MAX_FILE_SIZE) {
        return callback({ success: false, error: "file_too_large" });
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
  console.log(`🚀 QuickDrop Socket Server running on http://localhost:${PORT}`);
});
