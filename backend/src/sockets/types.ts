import { Socket, Server } from 'socket.io';
import { User } from '../entities/User';

/**
 * 📦 SOCKET TYPES
 * Alle TypeScript-Typen für Socket.io
 */

// Socket mit authentifiziertem User
export interface AuthenticatedSocket extends Socket {
  user: User;
}

// ============= CLIENT → SERVER EVENTS =============

export interface SendMessageData {
  chatroomId: string;  // UUID
  content: string;
}

export interface JoinRoomData {
  chatroomId: string;  // UUID
}

export interface LeaveRoomData {
  chatroomId: string;  // UUID
}

// ============= SERVER → CLIENT EVENTS =============

export interface UserOnlineData {
  userId: string;
  username: string;
}

export interface UserOfflineData {
  userId: string;
  username: string;
}

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

export type SocketServer = Server;
