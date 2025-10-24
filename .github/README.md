# 🚀 GitHub Actions CI/CD Pipeline

## Übersicht

Vollständige CI/CD Pipeline mit automatisierten Tests, Builds und Deployments.

## 📋 Workflows

### 1. **Main CI/CD Pipeline** (`ci-cd.yml`)
Hauptworkflow - Läuft bei jedem Push und Pull Request

**Jobs:**
- ✅ Code Quality Checks (Linting, TypeScript)
- ✅ Backend Tests (Unit + Integration)
- ✅ Frontend Tests
- ✅ Docker Build & Push
- ✅ Security Scanning
- ✅ Deployment (nur main branch)

**Trigger:**
```yaml
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
```

### 2. **Tests** (`tests.yml`)
Umfassende Test-Suite

**Jobs:**
- Backend Unit Tests
- Backend Integration Tests
- Frontend Tests
- E2E Tests (optional)

**Features:**
- PostgreSQL & Redis Services
- Code Coverage Upload
- Tägliche Scheduled Tests

### 3. **Docker Build** (`docker-build.yml`)
Baut und pushed Docker Images

**Features:**
- Multi-Platform Builds (amd64, arm64)
- Layer Caching
- Vulnerability Scanning mit Trivy
- Push zu GitHub Container Registry

### 4. **Code Quality** (`code-quality.yml`)
Qualitätsprüfungen

**Jobs:**
- ESLint & TypeScript Checks
- Security Scanning (Trivy)
- NPM Audit
- CodeQL Analysis

### 5. **Performance Tests** (`performance.yml`)
Performance-Messungen

**Jobs:**
- Lighthouse CI (Frontend)
- API Load Testing (k6)
- Wöchentliche Tests

### 6. **Dependency Updates** (`dependency-updates.yml`)
Dependency-Management

**Features:**
- Wöchentliche Checks
- Dependabot Integration
- Automatische Updates

---

## 🔧 Setup

### 1. GitHub Repository Settings

#### Secrets einrichten
Gehe zu: `Settings > Secrets and variables > Actions`

**Erforderliche Secrets:**
```yaml
# Für Production Deployment (optional)
PRODUCTION_HOST: your-server.com
PRODUCTION_SSH_KEY: <ssh-private-key>
SUPABASE_PASSWORD: <production-password>
JWT_SECRET: <production-jwt-secret>

# Für Docker Registry (automatisch verfügbar)
GITHUB_TOKEN: <automatisch>
```

#### Environments einrichten
Gehe zu: `Settings > Environments`

Erstelle Environment: `production`
- ✅ Protection Rules aktivieren
- ✅ Required Reviewers hinzufügen
- ✅ Environment Secrets hinzufügen

### 2. Branch Protection Rules

Gehe zu: `Settings > Branches > Add rule`

**Für `main` Branch:**
```yaml
- Require a pull request before merging
- Require approvals: 1
- Require status checks to pass:
  ✓ code-quality
  ✓ backend-tests
  ✓ frontend-tests
  ✓ build-docker
- Require branches to be up to date
```

**Für `develop` Branch:**
```yaml
- Require status checks to pass:
  ✓ code-quality
  ✓ backend-tests
```

### 3. GitHub Container Registry aktivieren

Gehe zu: `Settings > Packages`
- ✅ Enable improved container support

---

## 📊 Workflow Status Badges

Füge diese Badges zu deiner `README.md` hinzu:

```markdown
![CI/CD Pipeline](https://github.com/goen237/devchat/workflows/CI/CD%20Pipeline/badge.svg)
![Tests](https://github.com/goen237/devchat/workflows/Tests/badge.svg)
![Code Quality](https://github.com/goen237/devchat/workflows/Code%20Quality/badge.svg)
![Docker Build](https://github.com/goen237/devchat/workflows/Docker%20Build/badge.svg)
```

---

## 🔄 Workflow Triggers

### Automatische Triggers

| Event | Workflows |
|-------|-----------|
| Push to `main` | CI/CD, Tests, Docker Build, Code Quality |
| Push to `develop` | CI/CD, Tests, Code Quality |
| Pull Request | CI/CD, Tests, Code Quality |
| Schedule (Daily 2 AM) | Tests |
| Schedule (Weekly Mon) | Dependency Updates, Performance |

### Manuelle Triggers

Alle Workflows können manuell gestartet werden:
1. Gehe zu `Actions` Tab
2. Wähle Workflow
3. Klicke `Run workflow`

---

## 🐳 Docker Images

Images werden gepushed zu:
```
ghcr.io/goen237/devchat/backend:latest
ghcr.io/goen237/devchat/frontend:latest
```

