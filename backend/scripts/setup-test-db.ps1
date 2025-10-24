# Setup Test Database (Windows PowerShell)
# Encoding: UTF-8 with BOM

Write-Host "Setting up test database..." -ForegroundColor Cyan

# Load environment variables from .env.test
if (Test-Path .env.test) {
    Get-Content .env.test | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Variable -Name $name -Value $value -Scope Script
        }
    }
}
else {
    Write-Host "ERROR: .env.test file not found!" -ForegroundColor Red
    exit 1
}

# Database configuration
$DB_NAME = if ($DB_NAME_TEST) { $DB_NAME_TEST } else { "devchat_test" }
$DB_USER = if ($DB_USERNAME) { $DB_USERNAME } else { "postgres" }
$DB_HOST = if ($DB_HOST) { $DB_HOST } else { "localhost" }
$DB_PORT = if ($DB_PORT) { $DB_PORT } else { "5432" }

Write-Host "Database: $DB_NAME" -ForegroundColor Yellow
Write-Host "User: $DB_USER" -ForegroundColor Yellow
Write-Host "Host: ${DB_HOST}:${DB_PORT}" -ForegroundColor Yellow
Write-Host ""

# Set PostgreSQL password environment variable
$env:PGPASSWORD = if ($DB_PASSWORD) { $DB_PASSWORD } else { "postgres" }

# Check if database exists
Write-Host "Checking if database exists..." -ForegroundColor Cyan
$dbExists = $null
try {
    $dbExists = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt 2>$null | Select-String -Pattern "\b$DB_NAME\b"
}
catch {
    Write-Host "Warning: Could not check database existence" -ForegroundColor Yellow
}

if ($dbExists) {
    Write-Host "WARNING: Database $DB_NAME already exists" -ForegroundColor Yellow
    $response = Read-Host "Do you want to drop and recreate it? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host "Dropping database..." -ForegroundColor Yellow
        & dropdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Database dropped successfully" -ForegroundColor Green
        }
        else {
            Write-Host "Warning: Could not drop database" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "Using existing database" -ForegroundColor Cyan
        exit 0
    }
}

# Create database
Write-Host "Creating database..." -ForegroundColor Cyan
& createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Test database created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  npm test              # Run all tests" -ForegroundColor White
    Write-Host "  npm run test:unit     # Run unit tests only" -ForegroundColor White
    Write-Host "  npm run test:coverage # Run with coverage" -ForegroundColor White
}
else {
    Write-Host "ERROR: Failed to create test database" -ForegroundColor Red
    Write-Host "Make sure PostgreSQL is installed and running" -ForegroundColor Yellow
    exit 1
}
