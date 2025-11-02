# Redis Troubleshooting Guide

## ❌ Problem: "The client is closed"

### Fehlermeldung:
```
ClientClosedError: The client is closed
```

### Ursachen:
1. **Redis-Server läuft nicht**
   - Redis Container nicht gestartet
   - Lokaler Redis-Server nicht aktiv
   - Redis-Port blockiert

2. **Redis-Client nicht verbunden**
   - `connectRedis()` wurde nicht aufgerufen
   - Verbindung fehlgeschlagen beim Start
   - Redis-URL falsch konfiguriert

3. **Redis-Client wurde geschlossen**
   - App-Neustart ohne Redis-Reconnect
   - Verbindung unterbrochen

## ✅ Lösung: Graceful Degradation

Ich habe alle Redis-Funktionen mit **Failsafe-Mechanismen** ausgestattet:

### 1. Redis-Config (`config/redis.ts`)
```typescript
// Neue Funktion: isRedisConnected()
export function isRedisConnected(): boolean {
  return redisClient.isOpen; // Prüft ob Client verbunden ist
}

// connectRedis() prüft ob bereits verbunden
if (redisClient.isOpen) {
  console.log('⚠️ Redis: Already connected');
  return;
}
```

### 2. Cache-Utilities (`utils/cache.ts`)
```typescript
// Alle Funktionen prüfen Redis-Verbindung ZUERST
export async function setCache(key, data, ttl) {
  if (!isRedisConnected()) {
    console.log(`⚠️ Cache skipped (Redis not connected)`);
    return; // App funktioniert ohne Cache
  }
  // ... Rest der Funktion
}
```

### 3. Rate Limiting (`middleware/rateLimit.ts`)
```typescript
// Rate Limiting wird übersprungen wenn Redis nicht verfügbar
if (!isRedisConnected()) {
  console.log('⚠️ Rate limiting skipped');
  return next(); // Requests werden nicht blockiert
}
```

### 4. Token Blacklist (`services/tokenBlacklist.service.ts`)
```typescript
// Logout funktioniert, aber Token bleibt gültig
if (!isRedisConnected()) {
  console.warn('⚠️ Token blacklist skipped');
  console.warn('   Token remains valid until expiration');
  return;
}
```

## 🚀 App-Verhalten mit/ohne Redis

| Feature | Mit Redis ✅ | Ohne Redis ⚠️ |
|---------|-------------|---------------|
| **Cache** | Schnell (< 1ms) | Langsam (DB Query) |
| **Rate Limiting** | Aktiv | **DEAKTIVIERT** |
| **Token Blacklist** | Logout sofort wirksam | Token bleibt gültig bis Ablauf |
| **App funktioniert** | ✅ Ja | ✅ Ja (degraded) |

## 🔧 Wie man Redis startet

### Option 1: Docker (Empfohlen)
```bash
# Starte nur Redis
docker-compose up redis

# Oder alle Services
docker-compose up
```

### Option 2: Lokaler Redis-Server

**Windows:**
```bash
# Mit Chocolatey installieren
choco install redis-64

# Starten
redis-server
```

**macOS:**
```bash
# Mit Homebrew installieren
brew install redis

# Starten
redis-server
```

**Linux:**
```bash
# Installieren
sudo apt-get install redis-server

# Starten
sudo systemctl start redis
```

### Redis-Verbindung testen:
```bash
# Redis CLI öffnen
redis-cli

# Test-Befehl
> PING
PONG

# Status prüfen
> INFO server
```

## 🐛 Debugging

### 1. Prüfe ob Redis läuft
```bash
# Docker
docker ps | grep redis

# Lokal
redis-cli ping
```

### 2. Prüfe Redis-Logs
```bash
# Docker
docker logs devchat-redis

# Lokal
tail -f /var/log/redis/redis-server.log
```

