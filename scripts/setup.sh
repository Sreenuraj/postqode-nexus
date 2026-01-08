#!/bin/bash
# setup.sh - Initial setup script for PostQode Nexus

set -e

echo "🚀 Setting up PostQode Nexus..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || command -v docker >/dev/null 2>&1 || { echo "❌ Docker Compose is required. Aborting." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v java >/dev/null 2>&1 || { echo "❌ Java is required but not installed. Aborting." >&2; exit 1; }

echo -e "${GREEN}✅ All prerequisites met${NC}"
echo ""

# Create .env if not exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
else
    echo -e "${YELLOW}⚠️  .env file already exists, skipping${NC}"
fi

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
./mvnw dependency:go-offline -q || mvn dependency:go-offline -q
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
cd ..

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm ci --silent
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
cd ..

# Install mobile dependencies
echo ""
echo "📦 Installing mobile dependencies..."
cd mobile
npm ci --silent
echo -e "${GREEN}✅ Mobile dependencies installed${NC}"
cd ..

# Start Docker services
echo ""
echo "🐳 Starting Docker services..."
cd docker
docker-compose up -d
cd ..

# Wait for database to be ready
echo ""
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo ""
echo "🔄 Running database migrations..."
cd backend
./mvnw flyway:migrate -q || mvn flyway:migrate -q
echo -e "${GREEN}✅ Database migrations complete${NC}"
cd ..

# Load seed data
echo ""
echo "🌱 Loading seed data..."
docker exec nexus-db psql -U nexus -d nexus -f /docker-entrypoint-initdb.d/V999__demo_data.sql 2>/dev/null || \
    docker exec -i nexus-db psql -U nexus -d nexus < database/seeds/V999__demo_data.sql
echo -e "${GREEN}✅ Seed data loaded${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo "=========================================="
echo ""
echo "📌 Next steps:"
echo "   • Backend:  cd backend && ./mvnw spring-boot:run"
echo "   • Frontend: cd frontend && npm run dev"
echo "   • Mobile:   cd mobile && npm start"
echo ""
echo "📊 Demo credentials:"
echo "   • Admin: admin / Admin@123"
echo "   • User:  user / User@123"
echo ""
echo "🔗 URLs:"
echo "   • Backend:  http://localhost:8080"
echo "   • Frontend: http://localhost:5173"
echo "   • Database: localhost:5432"
echo ""
