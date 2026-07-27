"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, Clock, Smile, Trash2 } from "lucide-react";
import { TextMessage as TMsg } from "@/types";
import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ReactionPicker } from "@/components/ReactionPicker";
import { ProLock } from "@/components/ProLock";

interface TextMessageProps {
  message: TMsg;
  onReact: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => void;
}

export function TextMessageBubble({ message, onReact, onDelete }: TextMessageProps) {
  const [copied, setCopied] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const groupedReactions = message.reactions?.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
              ? "bg-primary-start/20 border-primary-start/25"
              : "bg-white/[0.04] border-white/10"
          }`}
        >
          <p className="text-sm text-neutral-100 whitespace-pre-wrap break-words leading-relaxed">
            {message.text}
          </p>
        </GlassCard>
        
        {groupedReactions && Object.keys(groupedReactions).length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-[-10px] relative z-10 ${message.isSelf ? "justify-end mr-2" : "justify-start ml-2"}`}>
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={emoji}
                className="px-1.5 py-0.5 rounded-full bg-black/80 border border-primary-start/30 text-xs flex items-center gap-1 shadow-[0_2px_8px_rgba(59,130,246,0.2)] backdrop-blur-md"
              >
                <span>{emoji}</span>
                {count > 1 && <span className="text-[10px] text-neutral-300 font-medium">{count}</span>}
              </motion.div>
            ))}
          </div>
        )}

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
            className="text-[10px] text-neutral-500 hover:text-primary-start transition-colors flex items-center gap-0.5"
            title="Copy text"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
          <div className="relative">
            <ProLock featureName="Transfer Reactions">
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="text-[10px] text-neutral-500 hover:text-primary-start transition-colors flex items-center justify-center w-5 h-5 rounded hover:bg-white/5"
                title="React"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>
            </ProLock>
            <AnimatePresence>
              {showPicker && (
                <ReactionPicker
                  onSelect={(emoji) => {
                    onReact(message.id, emoji);
                    setShowPicker(false);
                  }}
                />
              )}
            </AnimatePresence>
          </div>
          {message.isSelf && onDelete && (
            <button
              onClick={() => onDelete(message.id)}
              className="text-[10px] text-neutral-500 hover:text-red-400 transition-colors flex items-center justify-center w-5 h-5 rounded hover:bg-white/5 ml-1"
              title="Delete message"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
