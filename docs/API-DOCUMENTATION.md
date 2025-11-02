# 📡 API Documentation

## Übersicht

Die DevChat API ist eine RESTful API mit zusätzlichem WebSocket-Support für Echtzeit-Kommunikation.

**Base URL:** `http://localhost:4000/api`

**WebSocket URL:** `http://localhost:4000`

---

## 🔐 Authentifizierung

Alle geschützten Endpunkte benötigen ein JWT-Token im `Authorization` Header:

```
Authorization: Bearer <your-jwt-token>
```

### Token erhalten

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "user@example.com",
    "avatar_url": "/avatars/avatar1.png"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 📋 Endpunkte

### 🔑 Authentication

#### Benutzer registrieren

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "user@example.com",
    "created_at": "2025-10-25T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validierung:**
- `username`: 3-50 Zeichen, alphanumerisch + Unterstrich
- `email`: Gültige E-Mail-Adresse
- `password`: Mindestens 6 Zeichen

**Fehler:**
- `400`: Validation Error
- `409`: User already exists

---

#### Benutzer einloggen

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "user@example.com",
    "avatar_url": "/avatars/avatar1.png",
    "is_online": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Fehler:**
- `401`: Invalid credentials

---

#### Aktuellen Benutzer abrufen

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "user@example.com",
  "bio": "Software Developer",
  "avatar_url": "/avatars/avatar1.png",
  "is_online": true,
  "last_seen": "2025-10-25T10:30:00Z"
}
```

**Fehler:**
- `401`: Unauthorized

---

### 💬 Chatrooms

#### Alle Chatrooms abrufen

```http
GET /api/chatrooms
Authorization: Bearer <token>
```

**Query Parameters:**
- `type` (optional): `all` | `direct` | `group`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Team Chat",
    "is_group": true,
    "created_by": 1,
    "created_at": "2025-10-25T09:00:00Z",
    "participants": [
      {
        "id": 1,
        "username": "john_doe",
        "avatar_url": "/avatars/avatar1.png"
      },
      {
        "id": 2,
        "username": "jane_smith",
        "avatar_url": "/avatars/avatar2.png"
      }
    ],
    "last_message": {
      "content": "Hello everyone!",
      "created_at": "2025-10-25T10:25:00Z",
      "sender": {
        "username": "john_doe"
      }
    },
    "unread_count": 3
  }
]
```

---

#### Chatroom erstellen

```http
POST /api/chatrooms
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Project Discussion",
  "is_group": true,
  "participant_ids": [2, 3, 4]
}
```

**Für 1-zu-1 Chat:**
```json
{
  "is_group": false,
  "participant_ids": [2]
}
```

**Response:** `201 Created`
```json
{
  "id": 5,
  "name": "Project Discussion",
  "is_group": true,
  "created_by": 1,
  "created_at": "2025-10-25T11:00:00Z",
  "participants": [...]
}
```

**Validierung:**
- `name`: Required für Gruppen, 3-255 Zeichen
- `participant_ids`: Array mit mindestens 1 User ID
- Für 1-zu-1: Automatische Duplikat-Erkennung

**Fehler:**
- `400`: Validation Error
- `409`: Direct chat already exists

---

#### Chatroom Details abrufen

```http
GET /api/chatrooms/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Team Chat",
  "is_group": true,
  "created_by": 1,
  "participants": [
    {
      "id": 1,
      "username": "john_doe",
      "avatar_url": "/avatars/avatar1.png",
      "is_online": true
    }
  ],
  "messages": [
    {
      "id": 100,
      "content": "Hello!",
      "sender_id": 1,
      "created_at": "2025-10-25T10:00:00Z",
      "sender": {
        "username": "john_doe",
        "avatar_url": "/avatars/avatar1.png"
      }
    }
  ]
}
```

**Fehler:**
- `404`: Chatroom not found
- `403`: Not a participant

---

#### Chatroom aktualisieren

```http
PUT /api/chatrooms/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Team Chat"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Updated Team Chat",
  "is_group": true
}
```

**Fehler:**
- `403`: Not authorized (nur Creator)
- `404`: Chatroom not found

---

#### Chatroom löschen

```http
DELETE /api/chatrooms/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Chatroom deleted successfully"
}
```

**Fehler:**
- `403`: Not authorized (nur Creator)
- `404`: Chatroom not found

---

#### Teilnehmer hinzufügen

```http
POST /api/chatrooms/:id/participants
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_ids": [5, 6, 7]
}
```

**Response:** `200 OK`
```json
{
  "message": "Participants added successfully",
  "participants": [...]
}
```

**Fehler:**
- `400`: Invalid user IDs
- `403`: Not authorized
- `404`: Chatroom not found

---

#### Teilnehmer entfernen

