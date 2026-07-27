"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, LogOut, RefreshCw, Copy, Check, QrCode,
  Shield, User as UserIcon, Trash2
} from "lucide-react";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getSocket } from "@/lib/socket";
import { parseUserAgent, getLastDevice, setLastDevice, clearLastDevice, LastDevice } from "@/lib/utils";
import { getThemeForRoom, getThemeVariantConfig } from "@/lib/theme";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { TransferPanel } from "@/components/TransferPanel";
import { ProfileModal } from "@/components/ProfileModal";
import { ProLock } from "@/components/ProLock";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { RoomStatus } from "@/types";
import { Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "@/types";

const ROOM_EXPIRY_MS = 5 * 60 * 1000;

import { DashboardSkeleton } from "@/components/DashboardSkeleton";

export default function DashboardPage() {
  const { user, loading, logout, isPro } = useAuth();
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [lastDeviceState, setLastDeviceState] = useState<LastDevice | null>(null);

  useEffect(() => {
    const saved = getLastDevice();
    if (saved) {
      setLastDeviceState(saved);
    }
  }, []);

  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Check for upgraded success
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("upgraded") === "true") {
        // Show success animation or toast here
        alert("Success! You have been upgraded to Sync Pro.");
        // Remove param from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Socket event handlers
  const setupSocketListeners = useCallback(
    (socket: Socket<ServerToClientEvents, ClientToServerEvents>) => {
      socket.on("room:peer_joined", ({ socketId: peerId }) => {
        setPeerSocketId(peerId);
        setStatus("connected");
      });

      socket.on("room:state", ({ devices }) => {
        const peer = devices.find((d) => d.socketId !== socket.id);
        if (peer) {
          const dev = { deviceName: peer.deviceName, deviceType: peer.deviceType };
          setLastDevice(dev);
          setLastDeviceState(dev);
        }
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
    let token = "";
    try {
      token = await user.getIdToken();
    } catch (e) {
      console.error("Failed to get ID token", e);
      setStatus("error");
      setError("Failed to authenticate.");
      setIsCreating(false);
      return;
    }

    socket.emit("room:create", { token, deviceName, deviceType }, (res) => {
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
            : res.error === "free_plan_room_limit"
            ? "Free plan limit reached (1 active room)."
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
      socket.off("room:state");
      socket.off("room:peer_left");
      socket.off("room:expired");
    };
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
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
    return <DashboardSkeleton />;
  }

  if (!user) return null;

  const roomTheme = getThemeVariantConfig(getThemeForRoom(roomId || ""));

  return (
    <div 
      className="min-h-screen bg-indigo-black relative overflow-hidden"
      style={{
        "--room-accent": roomTheme.primary,
        "--room-glow": roomTheme.glow,
      } as React.CSSProperties}
    >
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[5%] w-[500px] h-[500px] rounded-full bg-primary-orange/15 blur-[120px] animate-blob" />
        <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-glow-orange/10 blur-[120px] animate-blob animation-delay-2000" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 px-6 py-4 bg-[#09090B]/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-10 h-10" />
          </Link>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="hidden sm:flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10"
            >
              <div className="w-6 h-6 rounded-full bg-primary-orange/20 border border-primary-orange/30 flex items-center justify-center">
                <UserIcon className="w-3 h-3 text-primary-orange" />
              </div>
              <span className="max-w-32 truncate">{user.displayName || user.email}</span>
              {isPro && (
                <span className="bg-gradient-to-r from-primary-orange to-glow-orange text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(255,122,26,0.3)] ml-1">PRO</span>
              )}
            </button>
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
          <p className="text-neutral-400">
            Generate a session, scan the QR on your phone, and start sharing instantly.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Room panel */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Session card */}
            <GlassCard className="p-8" glowColor={status === "connected" ? "emerald" : "primary"} glow={status === "connected" || status === "waiting"}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-sm text-neutral-300">Session</h2>
                <ConnectionStatus status={status} expiresAt={expiresAt || undefined} />
              </div>

              {/* QR / placeholder */}
              <div className="flex justify-center mb-8">
                <AnimatePresence mode="wait">
                  {roomId ? (
                    <motion.div
                      key="qr"
                      initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="relative"
                    >
                      {/* Pulsing Glow behind QR */}
                      <motion.div 
                        animate={status === "connected" ? { background: "rgba(16,185,129,0.3)", scale: [1, 1.2, 1] } : { background: roomTheme.glow, scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: status === "connected" ? 3 : 2, ease: "easeInOut" }}
                        className="absolute inset-[-15px] rounded-[32px] blur-xl -z-10"
                      />
                      <div className="p-5 rounded-[24px] bg-white shadow-xl">
                        <QRCodeDisplay value={joinUrl} size={180} />
                      </div>
                      <div className={`absolute -bottom-3 -right-3 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-500 ${status === "connected" ? "bg-emerald-accent shadow-emerald-accent/50" : "bg-room-accent shadow-room-accent/50"}`}>
                        {status === "connected" ? <Check className="w-5 h-5 text-white" /> : <QrCode className="w-5 h-5 text-white" />}
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
                      <div className="w-48 h-48 rounded-[24px] border-2 border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center">
                        <QrCode className="w-12 h-12 text-white/10" />
                      </div>
                      <p className="text-xs text-neutral-500 text-center max-w-48 mt-2">
                        Click &quot;New Session&quot; to generate a secure QR code
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* PIN display */}
              <AnimatePresence>
                {pin && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6"
                  >
                    <p className="text-xs text-neutral-500 text-center mb-3">4-digit PIN</p>
                    <div className="flex items-center justify-center gap-3">
                      {pin.split("").map((digit, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.1, y: -2 }}
                          className="w-14 h-16 rounded-xl bg-[#111217] border border-white/10 flex items-center justify-center text-3xl font-black tracking-widest text-white shadow-[inset_0_2px_10px_rgba(255,255,255,0.02)] relative overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-primary-orange/0 group-hover:bg-primary-orange/10 transition-colors" />
                          <span className="relative z-10">{digit}</span>
                        </motion.div>
                      ))}
                      <button
                        onClick={() => copyToClipboard(pin, "pin")}
                        className="ml-2 p-3 rounded-xl text-neutral-500 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                        title="Copy PIN"
                      >
                        {copied === "pin" ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
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
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onClick={() => copyToClipboard(joinUrl, "url")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#111217] border border-white/10 text-xs text-neutral-400 hover:text-white hover:border-primary-orange/30 transition-all mb-6 group"
                  >
                    <span className="truncate flex-1 text-left">{joinUrl}</span>
                    {copied === "url" ? (
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Copy className="w-4 h-4 flex-shrink-0 group-hover:text-primary-orange transition-colors" />
                    )}
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* New session button */}
              <div className="w-full flex flex-col gap-2">
                <Button
                  className={`w-full h-12 rounded-xl transition-all ${status === "connected" ? "bg-white/5 text-neutral-500 border-0" : "bg-gradient-to-r from-primary-orange to-glow-orange shadow-[0_0_20px_rgba(255,122,26,0.3)] hover:shadow-[0_0_30px_rgba(255,122,26,0.4)] border-0 text-white"}`}
                  onClick={createRoom}
                  loading={isCreating}
                  icon={<RefreshCw className="w-4 h-4" />}
                  disabled={status === "connected"}
                >
                  {roomId ? "New Session" : "Generate Session"}
                </Button>

                {/* Quick Action: Send to Last Device */}
                {lastDeviceState && status !== "connected" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: "auto" }}
                    className="w-full flex items-center gap-2 overflow-hidden"
                  >
                    <ProLock featureName="Send to Last Device">
                      <div className="flex-1 flex gap-2">
                        <Button
                          variant="secondary"
                          className="flex-1 h-10 rounded-xl bg-white/5 border border-primary-orange/20 hover:border-primary-orange/40 hover:bg-white/10 text-xs transition-colors"
                          onClick={createRoom}
                          disabled={isCreating}
                        >
                          <span className="truncate">Send to {lastDeviceState.deviceName} again</span>
                        </Button>
                        <button
                          onClick={() => { clearLastDevice(); setLastDeviceState(null); }}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 text-neutral-500 transition-colors shrink-0"
                          title="Forget device"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </ProLock>
                  </motion.div>
                )}
              </div>

              {status === "connected" && (
                <motion.p 
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-emerald-400 text-center mt-4 flex items-center justify-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Device connected — ready to transfer
                </motion.p>
              )}
            </GlassCard>

            {/* Security card */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-primary-orange" />
                <span className="text-sm font-semibold text-white">Security</span>
              </div>
              <ul className="space-y-2.5">
                {[
                  "UUID room IDs (crypto-random)",
                  "4-digit PIN required to join",
                  "Max 2 devices per room",
                  "Auto-expires after 5 min inactive",
                  "In-memory only — nothing stored",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-neutral-400">
                    <span className="text-primary-orange mt-1 text-[10px]">●</span>
                    {item}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>

          {/* Right: Transfer panel */}
          <div className="lg:col-span-3 min-h-0">
            <GlassCard className="h-[700px] flex flex-col overflow-hidden relative min-h-0">
              <div className="absolute inset-0 bg-gradient-to-b from-primary-orange/5 to-transparent pointer-events-none" />
              
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between relative z-10 bg-[#15171D]/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      status === "connected" ? "bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-neutral-600"
                    }`}
                  />
                  <span className="text-base font-semibold">Transfer Area</span>
                </div>
                {peerSocketId && (
                  <span className="text-xs text-neutral-500 font-mono bg-white/5 px-2 py-1 rounded-md">
                    peer: {peerSocketId.slice(0, 8)}…
                  </span>
                )}
              </div>

              {status === "connected" && socketRef.current && roomId ? (
                <div className="flex-1 overflow-hidden relative z-10 bg-[#09090B]/40 flex flex-col min-h-0">
                  <TransferPanel
                    socket={socketRef.current}
                    roomId={roomId}
                    socketId={socketId}
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 relative z-10">
                  <motion.div
                    className="w-24 h-24 rounded-[32px] bg-primary-orange/5 border border-primary-orange/10 flex items-center justify-center shadow-[inset_0_0_40px_rgba(255,122,26,0.05)]"
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <QrCode className="w-10 h-10 text-primary-orange/40" />
                  </motion.div>
                  <p className="text-base text-neutral-500 text-center max-w-xs">
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
