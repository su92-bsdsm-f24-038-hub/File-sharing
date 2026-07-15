"use client";

import { Suspense } from "react";
import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, KeyRound, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getSocket } from "@/lib/socket";
import { TransferPanel } from "@/components/TransferPanel";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RoomStatus } from "@/types";
import { Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "@/types";

const pinSchema = z.object({
  pin: z.string().length(4, "PIN must be 4 digits").regex(/^\d{4}$/, "PIN must be numeric"),
});
type PinForm = z.infer<typeof pinSchema>;

type JoinState =
  | { phase: "enter-pin" }
  | { phase: "joining" }
  | { phase: "connected"; socketId: string }
  | { phase: "error"; message: string }
  | { phase: "expired"; message: string };

function JoinPageInner() {
  const params = useParams<{ roomId: string }>();
  const searchParams = useSearchParams();
  const roomId = params.roomId;
  const prefilledPin = searchParams.get("pin") || "";

  const [state, setState] = useState<JoinState>({ phase: "enter-pin" });
  const [status, setStatus] = useState<RoomStatus>("idle");
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const hasAutoJoined = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<PinForm>({
    resolver: zodResolver(pinSchema),
    defaultValues: { pin: prefilledPin },
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const joinRoom = async (pin: string) => {
    setState({ phase: "joining" });
    setStatus("creating");

    const socket = getSocket();
    socketRef.current = socket;

    socket.off("room:peer_left");
    socket.off("room:expired");

    socket.on("room:peer_left", () => {
      setStatus("waiting");
    });

    socket.on("room:expired", ({ reason }) => {
      const msg =
        reason === "host_disconnected"
          ? "The host disconnected and closed the session."
          : "This session has expired. Ask the host to create a new one.";
      setState({ phase: "expired", message: msg });
      setStatus("expired");
    });

    socket.emit("room:join", { roomId, pin }, (res) => {
      if (res.success) {
        setState({ phase: "connected", socketId: socket.id || "" });
        setStatus("connected");
      } else {
        const msg =
          res.error === "room_not_found"
            ? "Room not found. The QR code may have expired."
            : res.error === "room_full"
            ? "This room is full. Only 2 devices can connect."
            : res.error === "invalid_pin"
            ? "Incorrect PIN. Check the PIN displayed on the laptop."
            : "Failed to join the room. Please try again.";
        setState({ phase: "error", message: msg });
        setStatus("error");
      }
    });
  };

  // Pre-fill + auto-join once
  useEffect(() => {
    if (prefilledPin && prefilledPin.match(/^\d{4}$/)) {
      setValue("pin", prefilledPin);
      if (!hasAutoJoined.current) {
        hasAutoJoined.current = true;
        joinRoom(prefilledPin);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledPin]);

  const onSubmitPin = async (data: PinForm) => {
    await joinRoom(data.pin);
  };

  const handleRetry = () => {
    setState({ phase: "enter-pin" });
    setStatus("idle");
    socketRef.current?.off("room:peer_left");
    socketRef.current?.off("room:expired");
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-900/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-fuchsia-900/10 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-5 py-4 flex items-center gap-2 border-b border-white/5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-[0_0_12px_rgba(124,58,237,0.4)]">
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-bold text-sm tracking-tight">QuickDrop</span>
        <div className="ml-auto">
          <ConnectionStatus status={status} />
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-8">
        <AnimatePresence mode="wait">
          {/* Enter PIN */}
          {state.phase === "enter-pin" && (
            <motion.div
              key="pin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-7 h-7 text-purple-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Enter PIN</h1>
                <p className="text-sm text-neutral-500">
                  Enter the 4-digit PIN shown on the laptop to connect.
                </p>
              </div>

              <GlassCard className="p-6" glow>
                <form onSubmit={handleSubmit(onSubmitPin)} className="flex flex-col gap-4" noValidate>
                  <Input
                    id="join-pin"
                    type="tel"
                    inputMode="numeric"
                    pattern="\d{4}"
                    maxLength={4}
                    label="4-digit PIN"
                    placeholder="1234"
                    error={errors.pin?.message}
                    className="text-center text-2xl font-black tracking-[0.5em] h-16"
                    {...register("pin")}
                  />
                  <Button type="submit" className="w-full" loading={isSubmitting}>
                    Connect to Session
                  </Button>
                </form>

                <div className="mt-5 pt-5 border-t border-white/5">
                  <p className="text-xs text-neutral-700 text-center">
                    Room:{" "}
                    <span className="text-neutral-500 font-mono">
                      {roomId?.slice(0, 8)}…
                    </span>
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Joining */}
          {state.phase === "joining" && (
            <motion.div
              key="joining"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Wifi className="w-7 h-7 text-purple-400" />
                </motion.div>
              </div>
              <p className="text-neutral-400 text-sm">Connecting to room…</p>
            </motion.div>
          )}

          {/* Connected */}
          {state.phase === "connected" && socketRef.current && (
            <motion.div
              key="connected"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full"
              style={{ height: "calc(100vh - 120px)" }}
            >
              <GlassCard
                className="flex flex-col overflow-hidden"
                style={{ height: "100%" } as React.CSSProperties}
              >
                <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                  </span>
                  <span className="text-sm font-medium">Connected ✓</span>
                  <span className="text-xs text-neutral-600 ml-auto font-mono">
                    {roomId?.slice(0, 8)}…
                  </span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <TransferPanel
                    socket={socketRef.current}
                    roomId={roomId}
                    socketId={state.socketId}
                  />
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Error */}
          {state.phase === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-sm text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <h2 className="text-xl font-bold mb-3">Connection Failed</h2>
              <p className="text-sm text-neutral-500 mb-8">{state.message}</p>
              <Button onClick={handleRetry} className="w-full">
                Try Again
              </Button>
            </motion.div>
          )}

          {/* Expired */}
          {state.phase === "expired" && (
            <motion.div
              key="expired"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-sm text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-neutral-800/50 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <WifiOff className="w-7 h-7 text-neutral-500" />
              </div>
              <h2 className="text-xl font-bold mb-3">Session Ended</h2>
              <p className="text-sm text-neutral-500 mb-8">{state.message}</p>
              <p className="text-xs text-neutral-700">
                Scan a new QR code from the laptop to start a new session.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <JoinPageInner />
    </Suspense>
  );
}
