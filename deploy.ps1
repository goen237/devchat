# Quick Deploy Script - Windows PowerShell
# Startet alle Services

Write-Host "DevChat Deployment Script" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "Docker is running" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop first." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "WARNING: .env file not found!" -ForegroundColor Yellow
    Write-Host "Creating from .env.example..." -ForegroundColor Cyan
    Copy-Item .env.example .env
    Write-Host ""
    Write-Host "Please edit .env with your configuration:" -ForegroundColor Yellow
    Write-Host "  - SUPABASE_PASSWORD" -ForegroundColor White
    Write-Host "  - JWT_SECRET" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter after editing .env"
}

Write-Host "Building Docker images..." -ForegroundColor Cyan
docker-compose build

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Cyan
docker-compose up -d

Write-Host ""
Write-Host "Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "Service Status:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "SUCCESS: Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Access your application:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  docker-compose logs -f        # View logs" -ForegroundColor White
Write-Host "  docker-compose ps             # Check status" -ForegroundColor White
Write-Host "  docker-compose down           # Stop all services" -ForegroundColor White
Write-Host "  docker-compose restart        # Restart services" -ForegroundColor White
Write-Host ""
