"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, X, AlertCircle } from "lucide-react";
import { Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents, TransferMessage, FileProgress, TextMessage } from "@/types";
import { TextMessageBubble } from "@/components/TextMessage";
import { FileMessageCard } from "@/components/FileMessage";
import { Button } from "@/components/ui/Button";
import { generateTransferId } from "@/lib/utils";

const CHUNK_SIZE = 256 * 1024; // 256 KB
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

interface TransferPanelProps {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  roomId: string;
  socketId: string;
}

export function TransferPanel({ socket, roomId, socketId }: TransferPanelProps) {
  const [messages, setMessages] = useState<TransferMessage[]>([]);
  const [text, setText] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSendingFile, setIsSendingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chunkBuffers = useRef<Map<string, Uint8Array[]>>(new Map());

  // ─── Scroll to bottom on new messages ─────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  // ─── Sending handled via handleSend below ────────────────────────────────

  // ─── Send file ────────────────────────────────────────────────────────────
  const sendFile = useCallback(async (file: File) => {
    setFileError(null);

    if (file.size > MAX_FILE_SIZE) {
      setFileError("File exceeds 50 MB limit.");
      return;
    }

    const transferId = generateTransferId();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    // Add outgoing file to messages immediately
    const outgoing: FileProgress = {
      transferId,
      fileName: file.name,
      fileType: file.type || "application/octet-stream",
      fileSize: file.size,
      totalChunks,
      receivedChunks: 0,
      status: "sending",
      isSelf: true,
      senderId: socketId,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, outgoing]);
    setIsSendingFile(true);

    // Init transfer on server
    const initRes = await new Promise<{ success: boolean; error?: string }>((resolve) => {
      socket.emit("transfer:file_init", {
        roomId,
        transferId,
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
        totalChunks,
      }, resolve);
    });

    if (!initRes.success) {
      setFileError(initRes.error === "file_type_not_allowed"
        ? "File type not allowed."
        : initRes.error === "file_too_large"
        ? "File too large (max 50 MB)."
        : "Failed to initiate transfer.");
      setMessages((prev) => prev.filter((m) => !("transferId" in m) || m.transferId !== transferId));
      setIsSendingFile(false);
      return;
    }

    // Send chunks sequentially with ack-driven progress
    const arrayBuffer = await file.arrayBuffer();

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = arrayBuffer.slice(start, end);

      await new Promise<void>((resolve, reject) => {
        socket.emit("transfer:file_chunk", {
          roomId,
          transferId,
          chunkIndex: i,
          data: chunk,
        }, (ackRes) => {
          if (ackRes.success) {
            // Update progress on outgoing card
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

    // Mark as sent
    setMessages((prev) =>
      prev.map((m) => {
        if ("transferId" in m && m.transferId === transferId) {
          return { ...m, status: "sent" } as FileProgress;
        }
        return m;
      })
    );
    setIsSendingFile(false);
  }, [socket, roomId, socketId]);

  const handleSend = useCallback(async () => {
    const filesToSend = [...pendingFiles];
    setPendingFiles([]);

    const trimmed = text.trim();
    if (trimmed) {
      socket.emit("transfer:text", { roomId, text: trimmed }, (res) => {
        if (res.success) {
          const msg: TextMessage = {
            id: generateTransferId(),
            type: "text",
            text: trimmed,
            senderId: socketId,
            isSelf: true,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, msg]);
          setText("");
        }
      });
    }

    for (const f of filesToSend) {
      await sendFile(f);
    }
  }, [socket, roomId, socketId, text, pendingFiles, sendFile]);

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

  return (
    <div
      className="flex flex-col h-full"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
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
              return <TextMessageBubble key={msg.id} message={msg} />;
            }
            return <FileMessageCard key={msg.transferId} file={msg as FileProgress} />;
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      <AnimatePresence>
        {fileError && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="mx-4 mb-2 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {fileError}
            <button onClick={() => setFileError(null)} className="ml-auto">
              <X className="w-3 h-3 hover:text-red-300" />
            </button>
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
                    onClick={() => setPendingFiles(prev => prev.filter((_, index) => index !== i))}
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
            disabled={isSendingFile}
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
            placeholder="Type a message or paste a link… (Enter to send)"
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none py-1.5 max-h-32 overflow-y-auto"
            style={{ lineHeight: "1.5" }}
          />

          {/* Send */}
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!text.trim() && pendingFiles.length === 0}
            className="flex-shrink-0 h-9 w-9 p-0 rounded-xl"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-neutral-700 mt-1.5 text-center">
          Drop files anywhere · Max 50 MB · End-to-end in same session
        </p>
      </div>
    </div>
  );
}
