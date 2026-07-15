"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { QRSkeleton } from "@/components/ui/LoadingSkeleton";
import { motion } from "framer-motion";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export function QRCodeDisplay({ value, size = 200 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!value || !canvasRef.current) return;
    setReady(false);
    setError(false);

    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#00000000", // transparent background
      },
      errorCorrectionLevel: "M",
    })
      .then(() => setReady(true))
      .catch(() => setError(true));
  }, [value, size]);

  if (error) {
    return (
      <div className="flex items-center justify-center w-[200px] h-[200px] rounded-2xl bg-red-500/10 border border-red-500/20">
        <span className="text-red-400 text-sm">QR Error</span>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {!ready && <QRSkeleton />}
      <motion.canvas
        ref={canvasRef}
        width={size}
        height={size}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: ready ? 1 : 0, scale: ready ? 1 : 0.95 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl"
        style={{ display: "block" }}
      />
    </div>
  );
}
