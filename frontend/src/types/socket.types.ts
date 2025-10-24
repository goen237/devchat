/**
 * 🔌 SOCKET TYPES
 * 
 * Alle TypeScript-Interfaces für Socket.io
 * Synchron mit backend/src/sockets/types.ts
 */

// ============= CLIENT → SERVER EVENTS =============

export interface SendMessageData {
  chatroomId: string;
  content: string;
}

export interface JoinRoomData {
  chatroomId: string;
}

export interface LeaveRoomData {
  chatroomId: string;
}

// ============= SERVER → CLIENT EVENTS =============

export interface MessageReceivedData {
  id: string;
  content: string;
  fileUrl?: string;
  fileType?: string;
  createdAt: Date;
  sender: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
}

export interface UserOnlineData {
  userId: string;
  username: string;
}

export interface UserOfflineData {
  userId: string;
  username: string;
}

export interface RoomJoinedData {
  chatroomId: string;
  chatroomName: string;
}

export interface UserJoinedRoomData {
  chatroomId: string;
  userId: string;
  username: string;
}

export interface UserLeftRoomData {
  chatroomId: string;
  userId: string;
  username: string;
}

export interface ErrorData {
  type: string;
  message: string;
  field?: string;
}

// ============= SOCKET SERVICE TYPES =============

export interface SocketState {
  connected: boolean;
  error: string | null;
}

export interface SocketEventListeners {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: ErrorData) => void;
  onMessageReceived?: (data: MessageReceivedData) => void;
  onUserOnline?: (data: UserOnlineData) => void;
  onUserOffline?: (data: UserOfflineData) => void;
  onRoomJoined?: (data: RoomJoinedData) => void;
  onUserJoinedRoom?: (data: UserJoinedRoomData) => void;
  onUserLeftRoom?: (data: UserLeftRoomData) => void;
}

// Legacy Aliases (für Kompatibilität mit altem Code)
export type ReceiveMessageData = MessageReceivedData;
export type OnlineUsersData = UserOnlineData;
export type FileUploadInfoData = MessageReceivedData;
export type UserJoinedData = UserJoinedRoomData;
export type UserLeftData = UserLeftRoomData;
export type ErrorMessageData = ErrorData;

// SocketService Type (für externe Verwendung)
export interface SocketService {
  connect(token: string): void;
  disconnect(): void;
  isConnected(): boolean;
  sendMessage(data: SendMessageData): void;
  joinRoom(data: JoinRoomData): void;
  leaveRoom(data: LeaveRoomData): void;
  on<T>(event: string, callback: (data: T) => void): void;
  off(event: string, callback?: (data: unknown) => void): void;
}
