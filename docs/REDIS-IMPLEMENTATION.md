# Redis Integration - Zusammenfassung

## 🎯 Was wurde implementiert?

### 1. **Redis Client Setup** (`config/redis.ts`)
- Verbindung zu Redis mit automatischem Reconnect
- Graceful Shutdown beim Server-Stop
- Helper-Funktionen für häufige Operationen
- Health Check für Monitoring

### 2. **Rate Limiting** (`middleware/rateLimit.ts`)
Schützt deine API vor Spam und DDoS-Attacken.

**Zwei Strategien:**
- **Standard Rate Limit**: 100 Requests / 15 Min (für normale Endpoints)
- **Auth Rate Limit**: 5 Requests / 15 Min (Login/Register - verhindert Brute-Force)

**Wie es funktioniert:**
```typescript
// Jede IP bekommt einen Counter in Redis
// Key: "rate_limit:192.168.1.1"
// Value: Anzahl der Requests
// TTL: Automatisches Löschen nach 15 Minuten

1. Request kommt rein → IP extrahieren
2. Counter in Redis inkrementieren
3. Wenn Limit erreicht → 429 Too Many Requests
4. Response Headers setzen (X-RateLimit-Remaining)
```

**Verwendung:**
```typescript
// In routes/auth.routes.ts
router.post("/login", authRateLimit, login);  // 5 Requests/15min
router.post("/register", authRateLimit, register);

// In app.ts (global)
app.use("/api", standardRateLimit);  // 100 Requests/15min
```

### 3. **Token Blacklist** (`services/tokenBlacklist.service.ts`)
Ermöglicht echtes Logout trotz stateless JWT.

**Problem:**
JWT Tokens können nicht "gelöscht" werden - sie sind gültig bis sie ablaufen.

**Lösung:**
```typescript
// Bei Logout: Token in Redis Blacklist speichern
await blacklistToken(token);
// Key: "blacklist:eyJhbGci..."
// TTL: Verbleibende Zeit bis Token abläuft

// Bei jedem Request: Ist Token in Blacklist?
if (await isTokenBlacklisted(token)) {
  return res.status(401).json({ error: 'Token revoked' });
}
```

**Verwendung:**
```typescript
// In controllers/auth.controller.ts
export const logout = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  await blacklistToken(token);
  res.json({ message: 'Logged out' });
};

// In middleware/authMiddleware.ts
const isBlacklisted = await isTokenBlacklisted(token);
if (isBlacklisted) {
  return res.status(401).json({ error: 'Token revoked' });
}
```

### 4. **Caching System** (`utils/cache.ts`)
Beschleunigt Datenbank-Queries dramatisch.

**Performance-Vergleich:**
- Datenbank-Query: 10-100ms ⏱️
- Redis-Cache: < 1ms ⚡

**Verwendung:**
```typescript
// METHODE 1: Manuelles Caching
async getChatroom(id: string) {
  // 1. Versuche aus Cache
  const cached = await getCache(`chatroom:${id}`);
  if (cached) return cached;
  
  // 2. Cache Miss - hole aus DB
  const chatroom = await chatroomRepo.findOne({ where: { id } });
  
  // 3. Speichere in Cache
  await setCache(`chatroom:${id}`, chatroom, 300); // 5 Min
  
  return chatroom;
}

// METHODE 2: Mit Cache-Wrapper (EINFACHER!)
async getChatroom(id: string) {
  return cacheWrapper(
    `chatroom:${id}`,
    () => chatroomRepo.findOne({ where: { id } }),
    300 // 5 Minuten TTL
  );
}

// ❗ WICHTIG: Cache löschen nach Updates
async updateChatroom(id: string, data: any) {
  await chatroomRepo.update(id, data);
  await deleteCache(`chatroom:${id}`); // Cache ungültig machen!
}
```

**Empfohlene TTL-Zeiten:**
- User Profiles: 1800s (30 Min) - ändert sich selten
- Chatroom Info: 300s (5 Min) - Name, Typ ändern sich selten
- Online Users: 30s - ändert sich häufig
- Popular Chatrooms: 300s (5 Min)

