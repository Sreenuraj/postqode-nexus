#!/bin/bash
# stop-all.sh - Stop all services using Docker Compose

set -e

echo "🛑 Stopping PostQode Nexus Services..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
NC='\033[0m' # No Color

cd "$PROJECT_ROOT/docker"

if [ -f "docker-compose.yml" ]; then
    docker-compose --env-file "$PROJECT_ROOT/.env" down
    echo ""
    echo -e "${GREEN}✅ All services stopped!${NC}"
else
    echo "❌ Error: docker-compose.yml not found in $PROJECT_ROOT/docker"
    exit 1
fi
