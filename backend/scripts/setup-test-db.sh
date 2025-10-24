#!/bin/bash

echo "🔧 Setting up test database..."

# Load environment variables
if [ -f .env.test ]; then
    export $(cat .env.test | grep -v '^#' | xargs)
else
    echo "❌ .env.test file not found!"
    exit 1
fi

# Database configuration
DB_NAME=${DB_NAME_TEST:-devchat_test}
DB_USER=${DB_USERNAME:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

echo "📊 Database: $DB_NAME"
echo "👤 User: $DB_USER"
echo "🌐 Host: $DB_HOST:$DB_PORT"

# Check if database exists
DB_EXISTS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -w $DB_NAME)

if [ -n "$DB_EXISTS" ]; then
    echo "⚠️  Database $DB_NAME already exists"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Dropping database..."
        PGPASSWORD=$DB_PASSWORD dropdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
        echo "✅ Database dropped"
    else
        echo "ℹ️  Using existing database"
        exit 0
    fi
fi

# Create database
echo "🔨 Creating database..."
PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME

if [ $? -eq 0 ]; then
    echo "✅ Test database created successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "   npm test              # Run all tests"
    echo "   npm run test:unit     # Run unit tests only"
    echo "   npm run test:coverage # Run with coverage"
else
    echo "❌ Failed to create test database"
    exit 1
fi