## 📁 Dateistruktur

```
backend/src/
├── config/
│   └── redis.ts              # Redis Client Setup
├── middleware/
│   ├── rateLimit.ts          # Rate Limiting Middleware
│   └── authMiddleware.ts     # Updated: Token Blacklist Check
├── services/
│   └── tokenBlacklist.service.ts  # Token Blacklist
├── utils/
│   └── cache.ts              # Caching Utilities
└── controllers/
    └── auth.controller.ts    # Updated: Logout Endpoint
```

## 🔧 Konfiguration

### 1. Environment Variables (`.env`)
```bash
# Redis Connection
REDIS_URL=redis://localhost:6379

# Für Docker (Service-Name als Host)
REDIS_URL=redis://redis:6379

# Mit Passwort
REDIS_URL=redis://password@host:6379
```

### 2. Docker Compose
Redis Service ist aktiviert:
```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
```

Backend hängt von Redis ab:
```yaml
  backend:
    depends_on:
      redis:
        condition: service_healthy
    environment:
      REDIS_URL: redis://redis:6379
```

### 3. Server Startup (`index.ts`)
```typescript
// 1. Datenbank verbinden
await getDataSource().initialize();

// 2. Redis verbinden (optional - App läuft auch ohne)
try {
  await connectRedis();
  console.log("✅ Redis connected");
} catch (err) {
  console.warn("⚠️ Redis connection failed - Running without cache");
}

// 3. Socket.io initialisieren
initializeSocket(server);
```

## 🚀 Installation & Start

### Lokale Entwicklung

1. **Redis installieren (falls lokal):**
   ```bash
   # Windows (Chocolatey)
   choco install redis-64

   # macOS (Homebrew)
   brew install redis

   # Linux
   sudo apt-get install redis-server
   ```

2. **Redis starten:**
   ```bash
   # Windows
   redis-server

   # macOS/Linux
   redis-server
   ```

3. **Backend Dependencies installieren:**
   ```bash
   cd backend
   npm install redis
   npm install @types/redis --save-dev
   ```

4. **Environment Variable setzen:**
   ```bash
   # .env
   REDIS_URL=redis://localhost:6379
   ```

5. **Server starten:**
   ```bash
   npm run dev
   ```

### Docker Deployment

1. **Dependencies installieren:**
   ```bash
   cd backend
   npm install
   ```

2. **Docker Compose starten:**
   ```bash
   docker-compose up --build
   ```

   Services starten in dieser Reihenfolge:
   1. Redis (wartet bis healthy)
   2. Backend (wartet auf Redis health check)
   3. Frontend (wartet auf Backend health check)

## 📊 Monitoring & Debugging

### Redis CLI Commands

```bash
# Verbinde zu Redis
redis-cli

# Alle Keys anzeigen
KEYS *

# Rate Limit für IP prüfen
GET rate_limit:192.168.1.1

# Token Blacklist prüfen
EXISTS blacklist:eyJhbGci...

# Cache für Chatroom prüfen
GET chatroom:123

# Alle Rate Limit Keys löschen
DEL rate_limit:*

# TTL prüfen (verbleibende Zeit)
TTL blacklist:eyJhbGci...

# Statistiken
INFO stats
```

### Docker Redis CLI

```bash
# Verbinde zu Redis im Docker Container
docker exec -it devchat-redis redis-cli

# Mit Passwort (falls gesetzt)
docker exec -it devchat-redis redis-cli -a your-password
```

### Logs überwachen

```bash
# Alle Logs
docker-compose logs -f

# Nur Backend
docker-compose logs -f backend

# Nur Redis
docker-compose logs -f redis
```

## 🧪 Testen

### Rate Limiting testen

```bash
# Schicke 10 Requests schnell hintereinander
for i in {1..10}; do
  curl -X POST http://localhost:4000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done

# Nach 5 Requests solltest du 429 Too Many Requests bekommen
```

### Token Blacklist testen