### 3. Prüfe Backend-Logs
```bash
# Suche nach Redis-Meldungen
docker logs devchat-backend | grep Redis

# Erwartete Ausgabe beim Start:
# 🔄 Redis: Connecting...
# ✅ Redis: Connected and ready
# ✅ Redis connection established successfully
```

### 4. Prüfe Environment Variables
```bash
# Backend Container
docker exec devchat-backend env | grep REDIS

# Erwartete Ausgabe:
# REDIS_URL=redis://redis:6379
```

### 5. Test Redis-Verbindung manuell
```bash
# Vom Backend Container zu Redis verbinden
docker exec -it devchat-backend sh
nc -zv redis 6379

# Erwartete Ausgabe:
# Connection to redis 6379 port [tcp/*] succeeded!
```

## 🔄 Redis Neustart

### Wenn Redis-Verbindung verloren geht:

**Docker:**
```bash
# Redis Container neustarten
docker-compose restart redis

# Warte auf Health Check
docker-compose ps redis

# Backend neustarten (reconnect)
docker-compose restart backend
```

**Lokaler Server:**
```bash
# Backend stoppen
npm run dev (Ctrl+C)

# Redis neustarten
redis-cli shutdown
redis-server &

# Backend starten
npm run dev
```

## ⚠️ Bekannte Probleme

### Problem: "ECONNREFUSED"
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Lösung:**
- Redis-Server ist nicht gestartet
- Starte Redis mit `redis-server` oder `docker-compose up redis`

### Problem: "Connection timeout"
```
Error: Connection timeout
```

**Lösung:**
- Redis-Port 6379 ist blockiert
- Firewall-Einstellungen prüfen
- `REDIS_URL` in `.env` prüfen

### Problem: "Authentication required"
```
Error: NOAUTH Authentication required
```

**Lösung:**
- Redis mit Passwort konfiguriert
- `.env` aktualisieren:
  ```bash
  REDIS_URL=redis://password@localhost:6379
  ```

## 📊 Monitoring

### Redis-Statistiken abrufen:
```bash
redis-cli

# Memory Usage
> INFO memory

# Connected Clients
> INFO clients

# Anzahl Keys
> DBSIZE

# Alle Keys anzeigen (VORSICHT in Production!)
> KEYS *

# Spezifische Keys suchen
> KEYS user:*
> KEYS rate_limit:*
> KEYS blacklist:*
```

### Performance-Metriken:
```bash
# Hits/Misses Ratio
> INFO stats

# Suche nach:
# - keyspace_hits
# - keyspace_misses
# Hit Ratio = hits / (hits + misses) * 100%
```

## 🎯 Best Practices

1. **Immer Failsafe implementieren**
   - App läuft auch ohne Redis
   - Keine Crashes bei Redis-Ausfall

2. **Verbindungsstatus prüfen**
   - `isRedisConnected()` vor jedem Zugriff
   - Graceful degradation

3. **Logging aktivieren**
   - Redis-Events loggen
   - Fehler nicht verschlucken
   - Warnungen bei degraded mode

4. **Health Checks nutzen**
   ```typescript
   app.get('/health', async (req, res) => {
     const redisOk = isRedisConnected();
     res.json({
       status: redisOk ? 'healthy' : 'degraded',
       redis: redisOk ? 'connected' : 'disconnected',
       timestamp: new Date().toISOString()
     });
   });
   ```

5. **Retry-Strategie konfigurieren**
   ```typescript
   reconnectStrategy: (retries) => {
     if (retries > 10) return new Error('Give up');
     return 1000; // Retry nach 1 Sekunde
   }
   ```

## ✅ Zusammenfassung

Nach den Updates:
- ✅ App crasht **NICHT** mehr bei Redis-Fehler
- ✅ Alle Funktionen haben **Failsafe-Mechanismen**
- ✅ Redis-Verbindung wird **geprüft** vor jedem Zugriff
- ✅ App läuft im **degraded mode** ohne Redis
- ✅ Klare **Warnungen** in Logs wenn Redis fehlt

**Die App funktioniert jetzt auch OHNE Redis!** 🎉
