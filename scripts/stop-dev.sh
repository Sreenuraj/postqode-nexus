#!/bin/bash
# stop-dev.sh - Stop all development services

echo "🛑 Stopping PostQode Nexus Development Services..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Stop backend
echo "☕ Stopping Backend..."
pkill -f "spring-boot:run" 2>/dev/null || echo -e "${YELLOW}   Not running${NC}"
lsof -ti:8080 | xargs kill 2>/dev/null || true
echo -e "${GREEN}   ✅ Backend stopped${NC}"

# Stop frontend
echo "⚛️  Stopping Frontend..."
pkill -f "vite" 2>/dev/null || echo -e "${YELLOW}   Not running${NC}"
lsof -ti:3000 | xargs kill 2>/dev/null || true
echo -e "${GREEN}   ✅ Frontend stopped${NC}"

# Stop database
echo "🐘 Stopping Database..."
docker stop nexus-db >/dev/null 2>&1 || echo -e "${YELLOW}   Not running${NC}"
docker rm nexus-db >/dev/null 2>&1 || true
echo -e "${GREEN}   ✅ Database stopped${NC}"

echo ""
echo -e "${GREEN}✅ All development services stopped${NC}"
echo ""
