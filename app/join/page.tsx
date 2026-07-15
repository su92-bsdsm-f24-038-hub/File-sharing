"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, ArrowRight, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function EnterCodePage() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)]">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">QuickDrop</span>
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
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
