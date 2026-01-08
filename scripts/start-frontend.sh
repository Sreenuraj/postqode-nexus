#!/bin/bash
# start-frontend.sh - Start frontend service for development

set -e

echo "🚀 Starting PostQode Nexus Frontend..."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd "$PROJECT_ROOT/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

echo ""
echo -e "${GREEN}🌐 Starting Vite dev server...${NC}"
echo ""
echo "Access at: http://localhost:5173"
echo ""

npm run dev

# Note: This script will block while frontend is running
# Press Ctrl+C to stop
