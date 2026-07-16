"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, LogOut, RefreshCw, Copy, Check, QrCode,
  Shield, User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getSocket } from "@/lib/socket";
import { parseUserAgent } from "@/lib/utils";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { TransferPanel } from "@/components/TransferPanel";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { RoomStatus } from "@/types";
import { Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "@/types";

const ROOM_EXPIRY_MS = 5 * 60 * 1000;

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [roomId, setRoomId] = useState<string | null>(null);
  const [pin, setPin] = useState<string | null>(null);
  const [status, setStatus] = useState<RoomStatus>("idle");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [peerSocketId, setPeerSocketId] = useState<string | null>(null);
  const [socketId, setSocketId] = useState<string>("");
  const [copied, setCopied] = useState<"url" | "pin" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Socket event handlers
  const setupSocketListeners = useCallback(
    (socket: Socket<ServerToClientEvents, ClientToServerEvents>) => {
      socket.on("room:peer_joined", ({ socketId: peerId }) => {
        setPeerSocketId(peerId);
        setStatus("connected");
      });

      socket.on("room:peer_left", () => {
        setPeerSocketId(null);
        setStatus("waiting");
      });

      socket.on("room:expired", ({ reason }) => {
        setStatus("expired");
        setRoomId(null);
        setPin(null);
        setExpiresAt(null);
        setPeerSocketId(null);
        const msg =
          reason === "host_disconnected"
            ? "The host disconnected."
            : reason === "inactivity"
            ? "Session expired due to inactivity."
            : "Session has ended.";
        setError(msg);
      });
    },
    []
  );

  // Create a new room
  const createRoom = useCallback(async () => {
    if (!user) return;
    setIsCreating(true);
    setError(null);
    setStatus("creating");
    setRoomId(null);
    setPin(null);
    setPeerSocketId(null);

    const socket = getSocket();
    socketRef.current = socket;
    setSocketId(socket.id || "");

    socket.off("room:peer_joined");
    socket.off("room:peer_left");
    socket.off("room:expired");
    setupSocketListeners(socket);

    const { deviceName, deviceType } = parseUserAgent(navigator.userAgent);
    socket.emit("room:create", { userId: user.uid, deviceName, deviceType }, (res) => {
      setIsCreating(false);
      if (res.success && res.roomId && res.pin) {
        setRoomId(res.roomId);
        setPin(res.pin);
        setStatus("waiting");
        setExpiresAt(Date.now() + ROOM_EXPIRY_MS);
        setSocketId(socket.id || "");
      } else {
        setStatus("error");
        setError(
          res.error === "rate_limit_exceeded"
            ? "Too many rooms created. Wait 1 minute."
            : "Failed to create room. Is the socket server running?"
        );
      }
    });
  }, [user, setupSocketListeners]);

  // Connect socket on mount
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    socketRef.current = socket;
    socket.on("connect", () => setSocketId(socket.id || ""));
    return () => {
      socket.off("connect");
      socket.off("room:peer_joined");
      socket.off("room:peer_left");
      socket.off("room:expired");
    };
  }, [user]);

  const handleLogout = async () => {
    socketRef.current?.disconnect();
    await logout();
    router.replace("/login");
  };

  const copyToClipboard = async (text: string, type: "url" | "pin") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // not available
    }
  };

  const joinUrl =
    roomId && typeof window !== "undefined"
      ? `${window.location.origin}/join/${roomId}?pin=${pin}`
      : "";


  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col gap-4 w-80">
          <LoadingSkeleton lines={3} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[5%] w-[500px] h-[500px] rounded-full bg-violet-900/15 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-purple-900/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)]">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight">QuickDrop</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-neutral-500">
              <div className="w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <UserIcon className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <span className="max-w-32 truncate">{user.displayName || user.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} icon={<LogOut className="w-4 h-4" />}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-neutral-500">
            Generate a session, scan the QR on your phone, and start sharing instantly.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Room panel */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Session card */}
            <GlassCard className="p-6" glow={status === "connected"}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-sm text-neutral-300">Session</h2>
                <ConnectionStatus status={status} expiresAt={expiresAt || undefined} />
              </div>

              {/* QR / placeholder */}
              <div className="flex justify-center mb-5">
                <AnimatePresence mode="wait">
                  {roomId ? (
                    <motion.div
                      key="qr"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative"
                    >
                      <div className="p-4 rounded-2xl bg-white">
                        <QRCodeDisplay value={joinUrl} size={168} />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-[0_0_12px_rgba(124,58,237,0.5)]">
                        <QrCode className="w-4 h-4 text-white" />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="w-44 h-44 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center">
                        <QrCode className="w-12 h-12 text-white/15" />
                      </div>
                      <p className="text-xs text-neutral-600 text-center">
                        Click &quot;New Session&quot; to generate a QR code
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* PIN display */}
              <AnimatePresence>
                {pin && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-4"
                  >
                    <p className="text-xs text-neutral-600 text-center mb-2">4-digit PIN</p>
                    <div className="flex items-center justify-center gap-2">
                      {pin.split("").map((digit, i) => (
                        <div
                          key={i}
                          className="w-12 h-14 rounded-xl bg-white/[0.06] border border-purple-500/20 flex items-center justify-center text-2xl font-black tracking-widest text-purple-300"
                        >
                          {digit}
                        </div>
                      ))}
                      <button
                        onClick={() => copyToClipboard(pin, "pin")}
                        className="ml-1 p-2 rounded-xl text-neutral-600 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                        title="Copy PIN"
                      >
                        {copied === "pin" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Copy URL */}
              <AnimatePresence>
                {joinUrl && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => copyToClipboard(joinUrl, "url")}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/8 text-xs text-neutral-600 hover:text-neutral-400 hover:border-purple-500/20 transition-all mb-4"
                  >
                    <span className="truncate flex-1 text-left">{joinUrl}</span>
                    {copied === "url" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 flex-shrink-0" />
                    )}
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-4"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* New session button */}
              <Button
                className="w-full"
                onClick={createRoom}
                loading={isCreating}
                icon={<RefreshCw className="w-4 h-4" />}
                disabled={status === "connected"}
              >
                {roomId ? "New Session" : "Generate Session"}
              </Button>

              {status === "connected" && (
                <p className="text-xs text-emerald-500/70 text-center mt-3">
                  ✓ Device connected — transfer panel is live
                </p>
              )}
            </GlassCard>

            {/* Security card */}
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-neutral-400">Security</span>
              </div>
              <ul className="space-y-1.5">
                {[
                  "UUID room IDs (crypto-random)",
                  "4-digit PIN required to join",
                  "Max 2 devices per room",
                  "Auto-expires after 5 min inactive",
                  "In-memory only — nothing stored",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-neutral-600">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>

          {/* Right: Transfer panel */}
          <div className="lg:col-span-3">
            <GlassCard className="h-[600px] flex flex-col overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      status === "connected" ? "bg-emerald-400" : "bg-neutral-700"
                    }`}
                  />
                  <span className="text-sm font-medium">Transfer</span>
                </div>
                {peerSocketId && (
                  <span className="text-xs text-neutral-600 font-mono">
                    peer: {peerSocketId.slice(0, 8)}…
                  </span>
                )}
              </div>

              {status === "connected" && socketRef.current && roomId ? (
                <div className="flex-1 overflow-hidden">
                  <TransferPanel
                    socket={socketRef.current}
                    roomId={roomId}
                    socketId={socketId}
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                  <motion.div
                    className="w-20 h-20 rounded-3xl bg-purple-500/5 border border-purple-500/10 flex items-center justify-center"
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <QrCode className="w-9 h-9 text-purple-500/40" />
                  </motion.div>
                  <p className="text-sm text-neutral-600 text-center max-w-56">
                    {status === "waiting"
                      ? "Waiting for a device to scan the QR and connect…"
                      : "Generate a session to start sharing files and text."}
                  </p>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
