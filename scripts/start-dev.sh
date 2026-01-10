#!/bin/bash
# start-dev.sh - Start services for local development (without Docker)

set -e

echo "🚀 Starting PostQode Nexus Development Environment..."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check prerequisites
check_prereqs() {
    echo "📋 Checking prerequisites..."
    
    command -v java >/dev/null 2>&1 || { echo -e "${RED}❌ Java is required${NC}"; exit 1; }
    command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js is required${NC}"; exit 1; }
    command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker is required${NC}"; exit 1; }
    
    echo -e "${GREEN}✅ All prerequisites met${NC}"
}

# Load .env variables if present
if [ -f "$PROJECT_ROOT/.env" ]; then
    echo "📄 Loading environment variables from .env..."
    export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
fi

# Start database
start_db() {
    echo ""
    echo "🐘 Starting PostgreSQL..."
    
    if docker ps | grep -q nexus-db; then
        echo -e "${YELLOW}   Already running${NC}"
    else
        if docker ps -a | grep -q nexus-db; then
            docker start nexus-db
        else
            docker run -d --name nexus-db -p 5432:5432 \
                -e POSTGRES_DB=nexus \
                -e POSTGRES_USER=nexus \
                -e POSTGRES_PASSWORD=nexus123 \
                postgres:15-alpine
        fi
        echo "   ⏳ Waiting for database..."
        sleep 5
    fi
    echo -e "${GREEN}   ✅ Database ready on port 5432${NC}"
}

# Start backend in background
start_backend() {
    echo ""
    echo "☕ Starting Backend (Spring Boot)..."
    
    cd "$PROJECT_ROOT/backend"
    
    # Check if already running
    if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}   Already running on port 8080${NC}"
    else
        nohup ./mvnw spring-boot:run > /tmp/nexus-backend.log 2>&1 &
        echo "   PID: $!"
        echo "   ⏳ Waiting for backend to start..."
        sleep 15
        
        if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
            echo -e "${GREEN}   ✅ Backend ready on port 8080${NC}"
        else
            echo -e "${YELLOW}   ⏳ Still starting... check /tmp/nexus-backend.log${NC}"
        fi
    fi
}

# Start frontend in background
start_frontend() {
    echo ""
    echo "⚛️  Starting Frontend (Vite)..."
    
    cd "$PROJECT_ROOT/frontend"
    
    # Install deps if needed
    if [ ! -d "node_modules" ]; then
        npm install --silent
    fi
    
    # Check if already running
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}   Already running on port 3000${NC}"
    else
        nohup npm run dev > /tmp/nexus-frontend.log 2>&1 &
        echo "   PID: $!"
        sleep 3
        echo -e "${GREEN}   ✅ Frontend ready on port 3000${NC}"
    fi
}

# Main
check_prereqs
start_db
start_backend
start_frontend

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Development environment ready!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}🔗 Access URLs:${NC}"
echo "   • Backend Health: http://localhost:8080/actuator/health"
echo "   • Swagger UI:     http://localhost:8080/swagger-ui.html"
echo "   • GraphiQL:       http://localhost:8080/graphiql (Interactive IDE)"
echo "   • Raw Schema:     http://localhost:8080/graphql/schema"
echo "   • Frontend:       http://localhost:3000"
echo ""
echo -e "${BLUE}📊 Demo Credentials:${NC}"
echo "   • Admin: admin / Admin@123"
echo "   • User:  user / User@123"
echo ""
echo -e "${BLUE}📋 Logs:${NC}"
echo "   • Backend:  tail -f /tmp/nexus-backend.log"
echo "   • Frontend: tail -f /tmp/nexus-frontend.log"
echo ""
echo "To stop: ./scripts/stop-dev.sh"
echo ""
