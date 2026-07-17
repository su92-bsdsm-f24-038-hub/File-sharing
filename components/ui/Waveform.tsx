"use client";

import { motion } from "framer-motion";

interface WaveformProps {
  isPlaying: boolean;
  color?: string;
  className?: string;
}

export function Waveform({ isPlaying, color = "#22D3EE", className = "" }: WaveformProps) {
  const bars = Array.from({ length: 24 });
  
  return (
    <div className={`flex items-center justify-center gap-[3px] h-10 ${className}`}>
      {bars.map((_, i) => {
        // Create a pleasing curve shape
        const baseHeight = 20 + Math.sin(i * 0.4) * 15 + Math.random() * 10;
        const activeHeight = baseHeight + 25 + Math.random() * 30;
        
        return (
          <motion.div
            key={i}
            className="w-[3px] rounded-full"
            style={{ backgroundColor: color }}
            initial={{ height: "15%" }}
            animate={
              isPlaying
                ? {
                    height: [`${baseHeight}%`, `${activeHeight}%`, `${baseHeight}%`],
                  }
                : {
                    height: "15%",
                  }
            }
            transition={
              isPlaying
                ? {
                    duration: 0.6 + Math.random() * 0.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.05,
                  }
                : {
                    duration: 0.3,
                    ease: "easeOut",
                  }
            }
          />
        );
      })}
    </div>
  );
}
