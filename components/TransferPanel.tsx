"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Paperclip, X, AlertCircle, Monitor, Smartphone,
  Tablet, Mic, MicOff, StopCircle, Play, Pause, Trash2,
} from "lucide-react";
import { Socket } from "socket.io-client";
import {
  ServerToClientEvents, ClientToServerEvents,
  TransferMessage, FileProgress, TextMessage, RoomDevice,
} from "@/types";
import { Waveform } from "@/components/ui/Waveform";
import { GlassCard } from "@/components/ui/GlassCard";
import { TextMessageBubble } from "@/components/TextMessage";
import { FileMessageCard } from "@/components/FileMessage";
import { Button } from "@/components/ui/Button";
import { generateTransferId } from "@/lib/utils";
import { parseUserAgent } from "@/lib/utils";

const CHUNK_SIZE = 256 * 1024; // 256 KB
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_RECORDING_SECONDS = 120; // 2 minutes

interface TransferPanelProps {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  roomId: string;
  socketId: string;
}

export function TransferPanel({ socket, roomId, socketId }: TransferPanelProps) {
  const [messages, setMessages] = useState<TransferMessage[]>([]);
  const [text, setText] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<RoomDevice[]>([]);
  const [targetId, setTargetId] = useState<string>("all");
  const blobUrls = useRef<Set<string>>(new Set());
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSendingFile, setIsSendingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chunkBuffers = useRef<Map<string, Uint8Array[]>>(new Map());
  const cancelledTransfers = useRef<Set<string>>(new Set());

  // ── Voice Note State ────────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { deviceName } = parseUserAgent(navigator.userAgent);

  // ─── Scroll to bottom on new messages ─────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Listen for room state ─────────────────────────────────────────────────
  useEffect(() => {
    const handleState = (data: { devices: RoomDevice[] }) => {
      setConnectedDevices(data.devices);
      setTargetId((prev) => {
        if (prev !== "all" && !data.devices.find((d) => d.socketId === prev)) {
          return "all";
        }
        return prev;
      });
    };
    socket.on("room:state", handleState);
    return () => { socket.off("room:state", handleState); };
  }, [socket]);

  // ─── Cleanup Blob URLs ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      blobUrls.current.forEach((url) => URL.revokeObjectURL(url));
      if (recordedBlobUrl) URL.revokeObjectURL(recordedBlobUrl);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Listen for incoming text ──────────────────────────────────────────────
  useEffect(() => {
    const handleText = (data: { id: string; text: string; senderId: string; timestamp: number }) => {
      const msg: TextMessage = {
        id: data.id,   // ← use the sender's id so both sides share the same ID
        type: "text",
        text: data.text,
        senderId: data.senderId,
        isSelf: false,
        timestamp: data.timestamp,
        reactions: [],
      };
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("transfer:text_received", handleText);
    return () => { socket.off("transfer:text_received", handleText); };
  }, [socket]);

  // ─── Listen for incoming file metadata ────────────────────────────────────
  useEffect(() => {
    const handleFileIncoming = (data: {
      transferId: string; fileName: string; fileType: string;
      fileSize: number; totalChunks: number; senderId: string;
    }) => {
      chunkBuffers.current.set(data.transferId, new Array<Uint8Array>(data.totalChunks));

      const file: FileProgress = {
        transferId: data.transferId,
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        totalChunks: data.totalChunks,
        receivedChunks: 0,
        status: "incoming",
        isSelf: false,
        senderId: data.senderId,
        timestamp: Date.now(),
        reactions: [],
      };
      setMessages((prev) => [...prev, file]);
    };

    socket.on("transfer:file_incoming", handleFileIncoming);
    return () => { socket.off("transfer:file_incoming", handleFileIncoming); };
  }, [socket]);

  // ─── Listen for incoming chunks ───────────────────────────────────────────
  useEffect(() => {
    const handleChunk = (data: {
      transferId: string; chunkIndex: number; data: ArrayBuffer | Uint8Array;
      receivedChunks: number; totalChunks: number;
    }) => {
      const buf = chunkBuffers.current.get(data.transferId);
      if (buf) {
        buf[data.chunkIndex] = data.data instanceof Uint8Array
          ? data.data
          : new Uint8Array(data.data);
      }

      setMessages((prev) =>
        prev.map((m) => {
          if ("transferId" in m && m.transferId === data.transferId) {
            return { ...m, receivedChunks: data.receivedChunks } as FileProgress;
          }
          return m;
        })
      );
    };

    socket.on("transfer:file_chunk_received", handleChunk);
    return () => { socket.off("transfer:file_chunk_received", handleChunk); };
  }, [socket]);

  // ─── Listen for file complete ─────────────────────────────────────────────
  useEffect(() => {
    const handleComplete = (data: {
      transferId: string; fileName: string; fileType: string; fileSize: number;
    }) => {
      const buf = chunkBuffers.current.get(data.transferId);
      let blobUrl: string | undefined;

      if (buf) {
        const allChunks = buf.filter(Boolean) as Uint8Array[];
        const blob = new Blob(allChunks as BlobPart[], { type: data.fileType });
        blobUrl = URL.createObjectURL(blob);
        blobUrls.current.add(blobUrl);
        chunkBuffers.current.delete(data.transferId);
      }

      setMessages((prev) =>
        prev.map((m) => {
          if ("transferId" in m && m.transferId === data.transferId) {
            return { ...m, status: "complete", blobUrl } as FileProgress;
          }
          return m;
        })
      );
    };

    socket.on("transfer:file_complete", handleComplete);
    return () => { socket.off("transfer:file_complete", handleComplete); };
  }, [socket]);

  // ─── Listen for reactions received ────────────────────────────────────────
  useEffect(() => {
    const handleReaction = (data: { messageId: string; emoji: string; deviceName: string }) => {
      setMessages((prev) =>
        prev.map((m) => {
          const id = "id" in m ? m.id : m.transferId;
          if (id === data.messageId) {
            const existingReactions = m.reactions ?? [];
            return { ...m, reactions: [...existingReactions, { emoji: data.emoji, deviceName: data.deviceName }] };
          }
          return m;
        })
      );
    };

    socket.on("transfer:reaction_received", handleReaction);
    return () => { socket.off("transfer:reaction_received", handleReaction); };
  }, [socket]);

  // ─── Reactions: send + local state ────────────────────────────────────────
  const handleReact = useCallback((messageId: string, emoji: string) => {
    // Optimistically add to local state immediately
    setMessages((prev) =>
      prev.map((m) => {
        const id = "id" in m ? m.id : m.transferId;
        if (id === messageId) {
          const existingReactions = m.reactions ?? [];
          return { ...m, reactions: [...existingReactions, { emoji, deviceName }] };
        }
        return m;
      })
    );

    // Send to the target (the original sender) or room
    const msg = messages.find((m) => ("id" in m ? m.id : m.transferId) === messageId);
    const sendTarget = msg ? msg.senderId : undefined;

    socket.emit("transfer:react", {
      roomId,
      targetId: sendTarget,
      messageId,
      emoji,
      deviceName,
    }, () => {});
  }, [socket, roomId, deviceName, messages]);

  // ─── Voice Note: Start Recording ──────────────────────────────────────────
  const startRecording = useCallback(async () => {
    setMicError(null);
    setRecordedBlob(null);
    if (recordedBlobUrl) {
      URL.revokeObjectURL(recordedBlobUrl);
      setRecordedBlobUrl(null);
    }

    // Check HTTPS / secure context
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError("Voice notes require a secure (HTTPS) connection.");
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch (err) {
      const error = err as DOMException;
      if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        setMicError("No microphone found. Please connect a microphone and try again.");
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        setMicError("Microphone is in use by another app. Close it and try again.");
      } else if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setMicError("Microphone access denied — enable it in browser settings to send voice notes.");
      } else if (error.name === "OverconstrainedError") {
        setMicError("Microphone constraints not satisfied. Try a different device.");
      } else {
        setMicError(`Could not access microphone: ${error.message || error.name}`);
      }
      return;
    }

    audioChunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setRecordedBlob(blob);
      setRecordedBlobUrl(url);
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };

    recorder.start();
    setIsRecording(true);
    setRecordingSeconds(0);

    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((s) => {
        if (s + 1 >= MAX_RECORDING_SECONDS) {
          stopRecording();
          return MAX_RECORDING_SECONDS;
        }
        return s + 1;
      });
    }, 1000);
  }, [recordedBlobUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const stopRecording = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  const discardRecording = useCallback(() => {
    if (recordedBlobUrl) URL.revokeObjectURL(recordedBlobUrl);
    setRecordedBlob(null);
    setRecordedBlobUrl(null);
    setRecordingSeconds(0);
    previewAudioRef.current?.pause();
  }, [recordedBlobUrl]);

  const togglePreviewPlay = useCallback(() => {
    if (!previewAudioRef.current) return;
    if (isPreviewPlaying) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      previewAudioRef.current.play();
      setIsPreviewPlaying(true);
    }
  }, [isPreviewPlaying]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ─── Send file (also used for voice blobs) ────────────────────────────────
  const sendFile = useCallback(async (file: File | Blob, overrideName?: string, overrideType?: string) => {
    setFileError(null);

    const name = overrideName ?? (file instanceof File ? file.name : `voice-note-${Date.now()}.webm`);
    const type = overrideType ?? file.type ?? "audio/webm";
    const size = file.size;

    if (size > MAX_FILE_SIZE) {
      setFileError("File exceeds 50 MB limit.");
      setIsSendingFile(false);
      return;
    }
    setFileError(null);

    const transferId = generateTransferId();
    cancelledTransfers.current.delete(transferId);
    const totalChunks = Math.ceil(size / CHUNK_SIZE);

    const outgoing: FileProgress = {
      transferId,
      fileName: name,
      fileType: type,
      fileSize: size,
      totalChunks,
      receivedChunks: 0,
      status: "sending",
      isSelf: true,
      senderId: socketId,
      timestamp: Date.now(),
      reactions: [],
    };
    setMessages((prev) => [...prev, outgoing]);
    setIsSendingFile(true);

    const initRes = await new Promise<{ success: boolean; error?: string }>((resolve) => {
      socket.emit("transfer:file_init", {
        roomId,
        transferId,
        fileName: name,
        fileType: type,
        fileSize: size,
        totalChunks,
        targetId: targetId === "all" ? undefined : targetId,
      }, resolve);
    });

    if (!initRes.success) {
      setFileError(
        initRes.error === "file_type_not_allowed"
          ? "File type not allowed."
          : initRes.error === "file_too_large"
          ? "File too large (max 50 MB)."
          : "Failed to initiate transfer."
      );
      setMessages((prev) => prev.filter((m) => !("transferId" in m) || m.transferId !== transferId));
      setIsSendingFile(false);
      return;
    }

    const arrayBuffer = await file.arrayBuffer();

    for (let i = 0; i < totalChunks; i++) {
      if (cancelledTransfers.current.has(transferId)) {
        setMessages((prev) => prev.filter((m) => !("transferId" in m) || m.transferId !== transferId));
        setIsSendingFile(false);
        return;
      }
      
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, size);
      const chunk = arrayBuffer.slice(start, end);

      await new Promise<void>((resolve, reject) => {
        socket.emit("transfer:file_chunk", {
          roomId,
          transferId,
          chunkIndex: i,
          data: chunk,
          targetId: targetId === "all" ? undefined : targetId,
        }, (ackRes) => {
          if (ackRes.success) {
            setMessages((prev) =>
              prev.map((m) => {
                if ("transferId" in m && m.transferId === transferId) {
                  return { ...m, receivedChunks: i + 1 } as FileProgress;
                }
                return m;
              })
            );
            resolve();
          } else {
            reject(new Error(ackRes.error));
          }
        });
      });
    }

    setMessages((prev) =>
      prev.map((m) => {
        if ("transferId" in m && m.transferId === transferId) {
          return { ...m, status: "sent" } as FileProgress;
        }
        return m;
      })
    );
    setIsSendingFile(false);
  }, [socket, roomId, socketId, targetId]);

  // ─── Send voice note ───────────────────────────────────────────────────────
  const sendVoiceNote = useCallback(async () => {
    if (!recordedBlob) return;
    const ext = recordedBlob.type.includes("mp4") ? "mp4" : "webm";
    await sendFile(recordedBlob, `voice-note-${Date.now()}.${ext}`, recordedBlob.type);
    discardRecording();
  }, [recordedBlob, sendFile, discardRecording]);

  const handleCancelTransfer = useCallback((transferId: string) => {
    cancelledTransfers.current.add(transferId);
    setMessages((prev) => prev.filter((m) => !("transferId" in m) || m.transferId !== transferId));
  }, []);

  // ─── Send text + files ─────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const filesToSend = [...pendingFiles];
    setPendingFiles([]);

    const trimmed = text.trim();
    if (trimmed) {
      const msgId = generateTransferId(); // generate ONCE, shared with receiver
      socket.emit("transfer:text", { roomId, id: msgId, text: trimmed, targetId: targetId === "all" ? undefined : targetId }, (res) => {
        if (res.success) {
          const msg: TextMessage = {
            id: msgId,   // ← same id the receiver will use
            type: "text",
            text: trimmed,
            senderId: socketId,
            isSelf: true,
            timestamp: Date.now(),
            reactions: [],
          };
          setMessages((prev) => [...prev, msg]);
          setText("");
        }
      });
    }

    for (const f of filesToSend) {
      await sendFile(f);
    }
  }, [socket, roomId, socketId, text, pendingFiles, sendFile, targetId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setPendingFiles((prev) => [...prev, ...files]);
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      setPendingFiles((prev) => [...prev, ...files]);
    }
  };

  const remainingSeconds = MAX_RECORDING_SECONDS - recordingSeconds;

  return (
    <div
      className="flex flex-col h-full"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Connected Devices Panel */}
      <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <h3 className="text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">Connected Devices</h3>
        <div className="flex flex-wrap gap-2">
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setTargetId("all")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
              targetId === "all"
                ? "bg-primary-start/20 border-primary-start/50 text-white"
                : "bg-white/[0.03] border-white/10 text-neutral-400 hover:bg-white/[0.06]"
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-accent animate-pulse" />
            Send to All
          </motion.button>

          <AnimatePresence>
            {connectedDevices.filter((d) => d.socketId !== socketId).map((device) => {
              const isSelected = targetId === device.socketId;
              const Icon = device.deviceType === "mobile" ? Smartphone : device.deviceType === "tablet" ? Tablet : Monitor;

              return (
                <motion.button
                  key={device.socketId}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => setTargetId(device.socketId)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                    isSelected
                      ? "bg-primary-start/20 border-primary-start/50 text-white"
                      : "bg-white/[0.03] border-white/10 text-neutral-400 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-accent animate-pulse" />
                  <Icon className="w-3.5 h-3.5" />
                  <span className="max-w-24 truncate">{device.deviceName}</span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-32 gap-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-start/10 flex items-center justify-center">
                <Send className="w-5 h-5 text-primary-start/70" />
              </div>
              <p className="text-sm text-neutral-600">Send a file or message to get started</p>
            </motion.div>
          )}
          {messages.map((msg) => {
            const key = "text" in msg ? msg.id : msg.transferId;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: msg.isSelf ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {"text" in msg 
                  ? <TextMessageBubble message={msg} onReact={handleReact} />
                  : <FileMessageCard file={msg as FileProgress} onReact={handleReact} onCancel={handleCancelTransfer} />
                }
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      <AnimatePresence>
        {(fileError || micError) && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="mx-4 mb-2 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {fileError || micError}
            <button onClick={() => { setFileError(null); setMicError(null); }} className="ml-auto">
              <X className="w-3 h-3 hover:text-red-300" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Note Preview / Recording Card */}
      <AnimatePresence mode="wait">
        {isRecording ? (
          <motion.div
            key="recording"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mx-4 mb-3"
          >
            <GlassCard glow glowColor="cyan" className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center relative">
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 bg-[#22D3EE] rounded-full"
                />
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] flex items-center justify-center relative z-10 text-white shadow-lg">
                  <Mic className="w-5 h-5" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-cyan-accent">Recording Audio...</span>
                  <span className="text-xs font-bold text-white tabular-nums">{formatTime(recordingSeconds)}</span>
                </div>
                <Waveform isPlaying={true} color="#22D3EE" className="w-full opacity-80" />
              </div>
            </GlassCard>
          </motion.div>
        ) : recordedBlob && recordedBlobUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mx-4 mb-3"
          >
            <GlassCard glow glowColor="primary" className="p-4 flex items-center gap-4">
              <button
                onClick={togglePreviewPlay}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center justify-center text-white transition-all shadow-lg flex-shrink-0"
              >
                {isPreviewPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
              </button>
              
              <div className="flex-1 min-w-0 flex items-center">
                <audio
                  ref={previewAudioRef}
                  src={recordedBlobUrl}
                  onEnded={() => setIsPreviewPlaying(false)}
                  className="hidden"
                />
                <Waveform isPlaying={isPreviewPlaying} color="#3B82F6" className="w-full" />
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={discardRecording}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                  title="Discard"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
                <Button
                  size="sm"
                  onClick={sendVoiceNote}
                  disabled={isSendingFile}
                  className="h-10 px-4 rounded-xl font-semibold shadow-lg shadow-[#3B82F6]/20"
                >
                  Send
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Input */}
      <div className="px-4 pb-4">
        <AnimatePresence>
          {pendingFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-wrap gap-2 mb-2"
            >
              {pendingFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-primary-start/10 border border-primary-start/20 px-2.5 py-1.5 rounded-lg">
                  <Paperclip className="w-3.5 h-3.5 text-primary-start" />
                  <span className="text-xs text-neutral-300 max-w-32 truncate">{f.name}</span>
                  <button
                    onClick={() => setPendingFiles((prev) => prev.filter((_, index) => index !== i))}
                    className="text-neutral-500 hover:text-red-400 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-2">
          {/* File button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            id="file-upload"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isSendingFile || isRecording}
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500 hover:text-primary-start hover:bg-primary-start/10 transition-all disabled:opacity-40"
            title="Attach file"
          >
            <Paperclip className="w-4.5 h-4.5" />
          </button>

          {/* Text area */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Recording…" : "Type a message or paste a link… (Enter to send)"}
            rows={1}
            disabled={isRecording}
            className="flex-1 resize-none bg-transparent text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none py-1.5 max-h-32 overflow-y-auto disabled:opacity-50"
            style={{ lineHeight: "1.5" }}
          />

          {/* Mic button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!!recordedBlob}
            className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 ${
              isRecording
                ? "bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30"
                : "text-neutral-500 hover:text-cyan-accent hover:bg-cyan-accent/10"
            }`}
            title={isRecording ? "Stop recording" : "Record voice note"}
          >
            {isRecording ? <StopCircle className="w-4 h-4" /> : recordedBlob ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send */}
          <Button
            size="sm"
            onClick={handleSend}
            disabled={(!text.trim() && pendingFiles.length === 0) || isRecording}
            className="flex-shrink-0 h-9 w-9 p-0 rounded-xl"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-neutral-700 mt-1.5 text-center">
          Drop files anywhere · Max 50 MB · Voice notes up to 2 min
        </p>
      </div>
    </div>
  );
}
