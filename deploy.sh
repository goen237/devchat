#!/bin/bash
set -e

echo "🚀 DevChat Deployment Script"
echo "=============================="
echo ""

# Detect docker compose command (modern vs legacy)
if docker compose version > /dev/null 2>&1; then
    DC_CMD="docker compose"
elif docker-compose version > /dev/null 2>&1; then
    DC_CMD="docker-compose"
else
    echo "❌ Neither 'docker compose' nor 'docker-compose' is available. Install Docker CLI or compose plugin."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "Please start Docker Desktop or Docker daemon first."
    exit 1
fi
echo "✅ Docker is running"
echo ""

# Mode: default = dev (uses docker-compose.override.yml automatically)
MODE="dev"
if [ "$1" = "--prod" ] || [ "$1" = "prod" ]; then
    MODE="prod"
fi

# Ensure backend .env exists (docker-compose references ./backend/.env)
ENV_PATH="./backend/.env"
ENV_EXAMPLE="./backend/.env.example"

if [ ! -f "$ENV_PATH" ]; then
    if [ -f "$ENV_EXAMPLE" ]; then
        echo "⚠️  $ENV_PATH not found — creating from example..."
        cp "$ENV_EXAMPLE" "$ENV_PATH"
        echo "🔧 Please edit $ENV_PATH and fill secrets (SUPABASE_PASSWORD, JWT_SECRET, ...)"
        read -p "Press Enter after editing $ENV_PATH..."
    else
        echo "❌ Neither $ENV_PATH nor $ENV_EXAMPLE exist. Create one before deploying."
        exit 1
    fi
fi

echo "📦 Building Docker images..."
if [ "$MODE" = "prod" ]; then
    # Use explicit file to avoid loading override
    $DC_CMD -f docker-compose.yaml build
else
    # Development: use default compose which merges docker-compose.override.yml
    $DC_CMD build
fi

echo ""
echo "🚀 Starting services..."
if [ "$MODE" = "prod" ]; then
    $DC_CMD -f docker-compose.yaml up -d
else
    $DC_CMD up -d
fi

echo ""
echo "⏳ Waiting briefly for services to initialise..."
sleep 10

echo ""
echo "📊 Service Status:"
if [ "$MODE" = "prod" ]; then
    $DC_CMD -f docker-compose.yaml ps
else
    $DC_CMD ps
fi

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:4000"
echo ""
echo "📝 Useful commands:"
echo "   $DC_CMD logs -f        # View logs"
echo "   $DC_CMD ps             # Check status"
echo "   $DC_CMD down           # Stop all services"
echo "   $DC_CMD restart        # Restart services"
echo ""
# ...existing code...