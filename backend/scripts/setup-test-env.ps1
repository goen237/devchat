# Setup Test Database using Node.js and TypeORM
# This doesn't require PostgreSQL CLI tools

Write-Host "Setting up test database using TypeORM..." -ForegroundColor Cyan

# Check if .env.test exists
if (-not (Test-Path .env.test)) {
    Write-Host "Creating .env.test file..." -ForegroundColor Yellow
    
    $envContent = @"
# Test Environment Configuration
NODE_ENV=test

# Test Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME_TEST=devchat_test

# JWT Secret (Test)
JWT_SECRET=test-secret-key-for-testing-only
"@
    
    Set-Content -Path .env.test -Value $envContent
    Write-Host "Created .env.test file" -ForegroundColor Green
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Test Database Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Load .env.test
Get-Content .env.test | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

Write-Host "Database Configuration:" -ForegroundColor Yellow
Write-Host "  Host: $env:DB_HOST" -ForegroundColor White
Write-Host "  Port: $env:DB_PORT" -ForegroundColor White
Write-Host "  User: $env:DB_USERNAME" -ForegroundColor White
Write-Host "  Database: $env:DB_NAME_TEST" -ForegroundColor White
Write-Host ""

Write-Host "Options:" -ForegroundColor Cyan
Write-Host "  1. Use Docker (Recommended)" -ForegroundColor White
Write-Host "  2. Skip database setup (use existing)" -ForegroundColor White
Write-Host "  3. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Select option (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Starting PostgreSQL with Docker..." -ForegroundColor Cyan
        
        # Check if Docker is available
        $dockerAvailable = $null
        try {
            $dockerAvailable = docker --version 2>$null
        } catch {}
        
        if (-not $dockerAvailable) {
            Write-Host "ERROR: Docker is not installed or not running" -ForegroundColor Red
            Write-Host "Please install Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
            exit 1
        }
        
        # Check if container already exists
        $containerExists = docker ps -a --filter "name=postgres-test-devchat" --format "{{.Names}}" 2>$null
        
        if ($containerExists) {
            Write-Host "Removing existing container..." -ForegroundColor Yellow
            docker rm -f postgres-test-devchat 2>$null
        }
        
        # Start PostgreSQL container
        Write-Host "Starting PostgreSQL container..." -ForegroundColor Cyan
        docker run -d `
            --name postgres-test-devchat `
            -e POSTGRES_PASSWORD=$env:DB_PASSWORD `
            -e POSTGRES_USER=$env:DB_USERNAME `
            -e POSTGRES_DB=$env:DB_NAME_TEST `
            -p "$($env:DB_PORT):5432" `
            postgres:15-alpine
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "SUCCESS: PostgreSQL container started!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
            Start-Sleep -Seconds 3
            
            Write-Host ""
            Write-Host "Container Info:" -ForegroundColor Cyan
            Write-Host "  Name: postgres-test-devchat" -ForegroundColor White
            Write-Host "  Port: $env:DB_PORT" -ForegroundColor White
            Write-Host "  Database: $env:DB_NAME_TEST" -ForegroundColor White
            Write-Host ""
            Write-Host "To stop the container:" -ForegroundColor Yellow
            Write-Host "  docker stop postgres-test-devchat" -ForegroundColor White
            Write-Host ""
            Write-Host "To remove the container:" -ForegroundColor Yellow
            Write-Host "  docker rm -f postgres-test-devchat" -ForegroundColor White
        } else {
            Write-Host "ERROR: Failed to start Docker container" -ForegroundColor Red
            exit 1
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "Skipping database setup..." -ForegroundColor Yellow
        Write-Host "Make sure PostgreSQL is running on $($env:DB_HOST):$($env:DB_PORT)" -ForegroundColor Yellow
    }
    
    default {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  npm test              # Run all tests" -ForegroundColor White
Write-Host "  npm run test:unit     # Run unit tests only" -ForegroundColor White
Write-Host "  npm run test:coverage # Run with coverage" -ForegroundColor White
Write-Host ""
