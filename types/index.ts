export interface Room {
  id: string;
  pin: string;
  createdAt: number;
  lastActivity: number;
  peerCount: number;
}

export type RoomStatus =
  | "idle"
  | "creating"
  | "waiting"
  | "connected"
  | "expired"
  | "error";

export type TransferRole = "host" | "guest";

// ─── Text ──────────────────────────────────────────────────────────────────

export interface TextMessage {
  id: string;
  type: "text";
  text: string;
  senderId: string;
  isSelf: boolean;
  timestamp: number;
}

// ─── File ──────────────────────────────────────────────────────────────────

export interface FileIncomingMeta {
  transferId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  totalChunks: number;
  senderId: string;
}

export interface FileProgress {
  transferId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  totalChunks: number;
  receivedChunks: number;
  status: "incoming" | "complete" | "sending" | "sent";
  blobUrl?: string;
  isSelf: boolean;
  senderId: string;
  timestamp: number;
}

export type TransferMessage = TextMessage | FileProgress;

// ─── Socket Events ─────────────────────────────────────────────────────────

export interface ServerToClientEvents {
  "room:peer_joined": (data: { socketId: string }) => void;
  "room:peer_left": (data: { socketId: string; role: TransferRole }) => void;
  "room:expired": (data: { reason: string }) => void;
  "transfer:text_received": (data: {
    text: string;
    senderId: string;
    timestamp: number;
  }) => void;
  "transfer:file_incoming": (data: FileIncomingMeta) => void;
  "transfer:file_chunk_received": (data: {
    transferId: string;
    chunkIndex: number;
    data: ArrayBuffer | Uint8Array;
    receivedChunks: number;
    totalChunks: number;
  }) => void;
  "transfer:file_complete": (data: {
    transferId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }) => void;
  "transfer:file_complete_ack": (data: { transferId: string }) => void;
}

export interface ClientToServerEvents {
  "room:create": (
    data: { userId: string },
    callback: (res: { success: boolean; roomId?: string; pin?: string; error?: string }) => void
  ) => void;
  "room:join": (
    data: { roomId: string; pin: string },
    callback: (res: { success: boolean; error?: string }) => void
  ) => void;
  "transfer:text": (
    data: { roomId: string; text: string },
    callback: (res: { success: boolean; error?: string }) => void
  ) => void;
  "transfer:file_init": (
    data: {
      roomId: string;
      transferId: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      totalChunks: number;
    },
    callback: (res: { success: boolean; error?: string }) => void
  ) => void;
  "transfer:file_chunk": (
    data: {
      roomId: string;
      transferId: string;
      chunkIndex: number;
      data: ArrayBuffer;
    },
    callback: (res: { success: boolean; chunkIndex?: number; error?: string }) => void
  ) => void;
}
