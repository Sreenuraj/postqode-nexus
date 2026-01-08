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
lsof -ti:5173 | xargs kill 2>/dev/null || true
echo -e "${GREEN}   ✅ Frontend stopped${NC}"

# Stop database (optional)
echo "🐘 Database container left running (use 'docker stop nexus-db' to stop)"

echo ""
echo -e "${GREEN}✅ All development services stopped${NC}"
echo ""
