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

# 2. Stop Metro Bundler (Port 8081)
echo "📱 Stopping Metro Bundler..."
lsof -ti:8081 | xargs kill 2>/dev/null || echo -e "${YELLOW}   Not running${NC}"

echo -e "${GREEN}✅ Mobile services stopped${NC}"
echo ""
