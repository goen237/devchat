#!/bin/bash
# Quick Deploy Script - Startet alle Services

set -e

echo "🚀 DevChat Deployment Script"
echo "=============================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating from .env.example..."
    cp .env.example .env
    echo ""
    echo "🔧 Please edit .env with your configuration:"
    echo "   - SUPABASE_PASSWORD"
    echo "   - JWT_SECRET"
    echo ""
    read -p "Press Enter after editing .env..."
fi

echo "📦 Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:4000"
echo ""
echo "📝 Useful commands:"
echo "   docker-compose logs -f        # View logs"
echo "   docker-compose ps             # Check status"
echo "   docker-compose down           # Stop all services"
echo "   docker-compose restart        # Restart services"
echo ""
