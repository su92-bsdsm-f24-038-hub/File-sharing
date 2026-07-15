"use client";

import { motion } from "framer-motion";
import { Check, Copy, Clock } from "lucide-react";
import { TextMessage as TMsg } from "@/types";
import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface TextMessageProps {
  message: TMsg;
}

export function TextMessageBubble({ message }: TextMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex ${message.isSelf ? "justify-end" : "justify-start"}`}
    >
      <div className="max-w-[80%] group">
        <GlassCard
          className={`px-4 py-3 ${
            message.isSelf
              ? "bg-purple-600/20 border-purple-500/25"
              : "bg-white/[0.04] border-white/10"
          }`}
        >
          <p className="text-sm text-neutral-100 whitespace-pre-wrap break-words leading-relaxed">
            {message.text}
          </p>
        </GlassCard>
        <div
          className={`flex items-center gap-2 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${
            message.isSelf ? "justify-end" : "justify-start"
          }`}
        >
          <span className="text-[10px] text-neutral-600 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {time}
          </span>
          <button
            onClick={handleCopy}
            className="text-[10px] text-neutral-500 hover:text-purple-400 transition-colors flex items-center gap-0.5"
            title="Copy text"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
