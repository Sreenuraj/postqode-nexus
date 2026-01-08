# PostQode Nexus - Scripts

Quick reference for all available scripts.

## Quick Start

```bash
# First time setup
./scripts/setup.sh

# Start development environment
./scripts/start-dev.sh

# Stop when done
./scripts/stop-dev.sh
```

---

## Scripts Overview

| Script | Purpose |
|--------|---------|
| `setup.sh` | Initial project setup |
| `start-dev.sh` | Start all services locally |
| `stop-dev.sh` | Stop all local services |
| `start-all.sh` | Start via Docker Compose |
| `start-backend.sh` | Start backend only |
| `start-frontend.sh` | Start frontend only |
| `reset-demo.sh` | Reset demo data |

---

## Testing Commands

### Frontend Tests

```bash
# Run all frontend tests
cd frontend && npm test

# Run tests in watch mode
cd frontend && npm test -- --watch

# Run tests with coverage
cd frontend && npm test:coverage

# Run specific test file
cd frontend && npm test -- ProductFormDialog.test.tsx
```

### Backend Tests

```bash
# Run all backend tests
cd backend && mvn test

# Run specific test class
cd backend && mvn test -Dtest=ProductServiceTest

# Run tests with coverage
cd backend && mvn test jacoco:report
```

**Test Summary:** See `frontend/TEST_SUMMARY.md` for detailed test coverage report.

---

## Detailed Descriptions

### `setup.sh` - Initial Setup

Run this once after cloning the repository.

```bash
./scripts/setup.sh
```

**What it does:**
- Checks prerequisites (Java, Node, Docker)
- Creates `.env` from `.env.example`
- Installs backend dependencies
- Installs frontend dependencies
- Installs mobile dependencies
- Starts Docker services
- Runs database migrations
- Loads seed data

---

### `start-dev.sh` - Start Development Environment

Start all services for local development (recommended).

```bash
./scripts/start-dev.sh
```

**What it does:**
- Starts PostgreSQL in Docker
- Starts Spring Boot backend (port 8080)
- Starts Vite frontend (port 5173)

**Access URLs:**
- Backend: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- Frontend: http://localhost:5173

---

### `stop-dev.sh` - Stop Development Services

Stop all services started by `start-dev.sh`.

```bash
./scripts/stop-dev.sh
```

**Note:** Database container is left running for faster restarts.

---

### `start-all.sh` - Start via Docker Compose

Start all services in Docker containers.

```bash
./scripts/start-all.sh
```

**What it does:**
- Creates `.env` if missing
- Runs `docker-compose up -d`
- Shows service status

**Access URLs:**
- Backend: http://localhost:8080
- Frontend: http://localhost:3000 (different port in Docker!)

---

### `start-backend.sh` - Start Backend Only

Start just the Spring Boot backend.

```bash
./scripts/start-backend.sh
```

**Prerequisite:** Database must be running.

---

### `start-frontend.sh` - Start Frontend Only

Start just the Vite development server.

```bash
./scripts/start-frontend.sh
```

---

### `reset-demo.sh` - Reset Demo Data

Reset database to clean demo state.

```bash
./scripts/reset-demo.sh
```

**What it does:**
- Clears activity logs
- Resets products to seed data (20 items)
- Keeps demo users (admin, user)

**Use when:** Demo data gets messy during testing.

---

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | Admin@123 |
| User | user | User@123 |

---

## Troubleshooting

### Permission Denied

```bash
chmod +x scripts/*.sh
```

### Port Already in Use

```bash
# Find and kill process
lsof -ti:8080 | xargs kill  # Backend
lsof -ti:5173 | xargs kill  # Frontend
```

### Database Connection Failed

```bash
# Check if container is running
docker ps | grep nexus-db

# Start manually if needed
docker start nexus-db
```
