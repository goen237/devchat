import request from 'supertest';
import { initializeTestDataSource, destroyTestDataSource } from './setupIntegration';

describe('Chat & Message integration', () => {
  let app: any;
  let tokenA: string;
  let tokenB: string;
  let userA: any;
  let userB: any;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await initializeTestDataSource();
    app = (await import('../../src/app')).default;
  });

  afterAll(async () => {
    await destroyTestDataSource();
  });

  test('register two users and login', async () => {
    const a = { username: 'AliceInt', email: 'alice.int@example.com', password: 'pw12345', semester: 1 };
    const b = { username: 'BobInt', email: 'bob.int@example.com', password: 'pw12345', semester: 2 };

    const regA = await request(app).post('/api/auth/register').send(a);
    expect(regA.status).toBe(200);

    const regB = await request(app).post('/api/auth/register').send(b);
    expect(regB.status).toBe(200);

    const loginA = await request(app).post('/api/auth/login').send({ email: a.email, password: a.password });
    expect(loginA.status).toBe(200);
    tokenA = loginA.body.token;
    userA = loginA.body.user;

    const loginB = await request(app).post('/api/auth/login').send({ email: b.email, password: b.password });
    expect(loginB.status).toBe(200);
    tokenB = loginB.body.token;
    userB = loginB.body.user;
  }, 20000);

  test('start private chat and create message, then fetch messages', async () => {
    // Start private chat
    const start = await request(app)
      .post('/api/chatrooms/private')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ userId: userB.id });

    expect(start.status).toBe(200);
    const privateRoom = start.body;
    expect(privateRoom).toHaveProperty('id');

    // Post message in private chat
    const msg = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ chatRoomId: privateRoom.id, content: 'Hello Bob!' });

    expect(msg.status).toBe(201);
    expect(msg.body.data).toHaveProperty('content', 'Hello Bob!');

    // Fetch messages as Bob
    const fetched = await request(app)
      .get(`/api/messages/room/${privateRoom.id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(fetched.status).toBe(200);
    expect(fetched.body.data.length).toBeGreaterThanOrEqual(1);
    expect(fetched.body.data[0]).toHaveProperty('content', 'Hello Bob!');
  }, 20000);

  test('create group chat and list user chatrooms', async () => {
    const groupRes = await request(app)
      .post('/api/chatrooms/group')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Test Group', participantIds: [userB.id] });

    expect(groupRes.status).toBe(200);
    const group = groupRes.body;
    expect(group).toHaveProperty('id');

    // List chatrooms for Bob
    const list = await request(app)
      .get('/api/chatrooms')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    // Bob should have at least one chatroom (private or group)
    expect(list.body.length).toBeGreaterThanOrEqual(1);
  }, 20000);
});
