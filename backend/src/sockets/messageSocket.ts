import { createMessage } from '../services/message.service';
import { AuthenticatedSocket, SendMessageData, MessageReceivedData, ErrorData, SocketServer } from './types';

/**
 * 💬 MESSAGE SOCKET
 * Verwaltet Nachrichten senden/empfangen
 */

export function setupMessageSocket(io: SocketServer, socket: AuthenticatedSocket) {
  const user = socket.user;
  
  console.log(`--> Message events setup for ${user.username}`);

  // Event: Nachricht senden
  socket.on('sendMessage', async (data: SendMessageData) => {
    try {
      console.log(`--> ${user.username} sending message to room ${data.chatroomId}`);

      // Message Service nutzen (macht Validierung + DB-Speicherung)
      const savedMessage = await createMessage({
        content: data.content,
        senderId: user.id,
        chatRoomId: data.chatroomId
      });

      // Message an alle im ChatRoom senden
      const messageData: MessageReceivedData = {
        id: savedMessage.id,
        content: savedMessage.content,
        fileUrl: savedMessage.fileUrl,
        fileType: savedMessage.fileType,
        createdAt: savedMessage.createdAt,
        sender: savedMessage.sender
      };

      // An alle im Room (inkl. Sender)
      const roomName = `chatroom_${data.chatroomId}`;
      io.to(roomName).emit('messageReceived', messageData);
      
      console.log(`--> Message sent to room ${roomName}`);

    } catch (error: any) {
      console.error('--> Error sending message:', error.message);
      
      const errorData: ErrorData = {
        type: 'MESSAGE_ERROR',
        message: error.message || 'Fehler beim Senden der Nachricht'
      };
      socket.emit('error', errorData);
    }
  });
}
