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
    const handleText = (data: { text: string; senderId: string; timestamp: number }) => {
      const msg: TextMessage = {
        id: generateTransferId(),
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

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch {
      setMicError("Microphone access denied — enable it in browser settings to send voice notes.");
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
      return;
    }

    const transferId = generateTransferId();
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

  // ─── Send text + files ─────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const filesToSend = [...pendingFiles];
    setPendingFiles([]);

    const trimmed = text.trim();
    if (trimmed) {
      socket.emit("transfer:text", { roomId, text: trimmed, targetId: targetId === "all" ? undefined : targetId }, (res) => {
        if (res.success) {
          const msg: TextMessage = {
            id: generateTransferId(),
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
          <button
            onClick={() => setTargetId("all")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
              targetId === "all"
                ? "bg-purple-500/20 border-purple-500/50 text-purple-100"
                : "bg-white/[0.03] border-white/10 text-neutral-400 hover:bg-white/[0.06]"
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Send to All
          </button>

          {connectedDevices.filter((d) => d.socketId !== socketId).map((device) => {
            const isSelected = targetId === device.socketId;
            const Icon = device.deviceType === "mobile" ? Smartphone : device.deviceType === "tablet" ? Tablet : Monitor;

            return (
              <button
                key={device.socketId}
                onClick={() => setTargetId(device.socketId)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                  isSelected
                    ? "bg-purple-500/20 border-purple-500/50 text-purple-100"
                    : "bg-white/[0.03] border-white/10 text-neutral-400 hover:bg-white/[0.06]"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Icon className="w-3.5 h-3.5" />
                <span className="max-w-24 truncate">{device.deviceName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-32 gap-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <Send className="w-5 h-5 text-purple-400/50" />
              </div>
              <p className="text-sm text-neutral-600">Send a file or message to get started</p>
            </motion.div>
          )}
          {messages.map((msg) => {
            if ("text" in msg) {
              return <TextMessageBubble key={msg.id} message={msg} onReact={handleReact} />;
            }
            return <FileMessageCard key={msg.transferId} file={msg as FileProgress} onReact={handleReact} />;
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

      {/* Voice Note Preview */}
      <AnimatePresence>
        {recordedBlob && recordedBlobUrl && !isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mx-4 mb-2 p-3 rounded-xl bg-white/[0.04] border border-emerald-500/30 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Mic className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-emerald-400 font-semibold mb-1">Voice note · {formatTime(recordingSeconds)}</p>
              <audio
                ref={previewAudioRef}
                src={recordedBlobUrl}
                onEnded={() => setIsPreviewPlaying(false)}
                className="hidden"
              />
              <button
                onClick={togglePreviewPlay}
                className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white transition-colors"
              >
                {isPreviewPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPreviewPlaying ? "Pause preview" : "Preview"}
              </button>
            </div>
            <button
              onClick={discardRecording}
              className="text-neutral-500 hover:text-red-400 transition-colors p-1"
              title="Discard"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <Button
              size="sm"
              onClick={sendVoiceNote}
              disabled={isSendingFile}
              className="flex-shrink-0 text-xs px-3 h-8"
            >
              Send
            </Button>
          </motion.div>
        )}
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
                <div key={i} className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1.5 rounded-lg">
                  <Paperclip className="w-3.5 h-3.5 text-purple-400" />
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

        {/* Recording indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20"
            >
              <motion.div
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="w-2.5 h-2.5 rounded-full bg-red-500"
              />
              <span className="text-xs text-red-400 font-medium">Recording {formatTime(recordingSeconds)}</span>
              {remainingSeconds <= 30 && (
                <span className="ml-auto text-xs text-orange-400 font-medium">{formatTime(remainingSeconds)} left</span>
              )}
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
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500 hover:text-purple-400 hover:bg-purple-500/10 transition-all disabled:opacity-40"
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
                : "text-neutral-500 hover:text-emerald-400 hover:bg-emerald-500/10"
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