```http
DELETE /api/chatrooms/:id/participants/:userId
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Participant removed successfully"
}
```

**Fehler:**
- `403`: Not authorized (nur Creator)
- `404`: Chatroom or participant not found

---

### 📨 Messages

#### Nachrichten abrufen

```http
GET /api/messages/:chatroomId
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of messages (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `before` (optional): Get messages before timestamp

**Response:** `200 OK`
```json
{
  "messages": [
    {
      "id": 1,
      "content": "Hello, how are you?",
      "sender_id": 1,
      "chatroom_id": 5,
      "is_read": false,
      "created_at": "2025-10-25T10:00:00Z",
      "sender": {
        "id": 1,
        "username": "john_doe",
        "avatar_url": "/avatars/avatar1.png"
      }
    }
  ],
  "total": 150,
  "has_more": true
}
```

**Fehler:**
- `403`: Not a participant
- `404`: Chatroom not found

---

#### Nachricht senden

```http
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "chatroom_id": 5,
  "content": "Hello everyone!"
}
```

**Response:** `201 Created`
```json
{
  "id": 101,
  "content": "Hello everyone!",
  "sender_id": 1,
  "chatroom_id": 5,
  "created_at": "2025-10-25T11:30:00Z",
  "sender": {
    "username": "john_doe",
    "avatar_url": "/avatars/avatar1.png"
  }
}
```

**Validierung:**
- `content`: 1-4000 Zeichen
- `chatroom_id`: Muss existieren

**Fehler:**
- `400`: Validation Error
- `403`: Not a participant
- `404`: Chatroom not found

---

#### Nachricht löschen

```http
DELETE /api/messages/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Message deleted successfully"
}
```

**Fehler:**
- `403`: Not authorized (nur Sender)
- `404`: Message not found

---

#### Nachrichten als gelesen markieren

```http
PUT /api/messages/:chatroomId/read
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Messages marked as read"
}
```

---

### 👤 Users

#### Alle Benutzer abrufen

```http
GET /api/users
Authorization: Bearer <token>
```

**Query Parameters:**
- `search` (optional): Suche nach Username/Email
- `online` (optional): `true` | `false`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "bio": "Software Developer",
    "avatar_url": "/avatars/avatar1.png",
    "is_online": true,
    "last_seen": "2025-10-25T11:00:00Z"
  }
]
```

---

#### Benutzer Details

```http
GET /api/users/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "bio": "Software Developer",
  "avatar_url": "/avatars/avatar1.png",
  "is_online": true,
  "last_seen": "2025-10-25T11:00:00Z",
  "created_at": "2025-01-15T08:00:00Z"
}
```

**Fehler:**
- `404`: User not found

---

### 👤 Profile

#### Eigenes Profil abrufen

```http
GET /api/profile
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "bio": "Software Developer",
  "avatar_url": "/avatars/avatar1.png",
  "is_online": true,
  "created_at": "2025-01-15T08:00:00Z"
}
```

---

#### Profil aktualisieren

```http
PUT /api/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "john_updated",
  "bio": "Senior Software Developer",
  "avatar_url": "/avatars/avatar5.png"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "john_updated",
  "bio": "Senior Software Developer",
  "avatar_url": "/avatars/avatar5.png"
}
```

**Validierung:**
- `username`: 3-50 Zeichen (optional)
- `bio`: Max 500 Zeichen (optional)
- `avatar_url`: Valid URL (optional)

**Fehler:**
- `400`: Validation Error
- `409`: Username already taken

---

### 🎨 Avatars

#### Alle Avatare abrufen

```http
GET /api/avatars
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "avatars": [
    {
      "id": "avatar1",
      "url": "/avatars/avatar1.png",
      "category": "animals"
    },
    {
      "id": "avatar2",
      "url": "/avatars/avatar2.png",
      "category": "people"
    }
  ],
  "total": 50
}
```

---

#### Avatar auswählen

```http
POST /api/avatars/select
Authorization: Bearer <token>
Content-Type: application/json

{
  "avatar_url": "/avatars/avatar5.png"
}
```

**Response:** `200 OK`
```json
{
  "message": "Avatar updated successfully",
  "user": {
    "id": 1,
    "avatar_url": "/avatars/avatar5.png"
  }
}
```

**Fehler:**
- `400`: Invalid avatar URL
- `404`: Avatar not found

---

## 🔌 WebSocket (Socket.io)

### Verbindung herstellen

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:4000', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connect', () => {
  console.log('Connected to server');
});
```

### Events

#### Client → Server

##### Join Room
```javascript
socket.emit('join-room', {
  chatroom_id: 5,
  user_id: 1
});
```

##### Leave Room
```javascript
socket.emit('leave-room', {
  chatroom_id: 5,
  user_id: 1
});
```

##### Send Message
```javascript
socket.emit('send-message', {
  chatroom_id: 5,
  content: 'Hello!',
  sender_id: 1
});
```

##### Typing Indicator
```javascript
// Start typing
socket.emit('typing', {
  chatroom_id: 5,
  user_id: 1
});

