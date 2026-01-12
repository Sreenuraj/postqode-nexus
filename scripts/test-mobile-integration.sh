#!/bin/bash
# scripts/test-mobile-integration.sh

set -e

echo "🚀 Setting up Integration Test Environment..."

# Track what we started so we only clean up what we created
STARTED_DATABASE=false
STARTED_BACKEND=false
BACKEND_PID=""

# Cleanup function to stop all services we started
cleanup() {
    echo ""
    echo "🧹 Cleaning up test environment..."
    
    # Stop backend if we started it
    if [ "$STARTED_BACKEND" = true ]; then
        echo "☕ Stopping Backend..."
        if [ -n "$BACKEND_PID" ]; then
            kill $BACKEND_PID 2>/dev/null || true
        fi
        pkill -f "spring-boot:run" 2>/dev/null || true
        # Only kill java processes on port 8080, not Docker processes
        for pid in $(lsof -ti:8080 2>/dev/null); do
            if ps -p $pid -o comm= 2>/dev/null | grep -qE "^(java|mvn)"; then
                kill $pid 2>/dev/null || true
            fi
        done
        echo "   ✅ Backend stopped"
    fi
    
    # Stop database if we started it
    if [ "$STARTED_DATABASE" = true ]; then
        echo "🐘 Stopping Database..."
        docker stop nexus-db >/dev/null 2>&1 || true
        docker rm nexus-db >/dev/null 2>&1 || true
        echo "   ✅ Database stopped"
    fi
    
    echo "🧹 Cleanup complete!"
}

# Register cleanup to run on script exit (success or failure)
trap cleanup EXIT

# Start database if not running
if ! docker ps | grep -q nexus-db; then
    echo "🐘 Starting Database..."
    STARTED_DATABASE=true
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
    echo "✅ Database is already running (will not stop after tests)"
fi

# Check if backend is running
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Backend is already running (will not stop after tests)"
else
    echo "☕ Starting Backend..."
    STARTED_BACKEND=true
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
        exit 1
    fi
fi

echo ""
echo "🧪 Running Mobile Integration Tests..."
cd mobile
npm run test:integration
TEST_EXIT_CODE=$?
cd ..

# Exit with test exit code (cleanup will run via trap)
exit $TEST_EXIT_CODE
