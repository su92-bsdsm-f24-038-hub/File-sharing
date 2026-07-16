"use client";

import { motion } from "framer-motion";

const EMOJIS = ["👍", "❤️", "😂", "🔥", "✅", "🎉"];

export function ReactionPicker({
  onSelect,
}: {
  onSelect: (emoji: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 5 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-full right-0 mb-2 p-1.5 rounded-full bg-black/80 backdrop-blur-md border border-purple-500/30 flex gap-1 shadow-[0_4px_24px_rgba(124,58,237,0.2)] z-50"
    >
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(emoji);
          }}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-lg transition-transform hover:scale-110"
        >
          {emoji}
        </button>
      ))}
    </motion.div>
  );
}
