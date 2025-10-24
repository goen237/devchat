import { io, Socket } from 'socket.io-client';
import type {
  SendMessageData,
  JoinRoomData,
  LeaveRoomData,
  MessageReceivedData,
  UserOnlineData,
  UserOfflineData,
  RoomJoinedData,
  UserJoinedRoomData,
  UserLeftRoomData,
  ErrorData
} from '../types/socket.types';

/**
 * 🔌 SOCKET SERVICE
 * Verwaltet die Socket.io Verbindung zum Backend
 */

// Re-export Types für einfachen Import
export type {
  SendMessageData,
  JoinRoomData,
  LeaveRoomData,
  MessageReceivedData,
  UserOnlineData,
  UserOfflineData,
  RoomJoinedData,
  UserJoinedRoomData,
  UserLeftRoomData,
  ErrorData
};

class SocketService {
  private socket: Socket | null = null;
  private connected: boolean = false;

  /**
   * 🔌 Socket.io Verbindung herstellen
   */
  connect(token: string): Socket {
    if (this.socket?.connected) {
      console.log('🔌 Socket already connected');
      return this.socket;
    }

    console.log('🔌 Connecting to Socket.io server...');

    this.socket = io('http://localhost:4000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    // Connection Events
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.connected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('⭕ Socket disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      this.connected = false;
    });

    // Error Event vom Server
    this.socket.on('error', (data: ErrorData) => {
      console.error('❌ Socket error from server:', data);
    });

    return this.socket;
  }

  /**
   * 🔌 Socket trennen
   */
  disconnect() {
    if (this.socket) {
      console.log('⭕ Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  /**
   * ✅ Verbindungsstatus
   */
  isConnected(): boolean {
    return this.connected && this.socket?.connected === true;
  }

  /**
   * 📤 Nachricht senden
   */
  sendMessage(data: SendMessageData) {
    if (!this.socket) {
      throw new Error('Socket nicht verbunden');
    }
    console.log('📤 Sending message:', data);
    this.socket.emit('sendMessage', data);
  }

  /**
   * 🏠 Room beitreten
   */
  joinRoom(data: JoinRoomData) {
    if (!this.socket) {
      throw new Error('Socket nicht verbunden');
    }
    console.log('🏠 Joining room:', data);
    this.socket.emit('joinRoom', data);
  }

  /**
   * 🚪 Room verlassen
   */
  leaveRoom(data: LeaveRoomData) {
    if (!this.socket) {
      throw new Error('Socket nicht verbunden');
    }
    console.log('🚪 Leaving room:', data);
    this.socket.emit('leaveRoom', data);
  }

  /**
   * 📡 Event Listener registrieren
   */
  on<T>(event: string, callback: (data: T) => void) {
    if (!this.socket) {
      console.warn('⚠️ Cannot register listener, socket not connected');
      return;
    }
    this.socket.on(event, callback);
  }

  /**
   * 🔇 Event Listener entfernen
   */
  off(event: string, callback?: (data: unknown) => void) {
    if (!this.socket) return;
    this.socket.off(event, callback as never);
  }

  /**
   * 🔍 Socket-Objekt abrufen (für direkten Zugriff)
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Singleton Export
export const socketService = new SocketService();
