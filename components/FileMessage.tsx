"use client";

import { motion } from "framer-motion";
import { Download, File, Image as ImageIcon, Music, Video, Archive } from "lucide-react";
import { FileProgress } from "@/types";
import { formatBytes } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { GlassCard } from "@/components/ui/GlassCard";

interface FileMessageProps {
  file: FileProgress;
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) return <ImageIcon className="w-5 h-5" />;
  if (fileType.startsWith("audio/")) return <Music className="w-5 h-5" />;
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

export function FileMessageCard({ file }: FileMessageProps) {
  const progress =
    file.status === "complete" || file.status === "sent"
      ? 100
      : file.totalChunks > 0
      ? Math.round((file.receivedChunks / file.totalChunks) * 100)
      : 0;

  const isComplete = file.status === "complete" || file.status === "sent";
  const isSending = file.status === "sending";
  const isIncoming = file.status === "incoming";

  const iconColor = getFileColor(file.fileType);
  const icon = getFileIcon(file.fileType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex ${file.isSelf ? "justify-end" : "justify-start"}`}
    >
      <div className="max-w-[85%] min-w-[260px]">
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
                <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={file.blobUrl}
                    alt={file.fileName}
                    className="max-w-full max-h-48 object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