// Stop typing
socket.emit('stop-typing', {
  chatroom_id: 5,
  user_id: 1
});
```

##### User Status
```javascript
// Set online
socket.emit('user-online', {
  user_id: 1
});

// Set offline
socket.emit('user-offline', {
  user_id: 1
});
```

---

#### Server → Client

##### New Message
```javascript
socket.on('new-message', (data) => {
  console.log('New message:', data);
  // {
  //   id: 101,
  //   content: 'Hello!',
  //   sender_id: 2,
  //   chatroom_id: 5,
  //   created_at: '2025-10-25T11:30:00Z',
  //   sender: { username: 'jane_smith', avatar_url: '...' }
  // }
});
```

##### User Joined
```javascript
socket.on('user-joined', (data) => {
  console.log('User joined:', data);
  // {
  //   chatroom_id: 5,
  //   user: { id: 3, username: 'bob' }
  // }
});
```

##### User Left
```javascript
socket.on('user-left', (data) => {
  console.log('User left:', data);
  // {
  //   chatroom_id: 5,
  //   user_id: 3
  // }
});
```

##### User Typing
```javascript
socket.on('user-typing', (data) => {
  console.log('User is typing:', data);
  // {
  //   chatroom_id: 5,
  //   user: { id: 2, username: 'jane_smith' }
  // }
});
```

##### User Stopped Typing
```javascript
socket.on('user-stopped-typing', (data) => {
  console.log('User stopped typing:', data);
  // {
  //   chatroom_id: 5,
  //   user_id: 2
  // }
});
```

##### Online Users Update
```javascript
socket.on('online-users', (users) => {
  console.log('Online users:', users);
  // [
  //   { id: 1, username: 'john_doe', is_online: true },
  //   { id: 2, username: 'jane_smith', is_online: true }
  // ]
});
```

##### User Status Changed
```javascript
socket.on('user-status-changed', (data) => {
  console.log('User status changed:', data);
  // {
  //   user_id: 2,
  //   is_online: false,
  //   last_seen: '2025-10-25T12:00:00Z'
  // }
});
```

---

## 🚨 Error Responses

### Standard Error Format

```json
{
  "error": "Error message",
  "details": "Additional error details",
  "status": 400
}
```

### HTTP Status Codes

| Code | Bedeutung | Beschreibung |
|------|-----------|--------------|
| 200 | OK | Request erfolgreich |
| 201 | Created | Ressource erstellt |
| 400 | Bad Request | Validierungsfehler |
| 401 | Unauthorized | Authentication fehlgeschlagen |
| 403 | Forbidden | Keine Berechtigung |
| 404 | Not Found | Ressource nicht gefunden |
| 409 | Conflict | Duplikat (z.B. User exists) |
| 500 | Server Error | Interner Serverfehler |

### Beispiel Error Responses

**Validation Error:**
```json
{
  "error": "Validation Error",
  "details": {
    "username": "Username must be at least 3 characters",
    "email": "Invalid email format"
  },
  "status": 400
}
```

**Authentication Error:**
```json
{
  "error": "Invalid credentials",
  "status": 401
}
```

**Authorization Error:**
```json
{
  "error": "You are not authorized to perform this action",
  "status": 403
}
```

---

## 📦 Postman Collection

Eine vollständige Postman Collection ist verfügbar:

```bash
backend/tests/auth.postman_collection.json
```

**Import in Postman:**
1. Öffne Postman
2. Click "Import"
3. Wähle Datei: `backend/tests/auth.postman_collection.json`
4. Setze Environment Variable `token` nach Login

---

## 🔐 Rate Limiting

**Limits:**
- Authentication: 5 Requests / 15 Minuten
- API Endpoints: 100 Requests / Minute
- WebSocket: Keine Limits

**Response bei Limit:**
```json
{
  "error": "Too many requests",
  "retry_after": 900,
  "status": 429
}
```

---

## 📊 Pagination

Für Listen-Endpunkte mit vielen Ergebnissen:

**Query Parameters:**
- `page`: Seitennummer (default: 1)
- `limit`: Items pro Seite (default: 20, max: 100)
- `sort`: Sortierfeld (z.B. `created_at`)
- `order`: `asc` | `desc` (default: `desc`)

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## 🔍 Filtering & Search

**Beispiele:**

```http
GET /api/users?search=john
GET /api/chatrooms?type=group
GET /api/messages/:chatroomId?before=2025-10-25T10:00:00Z
```

---

**Version:** 1.0.0 | **Last Updated:** Oktober 2025
