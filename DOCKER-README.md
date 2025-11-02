# 🐳 DevChat - Docker Setup

## 🚀 Schnellstart (3 Schritte)

### 1. Environment konfigurieren
```powershell
# Kopiere die Beispiel-Datei
copy .env.example .env

# Bearbeite .env mit deinen Supabase-Daten
notepad .env
```

**Wichtig - Fülle aus:**
- `SUPABASE_HOST` - Deine Supabase DB URL
- `SUPABASE_PASSWORD` - Dein Supabase Passwort
- `JWT_SECRET` - Ein zufälliger String (min. 32 Zeichen)

### 2. Docker starten
```powershell
# Automatisches Setup
.\deploy.ps1

# Oder manuell
docker-compose up -d
```

### 3. Zugreifen
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

---

## 📋 Services

| Service | Port | Beschreibung |
|---------|------|--------------|
| Frontend | 5173 | React + Vite |
| Backend | 4000 | Node.js + Express + Socket.io |
| Redis | 6379 | Caching & Sessions |
| PostgreSQL* | 5432 | Optional (wenn nicht Supabase) |

\* PostgreSQL ist auskommentiert, da du Supabase verwendest

---

## 🛠️ Nützliche Commands

### Starten & Stoppen
```powershell
# Alle Services starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f

# Services stoppen
docker-compose down

# Services + Volumes löschen
docker-compose down -v
```

### Debugging
```powershell
# Status prüfen
docker-compose ps

# Backend Logs
docker-compose logs -f backend

# In Container einsteigen
docker-compose exec backend sh

# Health Check
curl http://localhost:4000/health
```

### Updates
```powershell
# Neu builden
docker-compose build

# Neu builden ohne Cache
docker-compose build --no-cache

# Services neu starten
docker-compose up -d --build
```

---

## 🔧 Konfiguration

### Mit Supabase (Standard)
```.env
SUPABASE_HOST=db.xxxxxxxxxxxxxx.supabase.co
SUPABASE_PORT=5432
SUPABASE_USER=postgres
SUPABASE_PASSWORD=dein-password
SUPABASE_DB=postgres
```

### Mit lokaler PostgreSQL
1. Kommentiere in `docker-compose.yaml` den `postgres` Service ein
2. Ändere `.env`:
```.env
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=devchat
```

---

## 🚢 Production Deployment

### 1. Environment für Production
```.env.production
NODE_ENV=production
JWT_SECRET=<sehr-langer-zufälliger-string>
SUPABASE_PASSWORD=<production-password>
CORS_ORIGIN=https://yourdomain.com
VITE_API_URL=https://api.yourdomain.com
```

### 2. Mit Production Config starten
```powershell
docker-compose --env-file .env.production up -d
```

### 3. HTTPS Setup
Verwende einen Reverse Proxy wie Nginx oder Traefik

---

## 🔍 Troubleshooting

### Problem: Backend kann nicht zur DB verbinden
```powershell
# Prüfe Supabase Connection
docker-compose exec backend sh
ping db.xxxxx.supabase.co
```
**Lösung**: Prüfe Firewall bei Supabase, erlaube IP

### Problem: Frontend zeigt Fehler
```powershell
# Prüfe Backend Health
curl http://localhost:4000/health

# Prüfe Logs
docker-compose logs -f backend
```

### Problem: Port bereits belegt
Ändere in `docker-compose.yaml`:
```yaml
ports:
  - "8080:80"  # Statt 5173
```

### Problem: Build Fehler
```powershell
# Cache löschen
docker system prune -a

# Neu builden
docker-compose build --no-cache
```

---

## 📊 Health Monitoring

Alle Services haben Health Checks:
```powershell
# Service Status
docker-compose ps

# Backend Health
curl http://localhost:4000/health

# Response:
# {
#   "status": "ok",
#   "timestamp": "2024-...",
#   "uptime": 123.45
# }
```

---

## 🔐 Security Checklist

- [ ] `.env` nicht in Git committen
- [ ] Starkes JWT_SECRET verwenden
- [ ] Supabase Password sicher aufbewahren
- [ ] CORS_ORIGIN in Production anpassen
- [ ] HTTPS in Production aktivieren
- [ ] Regular Updates der Images

---

## 📈 Performance Tips

### Backend
- Connection Pooling ist aktiviert
- Compression enabled
- Health Checks optimiert

### Frontend
- Gzip Compression (nginx)
- Static Asset Caching (1 Jahr)
- Multi-stage Build (kleines Image)

### Database
- Supabase: Automatische Backups
- Lokal: Regelmäßige Backups machen

---

## 🆘 Support

**Logs prüfen:**
```powershell
docker-compose logs -f
```

**Services neu starten:**
```powershell
docker-compose restart
```

**Alles neu builden:**
```powershell
docker-compose down
docker-compose up -d --build
```

---

## 📚 Weitere Dokumentation

- [Vollständige Deployment-Anleitung](./DOCKER-DEPLOYMENT.md)
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [API Dokumentation](./docs/api.md)

---

**Status**: 🟢 Production Ready

Docker Setup ist vollständig getestet und einsatzbereit!
