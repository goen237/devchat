# 🏗️ DevChat Architecture Documentation

## Inhaltsverzeichnis

- [System Overview](#system-overview)
- [Architecture Patterns](#architecture-patterns)
- [Technology Stack](#technology-stack)
- [Database Design](#database-design)
- [API Architecture](#api-architecture)
- [Real-Time Communication](#real-time-communication)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Scalability Considerations](#scalability-considerations)

---

## System Overview

DevChat ist eine moderne, skalierbare Echtzeit-Chat-Anwendung mit einer **3-Tier Architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│                  (React SPA + Socket.io)                     │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│        (Express REST API + Socket.io Server)                 │
│                  Business Logic Layer                        │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│           (PostgreSQL + Redis + File Storage)                │
└─────────────────────────────────────────────────────────────┘
```

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                          Client Side                           │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  React Application (SPA)                                 │ │
│  │  • React Router  • Material-UI  • Axios                  │ │
│  │  • Socket.io Client  • State Management                  │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                    ↕ HTTPS/WSS ↕
┌────────────────────────────────────────────────────────────────┐
│                       nginx (Reverse Proxy)                    │
│  • SSL Termination  • Load Balancing  • Static Assets         │
└────────────────────────────────────────────────────────────────┘
                    ↕ HTTP/WS ↕
┌────────────────────────────────────────────────────────────────┐
│                       Application Server                       │
│  ┌──────────────────────┐    ┌──────────────────────┐        │
│  │   Express Server     │    │  Socket.io Server    │        │
│  │  • REST API          │    │  • WebSocket Events  │        │
│  │  • Middleware        │    │  • Room Management   │        │
│  │  • Auth Guards       │    │  • Broadcasting      │        │
│  └──────────────────────┘    └──────────────────────┘        │
│              ↕                          ↕                      │
│  ┌───────────────────────────────────────────────────────┐   │
│  │            Business Logic Layer                        │   │
│  │  • Auth Service    • Chatroom Service                 │   │
│  │  • Message Service • User Service                     │   │
│  │  • Avatar Service  • Profile Service                  │   │
│  └───────────────────────────────────────────────────────┘   │
│              ↕ TypeORM ↕                                      │
│  ┌───────────────────────────────────────────────────────┐   │
│  │             Data Access Layer (TypeORM)                │   │
│  │  • Entities  • Repositories  • Migrations              │   │
│  └───────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
                    ↕ TCP/IP ↕
┌────────────────────────────────────────────────────────────────┐
│                        Data Layer                              │
│  ┌──────────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │   PostgreSQL     │  │    Redis     │  │  File Storage  │  │
│  │  • User Data     │  │  • Sessions  │  │  • Avatars     │  │
│  │  • Messages      │  │  • Cache     │  │  • Uploads     │  │
│  │  • Chatrooms     │  │  • Pub/Sub   │  │                │  │
│  └──────────────────┘  └──────────────┘  └────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## Architecture Patterns

### 1. **Layered Architecture**

```
┌──────────────────────────────────────┐
│       Presentation Layer             │
│  (React Components, Pages, Hooks)    │
└──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────┐
│       Application Layer              │
│    (Controllers, Routes, API)        │
└──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────┐
│       Business Logic Layer           │
│   (Services, Validators, Utils)      │
└──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────┐
│       Data Access Layer              │
│   (TypeORM Entities, Repositories)   │
└──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────┐
│          Database Layer              │
│      (PostgreSQL, Redis)             │
└──────────────────────────────────────┘
```

**Vorteile:**
- ✅ Separation of Concerns
- ✅ Testbarkeit
- ✅ Wartbarkeit
- ✅ Skalierbarkeit

### 2. **MVC Pattern** (Backend)

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Router    │──────│ Controller  │──────│   Service   │
│  (Routes)   │      │  (Handler)  │      │  (Logic)    │
└─────────────┘      └─────────────┘      └─────────────┘
                            ↓                      ↓
                     ┌─────────────┐      ┌─────────────┐
                     │ Validator   │      │   Entity    │
                     │ (Input)     │      │   (Model)   │
                     └─────────────┘      └─────────────┘
```

**Beispiel Flow:**
```
Request → Router → Controller → Validator → Service → Entity → DB
Response ← Controller ← Service ← Entity ← DB
```

### 3. **Repository Pattern**

```typescript
// Entity (Model)
@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  username: string;
}

// Repository (Data Access)
const userRepository = getDataSource().getRepository(User);

// Service (Business Logic)
class UserService {
  async findUserById(id: number) {
    return await userRepository.findOne({ where: { id } });
  }
}

// Controller (Request Handler)
class UserController {
  async getUser(req, res) {
    const user = await userService.findUserById(req.params.id);
    res.json(user);
  }
}
```

### 4. **Pub/Sub Pattern** (Socket.io)

```typescript
// Publisher
socket.to(roomId).emit('new-message', messageData);

// Subscriber
socket.on('new-message', (data) => {
  // Handle new message
});
```

---

## Technology Stack

### Frontend Stack

```
React 19.1.1
    ├── React Router 7.9.2          (Routing)
    ├── Material-UI 7.3.2           (UI Components)
    ├── Axios 1.12.2                (HTTP Client)
    ├── Socket.io Client 4.8.1      (WebSocket)
    └── TypeScript 5.8.3            (Type Safety)

Build Tools:
    ├── Vite 7.1.2                  (Build Tool)
    ├── ESLint                      (Linting)
    └── TypeScript Compiler         (Type Checking)
```

### Backend Stack

```
Node.js 20.x
    ├── Express 5.1.0               (Web Framework)
    ├── TypeORM 0.3.27              (ORM)
    ├── Socket.io 4.8.1             (WebSocket)
    ├── JWT 9.0.2                   (Authentication)
    ├── bcrypt 6.0.0                (Password Hashing)
    └── TypeScript 5.9.2            (Type Safety)

Database:
    ├── PostgreSQL 15+              (Primary Database)
    └── Redis 7                     (Caching, Sessions)

Testing:
    ├── Jest 30.1.3                 (Test Framework)
    ├── Supertest 7.1.4             (API Testing)
    └── Socket.io Client            (WebSocket Testing)
```

### DevOps Stack

```
Containerization:
    ├── Docker                      (Containers)
    └── Docker Compose              (Orchestration)

CI/CD:
    ├── GitHub Actions              (Pipeline)
    ├── Dependabot                  (Dependency Updates)
    └── CodeQL                      (Security Scanning)

Monitoring:
    ├── Health Checks               (Service Monitoring)
    └── Logging                     (Application Logs)
```

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────────┐         ┌─────────────────────┐
│     Users       │         │     ChatRooms       │
├─────────────────┤         ├─────────────────────┤
│ id (PK)         │         │ id (PK)             │
│ username        │         │ name                │
│ email           │         │ is_group            │
│ password        │◄────────│ created_by (FK)     │
│ bio             │         │ created_at          │
│ avatar_url      │         │ updated_at          │
│ is_online       │         └─────────────────────┘
│ last_seen       │                   │
│ created_at      │                   │ M:N
│ updated_at      │                   │
└─────────────────┘                   ↓
        │                  ┌──────────────────────┐
        │                  │ chatroom_participants│
        │                  ├──────────────────────┤
        │  1:N             │ chatroom_id (FK)     │
        └──────────────────│ user_id (FK)         │
                           │ joined_at            │
        ┌──────────────────┤ (Composite PK)       │
        │                  └──────────────────────┘
        │
        │
        ↓
┌─────────────────┐
│    Messages     │
├─────────────────┤
│ id (PK)         │
│ content         │
│ sender_id (FK)  │──────► Users.id
│ chatroom_id (FK)│──────► ChatRooms.id
│ is_read         │
│ created_at      │
└─────────────────┘
```

### Table Schemas

#### Users Table

```sql
CREATE TABLE users (
    id                SERIAL PRIMARY KEY,
    username          VARCHAR(50) UNIQUE NOT NULL,
    email             VARCHAR(255) UNIQUE NOT NULL,
    password          VARCHAR(255) NOT NULL,
    bio               TEXT,
    avatar_url        VARCHAR(500),
    is_online         BOOLEAN DEFAULT false,
    last_seen         TIMESTAMP,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_online ON users(is_online);
```

#### ChatRooms Table

```sql
CREATE TABLE chatrooms (
    id                SERIAL PRIMARY KEY,
    name              VARCHAR(255),
    is_group          BOOLEAN DEFAULT false,
    created_by        INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_chatrooms_created_by ON chatrooms(created_by);
CREATE INDEX idx_chatrooms_is_group ON chatrooms(is_group);
```

#### Messages Table

```sql
CREATE TABLE messages (
    id                SERIAL PRIMARY KEY,
    content           TEXT NOT NULL,
    sender_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
    chatroom_id       INTEGER REFERENCES chatrooms(id) ON DELETE CASCADE,
    is_read           BOOLEAN DEFAULT false,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_chatroom_id ON messages(chatroom_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_is_read ON messages(is_read);
```

#### ChatRoom Participants (Join Table)

```sql
CREATE TABLE chatroom_participants (
    chatroom_id       INTEGER REFERENCES chatrooms(id) ON DELETE CASCADE,
    user_id           INTEGER REFERENCES users(id) ON DELETE CASCADE,
    joined_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (chatroom_id, user_id)
);

-- Indexes
CREATE INDEX idx_participants_user_id ON chatroom_participants(user_id);
CREATE INDEX idx_participants_chatroom_id ON chatroom_participants(chatroom_id);
```

### Data Flow

#### Create Message Flow

```
1. Client sends message via Socket.io
        ↓
2. Server validates JWT token
        ↓
3. MessageService.createMessage()
        ↓
4. Validate user is participant
        ↓
5. Create Message entity
        ↓
6. Save to PostgreSQL
        ↓
7. Broadcast to room participants
        ↓
8. Update last_message in chatroom
        ↓
9. Increment unread_count
```

---

## API Architecture

### REST API Structure

```
/api
├── /auth
│   ├── POST   /register        # User registration
│   ├── POST   /login           # User login
│   └── GET    /me              # Get current user
├── /chatrooms
│   ├── GET    /                # List chatrooms
│   ├── POST   /                # Create chatroom
│   ├── GET    /:id             # Get chatroom details
│   ├── PUT    /:id             # Update chatroom
│   ├── DELETE /:id             # Delete chatroom
│   └── POST   /:id/participants # Add participants
├── /messages
│   ├── GET    /:chatroomId     # Get messages
│   ├── POST   /                # Send message
│   ├── DELETE /:id             # Delete message
│   └── PUT    /:chatroomId/read # Mark as read
├── /users
│   ├── GET    /                # List users
│   └── GET    /:id             # Get user details
├── /profile
│   ├── GET    /                # Get own profile
│   └── PUT    /                # Update profile
└── /avatars
    ├── GET    /                # List avatars
    └── POST   /select          # Select avatar
```

### Middleware Stack

```typescript
Request
    ↓
1. CORS Middleware
    ↓
2. Body Parser (express.json())
    ↓
3. Static File Serving
    ↓
4. Rate Limiting (optional)
    ↓
5. Authentication (JWT)
    ↓
6. Route Handler
    ↓
7. Error Handler
    ↓
Response
```

### Authentication Flow

```
┌──────────┐                  ┌──────────┐
│  Client  │                  │  Server  │
└────┬─────┘                  └────┬─────┘
     │                             │
     │  1. POST /api/auth/login    │
     │  { email, password }        │
     │─────────────────────────────►
     │                             │
     │       2. Validate           │
     │       credentials           │
     │                             │
     │   3. Generate JWT Token     │
     │◄─────────────────────────────
     │   { token, user }           │
     │                             │
     │  4. Store token             │
     │     in localStorage         │
     │                             │
     │  5. Subsequent requests     │
     │     Authorization: Bearer   │
     │─────────────────────────────►
     │                             │
     │  6. Verify JWT              │
     │                             │
     │  7. Response                │
     │◄─────────────────────────────
     │                             │
```

---

## Real-Time Communication

### Socket.io Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Socket.io Server                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               Namespace: /                            │  │
│  │                                                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │ Room: chat1 │  │ Room: chat2 │  │ Room: chat3 │  │  │
│  │  │             │  │             │  │             │  │  │
│  │  │ • User 1    │  │ • User 2    │  │ • User 1    │  │  │
│  │  │ • User 2    │  │ • User 3    │  │ • User 3    │  │  │
│  │  │ • User 4    │  │             │  │ • User 4    │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Socket Event Flow

#### Message Sending Flow

```
Client A                Server                 Client B, C
   │                       │                       │
   │  1. send-message      │                       │
   │──────────────────────►│                       │
   │                       │                       │
   │                       │  2. Validate          │
   │                       │  3. Save to DB        │
   │                       │                       │
   │                       │  4. Broadcast         │
   │                       │  'new-message'        │
   │                       ├──────────────────────►│
   │  5. Confirmation      │                       │
   │◄──────────────────────┤                       │
   │                       │                       │
```

#### Room Management

```typescript
// User joins room
socket.on('join-room', async ({ chatroom_id, user_id }) => {
  // 1. Validate user is participant
  const isParticipant = await chatroomService.isParticipant(chatroom_id, user_id);
  
  if (isParticipant) {
    // 2. Join Socket.io room
    socket.join(`chatroom-${chatroom_id}`);
    
    // 3. Notify other users
    socket.to(`chatroom-${chatroom_id}`).emit('user-joined', {
      chatroom_id,
      user: { id: user_id, username: '...' }
    });
  }
});

// Broadcast message to room
socket.to(`chatroom-${chatroom_id}`).emit('new-message', messageData);
```

### Online Status Management

```typescript
// Connection tracking
const connectedUsers = new Map<number, string>(); // userId -> socketId

socket.on('user-online', ({ user_id }) => {
  connectedUsers.set(user_id, socket.id);
  
  // Update database
  await userService.setOnlineStatus(user_id, true);
  
  // Broadcast to all clients
  io.emit('user-status-changed', {
    user_id,
    is_online: true
  });
});

socket.on('disconnect', () => {
  const user_id = getUserIdFromSocket(socket);
  connectedUsers.delete(user_id);
  
  await userService.setOnlineStatus(user_id, false);
  
  io.emit('user-status-changed', {
    user_id,
    is_online: false,
    last_seen: new Date()
  });
});
```

---

## Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────────────────────┐
│                 Security Layers                         │
│                                                          │
│  1. Transport Security (HTTPS/WSS)                      │
│     ↓                                                    │
│  2. CORS Protection                                     │
│     ↓                                                    │
│  3. JWT Authentication                                  │
│     ↓                                                    │
│  4. Authorization (Role/Permission Check)               │
│     ↓                                                    │
│  5. Input Validation & Sanitization                     │
│     ↓                                                    │
│  6. Rate Limiting                                       │
│     ↓                                                    │
│  7. SQL Injection Protection (TypeORM)                  │
│     ↓                                                    │
│  8. XSS Protection                                      │
└─────────────────────────────────────────────────────────┘
```

### JWT Token Structure

```typescript
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": 1,
    "email": "user@example.com",
    "iat": 1698234567,
    "exp": 1698320967  // 24 hours
  },
  "signature": "..."
}
```

### Password Security

```typescript
// Hashing on registration
const hashedPassword = await bcrypt.hash(password, 10);

// Verification on login
const isValid = await bcrypt.compare(password, user.password);
```

### Security Best Practices

✅ **Implemented:**
- Password hashing with bcrypt (cost factor: 10)
- JWT tokens with expiration
- CORS protection
- Input validation on all endpoints
- SQL injection prevention (TypeORM)
- Error message sanitization
- Helmet.js headers (can be added)

🔄 **Recommended Enhancements:**
- Rate limiting per IP/User
- Refresh token mechanism
- Two-factor authentication
- API key management
- Audit logging
- CSRF protection

---

## Deployment Architecture

### Docker Compose Setup

```
┌──────────────────────────────────────────────────────────┐
│                   Docker Network: devchat                │
│                                                           │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────┐│
│  │   Frontend     │  │    Backend     │  │   Redis    ││
│  │   (nginx)      │  │  (Node.js)     │  │            ││
│  │   Port: 5173   │  │   Port: 4000   │  │ Port: 6379 ││
│  └────────────────┘  └────────────────┘  └────────────┘│
│          │                   │                  │        │
│          └───────────────────┴──────────────────┘        │
└──────────────────────────────────────────────────────────┘
                            │
                            ↓
                 ┌─────────────────────┐
                 │   PostgreSQL        │
                 │   (Supabase/Local)  │
                 │   Port: 5432        │
                 └─────────────────────┘
```

### Multi-Stage Docker Build

**Backend Dockerfile:**
```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
USER node
CMD ["node", "dist/index.js"]
```

**Benefits:**
- ✅ Smaller image size (builder artifacts removed)
- ✅ Faster deployment
- ✅ Security (non-root user)

### Environment Configuration

```
Development:
├── Local Database (Docker)
├── Hot Reload (ts-node-dev)
└── Debug Logging

Staging:
├── Supabase Database
├── Docker Compose
└── Production Build

Production:
├── Supabase Database
├── Kubernetes/Docker Swarm
├── Load Balancer
├── CDN for Static Assets
└── Monitoring & Logging
```

---

## Scalability Considerations

### Horizontal Scaling

```
┌────────────────────────────────────────────────────────┐
│                    Load Balancer                       │
│                    (nginx/HAProxy)                     │
└─────────────────────┬──────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼──────┐ ┌────▼──────┐ ┌───▼──────────┐
│ Backend      │ │ Backend   │ │ Backend      │
│ Instance 1   │ │ Instance 2│ │ Instance 3   │
└───────┬──────┘ └────┬──────┘ └───┬──────────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │  Shared Database          │
        │  (PostgreSQL + Redis)     │
        └───────────────────────────┘
```

### Socket.io Scaling mit Redis Adapter

```typescript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ host: 'redis' });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));

// Now messages are synchronized across instances
io.to('room1').emit('message', data); // Works across all instances
```

### Database Optimization

**Strategies:**
- ✅ Indexing auf frequently queried columns
- ✅ Connection pooling (TypeORM)
- ✅ Query optimization (eager/lazy loading)
- ✅ Redis caching für read-heavy data
- 🔄 Read replicas (für Produktion)
- 🔄 Partitioning (bei sehr vielen Messages)

### Caching Strategy

```
┌──────────────┐
│   Request    │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Check Redis  │
└──────┬───────┘
       │
   ┌───▼───┐
   │ Hit?  │
   └───┬───┘
     │   │
    Yes  No
     │   │
     │   ↓
     │ ┌──────────────┐
     │ │ Query DB     │
     │ └──────┬───────┘
     │        │
     │        ↓
     │ ┌──────────────┐
     │ │ Cache Result │
     │ └──────┬───────┘
     │        │
     └────────┤
              ↓
       ┌──────────────┐
       │   Response   │
       └──────────────┘
```

### Performance Metrics

**Target Metrics:**
- API Response Time: < 100ms (95th percentile)
- WebSocket Latency: < 50ms
- Database Queries: < 50ms
- Page Load Time: < 2s
- Time to Interactive: < 3s

**Monitoring:**
- Health checks (Docker)
- Application logs
- Database slow query log
- Redis memory usage
- WebSocket connection count

---

## Future Enhancements

### Planned Features

1. **Message Search**
   - Full-text search mit PostgreSQL
   - Elasticsearch integration

2. **File Sharing**
   - Image uploads
   - Document sharing
   - AWS S3/MinIO storage

3. **Voice/Video Calls**
   - WebRTC integration
   - Turn/Stun server

4. **Push Notifications**
   - Firebase Cloud Messaging
   - Service Worker implementation

5. **Advanced Features**
   - Message reactions (emoji)
   - Threading/Replies
   - Message editing
   - Read receipts
   - User presence (typing, online, away)

### Architectural Improvements

1. **Microservices**
   - Separate Auth Service
   - Message Service
   - Notification Service

2. **Event-Driven Architecture**
   - RabbitMQ/Kafka for events
   - CQRS pattern

3. **API Gateway**
   - Centralized routing
   - Rate limiting
   - API versioning

4. **Observability**
   - Prometheus metrics
   - Grafana dashboards
   - Distributed tracing (Jaeger)
   - ELK stack for logging

---

## Conclusion

DevChat verwendet moderne, bewährte Architektur-Patterns und ist designed für:
- ✅ **Skalierbarkeit** - Horizontal scaling ready
- ✅ **Maintainability** - Clean architecture, separation of concerns
- ✅ **Security** - Multiple security layers
- ✅ **Performance** - Optimized queries, caching, CDN-ready
- ✅ **Developer Experience** - TypeScript, testing, documentation

---

**Version:** 1.0.0 | **Last Updated:** Oktober 2025
