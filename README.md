# 💬 DevChat - Real-Time Chat Application

[![CI/CD Pipeline](https://github.com/goen237/devchat/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/goen237/devchat/actions)
[![Tests](https://github.com/goen237/devchat/workflows/Tests/badge.svg)](https://github.com/goen237/devchat/actions)
[![Code Quality](https://github.com/goen237/devchat/workflows/Code%20Quality/badge.svg)](https://github.com/goen237/devchat/actions)
[![Docker Build](https://github.com/goen237/devchat/workflows/Docker%20Build/badge.svg)](https://github.com/goen237/devchat/actions)

Eine moderne, Echtzeit-Chat-Anwendung mit WebSockets, gebaut mit React, Node.js, TypeORM und Socket.io. Unterstützt 1-zu-1 und Gruppen-Chats, Avatar-System, Online-Status und mehr.

![DevChat Demo](https://via.placeholder.com/800x400?text=DevChat+Demo)

## 📋 Inhaltsverzeichnis

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Schnellstart](#-schnellstart)
- [Installation](#-installation)
- [Entwicklung](#-entwicklung)
- [Deployment](#-deployment)
- [API Dokumentation](#-api-dokumentation)
- [Testing](#-testing)
- [Architektur](#-architektur)
- [Mitwirken](#-mitwirken)
- [Lizenz](#-lizenz)

---

## ✨ Features

### 🔐 Authentifizierung & Sicherheit
- ✅ Benutzer-Registrierung mit E-Mail-Validierung
- ✅ Sicheres Login mit JWT-Token
- ✅ Passwort-Hashing mit bcrypt
- ✅ Session-Management mit Redis (optional)
- ✅ Protected Routes im Frontend

### 💬 Chat-Funktionen
- ✅ **1-zu-1 Chats** - Direkte Nachrichten zwischen Benutzern
- ✅ **Gruppen-Chats** - Mehrere Teilnehmer in Chatrooms
- ✅ **Echtzeit-Messaging** - Instant Message Delivery mit Socket.io
- ✅ **Typing Indicators** - "Benutzer schreibt..." Status
- ✅ **Message History** - Persistente Nachrichtenspeicherung
- ✅ **Unread Message Count** - Ungelesene Nachrichten-Anzeige
- ✅ **Last Message Preview** - Vorschau der letzten Nachricht

### 👥 Benutzer-Features
- ✅ **Avatar-System** - 50+ vorgefertigte Avatare
- ✅ **Profil-Verwaltung** - Username, Bio, Avatar ändern
- ✅ **Online-Status** - Echtzeit Online/Offline Anzeige
- ✅ **Benutzer-Suche** - Finde andere Benutzer
- ✅ **Participant Management** - Mitglieder hinzufügen/entfernen

### 🎨 UI/UX
- ✅ **Responsive Design** - Mobile, Tablet, Desktop
- ✅ **Material-UI** - Moderne Komponenten-Bibliothek
- ✅ **Dark Theme Support** - (optional erweiterbar)
- ✅ **Smooth Animations** - Flüssige Übergänge
- ✅ **Loading States** - Klares User Feedback

### 🔧 Technische Features
- ✅ **TypeScript** - Vollständige Type Safety
- ✅ **Docker Support** - Containerisierte Deployment
- ✅ **CI/CD Pipeline** - Automatisierte Tests & Deployment
- ✅ **Health Checks** - Service Monitoring
- ✅ **Error Handling** - Comprehensive Error Management
- ✅ **Logging** - Structured Logging (erweiterbar)

---

## 🛠 Tech Stack

### Frontend
| Technologie | Version | Verwendung |
|------------|---------|------------|
| **React** | 19.1.1 | UI Framework |
| **TypeScript** | 5.8.3 | Type Safety |
| **Vite** | 7.1.2 | Build Tool |
| **Material-UI** | 7.3.2 | UI Components |
| **Socket.io Client** | 4.8.1 | WebSocket Client |
| **React Router** | 7.9.2 | Routing |
| **Axios** | 1.12.2 | HTTP Client |

### Backend
| Technologie | Version | Verwendung |
|------------|---------|------------|
| **Node.js** | 20.x | Runtime |
| **Express** | 5.1.0 | Web Framework |
| **TypeScript** | 5.9.2 | Type Safety |
| **TypeORM** | 0.3.27 | ORM |
| **PostgreSQL** | 15+ | Database |
| **Socket.io** | 4.8.1 | WebSocket Server |
| **JWT** | 9.0.2 | Authentication |
| **bcrypt** | 6.0.0 | Password Hashing |

### DevOps & Testing
| Technologie | Version | Verwendung |
|------------|---------|------------|
| **Docker** | Latest | Containerization |
| **Docker Compose** | Latest | Multi-Container Orchestration |
| **Jest** | 30.1.3 | Testing Framework |
| **Supertest** | 7.1.4 | API Testing |
| **GitHub Actions** | - | CI/CD Pipeline |
| **nginx** | alpine | Reverse Proxy |
| **Redis** | 7-alpine | Caching (optional) |

---

## 🚀 Schnellstart

### Voraussetzungen

- Node.js 20.x oder höher
- Docker & Docker Compose
- Git
- PostgreSQL 15+ (lokal oder Supabase)

### Mit Docker (Empfohlen) 🐳

```bash
# 1. Repository klonen
git clone https://github.com/goen237/devchat.git
cd devchat

# 2. Environment Variables konfigurieren
copy .env.example .env
# .env mit deinen Daten bearbeiten

# 3. Deployment starten
.\deploy.ps1
# oder auf Linux/Mac: ./deploy.sh

# 4. Öffne Browser
# Frontend: http://localhost:5173
# Backend: http://localhost:4000
# Health Check: http://localhost:4000/health
```

Das war's! Die Anwendung läuft jetzt. 🎉

### Ohne Docker (Lokale Entwicklung)

```bash
# 1. Repository klonen
git clone https://github.com/goen237/devchat.git
cd devchat

# 2. Backend Setup
cd backend
npm install
copy .env.example .env
# .env konfigurieren

# Datenbank initialisieren
npm run seed

# Backend starten
npm run dev

# 3. Frontend Setup (neues Terminal)
cd ../frontend
npm install
copy .env.example .env
# .env konfigurieren

# Frontend starten
npm run dev
```

---

## 📦 Installation

### Detaillierte Installation

#### 1. Backend Setup

```bash
cd backend

# Dependencies installieren
npm install

# Environment Variables
copy .env.example .env
```

**Backend `.env` Konfiguration:**

```env
# Database (Supabase oder lokal)
DB_HOST=db.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-supabase-password
DB_NAME=postgres

# Test Database (optional)
DB_NAME_TEST=devchat_test

# JWT
JWT_SECRET=your-super-secure-secret-key-min-32-chars

# Server
PORT=4000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Datenbank initialisieren:**

```bash
# Mit Seed-Daten
npm run seed

# Oder nur TypeORM sync (automatisch beim Start)
npm run dev
```

#### 2. Frontend Setup

```bash
cd frontend

# Dependencies installieren
npm install

# Environment Variables
copy .env.example .env
```

**Frontend `.env` Konfiguration:**

```env
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
```

#### 3. Docker Setup (Optional)

```bash
# .env für Docker Compose
copy .env.example .env

# Docker Compose starten
docker-compose up -d

# Logs verfolgen
docker-compose logs -f

# Services stoppen
docker-compose down
```

---

## 💻 Entwicklung

### Backend Development

```bash
cd backend

# Development Server mit Hot-Reload
npm run dev

# TypeScript kompilieren
npm run build

# Production starten
npm start

# Datenbank seeden
npm run seed
```

**Backend Struktur:**

```
backend/
├── src/
│   ├── config/           # Konfiguration (DB, Multer)
│   ├── controllers/      # Request Handler
│   ├── entities/         # TypeORM Entities
│   ├── middleware/       # Express Middleware
│   ├── routes/           # API Routes
│   ├── services/         # Business Logic
│   ├── sockets/          # Socket.io Handler
│   ├── utils/            # Utilities (JWT, Password)
│   ├── validators/       # Input Validation
│   ├── app.ts            # Express App
│   └── index.ts          # Server Entry Point
├── tests/
│   ├── unit/             # Unit Tests
│   └── integration/      # Integration Tests
└── package.json
```

### Frontend Development

```bash
cd frontend

# Development Server
npm run dev

# Production Build
npm run build

# Preview Build
npm run preview

# Linting
npm run lint
```

**Frontend Struktur:**

```
frontend/
├── src/
│   ├── api/              # API Client Functions
│   ├── components/       # Reusable Components
│   ├── hooks/            # Custom React Hooks
│   ├── pages/            # Page Components
│   ├── services/         # Business Logic
│   ├── styles/           # Global Styles
│   ├── types/            # TypeScript Types
│   ├── App.tsx           # Main App Component
│   └── main.tsx          # Entry Point
├── public/               # Static Assets
└── package.json
```

### API Endpoints

#### Authentifizierung
```typescript
POST   /api/auth/register     // Benutzer registrieren
POST   /api/auth/login        // Benutzer login
GET    /api/auth/me           // Aktuellen Benutzer abrufen
```

#### Chatrooms
```typescript
GET    /api/chatrooms         // Alle Chatrooms abrufen
POST   /api/chatrooms         // Neuen Chatroom erstellen
GET    /api/chatrooms/:id     // Chatroom Details
PUT    /api/chatrooms/:id     // Chatroom aktualisieren
DELETE /api/chatrooms/:id     // Chatroom löschen
POST   /api/chatrooms/:id/participants  // Teilnehmer hinzufügen
```

#### Nachrichten
```typescript
GET    /api/messages/:chatroomId    // Nachrichten abrufen
POST   /api/messages                // Nachricht senden
DELETE /api/messages/:id            // Nachricht löschen
```

#### Benutzer
```typescript
GET    /api/users               // Alle Benutzer
GET    /api/users/:id           // Benutzer Details
GET    /api/profile             // Eigenes Profil
PUT    /api/profile             // Profil aktualisieren
```

#### Avatare
```typescript
GET    /api/avatars             // Alle Avatare
POST   /api/avatars/select      // Avatar auswählen
```

### Socket.io Events

#### Client → Server
```typescript
'join-room'        // Chatroom beitreten
'leave-room'       // Chatroom verlassen
'send-message'     // Nachricht senden
'typing'           // Typing-Indikator starten
'stop-typing'      // Typing-Indikator stoppen
'user-online'      // Online-Status setzen
'user-offline'     // Offline-Status setzen
```

#### Server → Client
```typescript
'new-message'      // Neue Nachricht erhalten
'user-joined'      // Benutzer ist Chatroom beigetreten
'user-left'        // Benutzer hat Chatroom verlassen
'user-typing'      // Benutzer tippt
'user-stopped-typing'  // Benutzer hat aufgehört zu tippen
'online-users'     // Liste der Online-Benutzer
'user-status-changed'  // Benutzer-Status geändert
```

---

## 🧪 Testing

### Test Suite Overview

Das Projekt hat **87 Tests**:
- **45 Unit Tests** - Services, Utilities, Validators
- **42 Integration Tests** - API Endpoints, Socket.io

**Test Coverage:** ~82% overall

### Tests ausführen

```bash
cd backend

# Alle Tests
npm test

# Unit Tests
npm run test:unit

# Integration Tests
npm run test:integration

# Mit Coverage
npm run test:coverage

# Watch Mode
npm run test:watch

# Docker Test Database
npm run test:docker
```

### Test Kategorien

#### Unit Tests
```bash
# Services
tests/unit/auth.service.test.ts        # 8 Tests
tests/unit/chatroom.service.test.ts    # 12 Tests
tests/unit/message.service.test.ts     # 15 Tests

# Utilities
tests/unit/password.util.test.ts       # 4 Tests
tests/unit/jwt.util.test.ts            # 5 Tests

# Validators
tests/unit/message.validator.test.ts   # 10 Tests
tests/unit/chatroom.validator.test.ts  # 11 Tests
```

#### Integration Tests
```bash
# API Endpoints
tests/integration/auth.api.test.ts      # 10 Tests
tests/integration/chatroom.api.test.ts  # 12 Tests
tests/integration/message.api.test.ts   # 12 Tests

# WebSocket
tests/integration/socket.test.ts        # 8 Tests
```

### Test Database Setup

**Option 1: Docker (Empfohlen)**
```bash
npm run test:docker
```

**Option 2: Manuell**
```powershell
# PostgreSQL Container starten
.\scripts\docker-test-db.ps1

# Tests laufen lassen
npm test
```

Siehe [tests/README.md](tests/README.md) für detaillierte Test-Dokumentation.

---

## 🏗 Architektur

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          React Frontend (Vite)                      │   │
│  │  • React Router   • Material-UI                     │   │
│  │  • Axios          • Socket.io Client                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │   REST API (Express) │    │  Socket.io Server    │      │
│  │  • Auth Routes       │    │  • Chat Events       │      │
│  │  • Chatroom Routes   │    │  • User Status       │      │
│  │  • Message Routes    │    │  • Typing Indicators │      │
│  └──────────────────────┘    └──────────────────────┘      │
│              ↕                           ↕                   │
│  ┌──────────────────────────────────────────────────┐      │
│  │              Business Logic Layer                 │      │
│  │  • Auth Service    • Message Service              │      │
│  │  • Chatroom Service • Avatar Service              │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ TypeORM
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │   PostgreSQL DB      │    │    Redis Cache       │      │
│  │  • Users             │    │  • Sessions          │      │
│  │  • ChatRooms         │    │  • Online Status     │      │
│  │  • Messages          │    │                      │      │
│  └──────────────────────┘    └──────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema

```sql
-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar_url VARCHAR(500),
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ChatRooms Table
CREATE TABLE chatrooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  is_group BOOLEAN DEFAULT false,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages Table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  sender_id INT REFERENCES users(id),
  chatroom_id INT REFERENCES chatrooms(id),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ChatRoom Participants (Many-to-Many)
CREATE TABLE chatroom_participants (
  chatroom_id INT REFERENCES chatrooms(id),
  user_id INT REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (chatroom_id, user_id)
);
```

### Component Architecture

**Frontend Component Hierarchy:**

```
App
├── BrowserRouter
│   ├── Routes
│   │   ├── LoginPage
│   │   ├── RegisterPage
│   │   ├── DashboardPage
│   │   │   ├── ChatRoomList
│   │   │   ├── CreateGroupModal
│   │   │   └── OnlineUsers
│   │   ├── ChatRoomPage
│   │   │   ├── MessageList
│   │   │   ├── MessageInput
│   │   │   ├── TypingIndicator
│   │   │   └── ParticipantList
│   │   ├── ProfilePage
│   │   │   ├── AvatarSelector
│   │   │   └── ProfileForm
│   │   └── UserListPage
│   │       └── UserCard
│   └── ProtectedRoute (HOC)
```

---

## 🐳 Deployment

### Docker Compose Deployment

**Schnell-Deployment:**
```bash
# Windows
.\deploy.ps1

# Linux/Mac
./deploy.sh
```

**Manuell:**
```bash
# Services starten
docker-compose up -d

# Status prüfen
docker-compose ps

# Logs ansehen
docker-compose logs -f backend
docker-compose logs -f frontend

# Services stoppen
docker-compose down

# Mit Volumes löschen
docker-compose down -v
```

### Docker Images

Images werden automatisch gebaut und gepusht zu:
```
ghcr.io/goen237/devchat/backend:latest
ghcr.io/goen237/devchat/frontend:latest
```

### Production Deployment

#### Environment Variables für Production

```env
# Backend Production
DB_HOST=your-production-db.supabase.co
DB_PASSWORD=strong-production-password
JWT_SECRET=super-secure-random-string-min-32-chars
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com

# Frontend Production
VITE_API_URL=https://api.your-domain.com
VITE_SOCKET_URL=https://api.your-domain.com
```

#### SSL/HTTPS Setup

Füge nginx als Reverse Proxy hinzu:

```yaml
# docker-compose.production.yml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
```

#### Health Checks

Alle Services haben Health Checks:

```bash
# Backend
curl http://localhost:4000/health

# Frontend
curl http://localhost:5173

# Docker Health Status
docker-compose ps
```

### CI/CD Pipeline

GitHub Actions automatisiert:
- ✅ Tests bei jedem Push
- ✅ Docker Images bauen
- ✅ Security Scanning
- ✅ Code Quality Checks
- ✅ Deployment auf main branch

Siehe [.github/README.md](.github/README.md) für CI/CD Details.

---

## 📖 Weitere Dokumentation

| Dokument | Beschreibung |
|----------|--------------|
| [DOCKER-README.md](DOCKER-README.md) | Docker Quickstart Guide |
| [DOCKER-DEPLOYMENT.md](DOCKER-DEPLOYMENT.md) | Detaillierte Deployment-Anleitung |
| [.github/README.md](.github/README.md) | CI/CD Pipeline Dokumentation |
| [tests/README.md](backend/tests/README.md) | Test Suite Dokumentation |
| [docs/architecture.md](docs/architecture.md) | Detaillierte Architektur |
| [docs/api.md](docs/api.md) | API Referenz (generiert) |

---

## 🔧 Troubleshooting

### Häufige Probleme

#### Problem: Docker Container startet nicht

```bash
# Logs prüfen
docker-compose logs backend

# Ports prüfen
netstat -ano | findstr :4000

# Container neu starten
docker-compose restart backend
```

#### Problem: Datenbank-Verbindungsfehler

```bash
# .env prüfen
# DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD korrekt?

# Datenbank erreichbar testen
docker-compose exec backend npm run seed
```

#### Problem: Frontend kann Backend nicht erreichen

```bash
# CORS Origin prüfen in backend/.env
CORS_ORIGIN=http://localhost:5173

# API URL prüfen in frontend/.env
VITE_API_URL=http://localhost:4000
```

#### Problem: Socket.io verbindet nicht

```bash
# Überprüfe VITE_SOCKET_URL
VITE_SOCKET_URL=http://localhost:4000

# Browser Console prüfen auf WebSocket Fehler
# Network Tab prüfen auf Socket.io Requests
```

#### Problem: Tests schlagen fehl

```bash
# Test Database Setup
npm run test:docker

# Umgebungsvariablen für Tests prüfen
# Siehe tests/.env.test
```

---

## 🤝 Mitwirken

Beiträge sind willkommen! Bitte folge diesem Workflow:

1. **Fork** das Repository
2. **Clone** dein Fork: `git clone https://github.com/dein-username/devchat.git`
3. **Branch** erstellen: `git checkout -b feature/amazing-feature`
4. **Commit** deine Änderungen: `git commit -m 'Add amazing feature'`
5. **Push** zum Branch: `git push origin feature/amazing-feature`
6. **Pull Request** öffnen

### Development Guidelines

- ✅ Schreibe Tests für neue Features
- ✅ Folge TypeScript Best Practices
- ✅ Verwende ESLint & Prettier
- ✅ Aktualisiere Dokumentation
- ✅ Teste lokal vor dem Push

### Code Style

```bash
# Backend Linting
cd backend
npm run lint

# Frontend Linting
cd frontend
npm run lint
```

---

## 📄 Lizenz

Dieses Projekt ist unter der MIT License lizenziert.

---

## 👨‍💻 Autor

**George** - [@goen237](https://github.com/goen237)

---

## 🙏 Danksagungen

- React Team für das großartige Framework
- Socket.io Team für Echtzeit-Kommunikation
- TypeORM Team für das ORM
- Material-UI Team für UI Components
- Alle Contributors und die Open Source Community

---

## 📞 Support

Bei Fragen oder Problemen:

- 📧 E-Mail: support@devchat.com (TODO)
- 🐛 Issues: [GitHub Issues](https://github.com/goen237/devchat/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/goen237/devchat/discussions)

---

**Status:** ✅ Production Ready | **Version:** 1.0.0 | **Last Updated:** Oktober 2025

---

Made with ❤️ using TypeScript, React, Node.js and Socket.io
