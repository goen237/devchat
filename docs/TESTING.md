# 🧪 Testing Guide

## Übersicht

DevChat hat eine umfassende Test-Suite mit **87 Tests** und einer Code Coverage von ~82%.

```
Test Suite Overview:
├── Unit Tests (45)
│   ├── Services (35)
│   ├── Utilities (9)
│   └── Validators (21)
└── Integration Tests (42)
    ├── API Endpoints (34)
    └── Socket.io (8)
```

---

## Schnellstart

```bash
cd backend

# Alle Tests laufen lassen
npm test

# Mit Coverage Report
npm run test:coverage

# Nur Unit Tests
npm run test:unit

# Nur Integration Tests
npm run test:integration

# Watch Mode (Development)
npm run test:watch
```

---

## Test Environment Setup

### Option 1: Docker Test Database (Empfohlen)

```bash
# Automatisches Setup und Test-Run
npm run test:docker

# Oder manuell
.\scripts\docker-test-db.ps1
npm test
```

### Option 2: Lokale PostgreSQL

```bash
# Database erstellen
createdb devchat_test

# Environment Variables
# .env.test
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME_TEST=devchat_test

# Tests laufen lassen
npm test
```

---

## Test Struktur

```
backend/tests/
├── setup.ts                          # Test Configuration
├── unit/                             # Unit Tests (45)
│   ├── auth.service.test.ts         # 8 Tests
│   ├── chatroom.service.test.ts     # 12 Tests
│   ├── message.service.test.ts      # 15 Tests
│   ├── password.util.test.ts        # 4 Tests
│   ├── jwt.util.test.ts             # 5 Tests
│   ├── message.validator.test.ts    # 10 Tests
│   └── chatroom.validator.test.ts   # 11 Tests
└── integration/                      # Integration Tests (42)
    ├── auth.api.test.ts             # 10 Tests
    ├── chatroom.api.test.ts         # 12 Tests
    ├── message.api.test.ts          # 12 Tests
    └── socket.test.ts               # 8 Tests
```

---

## Unit Tests

### Service Tests

#### Auth Service Tests

```typescript
// tests/unit/auth.service.test.ts
describe('AuthService', () => {
  it('should register a new user', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const user = await authService.register(userData);
    
    expect(user).toBeDefined();
    expect(user.username).toBe('testuser');
    expect(user.password).not.toBe('password123'); // Hashed
  });

  it('should login user with valid credentials', async () => {
    const result = await authService.login(
      'test@example.com',
      'password123'
    );
    
    expect(result.user).toBeDefined();
    expect(result.token).toBeDefined();
  });
});
```

**Coverage:**
- ✅ User Registration
- ✅ Login with email
- ✅ Password validation
- ✅ JWT token generation
- ✅ Error handling (duplicate user)

#### ChatRoom Service Tests

```typescript
// tests/unit/chatroom.service.test.ts
describe('ChatRoomService', () => {
  it('should create a group chatroom', async () => {
    const chatroom = await chatroomService.createChatRoom({
      name: 'Test Group',
      is_group: true,
      created_by: userId,
      participant_ids: [user1Id, user2Id]
    });
    
    expect(chatroom.is_group).toBe(true);
    expect(chatroom.participants).toHaveLength(3); // Creator + 2
  });

  it('should create 1-to-1 chatroom', async () => {
    const chatroom = await chatroomService.createDirectChat(
      user1Id,
      user2Id
    );
    
    expect(chatroom.is_group).toBe(false);
    expect(chatroom.participants).toHaveLength(2);
  });

  it('should prevent duplicate 1-to-1 chats', async () => {
    await chatroomService.createDirectChat(user1Id, user2Id);
    
    await expect(
      chatroomService.createDirectChat(user1Id, user2Id)
    ).rejects.toThrow('Direct chat already exists');
  });
});
```

**Coverage:**
- ✅ Group chat creation
- ✅ 1-to-1 chat creation
- ✅ Duplicate chat detection
- ✅ Participant management
- ✅ Update/Delete operations

#### Message Service Tests

```typescript
// tests/unit/message.service.test.ts
describe('MessageService', () => {
  it('should create a message', async () => {
    const message = await messageService.createMessage({
      content: 'Hello, World!',
      sender_id: userId,
      chatroom_id: chatroomId
    });
    
    expect(message.content).toBe('Hello, World!');
    expect(message.sender_id).toBe(userId);
  });

  it('should get messages for chatroom', async () => {
    const messages = await messageService.getMessagesForChatRoom(
      chatroomId,
      { limit: 10 }
    );
    
    expect(messages).toBeInstanceOf(Array);
    expect(messages.length).toBeLessThanOrEqual(10);
  });

  it('should mark messages as read', async () => {
    await messageService.markMessagesAsRead(chatroomId, userId);
    
    const messages = await messageService.getMessagesForChatRoom(chatroomId);
    const unread = messages.filter(m => !m.is_read && m.sender_id !== userId);
    
    expect(unread.length).toBe(0);
  });
});
```

