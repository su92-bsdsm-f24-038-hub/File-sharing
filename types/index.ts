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

export type DeviceType = "desktop" | "mobile" | "tablet";

export interface RoomDevice {
  socketId: string;
  deviceName: string;
  deviceType: DeviceType;
  joinedAt: number;
}

// ─── Text ──────────────────────────────────────────────────────────────────

export interface TextMessage {
  id: string;
  type: "text";
  text: string;
  senderId: string;
  isSelf: boolean;
  timestamp: number;
  reactions?: { emoji: string; deviceName: string }[];
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
  reactions?: { emoji: string; deviceName: string }[];
}

export type TransferMessage = TextMessage | FileProgress;

// ─── Socket Events ─────────────────────────────────────────────────────────

export interface ServerToClientEvents {
  "room:peer_joined": (data: { socketId: string }) => void;
  "room:peer_left": (data: { socketId: string }) => void;
  "room:state": (data: { devices: RoomDevice[] }) => void;
  "room:expired": (data: { reason: string }) => void;
  "transfer:text_received": (data: {
    id: string;
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
  "transfer:reaction_received": (data: { messageId: string; emoji: string; deviceName: string }) => void;
}

export interface ClientToServerEvents {
  "room:create": (
    data: { userId: string; deviceName: string; deviceType: DeviceType },
    callback: (res: { success: boolean; roomId?: string; pin?: string; error?: string }) => void
  ) => void;
  "room:join": (
    data: { roomId: string; pin: string; deviceName: string; deviceType: DeviceType },
    callback: (res: { success: boolean; error?: string }) => void
  ) => void;
  "transfer:text": (
    data: { roomId: string; id: string; text: string; targetId?: string },
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
      targetId?: string;
    },
    callback: (res: { success: boolean; error?: string }) => void
  ) => void;
  "transfer:file_chunk": (
    data: {
      roomId: string;
      transferId: string;
      chunkIndex: number;
      data: ArrayBuffer;
      targetId?: string;
    },
    callback: (res: { success: boolean; chunkIndex?: number; error?: string }) => void
  ) => void;
  "transfer:react": (
    data: { roomId: string; targetId?: string; messageId: string; emoji: string; deviceName: string },
    callback: (res: { success: boolean; error?: string }) => void
  ) => void;
}
