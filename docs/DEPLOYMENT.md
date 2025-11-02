# 🚀 DevChat Deployment Guide

## Inhaltsverzeichnis

- [Schnellstart](#schnellstart)
- [Voraussetzungen](#voraussetzungen)
- [Lokale Entwicklung](#lokale-entwicklung)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Monitoring & Wartung](#monitoring--wartung)
- [Troubleshooting](#troubleshooting)

---

## Schnellstart

### Mit Docker (Empfohlen)

```bash
# 1. Repository klonen
git clone https://github.com/goen237/devchat.git
cd devchat

# 2. Environment konfigurieren
copy .env.example .env
# .env mit deinen Daten bearbeiten

# 3. Deployment starten
.\deploy.ps1  # Windows
./deploy.sh   # Linux/Mac

# 4. Öffne Browser: http://localhost:5173
```

Das war's! 🎉

---

## Voraussetzungen

### Software Requirements

| Software | Version | Zweck |
|----------|---------|-------|
| **Node.js** | 20.x+ | Backend Runtime |
| **npm** | 10.x+ | Package Manager |
| **Docker** | 24.x+ | Containerization |
| **Docker Compose** | 2.x+ | Orchestration |
| **Git** | 2.x+ | Version Control |
| **PostgreSQL** | 15+ | Database (optional) |

### Hardware Requirements

**Minimum:**
- CPU: 2 Cores
- RAM: 4GB
- Disk: 10GB

**Empfohlen (Production):**
- CPU: 4+ Cores
- RAM: 8GB+
- Disk: 50GB+ (SSD)

---

## Lokale Entwicklung

### Backend Setup

```bash
cd backend

# 1. Dependencies installieren
npm install

# 2. Environment Variables
copy .env.example .env

# 3. .env konfigurieren
# Siehe unten für Details

# 4. Datenbank initialisieren
npm run seed

# 5. Development Server starten
npm run dev
```

**Backend `.env`:**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=devchat
DB_NAME_TEST=devchat_test

# JWT
JWT_SECRET=your-super-secure-secret-key-min-32-chars

# Server
PORT=4000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend Setup

```bash
cd frontend

# 1. Dependencies installieren
npm install

# 2. Environment Variables
copy .env.example .env

# 3. Development Server starten
npm run dev
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
```

### Database Setup

**Option 1: Docker PostgreSQL**
```bash
cd backend
.\scripts\docker-test-db.ps1
```

**Option 2: Supabase**
1. Gehe zu [supabase.com](https://supabase.com)
2. Erstelle neues Projekt
3. Kopiere Connection String
4. Füge in `.env` ein

**Option 3: Lokale Installation**
```bash
# Windows (mit Chocolatey)
choco install postgresql

# Mac
brew install postgresql

# Linux
sudo apt-get install postgresql
```

---

## Docker Deployment

### Schnelles Deployment

**Windows:**
```powershell
.\deploy.ps1
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Manuelles Deployment

```bash
# 1. Environment konfigurieren
copy .env.example .env
# .env bearbeiten

# 2. Services bauen und starten
docker-compose up -d

# 3. Logs verfolgen
docker-compose logs -f

# 4. Status prüfen
docker-compose ps

# 5. Services stoppen
docker-compose down
```

### Docker Compose Struktur

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DB_HOST=db.supabase.co
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - redis
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    ports:
      - "5173:80"
    depends_on:
      - backend

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### Docker Environment Variables

**`.env` für Docker Compose:**
```env
# Backend
DB_HOST=db.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-supabase-password
DB_NAME=postgres
JWT_SECRET=your-secure-jwt-secret-32-chars
NODE_ENV=production
CORS_ORIGIN=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:5173
VITE_SOCKET_URL=http://localhost:5173

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
```

### Docker Commands

```bash
# Alle Services starten
docker-compose up -d

# Nur einen Service starten
docker-compose up -d backend

# Services neu bauen
docker-compose build

# Services neu bauen und starten
docker-compose up -d --build

# Logs anzeigen
docker-compose logs backend
docker-compose logs frontend
docker-compose logs -f  # Follow mode

# Service-Status
docker-compose ps

# Service neu starten
docker-compose restart backend

# In Container einsteigen
docker-compose exec backend sh

# Services stoppen
docker-compose stop

# Services stoppen und löschen
docker-compose down

# Services + Volumes löschen
docker-compose down -v

# Resources aufräumen
docker system prune -a
```

---

## Production Deployment

### Vorbereitung

1. **Domain & SSL Zertifikat**
   - Domain registrieren
   - DNS konfigurieren
   - SSL Zertifikat (Let's Encrypt)

2. **Database (Supabase)**
   - Production Projekt erstellen
   - Connection String notieren
   - Backups aktivieren

3. **Environment Variables**
   - Sichere Passwörter generieren
   - Production URLs konfigurieren
   - Secrets Management

### Production `.env`

```env
# Backend
DB_HOST=db.your-project.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=STRONG_PRODUCTION_PASSWORD
DB_NAME=postgres
JWT_SECRET=SUPER_SECURE_RANDOM_STRING_MIN_32_CHARS
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com

# Frontend
VITE_API_URL=https://api.your-domain.com
VITE_SOCKET_URL=https://api.your-domain.com
```

### nginx Reverse Proxy

**`nginx.conf`:**
```nginx
upstream backend {
    server backend:4000;
}

server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Frontend
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Socket.io
    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### Let's Encrypt SSL

```bash
# Certbot installieren
sudo apt-get install certbot python3-certbot-nginx

# Zertifikat erstellen
sudo certbot --nginx -d your-domain.com -d api.your-domain.com

# Auto-renewal testen
sudo certbot renew --dry-run
```

### Production Docker Compose

**`docker-compose.production.yml`:**
```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/letsencrypt
    depends_on:
      - frontend
      - backend
    restart: always

  backend:
    build: ./backend
    environment:
      - NODE_ENV=production
      - DB_HOST=${DB_HOST}
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - redis
    restart: always
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:4000/health"]

  frontend:
    build:
      context: ./frontend
      args:
        - VITE_API_URL=${VITE_API_URL}
    restart: always

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: always

volumes:
  redis_data:
```

**Deployment:**
```bash
docker-compose -f docker-compose.production.yml up -d
```

---

## Cloud Deployment

### AWS Deployment

#### EC2 Instance

```bash
# 1. EC2 Instance erstellen
# - Ubuntu 22.04 LTS
# - t3.medium (2 vCPU, 4GB RAM)
# - Security Group: Port 80, 443, 22

# 2. SSH verbinden
ssh -i your-key.pem ubuntu@your-ec2-ip

# 3. Docker installieren
sudo apt-get update
sudo apt-get install docker.io docker-compose

# 4. Repository klonen
git clone https://github.com/goen237/devchat.git
cd devchat

# 5. .env konfigurieren
nano .env

# 6. Deployment starten
./deploy.sh
```

#### AWS RDS (Database)

```bash
# 1. RDS PostgreSQL erstellen
# - Engine: PostgreSQL 15
# - Instance: db.t3.micro (Free Tier)
# - Public Access: No
# - VPC: Same as EC2

# 2. Security Group konfigurieren
# Allow Port 5432 from EC2 Security Group

# 3. Connection String in .env
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
```

#### AWS S3 (Static Assets)

```bash
# 1. S3 Bucket erstellen
aws s3 mb s3://devchat-avatars

# 2. Public Access konfigurieren
# Bucket Policy für avatars

# 3. CloudFront Distribution
# Origin: S3 Bucket
# Cache Policy: CachingOptimized
```

### DigitalOcean Deployment

#### Droplet

```bash
# 1. Droplet erstellen
# - Ubuntu 22.04
# - Basic Plan ($12/mo)
# - Frankfurt datacenter

# 2. SSH verbinden
ssh root@your-droplet-ip

# 3. Initial Setup
apt-get update
apt-get upgrade
apt-get install docker.io docker-compose git

# 4. Non-root user erstellen
adduser deploy
usermod -aG sudo deploy
usermod -aG docker deploy

# 5. Als deploy user
su - deploy
git clone https://github.com/goen237/devchat.git
cd devchat
./deploy.sh
```

#### Managed Database

```bash
# 1. Managed PostgreSQL erstellen
# - Version 15
# - Basic Plan ($15/mo)
# - Same datacenter

# 2. Connection String kopieren
# 3. In .env eintragen
```

### Heroku Deployment

```bash
# 1. Heroku CLI installieren
npm install -g heroku

# 2. Login
heroku login

# 3. App erstellen
heroku create devchat-backend
heroku create devchat-frontend

# 4. PostgreSQL hinzufügen
heroku addons:create heroku-postgresql:mini

# 5. Environment Variables setzen
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production

# 6. Deployment
git push heroku main

# 7. Logs ansehen
heroku logs --tail
```

---

## Kubernetes Deployment

### Voraussetzungen

```bash
# kubectl installieren
# https://kubernetes.io/docs/tasks/tools/

# kubectl version prüfen
kubectl version --client
```

### Deployment Files

**`k8s/backend-deployment.yaml`:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: devchat-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: ghcr.io/goen237/devchat/backend:latest
        ports:
        - containerPort: 4000
        env:
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: host
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
  - port: 4000
    targetPort: 4000
  type: ClusterIP
```

**Deployment:**
```bash
# Secrets erstellen
kubectl create secret generic db-secret \
  --from-literal=host=db.supabase.co \
  --from-literal=password=your-password

kubectl create secret generic jwt-secret \
  --from-literal=secret=your-jwt-secret

# Deployments anwenden
kubectl apply -f k8s/

# Status prüfen
kubectl get pods
kubectl get services

# Logs ansehen
kubectl logs -f deployment/devchat-backend

# Port forwarding (testing)
kubectl port-forward svc/backend-service 4000:4000
```

### Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: devchat-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## Monitoring & Wartung

### Health Checks

```bash
# Backend Health Check
curl http://localhost:4000/health

# Expected Response:
{
  "status": "ok",
  "timestamp": "2025-10-25T10:00:00.000Z",
  "uptime": 12345
}

# Docker Health Status
docker-compose ps
```

### Logs

```bash
# Docker Compose Logs
docker-compose logs backend -f
docker-compose logs frontend -f

# Kubernetes Logs
kubectl logs -f deployment/devchat-backend

# nginx Logs
docker-compose exec frontend tail -f /var/log/nginx/access.log
```

### Database Backups

**PostgreSQL Backup:**
```bash
# Backup erstellen
docker-compose exec postgres pg_dump -U postgres devchat > backup.sql

# Backup wiederherstellen
docker-compose exec -T postgres psql -U postgres devchat < backup.sql
```

**Supabase Backups:**
- Automatisch täglich
- Manuell in Supabase Dashboard

### Updates & Maintenance

```bash
# 1. Code aktualisieren
git pull origin main

# 2. Dependencies aktualisieren
cd backend && npm install
cd frontend && npm install

# 3. Docker Images neu bauen
docker-compose build

# 4. Rolling Update
docker-compose up -d --no-deps --build backend
docker-compose up -d --no-deps --build frontend

# 5. Health Check
curl http://localhost:4000/health
```

### Performance Monitoring

```bash
# Docker Stats
docker stats

# Container Resources
docker-compose top

# Database Connections
docker-compose exec postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## Troubleshooting

### Common Issues

#### Problem: Container startet nicht

```bash
# Logs prüfen
docker-compose logs backend

# Container neu starten
docker-compose restart backend

# Neu bauen
docker-compose up -d --build backend
```

#### Problem: Database Connection Error

```bash
# 1. .env prüfen
cat .env

# 2. Database erreichbar testen
docker-compose exec backend ping -c 3 db.supabase.co

# 3. PostgreSQL Connection String testen
docker-compose exec backend node -e "
  const pg = require('pg');
  const client = new pg.Client(process.env.DATABASE_URL);
  client.connect().then(() => console.log('Connected!'));
"
```

#### Problem: Frontend kann Backend nicht erreichen

```bash
# 1. CORS Origin prüfen
# backend/.env
CORS_ORIGIN=http://localhost:5173

# 2. API URL prüfen
# frontend/.env
VITE_API_URL=http://localhost:4000

# 3. nginx Config prüfen (Docker)
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf
```

#### Problem: Socket.io verbindet nicht

```bash
# 1. Browser Console öffnen
# Suche nach WebSocket Errors

# 2. nginx WebSocket Proxy prüfen
location /socket.io {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}

# 3. Firewall prüfen
sudo ufw status
sudo ufw allow 4000
```

#### Problem: Out of Memory

```bash
# Docker Memory Limit erhöhen
# docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G

# System Memory prüfen
free -h

# Docker prune
docker system prune -a
```

#### Problem: SSL Certificate Error

```bash
# Zertifikat neu erstellen
sudo certbot renew

# Zertifikat Status prüfen
sudo certbot certificates

# nginx Config prüfen
sudo nginx -t
```

### Debug Mode

**Backend Debug:**
```bash
# docker-compose.override.yml
services:
  backend:
    environment:
      - DEBUG=*
      - LOG_LEVEL=debug
    command: npm run dev
```

**Frontend Debug:**
```bash
# .env.development
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

---

## Backup & Restore

### Full Backup

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/$DATE"

mkdir -p $BACKUP_DIR

# Database Backup
docker-compose exec -T postgres pg_dump -U postgres devchat > $BACKUP_DIR/database.sql

# Redis Backup
docker-compose exec redis redis-cli SAVE
docker cp $(docker-compose ps -q redis):/data/dump.rdb $BACKUP_DIR/redis.rdb

# Environment Backup
cp .env $BACKUP_DIR/.env

# Compress
tar -czf backups/backup_$DATE.tar.gz -C backups $DATE

echo "Backup created: backups/backup_$DATE.tar.gz"
```

### Restore

```bash
#!/bin/bash
# restore.sh BACKUP_FILE

BACKUP_FILE=$1
TEMP_DIR="./temp_restore"

# Extract
mkdir -p $TEMP_DIR
tar -xzf $BACKUP_FILE -C $TEMP_DIR

# Restore Database
docker-compose exec -T postgres psql -U postgres devchat < $TEMP_DIR/*/database.sql

# Restore Redis
docker cp $TEMP_DIR/*/redis.rdb $(docker-compose ps -q redis):/data/dump.rdb
docker-compose restart redis

echo "Restore completed"
```

---

## Security Checklist

✅ **Pre-Production:**
- [ ] Strong JWT_SECRET (32+ chars)
- [ ] Strong DB_PASSWORD
- [ ] HTTPS/SSL configured
- [ ] Firewall rules configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Environment variables in secrets
- [ ] Database backups enabled
- [ ] Monitoring configured
- [ ] Error logging configured

✅ **Post-Production:**
- [ ] Regular security updates
- [ ] Log monitoring
- [ ] Performance monitoring
- [ ] Backup testing
- [ ] SSL certificate renewal
- [ ] Dependency updates

---

## Support & Resources

- 📖 [README.md](../README.md) - Projekt Overview
- 🏗️ [Architecture](./architecture.md) - System Architecture
- 📡 [API Documentation](./API-DOCUMENTATION.md) - API Reference
- 🐳 [Docker README](../DOCKER-README.md) - Docker Quickstart
- 🔧 [CI/CD Pipeline](../.github/README.md) - GitHub Actions

---

**Version:** 1.0.0 | **Last Updated:** Oktober 2025
