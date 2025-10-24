# Quick Test Database Setup with Docker
# One-liner to start PostgreSQL for testing

Write-Host "Starting PostgreSQL Test Database with Docker..." -ForegroundColor Cyan

# Check if Docker is running
$dockerRunning = $null
try {
    $dockerRunning = docker ps 2>$null
} catch {}

if (-not $dockerRunning) {
    Write-Host "ERROR: Docker is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop first" -ForegroundColor Yellow
    exit 1
}

# Remove old container if exists
$oldContainer = docker ps -a --filter "name=postgres-test-devchat" --format "{{.Names}}" 2>$null
if ($oldContainer) {
    Write-Host "Removing old container..." -ForegroundColor Yellow
    docker rm -f postgres-test-devchat 2>$null | Out-Null
}

# Start fresh container
Write-Host "Starting PostgreSQL container..." -ForegroundColor Cyan
docker run -d `
    --name postgres-test-devchat `
    -e POSTGRES_PASSWORD=postgres `
    -e POSTGRES_USER=postgres `
    -e POSTGRES_DB=devchat_test `
    -p 5432:5432 `
    postgres:15-alpine | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS! PostgreSQL is running" -ForegroundColor Green
    Write-Host ""
    Write-Host "Connection Details:" -ForegroundColor Cyan
    Write-Host "  Host: localhost" -ForegroundColor White
    Write-Host "  Port: 5432" -ForegroundColor White
    Write-Host "  Database: devchat_test" -ForegroundColor White
    Write-Host "  User: postgres" -ForegroundColor White
    Write-Host "  Password: postgres" -ForegroundColor White
    Write-Host ""
    Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    Write-Host ""
    Write-Host "Ready to run tests!" -ForegroundColor Green
    Write-Host "  npm test" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "ERROR: Failed to start container" -ForegroundColor Red
    exit 1
}
