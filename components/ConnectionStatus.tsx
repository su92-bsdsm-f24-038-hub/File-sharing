"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoomStatus } from "@/types";

interface ConnectionStatusProps {
  status: RoomStatus;
  expiresAt?: number;
}

export function ConnectionStatus({ status, expiresAt }: ConnectionStatusProps) {
  const configs: Record<RoomStatus, { label: string; color: string; pulse: boolean }> = {
    idle: { label: "Not started", color: "bg-neutral-600", pulse: false },
    creating: { label: "Creating room…", color: "bg-yellow-500", pulse: true },
    waiting: { label: "Waiting for device…", color: "bg-yellow-400", pulse: true },
    connected: { label: "Connected", color: "bg-emerald-400", pulse: false },
    expired: { label: "Session expired", color: "bg-red-500", pulse: false },
    error: { label: "Error", color: "bg-red-500", pulse: false },
  };

  const cfg = configs[status];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2"
      >
        <span className="relative flex h-2.5 w-2.5">
          {cfg.pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.color}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${cfg.color}`} />
        </span>
        <span className="text-sm font-medium text-neutral-300">{cfg.label}</span>
        {status === "waiting" && expiresAt && <ExpiryBadge expiresAt={expiresAt} />}
      </motion.div>
    </AnimatePresence>
  );
}

function ExpiryBadge({ expiresAt }: { expiresAt: number }) {
  const [remaining, setRemaining] = useState(Math.max(0, expiresAt - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      const r = Math.max(0, expiresAt - Date.now());
      setRemaining(r);
      if (r <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const formatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return (
    <span className="ml-1 text-xs text-neutral-500 font-mono">
      (expires in {formatted})
    </span>
  );
}
