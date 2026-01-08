#!/bin/bash
# reset-demo.sh - Reset demo data to clean state

set -e

echo "🔄 Resetting PostQode Nexus demo data..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if database container is running
if ! docker ps | grep -q nexus-db; then
    echo -e "${RED}❌ Database container 'nexus-db' is not running.${NC}"
    echo "   Run 'docker-compose up -d' in the docker/ directory first."
    exit 1
fi

echo "📊 Current database state:"
echo "   Products: $(docker exec nexus-db psql -U nexus -d nexus -tAc 'SELECT COUNT(*) FROM products' 2>/dev/null || echo 'N/A')"
echo "   Users:    $(docker exec nexus-db psql -U nexus -d nexus -tAc 'SELECT COUNT(*) FROM users' 2>/dev/null || echo 'N/A')"
echo "   Logs:     $(docker exec nexus-db psql -U nexus -d nexus -tAc 'SELECT COUNT(*) FROM activity_logs' 2>/dev/null || echo 'N/A')"
echo ""

# Confirm reset
read -p "⚠️  This will DELETE all data and reset to demo state. Continue? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "🗑️  Clearing existing data..."

# Clear tables in correct order (respecting foreign keys)
docker exec nexus-db psql -U nexus -d nexus -c "
    TRUNCATE activity_logs CASCADE;
    TRUNCATE products CASCADE;
    DELETE FROM users WHERE username NOT IN ('admin', 'user');
" > /dev/null 2>&1

echo -e "${GREEN}✅ Tables cleared${NC}"

echo ""
echo "🌱 Loading demo data..."

# Load seed data
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

docker exec -i nexus-db psql -U nexus -d nexus < "$PROJECT_ROOT/database/seeds/V999__demo_data.sql" > /dev/null 2>&1

echo -e "${GREEN}✅ Demo data loaded${NC}"

echo ""
echo "📊 New database state:"
echo "   Products: $(docker exec nexus-db psql -U nexus -d nexus -tAc 'SELECT COUNT(*) FROM products')"
echo "   Users:    $(docker exec nexus-db psql -U nexus -d nexus -tAc 'SELECT COUNT(*) FROM users')"
echo "   Logs:     $(docker exec nexus-db psql -U nexus -d nexus -tAc 'SELECT COUNT(*) FROM activity_logs')"

echo ""
echo "📈 Product status breakdown:"
docker exec nexus-db psql -U nexus -d nexus -c "
    SELECT status, COUNT(*) as count 
    FROM products 
    GROUP BY status 
    ORDER BY status;
"

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Demo reset complete!${NC}"
echo "=========================================="
echo ""
echo "📌 Demo credentials:"
echo "   • Admin: admin / Admin@123"
echo "   • User:  user / User@123"
echo ""
