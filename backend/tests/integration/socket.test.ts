/**
 * Integration Tests: Socket.io
 * Testet Socket-Verbindungen, Events und Real-Time Features
 */

import { createServer, Server as HTTPServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { io as ClientIO, Socket as ClientSocket } from 'socket.io-client';
import { 
  initializeTestDatabase, 
  closeTestDatabase, 
  cleanDatabase,
  createTestUser,
  createTestChatRoom 
} from '../setup';
import * as Sockets from '../../src/sockets';
import { generateToken } from '../../src/utils/jwt';

describe('Socket.io - Integration Tests', () => {
  let httpServer: HTTPServer;
  let ioServer: SocketServer;
  let clientSocket: ClientSocket;
  let serverPort: number;

  beforeAll(async () => {
    await initializeTestDatabase();
    
    // HTTP Server & Socket.io Server erstellen
    httpServer = createServer();
    ioServer = new SocketServer(httpServer, {
      cors: { origin: '*' }
    });
    
    (Sockets as any).setupSocket(ioServer);
    
    // Server auf zufälligem Port starten
    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        const address = httpServer.address();
        serverPort = typeof address === 'object' && address ? address.port : 3000;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await closeTestDatabase();
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
    ioServer.close();
    httpServer.close();
  });

  beforeEach(async () => {
    await cleanDatabase();
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  describe('Socket Authentication', () => {
    it('should connect with valid JWT token', async () => {
      const user = await createTestUser();
      const token = generateToken({ userId: user.id }, '1h');

      return new Promise<void>((resolve, reject) => {
        clientSocket = ClientIO(`http://localhost:${serverPort}`, {
          auth: { token }
        });

        clientSocket.on('connect', () => {
          expect(clientSocket.connected).toBe(true);
          resolve();
        });

        clientSocket.on('connect_error', (error) => {
          reject(error);
        });

        setTimeout(() => reject(new Error('Connection timeout')), 5000);
      });
    });

    it('should reject connection without token', async () => {
      return new Promise<void>((resolve) => {
        clientSocket = ClientIO(`http://localhost:${serverPort}`);

        clientSocket.on('connect', () => {
          throw new Error('Should not connect without token');
        });

        clientSocket.on('connect_error', (error) => {
          expect(error).toBeDefined();
          resolve();
        });

        setTimeout(resolve, 2000);
      });
    });

    it('should reject connection with invalid token', async () => {
      return new Promise<void>((resolve) => {
        clientSocket = ClientIO(`http://localhost:${serverPort}`, {
          auth: { token: 'invalid-token' }
        });

        clientSocket.on('connect_error', (error) => {
          expect(error).toBeDefined();
          resolve();
        });

        setTimeout(resolve, 2000);
      });
    });
  });

  describe('User Online/Offline Status', () => {
    it('should broadcast userOnline event when user connects', async () => {
      const user1 = await createTestUser({ username: 'user1' });
      const user2 = await createTestUser({ username: 'user2' });
      
      const token1 = generateToken({ userId: user1.id }, '1h');
      const token2 = generateToken({ userId: user2.id }, '1h');

      // User1 verbindet sich
      const client1 = ClientIO(`http://localhost:${serverPort}`, {
        auth: { token: token1 }
      });

      await new Promise<void>((resolve) => {
        client1.on('connect', resolve);
      });

      // User2 verbindet sich und sollte userOnline Event für User1 bekommen
      return new Promise<void>((resolve) => {
        const client2 = ClientIO(`http://localhost:${serverPort}`, {
          auth: { token: token2 }
        });

        client2.on('userOnline', (data) => {
          expect(data.userId).toBe(user1.id);
          expect(data.username).toBe('user1');
          client1.disconnect();
          client2.disconnect();
          resolve();
        });

        setTimeout(() => resolve(), 3000);
      });
    });

    it('should broadcast userOffline event when user disconnects', async () => {
      const user1 = await createTestUser({ username: 'user1' });
      const user2 = await createTestUser({ username: 'user2' });
      
      const token1 = generateToken({ userId: user1.id }, '1h');
      const token2 = generateToken({ userId: user2.id }, '1h');

      const client1 = ClientIO(`http://localhost:${serverPort}`, {
        auth: { token: token1 }
      });

      const client2 = ClientIO(`http://localhost:${serverPort}`, {
        auth: { token: token2 }
      });

      await new Promise<void>((resolve) => {
        let connected = 0;
        const checkBoth = () => {
          connected++;
          if (connected === 2) resolve();
        };
        client1.on('connect', checkBoth);
        client2.on('connect', checkBoth);
      });

      return new Promise<void>((resolve) => {
        client2.on('userOffline', (data) => {
          expect(data.userId).toBe(user1.id);
          expect(data.username).toBe('user1');
          client2.disconnect();
          resolve();
        });

        // User1 trennt Verbindung
        client1.disconnect();

        setTimeout(() => resolve(), 3000);
      });
    });
  });

  describe('Chat Room Events', () => {
    it('should join a chatroom successfully', async () => {
      const user = await createTestUser();
      const chatRoom = await createTestChatRoom([user]);
      const token = generateToken({ userId: user.id }, '1h');

      clientSocket = ClientIO(`http://localhost:${serverPort}`, {
        auth: { token }
      });

      await new Promise<void>((resolve) => {
        clientSocket.on('connect', resolve);
      });

      return new Promise<void>((resolve) => {
        clientSocket.on('roomJoined', (data) => {
          expect(data.chatroomId).toBe(chatRoom.id);
          expect(data.message).toContain('beigetreten');
          resolve();
        });

        clientSocket.emit('joinRoom', { chatroomId: chatRoom.id });

        setTimeout(() => resolve(), 3000);
      });
    });

    it('should reject joining room if not a participant', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const chatRoom = await createTestChatRoom([user1]); // Nur user1
      const token = generateToken({ userId: user2.id }, '1h');

      clientSocket = ClientIO(`http://localhost:${serverPort}`, {
        auth: { token }
      });

      await new Promise<void>((resolve) => {
        clientSocket.on('connect', resolve);
      });

      return new Promise<void>((resolve) => {
        clientSocket.on('error', (data) => {
          expect(data.message).toContain('nicht berechtigt');
          resolve();
        });

        clientSocket.emit('joinRoom', { chatroomId: chatRoom.id });

        setTimeout(() => resolve(), 3000);
      });
    });
  });

  describe('Message Events', () => {
    it('should send and receive messages in real-time', async () => {
      const user1 = await createTestUser({ username: 'sender' });
      const user2 = await createTestUser({ username: 'receiver' });
      const chatRoom = await createTestChatRoom([user1, user2]);
      
      const token1 = generateToken({ userId: user1.id }, '1h');
      const token2 = generateToken({ userId: user2.id }, '1h');

      const client1 = ClientIO(`http://localhost:${serverPort}`, {
        auth: { token: token1 }
      });

      const client2 = ClientIO(`http://localhost:${serverPort}`, {
        auth: { token: token2 }
      });

      // Beide verbinden
      await new Promise<void>((resolve) => {
        let connected = 0;
        const checkBoth = () => {
          connected++;
          if (connected === 2) resolve();
        };
        client1.on('connect', checkBoth);
        client2.on('connect', checkBoth);
      });

      // Beide joinen den Raum
      client1.emit('joinRoom', { chatroomId: chatRoom.id });
      client2.emit('joinRoom', { chatroomId: chatRoom.id });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      return new Promise<void>((resolve) => {
        client2.on('messageReceived', (data) => {
          expect(data.content).toBe('Hello from user1');
          expect(data.sender.username).toBe('sender');
          client1.disconnect();
          client2.disconnect();
          resolve();
        });

        // Client1 sendet Nachricht
        client1.emit('sendMessage', {
          chatroomId: chatRoom.id,
          content: 'Hello from user1'
        });

        setTimeout(() => resolve(), 5000);
      });
    });
  });
});
