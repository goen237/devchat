import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../utils/jwt';
import { getDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { AuthenticatedSocket } from './types';
import { setupUserSocket } from './userSocket';
import { setupMessageSocket } from './messageSocket';
import { setupChatRoomSocket } from './chatSocket';

/**
 * 🔌 SOCKET.IO HAUPTDATEI
 * Initialisiert Socket.io Server und registriert Handler
 */

export function initializeSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true
    }
  });

  console.log('🔌 Socket.io initialized');

  // Connection Event
  io.on('connection', async (socket) => {
    console.log(`🔌 Connection attempt: ${socket.id}`);

    try {
      // Token aus Handshake holen
      const token = socket.handshake.auth.token;
      
      if (!token) {
        console.log('--> No token');
        socket.emit('error', {
          type: 'AUTH_ERROR',
          message: 'Kein Token bereitgestellt'
        });
        socket.disconnect();
        return;
      }

      // Token verifizieren
      const payload = verifyToken(token);
      if (!payload || typeof payload === 'string') {
        console.log('--> Invalid token');
        socket.emit('error', {
          type: 'AUTH_ERROR',
          message: 'Ungültiges Token'
        });
        socket.disconnect();
        return;
      }

      const userId = (payload as any).userId;
      if (!userId) {
        console.log('--> No userId in token');
        socket.emit('error', {
          type: 'AUTH_ERROR',
          message: 'Ungültiges Token'
        });
        socket.disconnect();
        return;
      }

      // User aus DB laden
      const userRepo = getDataSource().getRepository(User);
      const user = await userRepo.findOne({ where: { id: userId } });
      
      if (!user) {
        console.log('--> User not found');
        socket.emit('error', {
          type: 'AUTH_ERROR',
          message: 'User nicht gefunden'
        });
        socket.disconnect();
        return;
      }

      // User an Socket anhängen
      (socket as AuthenticatedSocket).user = user;
      console.log(`--> ${user.username} authenticated`);

      // Handler registrieren
      const authSocket = socket as AuthenticatedSocket;
      setupUserSocket(io, authSocket);
      setupMessageSocket(io, authSocket);
      setupChatRoomSocket(io, authSocket);

      console.log(`--> All handlers registered for ${user.username}`);

    } catch (error) {
      console.error('--> Auth error:', error);
      socket.emit('error', {
        type: 'AUTH_ERROR',
        message: 'Authentifizierung fehlgeschlagen'
      });
      socket.disconnect();
    }
  });

  return io;
}