**Tags:**
- `latest` - Latest from main branch
- `main-<sha>` - Specific commit
- `v1.0.0` - Semantic version tags
- `develop` - Latest from develop branch

**Image pullen:**
```bash
docker pull ghcr.io/goen237/devchat/backend:latest
docker pull ghcr.io/goen237/devchat/frontend:latest
```

---

## 🧪 Testing

### Lokale Tests laufen lassen

**Backend Tests:**
```bash
cd backend
npm test
npm run test:unit
npm run test:integration
npm run test:coverage
```

**Frontend Tests:**
```bash
cd frontend
npm test
```

### CI Tests debuggen

**Logs ansehen:**
1. Gehe zu `Actions` Tab
2. Klicke auf fehlgeschlagenen Workflow
3. Klicke auf fehlgeschlagenen Job
4. Expandiere Failed Step

**Lokale Simulation:**
```bash
# Mit Docker Services
docker-compose -f docker-compose.test.yml up -d
npm test
docker-compose -f docker-compose.test.yml down
```

---

## 📈 Code Coverage

Coverage Reports werden automatisch generiert und zu Codecov hochgeladen.

**Setup Codecov:**
1. Gehe zu https://codecov.io
2. Verknüpfe GitHub Repository
3. Kopiere Token
4. Füge als Secret hinzu: `CODECOV_TOKEN`

**Coverage Badge:**
```markdown
[![codecov](https://codecov.io/gh/goen237/devchat/branch/main/graph/badge.svg)](https://codecov.io/gh/goen237/devchat)
```

---

## 🔒 Security

### Automated Security Scanning

**Tools:**
- ✅ Trivy - Vulnerability Scanner
- ✅ CodeQL - Code Analysis
- ✅ npm audit - Dependency Audit
- ✅ Dependabot - Automated Updates

**Security Alerts:**
Gehe zu: `Security > Dependabot alerts`

### Security Best Practices

- ✅ Never commit secrets
- ✅ Use GitHub Secrets
- ✅ Enable branch protection
- ✅ Require code reviews
- ✅ Scan images before deployment

---

## 🚢 Deployment

### Deployment Strategie

**Branches:**
- `develop` → Dev/Staging Environment
- `main` → Production Environment

**Workflow:**
```
1. Feature Branch → develop (PR + Tests)
2. develop → main (PR + Full Pipeline)
3. main → Production Deploy (Automatic)
```

### Custom Deployment

Füge deine Deployment-Steps in `ci-cd.yml` ein:

```yaml
- name: Deploy to Server
  uses: appleboy/ssh-action@master
  with:
    host: ${{ secrets.PRODUCTION_HOST }}
    username: deploy
    key: ${{ secrets.PRODUCTION_SSH_KEY }}
    script: |
      cd /app/devchat
      docker-compose pull
      docker-compose up -d
```

---

## 🎯 Performance

### Optimization

**Build Zeit reduzieren:**
- ✅ Layer Caching aktiviert
- ✅ npm ci statt npm install
- ✅ Parallele Jobs
- ✅ Conditional Steps

**Kosten sparen:**
- ✅ Scheduled Jobs nur auf main
- ✅ E2E Tests nur bei wichtigen Changes
- ✅ Aggressive Caching

### Monitoring

**GitHub Actions Usage:**
Gehe zu: `Settings > Billing > Actions`

**Workflow Laufzeit:**
```bash
# Durchschnittliche Zeiten
Code Quality: ~2 min
Backend Tests: ~5 min
Frontend Tests: ~3 min
Docker Build: ~8 min
Total: ~15-20 min
```

---

## 🛠️ Troubleshooting

### Tests schlagen fehl

**Problem:** PostgreSQL Service nicht bereit
```yaml
# Lösung: Warten in Step
- name: Wait for PostgreSQL
  run: |
    until pg_isready -h localhost -p 5432; do
      echo "Waiting for postgres..."
      sleep 2
    done
```

**Problem:** npm ci fails
```yaml
# Lösung: Cache invalidieren
- name: Clear npm cache
  run: npm cache clean --force
```

### Docker Build schlägt fehl

**Problem:** Out of disk space
```yaml
# Lösung: Cleanup vor Build
- name: Free disk space
  run: |
    docker system prune -af
    sudo rm -rf /usr/share/dotnet
    sudo rm -rf /opt/ghc
```

**Problem:** Build timeout
```yaml
# Lösung: Timeout erhöhen
- name: Build
  timeout-minutes: 30  # Standard: 360
```

---

## 📚 Weitere Ressourcen

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Codecov Action](https://github.com/codecov/codecov-action)
- [Trivy Security Scanner](https://github.com/aquasecurity/trivy-action)

---

**Status**: ✅ Production Ready

Alle Workflows sind getestet und deployment-ready!
