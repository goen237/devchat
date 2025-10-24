import { useEffect, useState, useCallback, useRef } from 'react';
import { socketService } from '../services/socketService';
import type { 
  MessageReceivedData,
  UserOnlineData,
  UserOfflineData,
  RoomJoinedData,
  UserJoinedRoomData,
  UserLeftRoomData,
  ErrorData
} from '../types/socket.types';

/**
 * 🔌 useSocket Hook
 * Haupthook für Socket.io Verbindung
 */
export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Kein Token vorhanden');
      return;
    }

    // Socket verbinden
    const socket = socketService.connect(token);

    // Connection Status Listener
    const handleConnect = () => {
      console.log('✅ Socket connected in hook');
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnect = () => {
      console.log('⭕ Socket disconnected in hook');
      setIsConnected(false);
    };

    const handleError = (data: ErrorData) => {
      console.error('❌ Socket error in hook:', data);
      setError(data.message);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('error', handleError);

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('error', handleError);
    };
  }, []);

  return { isConnected, error };
}

/**
 * 💬 useChatRoom Hook
 * Hook für ChatRoom-spezifische Socket Events
 */
export function useChatRoom(chatroomId: string) {
  const [messages, setMessages] = useState<MessageReceivedData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [roomJoined, setRoomJoined] = useState(false);
  const hasJoinedRef = useRef(false);

  // Room beitreten
  useEffect(() => {
    if (!chatroomId || hasJoinedRef.current) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    // Socket verbinden falls noch nicht verbunden
    if (!socketService.isConnected()) {
      socketService.connect(token);
    }

    // Warten bis Socket verbunden ist
    const checkConnection = setInterval(() => {
      if (socketService.isConnected()) {
        clearInterval(checkConnection);
        
        // Room beitreten
        console.log('🏠 Joining room:', chatroomId);
        socketService.joinRoom({ chatroomId });
        hasJoinedRef.current = true;
        setIsConnected(true);
      }
    }, 100);

    return () => {
      clearInterval(checkConnection);
      if (hasJoinedRef.current) {
        console.log('🚪 Leaving room:', chatroomId);
        socketService.leaveRoom({ chatroomId });
        hasJoinedRef.current = false;
      }
    };
  }, [chatroomId]);

  // Event Listeners
  useEffect(() => {
    if (!chatroomId) return;

    // Neue Nachricht empfangen
    const handleMessageReceived = (data: MessageReceivedData) => {
      console.log('📨 New message received:', data);
      setMessages(prev => {
        // Duplikate vermeiden
        const exists = prev.some(m => m.id === data.id);
        if (exists) return prev;
        return [...prev, data];
      });
    };

    // Room beigetreten
    const handleRoomJoined = (data: RoomJoinedData) => {
      console.log('✅ Room joined:', data);
      setRoomJoined(true);
    };

    // User joined room
    const handleUserJoinedRoom = (data: UserJoinedRoomData) => {
      console.log('👤 User joined room:', data);
    };

    // User left room
    const handleUserLeftRoom = (data: UserLeftRoomData) => {
      console.log('👋 User left room:', data);
    };

    // Error
    const handleError = (data: ErrorData) => {
      console.error('❌ Socket error:', data);
    };

    // Listener registrieren
    socketService.on<MessageReceivedData>('messageReceived', handleMessageReceived);
    socketService.on<RoomJoinedData>('roomJoined', handleRoomJoined);
    socketService.on<UserJoinedRoomData>('userJoinedRoom', handleUserJoinedRoom);
    socketService.on<UserLeftRoomData>('userLeftRoom', handleUserLeftRoom);
    socketService.on<ErrorData>('error', handleError);

    // Cleanup
    return () => {
      socketService.off('messageReceived');
      socketService.off('roomJoined');
      socketService.off('userJoinedRoom');
      socketService.off('userLeftRoom');
      socketService.off('error');
    };
  }, [chatroomId]);

  // Nachricht senden
  const sendMessage = useCallback((content: string) => {
    if (!chatroomId || !content.trim()) return;
    
    try {
      socketService.sendMessage({
        chatroomId,
        content: content.trim()
      });
      console.log('📤 Message sent via socket');
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }, [chatroomId]);

  return {
    messages,
    sendMessage,
    isConnected,
    roomJoined
  };
}

/**
 * 👤 useUserStatus Hook
 * Hook für User online/offline Status
 */
export function useUserStatus() {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleUserOnline = (data: UserOnlineData) => {
      console.log('✅ User online:', data.username);
      setOnlineUsers(prev => new Set(prev).add(data.userId));
    };

    const handleUserOffline = (data: UserOfflineData) => {
      console.log('⭕ User offline:', data.username);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    };

    socketService.on<UserOnlineData>('userOnline', handleUserOnline);
    socketService.on<UserOfflineData>('userOffline', handleUserOffline);

    return () => {
      socketService.off('userOnline');
      socketService.off('userOffline');
    };
  }, []);

  return {
    onlineUsers,
    isUserOnline: (userId: string) => onlineUsers.has(userId)
  };
}
