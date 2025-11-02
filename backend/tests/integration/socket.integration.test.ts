import { initializeTestDataSource, destroyTestDataSource } from './setupIntegration';
import http from 'http';

// Prevent the userSocket from performing DB operations on connect/disconnect during tests
jest.mock('../../src/sockets/userSocket', () => ({
  setupUserSocket: jest.fn()
}));

import { initializeSocket } from '../../src/sockets';
import request from 'supertest';
import { io as Client, Socket } from 'socket.io-client';

describe('Socket.io integration', () => {
  let app: any;
  let server: http.Server;
  let port: number;
  let ioInstance: any;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await initializeTestDataSource();
    app = (await import('../../src/app')).default;
    // start HTTP server on ephemeral port
    server = http.createServer(app);
    ioInstance = initializeSocket(server as any);
    await new Promise<void>(resolve => {
      server.listen(0, () => {
        // @ts-ignore
        port = (server.address() as any).port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (ioInstance && typeof ioInstance.close === 'function') ioInstance.close();
    await new Promise<void>(resolve => server.close(() => resolve()));
    await destroyTestDataSource();
  });

  test('connect without token emits AUTH_ERROR and disconnects', (done) => {
    const client: Socket = Client(`http://localhost:${port}`, { autoConnect: true, reconnection: false });

      let finished = false;
      // connect will still happen at transport level; server should emit error then disconnect
      client.on('connect', () => {
        // no-op: transport-level connect is expected; actual auth error is emitted next
      });

      let sawError = false;
      client.on('error', (err: any) => {
        sawError = true;
        expect(err).toBeDefined();
      });

      client.on('disconnect', () => {
        if (finished) return;
        finished = true;
        expect(sawError).toBe(true);
        client.close();
        done();
      });
  }, 10000);

  test('joinRoom success and forbidden', (done) => {
    // Register user and create a chatroom
    const user = { username: 'socketA', email: 'socket.a@example.com', password: 'pw12345', semester: 1 };
    (async () => {
      await request(app).post('/api/auth/register').send(user);
      const login = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
      const token = login.body.token;
      const userId = login.body.user.id;

      // create a group chat where user is participant
      const group = await request(app).post('/api/chatrooms/group').set('Authorization', `Bearer ${token}`).send({ name: 'SocketRoom', participantIds: [userId] });
      expect(group.status).toBe(200);
      const chatId = group.body.id || group.body?.id;

      // connect client with token
      const client: Socket = Client(`http://localhost:${port}`, { auth: { token }, reconnection: false });

      client.on('connect', async () => {
        // attempt to join the room where user is a member
        client.emit('joinRoom', { chatroomId: chatId });
      });

      client.on('roomJoined', (data: any) => {
        expect(data).toHaveProperty('chatroomId');
        // Now try to join a non-existent room -> should return error
        client.emit('joinRoom', { chatroomId: 'non-existent-room' });
      });

      client.on('error', (err: any) => {
        // Expect error for non-existent room or forbidden
        expect(err).toBeDefined();
        client.close();
        done();
      });
    })();
  }, 20000);
});