```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password"}' \
  | jq -r '.token')

# 2. Geschützter Endpoint (sollte funktionieren)
curl http://localhost:4000/api/profile \
  -H "Authorization: Bearer $TOKEN"

# 3. Logout
curl -X POST http://localhost:4000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"

# 4. Geschützter Endpoint (sollte 401 geben)
curl http://localhost:4000/api/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Cache testen

```bash
# 1. Erste Request (Cache Miss - langsam)
time curl http://localhost:4000/api/chatrooms/123

# 2. Zweite Request (Cache Hit - schnell!)
time curl http://localhost:4000/api/chatrooms/123
```

## 🎓 Wie funktioniert Redis?

### In-Memory Database
```
                    RAM (schnell!)
                    ┌──────────────┐
Redis speichert → │ Key: Value   │
alles im RAM     │ TTL: 300s    │
                    └──────────────┘
                           ↓
                    Optional: Disk
                    (Persistence)
```

### Key-Value Store
```typescript
// Redis = riesige HashMap
{
  "rate_limit:192.168.1.1": "5",
  "blacklist:eyJhbGci...": "logged_out",
  "chatroom:123": '{"id":123,"name":"General"}',
  "online_users": '["user1","user2","user3"]'
}
```

### TTL (Time To Live)
```typescript
// Automatisches Löschen
await redis.set("key", "value", { EX: 300 }); // 5 Minuten

// Nach 300 Sekunden: Key verschwindet automatisch
// Kein manuelles Cleanup nötig! 🎉
```

## ✅ Vorteile zusammengefasst

| Feature | Ohne Redis | Mit Redis |
|---------|-----------|-----------|
| **Login Spam** | ❌ Möglich | ✅ Blockiert nach 5 Versuchen |
| **Logout** | ❌ Token bleibt gültig | ✅ Token sofort ungültig |
| **DB Query** | 🐌 10-100ms | ⚡ < 1ms (Cache Hit) |
| **Skalierung** | ❌ Single Instance | ✅ Multi-Instance mit shared State |
| **Memory Usage** | ❌ Unendlich wachsend | ✅ Automatisches Cleanup (TTL) |

## 🔐 Security Best Practices

1. **Niemals cachen:**
   - Passwörter
   - JWT Tokens (nur Blacklist)
   - Persönliche/sensible Daten ohne Encryption

2. **Immer TTL setzen:**
   ```typescript
   // ❌ SCHLECHT: Kein TTL
   await redis.set("key", "value");
   
   // ✅ GUT: Mit TTL
   await redis.set("key", "value", { EX: 300 });
   ```

3. **Cache invalidieren nach Updates:**
   ```typescript
   // ❌ SCHLECHT: Cache bleibt veraltet
   await userRepo.update(id, data);
   
   // ✅ GUT: Cache löschen
   await userRepo.update(id, data);
   await deleteCache(`user:${id}`);
   ```

4. **Redis Passwort in Production:**
   ```bash
   # docker-compose.yaml
   command: redis-server --requirepass ${REDIS_PASSWORD}
   
   # .env
   REDIS_URL=redis://password@redis:6379
   ```

## 📚 Weitere Ressourcen

- [Redis Documentation](https://redis.io/docs/)
- [Redis Node.js Client](https://github.com/redis/node-redis)
- [Rate Limiting Patterns](https://redis.io/docs/manual/patterns/rate-limiting/)
- [Caching Strategies](https://redis.io/docs/manual/patterns/caching/)

## 🎉 Fertig!

Du hast jetzt:
1. ✅ Redis Client Setup mit Reconnect-Strategie
2. ✅ Rate Limiting (Spam-Schutz)
3. ✅ Token Blacklist (echtes Logout)
4. ✅ Caching System (Performance-Boost)
5. ✅ Docker Integration
6. ✅ Monitoring & Debugging Tools

**Nächste Schritte:**
1. `npm install redis` im Backend
2. `.env` anpassen mit `REDIS_URL`
3. `docker-compose up --build` starten
4. Rate Limiting und Logout testen
5. Caching in Services implementieren (optional)
