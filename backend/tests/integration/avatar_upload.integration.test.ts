import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { initializeTestDataSource, destroyTestDataSource } from './setupIntegration';

describe('Avatar & File Upload integration', () => {
  let app: any;
  let uploadsDir: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await initializeTestDataSource();
    // Import app after initializing DS
    app = (await import('../../src/app')).default;
    uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  });

  afterAll(async () => {
    // Cleanup uploads created during tests
    const files = fs.readdirSync(uploadsDir).filter(f => f.includes('test-upload-'));
    for (const f of files) {
      try { fs.unlinkSync(path.join(uploadsDir, f)); } catch {}
    }
    await destroyTestDataSource();
  });

  test('list preset avatars and select avatar (auth required)', async () => {
    // List avatars (public)
    const listRes = await request(app).get('/api/avatars/list');
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveProperty('avatars');
    const avatars = listRes.body.avatars;
    expect(Array.isArray(avatars)).toBe(true);

    // Register a user
    const user = { username: 'avatarint', email: 'avatar.int@example.com', password: 'pw12345', semester: 1 };
    const reg = await request(app).post('/api/auth/register').send(user);
    expect(reg.status).toBe(200);

    const login = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
    expect(login.status).toBe(200);
    const token = login.body.token as string;
    const userId = login.body.user.id as string;

    // selecting without auth should fail
    const selNoAuth = await request(app).post('/api/avatars/select').send({ avatarId: avatars[0]?.id });
    expect(selNoAuth.status).toBe(401);

    // select with auth
    const sel = await request(app)
      .post('/api/avatars/select')
      .set('Authorization', `Bearer ${token}`)
      .send({ avatarId: avatars[0]?.id });

    expect(sel.status).toBe(200);
    expect(sel.body).toHaveProperty('user');
    expect(sel.body.user).toHaveProperty('id', userId);
    expect(sel.body.user).toHaveProperty('avatarUrl');
  }, 20000);

  test('upload file as message and download it', async () => {
    // Register user and create a chatroom where user is participant
    const user = { username: 'uploader', email: 'uploader.int@example.com', password: 'pw12345', semester: 1 };
    await request(app).post('/api/auth/register').send(user);
    const login = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
    const token = login.body.token as string;
    const userId = login.body.user.id as string;

    // create a group chat (include the user)
    const group = await request(app)
      .post('/api/chatrooms/group')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Upload Room', participantIds: [userId] });

    expect(group.status).toBe(200);
    const chatId = group.body.id || group.body.id?.toString() || group.body?.id;

    // Create a small temp file to upload
    const tmpName = `test-upload-${Date.now()}.txt`;
    const tmpPath = path.join(process.cwd(), 'uploads', tmpName);
    fs.writeFileSync(tmpPath, 'hello upload');

    // Use supertest to upload (attach will read file content)
    const uploadRes = await request(app)
      .post('/api/messages/file')
      .set('Authorization', `Bearer ${token}`)
      .field('chatRoomId', chatId)
      .attach('file', tmpPath);

    expect(uploadRes.status).toBe(201);
    expect(uploadRes.body).toHaveProperty('data');
    const fileUrl = uploadRes.body.data.fileUrl as string;
    expect(fileUrl).toBeDefined();
    const filename = fileUrl.replace('/uploads/', '');

    // Download the uploaded file via the public route
    const dl = await request(app).get(`/uploads/${filename}`);
    expect(dl.status).toBe(200);
    expect(dl.text).toContain('hello upload');

    // Cleanup the temporary file created by multer (if different)
    try { fs.unlinkSync(path.join(process.cwd(), 'uploads', filename)); } catch {}
    try { fs.unlinkSync(tmpPath); } catch {}
  }, 30000);
});
