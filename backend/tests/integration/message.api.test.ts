/**
 * Integration Tests: Message API
 * Testet vollständige Message-Workflows über HTTP
 */

import request from 'supertest';
import express, { Application } from 'express';
import { 
  initializeTestDatabase, 
  closeTestDatabase, 
  cleanDatabase,
  createTestUser,
  createTestChatRoom,
  createTestMessage 
} from '../setup';
import messageRoutes from '../../src/routes/message.routes';
import { generateToken } from '../../src/utils/jwt';

describe('Message API - Integration Tests', () => {
  let app: Application;

  beforeAll(async () => {
    await initializeTestDatabase();
    
    // Express App Setup
    app = express();
    app.use(express.json());
    app.use('/api/messages', messageRoutes);
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('GET /api/messages/:chatroomId', () => {
    it('should return messages for a chatroom', async () => {
      const user = await createTestUser();
      const chatRoom = await createTestChatRoom([user]);
      await createTestMessage(user, chatRoom, 'Message 1');
      await createTestMessage(user, chatRoom, 'Message 2');

      const token = generateToken({ userId: user.id }, '1h');

      const response = await request(app)
        .get(`/api/messages/${chatRoom.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].content).toBe('Message 1');
    });

    it('should return 401 without token', async () => {
      const user = await createTestUser();
      const chatRoom = await createTestChatRoom([user]);

      const response = await request(app)
        .get(`/api/messages/${chatRoom.id}`);

      expect(response.status).toBe(401);
    });

    it('should return 403 if user is not a participant', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const chatRoom = await createTestChatRoom([user1]);

      const token = generateToken({ userId: user2.id }, '1h');

      const response = await request(app)
        .get(`/api/messages/${chatRoom.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
    });

    it('should return empty array if no messages', async () => {
      const user = await createTestUser();
      const chatRoom = await createTestChatRoom([user]);

      const token = generateToken({ userId: user.id }, '1h');

      const response = await request(app)
        .get(`/api/messages/${chatRoom.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should include sender information', async () => {
      const user = await createTestUser({ username: 'alice' });
      const chatRoom = await createTestChatRoom([user]);
      await createTestMessage(user, chatRoom);

      const token = generateToken({ userId: user.id }, '1h');

      const response = await request(app)
        .get(`/api/messages/${chatRoom.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.body[0].sender).toBeDefined();
      expect(response.body[0].sender.username).toBe('alice');
    });
  });

  describe('POST /api/messages', () => {
    it('should create a message', async () => {
      const user = await createTestUser();
      const chatRoom = await createTestChatRoom([user]);

      const token = generateToken({ userId: user.id }, '1h');

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Hello World',
          chatRoomId: chatRoom.id
        });

      expect(response.status).toBe(201);
      expect(response.body.content).toBe('Hello World');
      expect(response.body.sender.id).toBe(user.id);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/messages')
        .send({
          content: 'Hello',
          chatRoomId: 'some-id'
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 if content is empty', async () => {
      const user = await createTestUser();
      const chatRoom = await createTestChatRoom([user]);
      const token = generateToken({ userId: user.id }, '1h');

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: '',
          chatRoomId: chatRoom.id
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 if chatRoomId is missing', async () => {
      const user = await createTestUser();
      const token = generateToken({ userId: user.id }, '1h');

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Hello'
        });

      expect(response.status).toBe(400);
    });

    it('should return 403 if user is not a participant', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const chatRoom = await createTestChatRoom([user1]);

      const token = generateToken({ userId: user2.id }, '1h');

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Hello',
          chatRoomId: chatRoom.id
        });

      expect(response.status).toBe(403);
    });

    it('should trim message content', async () => {
      const user = await createTestUser();
      const chatRoom = await createTestChatRoom([user]);
      const token = generateToken({ userId: user.id }, '1h');

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: '  Hello World  ',
          chatRoomId: chatRoom.id
        });

      expect(response.body.content).toBe('Hello World');
    });
  });

  describe('DELETE /api/messages/:id', () => {
    it('should delete a message', async () => {
      const user = await createTestUser();
      const chatRoom = await createTestChatRoom([user]);
      const message = await createTestMessage(user, chatRoom);

      const token = generateToken({ userId: user.id }, '1h');

      const response = await request(app)
        .delete(`/api/messages/${message.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('gelöscht');
    });

    it('should return 401 without token', async () => {
      const user = await createTestUser();
      const chatRoom = await createTestChatRoom([user]);
      const message = await createTestMessage(user, chatRoom);

      const response = await request(app)
        .delete(`/api/messages/${message.id}`);

      expect(response.status).toBe(401);
    });

    it('should return 404 if message not found', async () => {
      const user = await createTestUser();
      const token = generateToken({ userId: user.id }, '1h');

      const response = await request(app)
        .delete('/api/messages/nonexistent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('should return 403 if user is not the sender', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const chatRoom = await createTestChatRoom([user1, user2]);
      const message = await createTestMessage(user1, chatRoom);

      const token = generateToken({ userId: user2.id }, '1h');

      const response = await request(app)
        .delete(`/api/messages/${message.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
    });
  });
});
