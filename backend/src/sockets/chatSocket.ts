import { AppDataSource } from '../config/data-source';
import { ChatRoom } from '../entities/ChatRoom';
import { AuthenticatedSocket, JoinRoomData, LeaveRoomData, RoomJoinedData, UserJoinedRoomData, UserLeftRoomData, ErrorData, SocketServer } from './types';

/**
 * 🏠 CHATROOM SOCKET
 * Verwaltet ChatRoom join/leave
 */

export function setupChatRoomSocket(io: SocketServer, socket: AuthenticatedSocket) {
  const user = socket.user;
  
  console.log(`--> ChatRoom events setup for ${user.username}`);

  // Event: Room beitreten
  socket.on('joinRoom', async (data: JoinRoomData) => {
    try {
      console.log(`🏠 ${user.username} joining room ${data.chatroomId}`);

      // ChatRoom aus DB laden
      const chatRoomRepo = AppDataSource.getRepository(ChatRoom);
      const chatRoom = await chatRoomRepo.findOne({
        where: { id: data.chatroomId },
        relations: ['participants']
      });

      if (!chatRoom) {
        const error: ErrorData = {
          type: 'NOT_FOUND',
          message: 'ChatRoom nicht gefunden'
        };
        socket.emit('error', error);
        return;
      }

      // Prüfen ob User Mitglied ist
      const isMember = chatRoom.participants.some(p => p.id === user.id);
      if (!isMember) {
        const error: ErrorData = {
          type: 'FORBIDDEN',
          message: 'Du bist kein Mitglied dieses ChatRooms'
        };
        socket.emit('error', error);
        return;
      }

      // Socket.io Room beitreten
      const roomName = `chatroom_${chatRoom.id}`;
      await socket.join(roomName);

      // Bestätigung an User
      const joinedData: RoomJoinedData = {
        chatroomId: chatRoom.id,
        chatroomName: chatRoom.name
      };
      socket.emit('roomJoined', joinedData);

      // Anderen im Room Bescheid geben
      const userJoinedData: UserJoinedRoomData = {
        chatroomId: chatRoom.id,
        userId: user.id,
        username: user.username
      };
      socket.to(roomName).emit('userJoinedRoom', userJoinedData);

      console.log(`--> ${user.username} joined ${chatRoom.name}`);

    } catch (error: any) {
      console.error('--> Error joining room:', error);
      const errorData: ErrorData = {
        type: 'SERVER_ERROR',
        message: 'Fehler beim Beitreten'
      };
      socket.emit('error', errorData);
    }
  });

  // Event: Room verlassen
  socket.on('leaveRoom', async (data: LeaveRoomData) => {
    try {
      console.log(`--> ${user.username} leaving room ${data.chatroomId}`);

      const roomName = `chatroom_${data.chatroomId}`;
      await socket.leave(roomName);

      // Anderen Bescheid geben
      const userLeftData: UserLeftRoomData = {
        chatroomId: data.chatroomId,
        userId: user.id,
        username: user.username
      };
      socket.to(roomName).emit('userLeftRoom', userLeftData);

      console.log(`--> ${user.username} left room`);

    } catch (error) {
      console.error('--> Error leaving room:', error);
    }
  });
}
