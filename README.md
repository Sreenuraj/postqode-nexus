# PostQode Nexus

> **From requirements to reality**

PostQode Nexus is a CI/CD-ready demo application designed to showcase the full PostQode value chain — from BRD ingestion to automation readiness.

## 🎯 Purpose

This is a **long-living demo asset** for:
- Customer demos
- Sales presentations
- Demo videos
- PoCs
- Automation showcases

## 🏗️ Business Domain

**Inventory & Product Management** — A universally understood domain that supports CRUD operations, workflows, roles, and analytics.

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Full product & inventory control, dashboard access, analytics, category management, user management, order approval/rejection |
| **User** | Browse catalog, filter by category, place orders, manage personal inventory, view order history |

## 🖥️ Screens

### Admin Screens
1. **Dashboard** — Real-time analytics and metrics
2. **Product Catalog** — Full CRUD, category assignment
3. **Inventory Management** — Stock control, status updates
4. **Categories** — Create, edit, delete product categories
5. **Users** — Create, edit, enable/disable users
6. **Order Management** — Approve/Reject pending orders

### User Screens
1. **Product Catalog** — Browse, search, filter by category, place orders
2. **My Orders** — View order history, cancel pending orders
3. **My Inventory** — Personal inventory (auto-created from orders, merge duplicates, consume items)

### Common Screens
1. **Login** — Role-based authentication
2. **Logout** — Session termination

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend (Web) | React + TypeScript + Vite |
| Mobile | React Native |
| Backend | Java + Spring Boot |
| Database | PostgreSQL |
| APIs | REST + GraphQL |

## 📁 Project Structure

```
postqode-nexus/
├── docs/                    # Documentation
│   ├── requirement document.md
│   ├── implementation-plan.md
│   └── application-functionality.md
├── backend/                 # Java Spring Boot
├── frontend/                # React Web App
├── mobile/                  # React Native App (Coming in Phase 4)
├── database/                # Migrations & Seeds
├── docker/                  # Docker Compose files
└── automation/              # Test automation (Coming in Phase 6)
```

## 📚 Documentation

- [Requirement Document](./docs/requirement%20document.md) — What to build
- [Implementation Plan](./docs/implementation-plan.md) — How to build it
- [Application Functionality](./docs/application-functionality.md) — What it does

## 🚀 Quick Start

```bash
# Start Development Environment (Backend + Frontend + DB)
./scripts/start-dev.sh

# Or using Docker Compose
docker-compose up -d
```

## 🔑 Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | Admin@123 |
| User | user | User@123 |

## 📄 License

Proprietary — PostQode Internal

---

*Built with ❤️ by the PostQode Team*
