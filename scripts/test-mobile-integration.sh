#!/bin/bash
# scripts/test-mobile-integration.sh

set -e

echo "🚀 Setting up Integration Test Environment..."

PROJECT_ROOT=$(pwd)
DB_WAS_RUNNING=false
BACKEND_WAS_RUNNING=false

# Check if database is running
if docker ps | grep -q nexus-db; then
    DB_WAS_RUNNING=true
fi

# Check if backend is running
if curl -s http://localhost:8080/health > /dev/null; then
    BACKEND_WAS_RUNNING=true
fi

cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    
    if [ "$BACKEND_WAS_RUNNING" = false ]; then
        echo "Stopping Backend..."
        pkill -f "spring-boot:run" 2>/dev/null || true
        # Also kill by port just in case
        lsof -ti:8080 | xargs kill 2>/dev/null || true
    else
        echo "Backend was running before test, leaving it running."
    fi

    if [ "$DB_WAS_RUNNING" = false ]; then
        echo "Stopping Database..."
        docker stop nexus-db >/dev/null 2>&1 || true
        docker rm nexus-db >/dev/null 2>&1 || true
    else
        echo "Database was running before test, leaving it running."
    fi
}
trap cleanup EXIT

# Start database if not running
if [ "$DB_WAS_RUNNING" = false ]; then
    echo "🐘 Starting Database..."
    if docker ps -a | grep -q nexus-db; then
        docker start nexus-db
    else
        docker run -d --name nexus-db -p 5432:5432 \
            -e POSTGRES_DB=nexus \
            -e POSTGRES_USER=nexus \
            -e POSTGRES_PASSWORD=nexus123 \
            postgres:15-alpine
    fi
    echo "⏳ Waiting for database..."
    sleep 5
else
    echo "✅ Database is already running"
fi

# Start backend if not running
if [ "$BACKEND_WAS_RUNNING" = false ]; then
    echo "☕ Starting Backend..."
    # Start backend in background
    cd backend
    if [ -f "./mvnw" ]; then
        ./mvnw spring-boot:run > /tmp/nexus-backend-test.log 2>&1 &
    else
        mvn spring-boot:run > /tmp/nexus-backend-test.log 2>&1 &
    fi
    BACKEND_PID=$!
    cd ..
    
    echo "⏳ Waiting for backend to start (this may take a minute)..."
    # Wait loop
    for i in {1..60}; do
        if curl -s http://localhost:8080/health > /dev/null; then
            echo "✅ Backend started!"
            break
        fi
        echo -n "."
        sleep 2
    done
    
    if ! curl -s http://localhost:8080/health > /dev/null; then
        echo "❌ Backend failed to start. Check /tmp/nexus-backend-test.log"
        kill $BACKEND_PID || true
        exit 1
    fi
else
    echo "✅ Backend is already running"
fi

echo ""
echo "🧪 Running Mobile Integration Tests..."
cd mobile
npm run test:integration
TEST_EXIT_CODE=$?
cd ..

# Cleanup is handled by trap
exit $TEST_EXIT_CODE
