"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Download, File, Image as ImageIcon, Music, Video, Archive, Smile, Mic } from "lucide-react";
import { FileProgress } from "@/types";
import { formatBytes } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { GlassCard } from "@/components/ui/GlassCard";
import { ReactionPicker } from "@/components/ReactionPicker";
import { useState } from "react";

interface FileMessageProps {
  file: FileProgress;
  onReact: (messageId: string, emoji: string) => void;
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) return <ImageIcon className="w-5 h-5" />;
  if (fileType.startsWith("audio/")) return <Mic className="w-5 h-5" />;
  if (fileType.startsWith("video/")) return <Video className="w-5 h-5" />;
  if (fileType.includes("zip") || fileType.includes("gz") || fileType.includes("tar"))
    return <Archive className="w-5 h-5" />;
  return <File className="w-5 h-5" />;
}

function getFileColor(fileType: string) {
  if (fileType.startsWith("image/")) return "text-sky-400";
  if (fileType.startsWith("audio/")) return "text-emerald-400";
  if (fileType.startsWith("video/")) return "text-rose-400";
  return "text-purple-400";
}

export function FileMessageCard({ file, onReact }: FileMessageProps) {
  const [showPicker, setShowPicker] = useState(false);

  const progress =
    file.status === "complete" || file.status === "sent"
      ? 100
      : file.totalChunks > 0
      ? Math.round((file.receivedChunks / file.totalChunks) * 100)
      : 0;

  const isComplete = file.status === "complete" || file.status === "sent";
  const isSending = file.status === "sending";
  const isIncoming = file.status === "incoming";
  const isVoiceNote = file.fileType.startsWith("audio/");

  const iconColor = getFileColor(file.fileType);
  const icon = getFileIcon(file.fileType);

  const groupedReactions = file.reactions?.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // ── Voice Note Card Layout ─────────────────────────────────────────────────
  if (isVoiceNote) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
        className={`flex ${file.isSelf ? "justify-end" : "justify-start"}`}
      >
        <div className="max-w-[85%] min-w-[240px] group">
          <GlassCard
            className={`p-3 ${
              file.isSelf
                ? "bg-purple-600/10 border-purple-500/20"
                : "bg-white/[0.03] border-white/8"
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Mic icon */}
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Mic className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-400 mb-1">Voice Note</p>

                {/* Audio player */}
                {isComplete && file.blobUrl ? (
                  <audio
                    src={file.blobUrl}
                    controls
                    className="w-full h-8"
                    style={{ accentColor: "#a855f7" }}
                  />
                ) : (
                  <div className="h-8 bg-white/5 rounded-lg animate-pulse flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                  </div>
                )}

                {!isComplete && (
                  <p className="text-[10px] text-neutral-500 mt-1 tabular-nums">
                    {isSending ? `Sending… ${progress}%` : isIncoming ? `Receiving… ${progress}%` : `${progress}%`}
                  </p>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Reactions row */}
          {groupedReactions && Object.keys(groupedReactions).length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-[-8px] relative z-10 ${file.isSelf ? "justify-end mr-2" : "justify-start ml-2"}`}>
              {Object.entries(groupedReactions).map(([emoji, count]) => (
                <motion.div
                  key={emoji}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-1.5 py-0.5 rounded-full bg-black/80 border border-purple-500/30 text-xs flex items-center gap-1 shadow-[0_2px_8px_rgba(124,58,237,0.2)] backdrop-blur-md"
                >
                  <span>{emoji}</span>
                  {count > 1 && <span className="text-[10px] text-neutral-300 font-medium">{count}</span>}
                </motion.div>
              ))}
            </div>
          )}

          {/* Reaction button */}
          <div className={`flex mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${file.isSelf ? "justify-end" : "justify-start"}`}>
            <div className="relative">
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="text-neutral-500 hover:text-purple-400 transition-colors flex items-center justify-center w-5 h-5 rounded hover:bg-white/5"
                title="React"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>
              <AnimatePresence>
                {showPicker && (
                  <ReactionPicker
                    onSelect={(emoji) => {
                      onReact(file.transferId, emoji);
                      setShowPicker(false);
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Standard File Card Layout ──────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex ${file.isSelf ? "justify-end" : "justify-start"}`}
    >
      <div className="max-w-[85%] min-w-[260px] group">
        <GlassCard
          className={`p-4 ${
            file.isSelf
              ? "bg-purple-600/10 border-purple-500/20"
              : "bg-white/[0.03] border-white/8"
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.06] ${iconColor}`}
            >
              {icon}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-100 truncate">{file.fileName}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{formatBytes(file.fileSize)}</p>

              {/* Progress */}
              {!isComplete && (
                <div className="mt-2">
                  <ProgressBar
                    value={progress}
                    size="sm"
                    color={isSending ? "purple" : "blue"}
                  />
                  <p className="text-[10px] text-neutral-600 mt-1 tabular-nums">
                    {isSending
                      ? `Sending… ${progress}%`
                      : isIncoming
                      ? `Receiving… ${progress}%`
                      : `${progress}%`}
                  </p>
                </div>
              )}

              {/* Download */}
              {isComplete && file.blobUrl && !file.isSelf && (
                <a
                  href={file.blobUrl}
                  download={file.fileName}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
              )}

              {isComplete && file.isSelf && (
                <p className="mt-2 text-xs text-emerald-400 font-medium">✓ Sent</p>
              )}

              {/* Image preview */}
              {isComplete && file.blobUrl && file.fileType.startsWith("image/") && !file.isSelf && (
                <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={file.blobUrl}
                    alt={file.fileName}
                    className="max-w-full max-h-48 object-cover"
                  />
                </div>
              )}

              {/* Video preview */}
              {isComplete && file.blobUrl && file.fileType.startsWith("video/") && !file.isSelf && (
                <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-black/40">
                  <video
                    src={file.blobUrl}
                    controls
                    className="max-w-full max-h-64 object-cover"
                  />
                </div>
              )}

              {/* Video buffering skeleton */}
              {!isComplete && isIncoming && file.fileType.startsWith("video/") && (
                <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-white/5 animate-pulse h-32 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Reactions row */}
        {groupedReactions && Object.keys(groupedReactions).length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-[-10px] relative z-10 ${file.isSelf ? "justify-end mr-2" : "justify-start ml-2"}`}>
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <motion.div
                key={emoji}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-1.5 py-0.5 rounded-full bg-black/80 border border-purple-500/30 text-xs flex items-center gap-1 shadow-[0_2px_8px_rgba(124,58,237,0.2)] backdrop-blur-md"
              >
                <span>{emoji}</span>
                {count > 1 && <span className="text-[10px] text-neutral-300 font-medium">{count}</span>}
              </motion.div>
            ))}
          </div>
        )}

        {/* Reaction button */}
        <div className={`flex mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${file.isSelf ? "justify-end" : "justify-start"}`}>
          <div className="relative">
            <button
              onClick={() => setShowPicker(!showPicker)}
              className="text-neutral-500 hover:text-purple-400 transition-colors flex items-center justify-center w-5 h-5 rounded hover:bg-white/5"
              title="React"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>
            <AnimatePresence>
              {showPicker && (
                <ReactionPicker
                  onSelect={(emoji) => {
                    onReact(file.transferId, emoji);
                    setShowPicker(false);
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
