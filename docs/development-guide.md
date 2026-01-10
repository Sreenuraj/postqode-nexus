# PostQode Nexus - Development Guide

> **Version**: 1.0 | **Last Updated**: 2026-01-08

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Repository Setup](#2-repository-setup)
3. [Local Development](#3-local-development)
4. [Docker Development](#4-docker-development)
5. [Environment Configuration](#5-environment-configuration)
6. [Database Setup](#6-database-setup)
7. [Common Commands](#7-common-commands)

---

## 1. Prerequisites

| Tool | Version | Installation |
|------|---------|--------------|
| Java | 17+ | [Download](https://adoptium.net/) |
| Node.js | 20+ | [Download](https://nodejs.org/) |
| Docker | 24+ | [Download](https://docker.com/) |
| Maven | 3.9+ | Included via `mvnw` |
| Git | 2.40+ | [Download](https://git-scm.com/) |

### Verify Installation

```bash
java -version      # Should show Java 17+
node -v            # Should show v20+
docker --version   # Should show Docker 24+
git --version      # Should show git 2.40+
```

---

## 2. Repository Setup

### Clone Repository

```bash
git clone https://github.com/Sreenuraj/postqode-nexus.git
cd postqode-nexus
```

### Quick Setup (Recommended)

```bash
# Run the setup script
./scripts/setup.sh
```

This will:
- Check prerequisites
- Create `.env` from `.env.example`
- Install backend, frontend, mobile dependencies
- Start Docker services
- Run database migrations
- Load seed data

---

## 3. Local Development

### Option A: Full Stack (Recommended for Development)

```bash
# Terminal 1: Start Database
docker run -d --name nexus-db -p 5432:5432 \
  -e POSTGRES_DB=nexus \
  -e POSTGRES_USER=nexus \
  -e POSTGRES_PASSWORD=nexus123 \
  postgres:15-alpine

# Terminal 2: Start Backend
cd backend
./mvnw spring-boot:run

# Terminal 3: Start Frontend
cd frontend
npm run dev

# Terminal 4: Start Mobile (optional)
cd mobile
npm start
```

### Option B: Backend Only

```bash
# Start DB + Backend
docker run -d --name nexus-db -p 5432:5432 \
  -e POSTGRES_DB=nexus -e POSTGRES_USER=nexus -e POSTGRES_PASSWORD=nexus123 \
  postgres:15-alpine

cd backend && ./mvnw spring-boot:run
```

### Access Points (Local)

| Service | URL |
|---------|-----|
| Backend Health | http://localhost:8080/actuator/health |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| GraphiQL | http://localhost:8080/graphiql |
| Frontend | http://localhost:5173 |
| Database | localhost:5432 |

---

## 4. Docker Development

### Start All Services

```bash
cd docker
docker-compose up -d
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Stop Services

```bash
docker-compose down

# Remove volumes too (fresh start)
docker-compose down -v
```

### Rebuild After Code Changes

```bash
docker-compose up -d --build
```

### Access Points (Docker)

| Service | URL |
|---------|-----|
| Backend Health | http://localhost:8080/actuator/health |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Frontend | http://localhost:3000 |
| Database | localhost:5432 |

---

## 5. Environment Configuration

### Create .env File

```bash
cp .env.example .env
```

### Configuration Variables

```properties
# Application
APP_ENV=dev                    # dev | demo | prod-demo
APP_VERSION=1.0.0

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nexus
DB_USER=nexus
DB_PASSWORD=nexus123

# API
API_BASE_URL=http://localhost:8080
GRAPHQL_ENDPOINT=http://localhost:8080/graphql

# Security
JWT_SECRET=your-secure-jwt-secret-key-min-256-bits
JWT_EXPIRY=86400               # 24 hours in seconds

# Frontend
VITE_API_URL=http://localhost:8080
VITE_GRAPHQL_URL=http://localhost:8080/graphql
```

---

## 6. Database Setup

### Run Migrations

```bash
cd backend
./mvnw flyway:migrate
```

### Load Seed Data

```bash
# Via psql
psql -h localhost -U nexus -d nexus -f database/seeds/V999__demo_data.sql

# Or via Docker
docker exec -i nexus-db psql -U nexus -d nexus < database/seeds/V999__demo_data.sql
```

### Reset Demo Data

```bash
./scripts/reset-demo.sh
```

### Connect to Database

```bash
# Via psql
psql -h localhost -U nexus -d nexus

# Via Docker
docker exec -it nexus-db psql -U nexus -d nexus
```

---

## 7. Common Commands

### Backend

| Command | Description |
|---------|-------------|
| `./mvnw spring-boot:run` | Start backend server |
| `./mvnw test` | Run unit tests |
| `./mvnw package` | Build JAR file |
| `./mvnw clean` | Clean build artifacts |
| `./mvnw flyway:migrate` | Run DB migrations |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run test` | Run tests |
| `npm run lint` | Lint code |
| `npm run preview` | Preview production build |

### Mobile

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo |
| `npm run android` | Start Android |
| `npm run ios` | Start iOS |
| `npm run test` | Run tests |

### Docker

| Command | Description |
|---------|-------------|
| `docker-compose up -d` | Start all services |
| `docker-compose down` | Stop all services |
| `docker-compose logs -f` | View logs |
| `docker-compose ps` | List containers |

---

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | Admin@123 |
| User | user | User@123 |

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :8080 | grep LISTEN

# Kill it
kill -9 <PID>
```

### Database Connection Failed

1. Check if PostgreSQL is running: `docker ps | grep nexus-db`
2. Verify credentials in `.env`
3. Try connecting manually: `psql -h localhost -U nexus -d nexus`

### Docker Build Failed

```bash
# Clean Docker cache
docker system prune -a

# Rebuild
docker-compose build --no-cache
```

---

*For testing procedures, see [Testing Guide](./testing-guide.md)*