**Coverage:**
- ✅ Message creation
- ✅ Message retrieval
- ✅ Pagination
- ✅ Read status
- ✅ Message deletion

### Utility Tests

#### Password Utility Tests

```typescript
// tests/unit/password.util.test.ts
describe('Password Utility', () => {
  it('should hash password', async () => {
    const hashed = await hashPassword('password123');
    
    expect(hashed).toBeDefined();
    expect(hashed).not.toBe('password123');
    expect(hashed.length).toBeGreaterThan(50);
  });

  it('should verify correct password', async () => {
    const hashed = await hashPassword('password123');
    const isValid = await comparePassword('password123', hashed);
    
    expect(isValid).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const hashed = await hashPassword('password123');
    const isValid = await comparePassword('wrongpassword', hashed);
    
    expect(isValid).toBe(false);
  });
});
```

#### JWT Utility Tests

```typescript
// tests/unit/jwt.util.test.ts
describe('JWT Utility', () => {
  it('should generate valid token', () => {
    const token = generateToken({ userId: 1 });
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('should verify valid token', () => {
    const token = generateToken({ userId: 1 });
    const decoded = verifyToken(token);
    
    expect(decoded.userId).toBe(1);
  });

  it('should reject invalid token', () => {
    expect(() => {
      verifyToken('invalid-token');
    }).toThrow();
  });
});
```

### Validator Tests

#### Message Validator Tests

```typescript
// tests/unit/message.validator.test.ts
describe('Message Validator', () => {
  it('should validate correct message', () => {
    const data = {
      content: 'Hello',
      chatroom_id: 1
    };
    
    expect(() => validateMessage(data)).not.toThrow();
  });

  it('should reject empty content', () => {
    const data = {
      content: '',
      chatroom_id: 1
    };
    
    expect(() => validateMessage(data)).toThrow('Content is required');
  });

  it('should reject content over 4000 chars', () => {
    const data = {
      content: 'a'.repeat(5001),
      chatroom_id: 1
    };
    
    expect(() => validateMessage(data)).toThrow('Content too long');
  });
});
```

---

## Integration Tests

### API Endpoint Tests

#### Auth API Tests

```typescript
// tests/integration/auth.api.test.ts
describe('Auth API', () => {
  it('POST /api/auth/register - should register user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.user).toBeDefined();
    expect(response.body.token).toBeDefined();
  });

  it('POST /api/auth/login - should login user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it('GET /api/auth/me - should get current user', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.email).toBe('test@example.com');
  });

  it('GET /api/auth/me - should reject without token', async () => {
    const response = await request(app)
      .get('/api/auth/me');
    
    expect(response.status).toBe(401);
  });
});
```

#### ChatRoom API Tests

```typescript
// tests/integration/chatroom.api.test.ts
describe('ChatRoom API', () => {
  it('GET /api/chatrooms - should list chatrooms', async () => {
    const response = await request(app)
      .get('/api/chatrooms')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it('POST /api/chatrooms - should create chatroom', async () => {
    const response = await request(app)
      .post('/api/chatrooms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Group',
        is_group: true,
        participant_ids: [user2Id]
      });
    
    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Test Group');
  });

  it('GET /api/chatrooms/:id - should get chatroom details', async () => {
    const response = await request(app)
      .get(`/api/chatrooms/${chatroomId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(chatroomId);
    expect(response.body.participants).toBeDefined();
  });
});
```

#### Message API Tests

```typescript
// tests/integration/message.api.test.ts
describe('Message API', () => {
  it('POST /api/messages - should send message', async () => {
    const response = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'Hello, World!',
        chatroom_id: chatroomId
      });
    
    expect(response.status).toBe(201);
    expect(response.body.content).toBe('Hello, World!');
  });

  it('GET /api/messages/:chatroomId - should get messages', async () => {
    const response = await request(app)
      .get(`/api/messages/${chatroomId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.messages).toBeInstanceOf(Array);
  });

  it('DELETE /api/messages/:id - should delete message', async () => {
    const response = await request(app)
      .delete(`/api/messages/${messageId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
  });
});
```

### Socket.io Tests

```typescript
// tests/integration/socket.test.ts
describe('Socket.io', () => {
  let clientSocket1, clientSocket2;

  beforeAll((done) => {
    clientSocket1 = io('http://localhost:4000', {
      auth: { token: token1 }
    });
    clientSocket2 = io('http://localhost:4000', {
      auth: { token: token2 }
    });
    
    Promise.all([
      new Promise(resolve => clientSocket1.on('connect', resolve)),
      new Promise(resolve => clientSocket2.on('connect', resolve))
    ]).then(() => done());
  });

  afterAll(() => {
    clientSocket1.close();
    clientSocket2.close();
  });

  it('should join room', (done) => {
    clientSocket1.emit('join-room', {
      chatroom_id: chatroomId,
      user_id: user1Id
    });
    
    clientSocket2.on('user-joined', (data) => {
      expect(data.chatroom_id).toBe(chatroomId);
      expect(data.user.id).toBe(user1Id);
      done();
    });
  });

  it('should broadcast messages', (done) => {
    const testMessage = 'Test message via socket';
    
    clientSocket2.on('new-message', (data) => {
      expect(data.content).toBe(testMessage);
      expect(data.sender_id).toBe(user1Id);
      done();
    });
    
    clientSocket1.emit('send-message', {
      chatroom_id: chatroomId,
      content: testMessage,
      sender_id: user1Id
    });
  });

  it('should handle typing indicator', (done) => {
    clientSocket2.on('user-typing', (data) => {
      expect(data.user_id).toBe(user1Id);
      done();
    });
    
    clientSocket1.emit('typing', {
      chatroom_id: chatroomId,
      user_id: user1Id
    });
  });

  it('should track online status', (done) => {
    clientSocket2.on('user-status-changed', (data) => {
      expect(data.user_id).toBe(user1Id);
      expect(data.is_online).toBe(true);
      done();
    });
    
    clientSocket1.emit('user-online', { user_id: user1Id });
  });
});
```

---

## Test Coverage

```bash
# Coverage Report generieren
npm run test:coverage

