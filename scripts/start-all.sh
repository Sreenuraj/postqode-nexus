#!/bin/bash
# start-all.sh - Start all services using Docker Compose

set -e

echo "🚀 Starting All PostQode Nexus Services..."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

cd "$PROJECT_ROOT/docker"

# Check if .env exists
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    echo -e "${YELLOW}📝 Creating .env from .env.example...${NC}"
    cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
fi

echo "🐳 Starting Docker Compose services..."
docker-compose --env-file "$PROJECT_ROOT/.env" up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check health
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 All services started!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}🔗 Access URLs:${NC}"
echo "   • Backend Health: http://localhost:8080/actuator/health"
echo "   • Swagger UI:     http://localhost:8080/swagger-ui.html"
echo "   • GraphiQL:       http://localhost:8080/graphiql (Schema via Docs tab)"
echo "   • Frontend:       http://localhost:3000"
echo ""
echo -e "${BLUE}📊 Demo Credentials:${NC}"
echo "   • Admin: admin / Admin@123"
echo "   • User:  user / User@123"
echo ""
echo "To stop: docker-compose down"
echo ""
