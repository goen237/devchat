/**
 * Integration Tests: Auth API
 * Testet vollständige Auth-Workflows über HTTP
 */

import request from 'supertest';
import express, { Application } from 'express';
import { 
  initializeTestDatabase, 
  closeTestDatabase, 
  cleanDatabase,
  createTestUser 
} from '../setup';
import authRoutes from '../../src/routes/auth.routes';
import { hashPassword } from '../../src/utils/password';

describe('Auth API - Integration Tests', () => {
  let app: Application;

  beforeAll(async () => {
    await initializeTestDatabase();
    
    // Express App Setup
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'Password123!',
          semester: 3
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe('newuser');
      expect(response.body.user.email).toBe('newuser@example.com');
      expect(response.body.user.id).toBeDefined();
    });

    it('should return 400 if user already exists', async () => {
      const email = 'existing@example.com';
      await createTestUser({ email });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email,
          password: 'Password123!',
          semester: 2
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('exist');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'user'
          // Missing email, password, semester
        });

      expect(response.status).toBe(400);
    });

    it('should not return password hash in response', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'user',
          email: 'user@example.com',
          password: 'Password123!',
          semester: 1
        });

      expect(response.body.user.passwordHash).toBeUndefined();
      expect(response.body.user.password).toBeUndefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const email = 'login@example.com';
      const password = 'Password123!';
      const passwordHash = await hashPassword(password);
      
      await createTestUser({ 
        email, 
        passwordHash,
        username: 'loginuser' 
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email, password });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(email);
      expect(typeof response.body.token).toBe('string');
    });

    it('should return 401 with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return 401 with invalid password', async () => {
      const email = 'user@example.com';
      const passwordHash = await hashPassword('correctpassword');
      
      await createTestUser({ email, passwordHash });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return JWT token with userId', async () => {
      const email = 'jwt@example.com';
      const password = 'Password123!';
      const passwordHash = await hashPassword(password);
      
      const user = await createTestUser({ email, passwordHash });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email, password });

      const token = response.body.token;
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString()
      );

      expect(payload.userId).toBe(user.id);
    });

    it('should return 400 if fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com'
          // Missing password
        });

      expect(response.status).toBe(400);
    });
  });
});
