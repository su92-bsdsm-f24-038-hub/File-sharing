"use client";
import React from "react";
import { cn } from "@/lib/utils";

export default function Earth({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto flex items-center justify-center h-[300px] w-[300px]", className)}>
      <div className="absolute inset-0 rounded-full border border-white/20 bg-blue-900/10 shadow-[0_0_50px_rgba(50,115,255,0.4)] animate-spin" style={{ animationDuration: '20s' }}>
        <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-[radial-gradient(circle,rgba(59,130,246,0.3)_0%,transparent_70%)] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-[radial-gradient(circle,rgba(255,122,26,0.2)_0%,transparent_70%)] rounded-full" />
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-30 text-white fill-current">
          {/* Simple grid lines for globe effect */}
          <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <ellipse cx="50" cy="50" rx="49" ry="20" fill="none" stroke="currentColor" strokeWidth="0.5" transform="rotate(45 50 50)" />
          <ellipse cx="50" cy="50" rx="49" ry="20" fill="none" stroke="currentColor" strokeWidth="0.5" transform="rotate(-45 50 50)" />
          <line x1="50" y1="1" x2="50" y2="99" stroke="currentColor" strokeWidth="0.5" />
          <line x1="1" y1="50" x2="99" y2="50" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#000000_100%)] rounded-full pointer-events-none" />
    </div>
  );
}