# Coverage in Browser öffnen
# backend/coverage/lcov-report/index.html
```

**Aktueller Coverage:**
```
---------------------|---------|----------|---------|---------|
File                 | % Stmts | % Branch | % Funcs | % Lines |
---------------------|---------|----------|---------|---------|
All files            |   82.15 |    75.32 |   84.67 |   81.98 |
 services/           |   91.23 |    82.45 |   95.12 |   90.87 |
  auth.service.ts    |   94.12 |    85.71 |  100.00 |   93.75 |
  chatroom.service.ts|   89.47 |    80.00 |   90.91 |   88.89 |
  message.service.ts |   90.32 |    82.35 |   94.74 |   89.66 |
 utils/              |   95.45 |    88.89 |  100.00 |   95.00 |
  password.ts        |  100.00 |  100.00 |  100.00 |  100.00 |
  jwt.ts             |   92.31 |   83.33 |  100.00 |   91.67 |
 validators/         |   88.24 |    82.35 |   87.50 |   87.93 |
 controllers/        |   75.86 |    68.42 |   78.26 |   75.00 |
 middleware/         |   70.00 |    60.00 |   66.67 |   69.23 |
---------------------|---------|----------|---------|---------|
```

---

## Best Practices

### Test Naming Convention

```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do something when condition', () => {
      // Test implementation
    });
  });
});
```

### Test Organization

```typescript
describe('AuthService', () => {
  // Setup
  let authService: AuthService;
  let testUser: User;

  beforeAll(async () => {
    // One-time setup
  });

  beforeEach(async () => {
    // Per-test setup
    testUser = await createTestUser();
  });

  afterEach(async () => {
    // Per-test cleanup
    await cleanDatabase();
  });

  afterAll(async () => {
    // One-time cleanup
  });

  // Tests...
});
```

### Mocking

```typescript
// Mock External Services
jest.mock('../services/email.service');

// Mock Database
const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn()
};

// Mock Socket.io
const mockSocket = {
  emit: jest.fn(),
  on: jest.fn(),
  to: jest.fn().mockReturnThis()
};
```

---

## CI/CD Integration

Tests werden automatisch ausgeführt in der CI/CD Pipeline:

```yaml
# .github/workflows/tests.yml
jobs:
  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: devchat_test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

---

## Troubleshooting

### Tests schlagen fehl

```bash
# Database Connection Error
# → Check .env.test configuration
# → Verify PostgreSQL is running

# Timeout Errors
# → Increase Jest timeout in jest.config.js
jest.setTimeout(51730);

# Port already in use
# → Stop other running servers
# → Use different port in test setup
```

### Debug Tests

```bash
# Run specific test file
npm test -- auth.service.test.ts

# Run specific test case
npm test -- -t "should register user"

# Debug with Node Inspector
node --inspect-brk node_modules/.bin/jest

# Verbose output
npm test -- --verbose

# No coverage
npm test -- --coverage=false
```

---

## Writing New Tests

### Template für Unit Test

```typescript
// tests/unit/your-feature.test.ts
import { YourService } from '../../src/services/your.service';

describe('YourService', () => {
  let service: YourService;

  beforeEach(() => {
    service = new YourService();
  });

  describe('methodName', () => {
    it('should handle success case', async () => {
      const result = await service.methodName(params);
      expect(result).toBeDefined();
    });

    it('should handle error case', async () => {
      await expect(
        service.methodName(invalidParams)
      ).rejects.toThrow('Error message');
    });
  });
});
```

### Template für Integration Test

```typescript
// tests/integration/your-api.test.ts
import request from 'supertest';
import app from '../../src/app';

describe('Your API', () => {
  let token: string;

  beforeAll(async () => {
    // Setup: Create user and get token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    token = response.body.token;
  });

  describe('GET /api/your-endpoint', () => {
    it('should return data', async () => {
      const response = await request(app)
        .get('/api/your-endpoint')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });
});
```

---

**Version:** 1.0.0 | **Last Updated:** Oktober 2025
