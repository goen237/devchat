import request from 'supertest';
import { initializeTestDataSource, destroyTestDataSource } from './setupIntegration';

describe('Auth edge cases (401/403)', () => {
  let app: any;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await initializeTestDataSource();
  });

  afterAll(async () => {
    await destroyTestDataSource();
  });

  test('protected endpoint without Authorization header returns 401', async () => {
    const app = (await import('../../src/app')).default;
    const res = await request(app).post('/api/chatrooms/group').send({ name: 'x', participantIds: [] });
    expect(res.status).toBe(401);
  });

  test('invalid token returns 403', async () => {
    const app = (await import('../../src/app')).default;
    const res = await request(app)
      .post('/api/chatrooms/group')
      .set('Authorization', 'Bearer invalid.token')
      .send({ name: 'x', participantIds: [] });
    expect(res.status).toBe(403);
  });

  test('blacklisted token returns 401', async () => {
    // Reset modules and mock the blacklist service before importing app
    jest.resetModules();

    // Ensure jwt.verify doesn't fail due to signature checks in this isolated import.
    // We keep jwt.sign (used by login) intact but override verify to return the decoded payload.
    const realJwt = jest.requireActual('jsonwebtoken');
    jest.doMock('jsonwebtoken', () => ({
      ...realJwt,
      verify: jest.fn((token: string) => realJwt.decode(token)),
    }));

    jest.doMock('../../src/services/tokenBlacklist.service', () => ({
      isTokenBlacklisted: jest.fn().mockResolvedValue(true)
    }));

    const isolatedApp = require('../../src/app').default;

    // Register & login to get a valid token
    const user = { username: 'blkuser', email: 'blk@example.com', password: 'pw12345', semester: 1 };
    await request(isolatedApp).post('/api/auth/register').send(user);
    const login = await request(isolatedApp).post('/api/auth/login').send({ email: user.email, password: user.password });
    const token = login.body.token;

    // Derive userId from response or from token payload if missing
    const jwt = require('jsonwebtoken');
    const userId = (login.body.user && login.body.user.id) || (jwt.decode(token) as any)?.userId;

    // Send a valid request so authMiddleware reaches the blacklist check
    const res = await request(isolatedApp)
      .post('/api/chatrooms/group')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'x', participantIds: [userId] });

    expect(res.status).toBe(401);
  });
});
