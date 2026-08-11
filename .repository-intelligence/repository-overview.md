# Overview

## System Purpose
PostQode Nexus is a CI/CD-ready demo web application for Inventory & Product Management. It lets Admins manage products, categories, users, and orders, while Standard Users browse a catalog, place orders, and manage personal inventory. The app demonstrates a full-stack React + Spring Boot + PostgreSQL system with REST + GraphQL APIs.

## User Roles
| Role | What They Can Do |
|---|---|
| Admin | Full catalog CRUD, category/user management, order approval/rejection, Command Center queue ops, Insights analytics |
| Standard User | Browse catalog, buy products (creates PENDING orders), manage own orders/inventory, view activity timeline, submit Request Product wizard |

## Functional Areas
- **Auth**: Login/logout, session, RBAC route protection
- **Dashboard**: Role-specific analytics/personal overview
- **Product Catalog**: Search/filter/sort products, Admin CRUD, User Buy flow
- **Categories**: Admin CRUD
- **Users**: Admin CRUD, enable/disable
- **Order Management**: Admin approve/reject queue
- **Command Center**: Admin optimistic-update queue + watchlist
- **Insights**: Analytics drill-down (Overview/Products/Orders/Activity tabs)
- **My Orders / My Inventory / My Activity**: User self-service views
- **Request Product Wizard**: Multi-step product request flow
- **Preferences**: Metadata-driven settings form (semantic-only locators)

## External Integrations
None — self-contained app. Backend at `localhost:8080` (Spring Boot, REST + GraphQL + Swagger), Frontend at `localhost:3000` (React).

## Technical Stack
- Frontend: React, Vite, TypeScript, shadcn/ui, Tailwind
- Backend: Spring Boot 3.2, PostgreSQL, Flyway, JWT auth, GraphQL
- Automation: Playwright (Python) + behave (BDD), Page Object Model, data-driven via JSON fixtures

_Sources: docs/application-functionality.md, docs/requirement document.md, docs/e2e-test-cases.md §1 | Last updated: 2026-08-11_
