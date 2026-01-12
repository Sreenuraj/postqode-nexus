#!/bin/bash
# stop-mobile.sh - Stop mobile development services

echo "🛑 Stopping PostQode Nexus Mobile Services..."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd "$PROJECT_ROOT"

# 1. Revert .env if backup exists
if [ -f ".env.bak" ]; then
    echo "📝 Reverting .env to original state..."
    mv .env.bak .env
    echo -e "${GREEN}✅ Reverted .env to localhost${NC}"
else
    echo "   No .env backup found (no changes to revert)"
fi

# 2. Stop Metro Bundler (Port 8081) - Only kill node processes, not Docker
echo "📱 Stopping Metro Bundler..."
pkill -f "metro" 2>/dev/null || true
METRO_KILLED=false
for pid in $(lsof -ti:8081 2>/dev/null); do
    # Check if this is a node process before killing
    if ps -p $pid -o comm= 2>/dev/null | grep -qE "^node"; then
        kill $pid 2>/dev/null || true
        METRO_KILLED=true
    fi
done
if [ "$METRO_KILLED" = false ]; then
    echo -e "${YELLOW}   Metro Bundler not running or already stopped${NC}"
fi

echo -e "${GREEN}✅ Mobile services stopped${NC}"
echo ""
