#!/bin/bash
# stop-dev.sh - Stop all development services

echo "🛑 Stopping PostQode Nexus Development Services..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load .env variables if present
if [ -f "$PROJECT_ROOT/.env" ]; then
    export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
fi

# Stop backend - Only kill Java/Maven processes, not Docker
echo "☕ Stopping Backend..."
pkill -f "spring-boot:run" 2>/dev/null || true
pkill -f "maven.*spring-boot" 2>/dev/null || true
# Only kill java processes on the backend port, not Docker processes
BACKEND_PORT_VAL=${BACKEND_PORT:-8080}
for pid in $(lsof -ti:$BACKEND_PORT_VAL 2>/dev/null); do
    # Check if this is a java process before killing
    if ps -p $pid -o comm= 2>/dev/null | grep -qE "^(java|mvn)"; then
        kill $pid 2>/dev/null || true
    fi
done
echo -e "${GREEN}   ✅ Backend stopped${NC}"

# Stop frontend - Only kill Node/Vite processes, not Docker
echo "⚛️  Stopping Frontend..."
pkill -f "vite" 2>/dev/null || true
pkill -f "node.*vite" 2>/dev/null || true
# Only kill node processes on the frontend port, not Docker processes
FRONTEND_PORT_VAL=${FRONTEND_PORT:-3000}
for pid in $(lsof -ti:$FRONTEND_PORT_VAL 2>/dev/null); do
    # Check if this is a node process before killing
    if ps -p $pid -o comm= 2>/dev/null | grep -qE "^node"; then
        kill $pid 2>/dev/null || true
    fi
done
echo -e "${GREEN}   ✅ Frontend stopped${NC}"

# Stop database
echo "🐘 Stopping Database..."
docker stop nexus-db >/dev/null 2>&1 || echo -e "${YELLOW}   Not running${NC}"
docker rm nexus-db >/dev/null 2>&1 || true
echo -e "${GREEN}   ✅ Database stopped${NC}"

echo ""
echo -e "${GREEN}✅ All development services stopped${NC}"
echo ""
