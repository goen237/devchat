import request from 'supertest';
import { initializeTestDataSource, destroyTestDataSource } from './setupIntegration';

describe('Auth integration', () => {
  let app: any;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await initializeTestDataSource();
    // Import app after test DataSource initialized so services that access getDataSource() pick up the test DS
    app = (await import('../../src/app')).default;
  });

  afterAll(async () => {
    await destroyTestDataSource();
  });

  test('health endpoint returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  test('register -> login flow (integration)', async () => {
    const user = {
      username: 'intuser',
      email: 'int@example.com',
      password: 'password123',
      semester: 1
    };

    // Register
    const reg = await request(app).post('/api/auth/register').send(user);
    expect(reg.status).toBe(200);
    expect(reg.body).toHaveProperty('message');

    // Login
    const login = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
    expect(login.status).toBe(200);
    expect(login.body).toHaveProperty('token');
    expect(login.body).toHaveProperty('user');
    expect(login.body.user).toHaveProperty('email', user.email);
  }, 20000);
});
