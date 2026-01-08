#!/bin/bash
# start-backend.sh - Start backend service for development

set -e

echo "🚀 Starting PostQode Nexus Backend..."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if PostgreSQL is running
check_db() {
    if docker ps | grep -q nexus-db; then
        echo -e "${GREEN}✅ Database container running${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Database not running. Starting it...${NC}"
        docker run -d --name nexus-db -p 5432:5432 \
            -e POSTGRES_DB=nexus \
            -e POSTGRES_USER=nexus \
            -e POSTGRES_PASSWORD=nexus123 \
            postgres:15-alpine
        echo "⏳ Waiting for database to be ready..."
        sleep 5
        return 0
    fi
}

# Main
cd "$PROJECT_ROOT"

# Check database
check_db

echo ""
echo "📦 Starting Spring Boot application..."
echo ""

cd backend

# Load environment variables if .env exists
if [ -f "$PROJECT_ROOT/.env" ]; then
    export $(cat "$PROJECT_ROOT/.env" | grep -v '^#' | xargs)
fi

# Start the backend
./mvnw spring-boot:run

# Note: This script will block while backend is running
# Press Ctrl+C to stop
