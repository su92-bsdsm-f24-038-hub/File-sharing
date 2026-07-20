"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, ArrowRight, AlertCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UltrasonicReceiver } from "@/lib/ultrasonic";

export default function EnterCodePage() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (pin.length !== 4) {
      setError("Please enter a valid 4-digit PIN.");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";
      const res = await fetch(`${apiUrl}/api/room-by-pin/${pin}`);
      const data = await res.json();

      if (data.success && data.roomId) {
        router.push(`/join/${data.roomId}?pin=${pin}`);
      } else {
        setError("Room not found or expired.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleListen = async () => {
    try {
      const receiver = new UltrasonicReceiver();
      setIsListening(true);
      setError(null);
      await receiver.start((data) => {
        // e.g. "abc123def:4321"
        const [detectedRoom, detectedPin] = data.split(":");
        if (detectedRoom && detectedPin) {
          receiver.stop();
          router.push(`/join/${detectedRoom}?pin=${detectedPin}`);
        }
      });
      // Stop after 10s if nothing found
      setTimeout(() => {
        receiver.stop();
        if (isListening) {
          setIsListening(false);
          setError("No nearby sessions detected.");
        }
      }, 10000);
    } catch (e) {
      setIsListening(false);
      setError("Microphone access denied or not available.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[10%] right-[20%] w-[350px] h-[350px] rounded-full bg-violet-900/20 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <Logo className="w-14 h-14" />
          </Link>
          <h1 className="text-2xl font-bold">Enter Session Code</h1>
          <p className="text-sm text-neutral-500 mt-1 text-center">
            Type the 4-digit PIN shown on the host device.
          </p>
        </div>

        <GlassCard className="p-8" glow>
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <Input
              id="pin"
              type="text"
              maxLength={4}
              placeholder="e.g. 1234"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="text-center text-2xl tracking-[0.5em] font-mono h-16"
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full mt-2"
              loading={loading}
              disabled={pin.length !== 4}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Join Session
            </Button>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-neutral-500 uppercase tracking-widest">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full bg-white/5 hover:bg-white/10 text-neutral-300"
              onClick={handleListen}
              disabled={isListening}
            >
              {isListening ? (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary-orange animate-pulse" />
                  Listening...
                </div>
              ) : (
                "Listen for nearby session"
              )}
            </Button>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
