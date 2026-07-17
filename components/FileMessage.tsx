import { motion, AnimatePresence } from "framer-motion";
import { Download, File, Image as ImageIcon, Music, Video, Archive, Smile, Mic, X, CheckCircle2, Play, Pause, Loader2 } from "lucide-react";
import { FileProgress } from "@/types";
import { formatBytes } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { GlassCard } from "@/components/ui/GlassCard";
import { ReactionPicker } from "@/components/ReactionPicker";
import { useState, useRef, useEffect } from "react";
import { Waveform } from "@/components/ui/Waveform";

interface FileMessageProps {
  file: FileProgress;
  onReact: (messageId: string, emoji: string) => void;
  onCancel?: (transferId: string) => void;
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) return <ImageIcon className="w-6 h-6" />;
  if (fileType.startsWith("video/")) return <Video className="w-6 h-6" />;
  if (fileType.includes("zip") || fileType.includes("gz") || fileType.includes("tar"))
    return <Archive className="w-6 h-6" />;
  return <File className="w-6 h-6" />;
}

function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "FILE";
}

export function FileMessageCard({ file, onReact, onCancel }: FileMessageProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

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

  const icon = getFileIcon(file.fileType);
  const ext = getFileExtension(file.fileName);

  const groupedReactions = file.reactions?.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [file.blobUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
    }
  };

  // ── Voice Note Card Layout ─────────────────────────────────────────────────
  if (isVoiceNote) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
        className={`flex relative ${file.isSelf ? "justify-end" : "justify-start"}`}
      >
        <div className="max-w-[85%] min-w-[280px] group relative z-10">
          <GlassCard glow glowColor="cyan" className="p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                disabled={!isComplete}
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isComplete
                    ? "bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] text-white"
                    : "bg-white/10 text-neutral-500 cursor-not-allowed"
                }`}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
              </button>

              <div className="flex-1 min-w-0 flex items-center">
                {isComplete && file.blobUrl ? (
                  <>
                    <audio ref={audioRef} src={file.blobUrl} className="hidden" />
                    <Waveform isPlaying={isPlaying} color="#22D3EE" className="w-full" />
                  </>
                ) : (
                  <div className="w-full flex flex-col justify-center gap-1.5 h-10">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-cyan-accent flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {isSending ? "Sending…" : "Receiving…"}
                      </span>
                      <span className="text-neutral-400">{progress}%</span>
                    </div>
                    <ProgressBar value={progress} size="sm" color="cyan" />
                  </div>
                )}
              </div>
            </div>
            {isComplete && (
              <div className="absolute top-2 right-3 text-[10px] text-neutral-500 font-medium">
                {file.isSelf ? "Sent" : "Voice Note"}
              </div>
            )}
          </GlassCard>

          {/* Reactions */}
          {groupedReactions && Object.keys(groupedReactions).length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-[-10px] relative z-20 ${file.isSelf ? "justify-end mr-2" : "justify-start ml-2"}`}>
              {Object.entries(groupedReactions).map(([emoji, count]) => (
                <motion.div
                  key={emoji}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-1.5 py-0.5 rounded-full bg-[#0B1120] border border-[#1E40AF] text-xs flex items-center gap-1 shadow-lg"
                >
                  <span>{emoji}</span>
                  {count > 1 && <span className="text-[10px] text-neutral-300 font-medium">{count}</span>}
                </motion.div>
              ))}
            </div>
          )}

          <div className={`flex mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${file.isSelf ? "justify-end" : "justify-start"}`}>
            <div className="relative">
              <button onClick={() => setShowPicker(!showPicker)} className="text-neutral-500 hover:text-[#3B82F6] p-1 rounded">
                <Smile className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {showPicker && (
                  <ReactionPicker onSelect={(emoji) => { onReact(file.transferId, emoji); setShowPicker(false); }} />
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
      className={`flex relative ${file.isSelf ? "justify-end" : "justify-start"}`}
    >
      <div className="max-w-[90%] min-w-[320px] group relative z-10">
        <GlassCard glow glowColor="primary" className="p-5 overflow-hidden">
          {/* File Header */}
          <div className="flex items-start gap-4 relative z-10">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] flex items-center justify-center text-white shadow-lg">
                {icon}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#0B1120] px-2 py-0.5 rounded-lg border border-white/10 text-[10px] font-bold text-white shadow-sm">
                {ext.length > 4 ? ext.substring(0,4) : ext}
              </div>
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <p className="text-sm font-semibold text-white truncate" title={file.fileName}>{file.fileName}</p>
              <p className="text-xs text-neutral-400 mt-1">{formatBytes(file.fileSize)}</p>
            </div>

            {/* Cancel Button */}
            {!isComplete && (
              <button
                onClick={() => onCancel && onCancel(file.transferId)}
                className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                title="Cancel Transfer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Progress / Complete Row */}
          <div className="mt-5 relative z-10">
            <AnimatePresence mode="wait">
              {!isComplete ? (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white/5 rounded-xl p-3 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 text-cyan-accent animate-spin" />
                      <span className="text-xs font-medium text-cyan-accent">
                        {isSending ? "Sending…" : "Receiving…"}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-white">{progress}%</span>
                  </div>
                  <ProgressBar value={progress} size="sm" color="cyan" />
                </motion.div>
              ) : (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-xl p-2 border border-white/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 px-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-400">
                      {file.isSelf ? "Sent Successfully" : "Received"}
                    </span>
                  </div>
                  
                  {file.blobUrl && !file.isSelf && (
                    <a
                      href={file.blobUrl}
                      download={file.fileName}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E40AF] hover:bg-[#3B82F6] text-white text-xs font-semibold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Save
                    </a>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>

        {/* Reactions row */}
        {groupedReactions && Object.keys(groupedReactions).length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-[-10px] relative z-20 ${file.isSelf ? "justify-end mr-2" : "justify-start ml-2"}`}>
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <motion.div
                key={emoji}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-1.5 py-0.5 rounded-full bg-[#0B1120] border border-[#1E40AF] text-xs flex items-center gap-1 shadow-lg"
              >
                <span>{emoji}</span>
                {count > 1 && <span className="text-[10px] text-neutral-300 font-medium">{count}</span>}
              </motion.div>
            ))}
          </div>
        )}

        <div className={`flex mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${file.isSelf ? "justify-end" : "justify-start"}`}>
          <div className="relative">
            <button onClick={() => setShowPicker(!showPicker)} className="text-neutral-500 hover:text-[#3B82F6] p-1 rounded">
              <Smile className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showPicker && (
                <ReactionPicker onSelect={(emoji) => { onReact(file.transferId, emoji); setShowPicker(false); }} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
