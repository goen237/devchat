# 🐳 DevChat - Docker Deployment Guide

## 📋 Inhaltsverzeichnis
- [Schnellstart](#schnellstart)
- [Konfiguration](#konfiguration)
- [Services](#services)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Schnellstart

### 1. Voraussetzungen
- Docker Desktop installiert und läuft
- Supabase Account erstellt (oder lokale PostgreSQL)

### 2. Environment Variables einrichten

```bash
# Kopiere die Beispiel-Datei
cp .env.example .env

# Bearbeite .env mit deinen Werten
```

**Wichtig:** Fülle mindestens folgende Variablen aus:
- `SUPABASE_PASSWORD` - Dein Supabase Passwort
- `JWT_SECRET` - Ein sicherer, zufälliger String (min. 32 Zeichen)

### 3. Docker Compose starten

```bash
# Alle Services starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f

# Status prüfen
docker-compose ps
```

### 4. Zugriff auf die Anwendung

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **Redis**: localhost:6379

---

## ⚙️ Konfiguration

### Mit Supabase (Empfohlen)

Bearbeite `.env`:
```env
SUPABASE_HOST=db.xxxxxxxxxxxxxx.supabase.co
SUPABASE_PORT=5432
SUPABASE_USER=postgres
SUPABASE_PASSWORD=your-password
SUPABASE_DB=postgres
```

### Mit lokaler PostgreSQL

1. Kommentiere in `docker-compose.yaml` den `postgres` Service ein:
```yaml
postgres:
  image: postgres:15-alpine
  # ... Rest der Konfiguration
```

2. Bearbeite `.env`:
```env
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=devchat
```

---

## 🛠️ Services

### Backend
- **Port**: 4000
- **Tech**: Node.js + TypeScript + Express
- **Features**: REST API, Socket.io, JWT Auth

### Frontend
- **Port**: 5173 (intern 80)
- **Tech**: React + Vite + TypeScript
- **Server**: Nginx

### Redis
- **Port**: 6379
- **Verwendung**: Session-Management, Caching

### PostgreSQL (Optional)
- **Port**: 5432
- **Alternative**: Supabase

---

## 📦 Docker Commands

### Starten & Stoppen
```bash
# Alle Services starten
docker-compose up -d

# Bestimmten Service starten
docker-compose up -d backend

# Alle Services stoppen
docker-compose down

# Services stoppen und Volumes löschen
docker-compose down -v
```

### Logs & Debugging
```bash
# Alle Logs anzeigen
docker-compose logs -f

# Logs eines bestimmten Services
docker-compose logs -f backend

# Service neu starten
docker-compose restart backend

# In Container einsteigen
docker-compose exec backend sh
```

### Build & Update
```bash
# Images neu bauen
docker-compose build

# Images neu bauen ohne Cache
docker-compose build --no-cache

# Services neu bauen und starten
docker-compose up -d --build
```

---

## 🚢 Production Deployment

### 1. Environment Variables für Production

Erstelle `.env.production`:
```env
NODE_ENV=production
JWT_SECRET=<sehr-langer-zufälliger-string>
SUPABASE_PASSWORD=<production-password>
CORS_ORIGIN=https://yourdomain.com
VITE_API_URL=https://api.yourdomain.com
```

### 2. Docker Compose für Production

```bash
# Mit Production Env-File starten
docker-compose --env-file .env.production up -d

# Oder spezifisches Compose-File
docker-compose -f docker-compose.prod.yaml up -d
```

### 3. HTTPS mit Reverse Proxy

Verwende nginx oder Traefik als Reverse Proxy:

```yaml
# docker-compose.prod.yaml
services:
  nginx-proxy:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-proxy.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
```

---

## 🔍 Troubleshooting

### Problem: Backend kann nicht zur Datenbank verbinden

**Lösung 1**: Prüfe Supabase Connection String
```bash
docker-compose exec backend sh
ping db.xxxxx.supabase.co
```

**Lösung 2**: Prüfe Firewall/Security Groups bei Supabase

**Lösung 3**: Verwende lokale PostgreSQL
```bash
# Uncomment postgres service in docker-compose.yaml
docker-compose up -d postgres
```

### Problem: Frontend zeigt "Cannot connect to backend"

**Lösung**: Prüfe CORS Origin
```env
# .env
CORS_ORIGIN=http://localhost:5173
```

**Lösung 2**: Prüfe Backend Health
```bash
curl http://localhost:4000/health
```

### Problem: Port bereits belegt

**Lösung**: Ändere Ports in `docker-compose.yaml`
```yaml
ports:
  - "8080:80"  # Statt 5173:80
```

### Problem: Redis Connection Fehler

**Lösung**: Prüfe Redis Status
```bash
docker-compose ps redis
docker-compose logs redis
```

### Problem: Images zu groß

**Lösung**: Multi-stage Build optimieren
```bash
# Prüfe Image Größen
docker images | grep devchat

# Build mit spezifischem Target
docker-compose build --no-cache
```

---

## 📊 Health Checks

Alle Services haben Health Checks konfiguriert:

```bash
# Health Status aller Services
docker-compose ps

# Backend Health Endpoint
curl http://localhost:4000/health

# Frontend Health (über nginx)
curl http://localhost:5173/

# Redis Health
docker-compose exec redis redis-cli ping
```

---

## 🔐 Security Best Practices

### 1. Environment Variables
- ✅ Niemals `.env` in Git committen
- ✅ Verwende starke, zufällige Secrets
- ✅ Rotiere Secrets regelmäßig

### 2. Docker Security
- ✅ Verwende non-root User im Container
- ✅ Scanne Images auf Vulnerabilities
- ✅ Halte Base Images aktuell

### 3. Network Security
- ✅ Nur notwendige Ports exposen
- ✅ Verwende Docker Networks für Service-Kommunikation
- ✅ HTTPS in Production

---

## 🎯 Performance Optimierung

### Backend
```typescript
// Enable compression
import compression from 'compression';
app.use(compression());
```

### Frontend
- Gzip enabled in nginx
- Static asset caching (1 year)
- Lazy loading von Komponenten

### Database
- Connection Pooling
- Query Optimization
- Indexes auf häufig genutzte Felder

---

## 📈 Monitoring

### Container Metrics
```bash
# Resource Usage
docker stats

# Disk Usage
docker system df
```

### Application Logs
```bash
# Logs mit Timestamp
docker-compose logs -f --timestamps

# Logs der letzten 100 Zeilen
docker-compose logs --tail=100
```

---

## 🔄 Updates & Maintenance

### Application Updates
```bash
# Pull neueste Changes
git pull

# Rebuild & Restart
docker-compose up -d --build
```

### Docker Updates
```bash
# Pull neueste Images
docker-compose pull

# Update Services
docker-compose up -d
```

### Database Backups
```bash
# Supabase: Automatische Backups aktiviert
# Lokal: Manual Backup
docker-compose exec postgres pg_dump -U postgres devchat > backup.sql
```

---

## 🆘 Support

Bei Problemen:
1. Prüfe Logs: `docker-compose logs -f`
2. Prüfe Health: `docker-compose ps`
3. Neustart: `docker-compose restart`
4. Rebuild: `docker-compose up -d --build`

---

**Status**: 🟢 Production Ready

Alle Services sind getestet und deployment-ready!
