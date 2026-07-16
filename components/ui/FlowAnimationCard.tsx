"use client";

import { motion } from "framer-motion";
import { FileText, FileVideo, Globe, Image as ImageIcon, Link2 } from "lucide-react";
import { GlassCard } from "./GlassCard";

interface FlowAnimationCardProps {
  className?: string;
}

export function FlowAnimationCard({ className }: FlowAnimationCardProps) {
  return (
    <GlassCard className={`relative overflow-hidden ${className}`} glowColor="primary" glow>
      {/* Container aspect ratio to ensure SVG scales nicely */}
      <div className="relative w-full aspect-[16/9] min-h-[300px] flex items-center justify-center pointer-events-none">
        
        {/* SVG Canvas */}
        <svg 
          viewBox="0 0 600 400" 
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="1" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
            
            <filter id="glow-blur">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Static paths (subtle background tracks) */}
          <path d="M 100 80 Q 250 150 400 200" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
          <path d="M 100 160 Q 250 180 400 200" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
          <path d="M 100 240 Q 250 210 400 200" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
          <path d="M 100 320 Q 250 250 400 200" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />

          {/* Animated Paths (traveling pulses) */}
          {/* Path 1 */}
          <path d="M 100 80 Q 250 150 400 200" fill="none" stroke="url(#flow-gradient)" strokeWidth="2.5" strokeDasharray="60 300" filter="url(#glow-blur)">
            <animate attributeName="stroke-dashoffset" values="360;0" dur="2.5s" repeatCount="indefinite" />
          </path>
          
          {/* Path 2 */}
          <path d="M 100 160 Q 250 180 400 200" fill="none" stroke="url(#flow-gradient)" strokeWidth="2.5" strokeDasharray="60 300" filter="url(#glow-blur)">
            <animate attributeName="stroke-dashoffset" values="360;0" dur="2.8s" repeatCount="indefinite" />
          </path>

          {/* Path 3 */}
          <path d="M 100 240 Q 250 210 400 200" fill="none" stroke="url(#flow-gradient)" strokeWidth="2.5" strokeDasharray="60 300" filter="url(#glow-blur)">
            <animate attributeName="stroke-dashoffset" values="360;0" dur="2.2s" repeatCount="indefinite" />
          </path>

          {/* Path 4 */}
          <path d="M 100 320 Q 250 250 400 200" fill="none" stroke="url(#flow-gradient)" strokeWidth="2.5" strokeDasharray="60 300" filter="url(#glow-blur)">
            <animate attributeName="stroke-dashoffset" values="360;0" dur="2.6s" repeatCount="indefinite" />
          </path>
          
          {/* Central Hub Node (QuickDrop Server) */}
          {/* Outer breathing ring (Blue/Cyan) */}
          <circle cx="400" cy="200" r="24" fill="#3B82F6" filter="url(#glow-blur)">
            <animate attributeName="r" values="20;32;20" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
          </circle>

          {/* Flashing Emerald Ring */}
          <circle cx="400" cy="200" r="14" fill="none" stroke="#10B981" strokeWidth="2" filter="url(#glow-blur)">
            <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" />
            <animate attributeName="r" values="14;20;14" dur="1s" repeatCount="indefinite" />
          </circle>

          {/* Core dot */}
          <circle cx="400" cy="200" r="8" fill="#06B6D4" />
        </svg>
        
        {/* HTML Nodes positioned over SVG origins */}
        {/* We use absolute positioning based on percentages that roughly match the SVG viewBox origins (100, 80 etc. out of 600x400) */}
        
        {/* Node 1: Top Left (100, 80) -> x: 16.6%, y: 20% */}
        <motion.div 
          className="absolute p-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md"
          style={{ left: "16.6%", top: "20%", transform: "translate(-50%, -50%)" }}
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <FileText className="w-5 h-5 text-primary-start" />
        </motion.div>

        {/* Node 2: Middle-Top Left (100, 160) -> x: 16.6%, y: 40% */}
        <motion.div 
          className="absolute p-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md"
          style={{ left: "16.6%", top: "40%", transform: "translate(-50%, -50%)" }}
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <ImageIcon className="w-5 h-5 text-cyan-accent" />
        </motion.div>

        {/* Node 3: Middle-Bottom Left (100, 240) -> x: 16.6%, y: 60% */}
        <motion.div 
          className="absolute p-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md"
          style={{ left: "16.6%", top: "60%", transform: "translate(-50%, -50%)" }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <FileVideo className="w-5 h-5 text-primary-start" />
        </motion.div>

        {/* Node 4: Bottom Left (100, 320) -> x: 16.6%, y: 80% */}
        <motion.div 
          className="absolute p-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md"
          style={{ left: "16.6%", top: "80%", transform: "translate(-50%, -50%)" }}
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        >
          <Link2 className="w-5 h-5 text-cyan-accent" />
        </motion.div>

      </div>
    </GlassCard>
  );
}
