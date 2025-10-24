/**
 * Integration Tests: ChatRoom API
 * Testet vollständige ChatRoom-Workflows über HTTP
 */

import request from 'supertest';
import express, { Application } from 'express';
import { 
  initializeTestDatabase, 
  closeTestDatabase, 
  cleanDatabase,
  createTestUser,
  createTestChatRoom 
} from '../setup';
import chatroomRoutes from '../../src/routes/chatroom.routes';
import { generateToken } from '../../src/utils/jwt';

describe('ChatRoom API - Integration Tests', () => {
  let app: Application;

  beforeAll(async () => {
    await initializeTestDatabase();
    
    // Express App Setup
    app = express();
    app.use(express.json());
    app.use('/api/chatrooms', chatroomRoutes);
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('GET /api/chatrooms', () => {
    it('should return user chatrooms', async () => {
      const user = await createTestUser();
      const user2 = await createTestUser();
      await createTestChatRoom([user, user2], { name: 'Test Chat' });

      const token = generateToken({ userId: user.id }, '1h');

      const response = await request(app)
        .get('/api/chatrooms')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Test Chat');
      expect(response.body[0].participants).toHaveLength(2);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/chatrooms');

      expect(response.status).toBe(401);
    });

    it('should return empty array if no chatrooms', async () => {
      const user = await createTestUser();
      const token = generateToken({ userId: user.id }, '1h');

      const response = await request(app)
        .get('/api/chatrooms')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should include participant details', async () => {
      const user1 = await createTestUser({ username: 'alice' });
      const user2 = await createTestUser({ username: 'bob' });
      await createTestChatRoom([user1, user2]);

      const token = generateToken({ userId: user1.id }, '1h');

      const response = await request(app)
        .get('/api/chatrooms')
        .set('Authorization', `Bearer ${token}`);

      const participants = response.body[0].participants;
      expect(participants[0]).toHaveProperty('id');
      expect(participants[0]).toHaveProperty('username');
      expect(participants[0]).toHaveProperty('email');
      expect(participants[0]).toHaveProperty('avatarUrl');
    });
  });

  describe('POST /api/chatrooms/group', () => {
    it('should create a group chat', async () => {
      const creator = await createTestUser({ username: 'creator' });
      const user2 = await createTestUser();
      const user3 = await createTestUser();

      const token = generateToken({ userId: creator.id }, '1h');

      const response = await request(app)
        .post('/api/chatrooms/group')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Study Group',
          participantIds: [user2.id, user3.id]
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Study Group');
      expect(response.body.type).toBe('group');
      expect(response.body.participants).toHaveLength(3);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/chatrooms/group')
        .send({
          name: 'Chat',
          participantIds: []
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 if name is missing', async () => {
      const user = await createTestUser();
      const token = generateToken({ userId: user.id }, '1h');

      const response = await request(app)
        .post('/api/chatrooms/group')
        .set('Authorization', `Bearer ${token}`)
        .send({
          participantIds: []
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/chatrooms/private', () => {
    it('should create a private chat', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();

      const token = generateToken({ userId: user1.id }, '1h');

      const response = await request(app)
        .post('/api/chatrooms/private')
        .set('Authorization', `Bearer ${token}`)
        .send({
          otherUserId: user2.id
        });

      expect(response.status).toBe(201);
      expect(response.body.type).toBe('private');
      expect(response.body.participants).toHaveLength(2);
    });

    it('should return existing private chat', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();

      const token = generateToken({ userId: user1.id }, '1h');

      // Erster Request
      const response1 = await request(app)
        .post('/api/chatrooms/private')
        .set('Authorization', `Bearer ${token}`)
        .send({ otherUserId: user2.id });

      // Zweiter Request
      const response2 = await request(app)
        .post('/api/chatrooms/private')
        .set('Authorization', `Bearer ${token}`)
        .send({ otherUserId: user2.id });

      expect(response1.body.id).toBe(response2.body.id);
    });

    it('should return 400 if otherUserId is missing', async () => {
      const user = await createTestUser();
      const token = generateToken({ userId: user.id }, '1h');

      const response = await request(app)
        .post('/api/chatrooms/private')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/chatrooms/:id', () => {
    it('should delete a chatroom', async () => {
      const user = await createTestUser();
      const chatRoom = await createTestChatRoom([user]);

      const token = generateToken({ userId: user.id }, '1h');

      const response = await request(app)
        .delete(`/api/chatrooms/${chatRoom.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('gelöscht');
    });

    it('should return 401 without token', async () => {
      const user = await createTestUser();
      const chatRoom = await createTestChatRoom([user]);

      const response = await request(app)
        .delete(`/api/chatrooms/${chatRoom.id}`);

      expect(response.status).toBe(401);
    });

    it('should return 404 if chatroom not found', async () => {
      const user = await createTestUser();
      const token = generateToken({ userId: user.id }, '1h');

      const response = await request(app)
        .delete('/api/chatrooms/nonexistent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });
});
