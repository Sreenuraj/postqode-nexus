# Repository Overview — PostQode Nexus

## Business Purpose
Full-stack demo application for **Inventory & Product Management**. Used for PostQode customer demos, sales presentations, demo videos, PoCs, and automation showcases. Educational/reference implementation.

## Architecture Style
- **Monorepo** with 4 distinct modules: backend, frontend, mobile, automation
- **Layered architecture** on backend (Spring Boot: Controller → Service → Repository → Entity)
- **Component-based SPA** on frontend (React + React Router)
- **Cross-platform mobile** (React Native with Expo)

## High-Level Structure
```
postqode-nexus/
├── backend/          # Java Spring Boot (port 8080)
├── frontend/         # React + Vite + TypeScript (port 3000)
├── mobile/           # React Native + Expo (Android/iOS)
├── automation/       # Test automation (api-tests, smoke-tests, ui-tests)
├── database/         # Flyway migrations + seed data
├── docker/           # Docker Compose (db + backend + frontend)
├── docs/             # BRD, implementation plan, testing guides
└── scripts/          # Dev lifecycle scripts (start, stop, build, reset)
```

## Technology Stack
| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2.1, PostgreSQL, Flyway, JWT, GraphQL |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Radix UI, Zustand |
| Mobile | React Native 0.73.6, Expo 50, React Navigation, Zustand |
| Database | PostgreSQL 15+ (via Docker) |
| APIs | REST + GraphQL |
| Auth | JWT (Spring Security) |

## User Roles
- **Admin**: Full control — products, inventory, categories, users, order approval, analytics
- **User**: Browse catalog, place orders, manage personal inventory, view order history

## Key Screens
| Role | Screens |
|------|---------|
| Admin | Dashboard, Product Catalog, Inventory, Categories, Users, Order Management |
| User | Dashboard, Product Catalog, My Orders, My Inventory |
| Common | Login, Logout |

## Demo Credentials
| Role | Username | Password |
|------|----------|----------|
| Admin | admin | Admin@123 |
| User | user | User@123 |

## Build & Run
- `./scripts/start-dev.sh` — Backend + Frontend + DB
- `./scripts/start-mobile.sh` — Mobile app
- `docker-compose -f docker/docker-compose.yml up -d` — Full stack via Docker

## Confidence
- **High** — README and pom.xml are authoritative and stable
