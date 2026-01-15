# PostQode Nexus

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20iOS%20%7C%20Android-blue)]()
[![Demo](https://img.shields.io/badge/Purpose-Demo%20%7C%20Educational-green)]()

> **From requirements to reality**

PostQode Nexus is a **full-stack demo application** showcasing modern software development practices, mobile app distribution, and the complete PostQode value chain — from BRD ingestion to automation readiness.

## ⚠️ Demo & Educational Purpose

This repository is created for:
- **PostQode demo videos** and presentations
- **Educational purposes** - learning full-stack development
- **Reference implementation** - best practices showcase
- **Mobile app distribution** - Android APK and iOS builds

**Note**: This is a demonstration project. While functional, it's designed for learning and showcasing capabilities rather than production use.

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
1. **Dashboard** — Personal overview (My Orders, Inventory Stats)
2. **Product Catalog** — Browse, search, filter by category, place orders
3. **My Orders** — View order history, cancel pending orders
4. **My Inventory** — Personal inventory (auto-created from orders, merge duplicates, consume items)

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
├── mobile/                  # React Native App
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

# Start Mobile App
./scripts/start-mobile.sh

# Or using Docker Compose
docker-compose up -d
```

## 🔑 Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | Admin@123 |
| User | user | User@123 |

## 📱 Mobile Apps

### Android
- **Build**: `./scripts/build-mobile-android.sh`
- **Output**: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`
- **Distribution**: Share APK directly - works on any Android device

### iOS
- **Simulator**: `./scripts/build-mobile-ios.sh`
- **Physical Device**: `./scripts/build-mobile-ios.sh device`
- **Distribution**: TestFlight, Ad Hoc, or App Store

📖 **Complete Guide**: See [Mobile Build & Distribution Guide](./docs/mobile-build-guide.md)

## 📚 Additional Documentation

- [Mobile Build Guide](./docs/mobile-build-guide.md) — Build and distribute mobile apps
- [Development Guide](./docs/development-guide.md) — Setup and development workflow
- [Testing Guide](./docs/testing-guide.md) — Testing strategies
- [API Strategy](./docs/api-strategy.md) — REST and GraphQL APIs

## 🤝 Contributing

This is a demo project for PostQode. While it's open source under MIT license, it's primarily maintained for demonstration purposes.

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026

**Permission is granted** to use, copy, modify, and distribute this software for any purpose, including commercial applications, subject to the terms in the LICENSE file.

## 🙏 Acknowledgments

- Built as a demonstration of modern full-stack development
- Showcases React, React Native, Spring Boot, and PostgreSQL
- Demonstrates mobile app build and distribution workflows

---

**⭐ Star this repo** if you find it useful for learning or reference!

*Built with ❤️ by the PostQode Team*
