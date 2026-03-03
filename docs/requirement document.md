# PostQode Nexus – Requirement Document

## Version
v1.0 (Baseline)

## Status
Approved for implementation

---

## 1. Overview

### Application Name
**PostQode Nexus**

### Tagline
**From requirements to reality**

### Purpose
PostQode Nexus is a **CI/CD-ready demo application** designed to showcase the full PostQode value chain:
- BRD ingestion
- User story generation
- Application navigation
- Test case generation
- Automation readiness

It is a **long-living demo asset**, deployed on real servers, used for:
- Customer demos
- Sales demos
- Demo videos
- PoCs
- Automation showcases

This application is **not a production system**, but it must behave like one.

---

## 2. Vision & Core Principles

### Design Philosophy
- Story-first, not feature-first
- Minimal but realistic
- End-to-end journey over isolated screens
- Deterministic, resettable behavior
- Automation-ready by design

### Golden Rule
> Build once. Deploy anywhere. Demo everywhere.

---

## 3. Target Audiences

| Audience | Expectation |
|--------|-------------|
| Business / Leadership | Clear end-to-end story |
| Sales | Stable demos & videos |
| QA / Engineering | Automation credibility |
| Customers | Realistic application behavior |

---

## 4. Business Domain

### Selected Domain
**Inventory & Product Management**

### Rationale
- Universally understood
- Neutral and non-industry-specific
- Supports CRUD, workflows, roles, analytics
- Ideal for REST, GraphQL, UI, and automation demos

---

## 5. User Roles

### 5.1 Admin User
- Login access
- Full product & inventory control
- Dashboard access with system-wide analytics
- View analytics and activity trends
- User management (add, edit, delete users)
- Category management (add, edit, delete categories)
- Order management (approve, reject orders)
- Product CRUD operations

### 5.2 Standard User
- Login access
- View-only product catalog with buy functionality
- Search, sort, filter products
- Personal dashboard with order and inventory metrics
- My Orders page (view own order history)
- My Inventory page (personal inventory tracking with consume functionality)
- No modification rights to system data

---

## 6. End-to-End Demo Journey

### Admin Demo Flow
Login → Dashboard → Products → Categories → Users → Order Management → Logout

### User Demo Flow
Login → Dashboard → Products → My Orders → My Inventory → Logout

### Demo Constraints
- Max 5–7 screens per role
- Role-specific navigation paths
- Same flow on Web & Mobile
- Only approved screens visible during demos

---

## 7. Screen Definitions

### 7.1 Login Screen
- Role-based login (Admin / User)
- Username & password
- Clear success / failure states
- Token-based authentication

---

### 7.2 Product Catalog
- **For Admin:**
  - Product list view with full CRUD actions
  - Search, sort, filter, pagination
  - Add Product button
  - Edit/Delete actions via dropdown menu
  - Product metadata: SKU, Name, Category, Price, Quantity, Status, Actions
- **For User:**
  - Product list view (view-only)
  - Search, sort, filter, pagination
  - Buy button for in-stock products
  - Disabled Buy button for out-of-stock products
  - Product metadata: SKU, Name, Category, Price, Quantity, Status, Actions
- Product states:
  - 🟢 ACTIVE
  - 🟡 LOW STOCK
  - 🔴 OUT OF STOCK

---

### 7.3 Inventory Management (Admin Only)
- Admin-only actions:
  - Add product
  - Update product
  - Change product state
  - Delete product
- Product states:
  - Active
  - Low Stock
  - Out of Stock
- State transitions must be visible and auditable

---

### 7.4 Dashboard
- **Admin Dashboard:**
  - Metrics driven by real actions:
    - Total Products, Active, Low Stock, Out of Stock counts
    - Order Overview (Total, Pending, Approved, Rejected)
    - Products by Status chart
    - Products Added Today
    - Activity by User (Last 7 Days)
    - Recent Activity log
- **User Dashboard:**
  - Personal metrics:
    - My Orders count
    - Pending Orders
    - Total Spend
    - Inventory Items count
  - Quick actions to My Orders and My Inventory

---

### 7.5 Categories (Admin Only)
- Category list view
- Add new category
- Edit existing category
- Delete category
- Category metadata: Name, Description, Created date

---

### 7.6 Users (Admin Only)
- User list view
- Add new user
- Edit existing user
- Delete user
- User metadata: Username, Email, Role, Status, Created date

---

### 7.7 Order Management (Admin Only)
- Order list view with all orders
- Order actions: Approve, Reject
- Order metadata: Order ID, User, Product, Quantity, Total, Stock, Status, Created
- Order statuses: PENDING, APPROVED, REJECTED, CANCELLED

---

### 7.8 My Orders (User Only)
- Personal order history
- Order details: Order ID, Product, Quantity, Total, Status, Created
- Order statuses: PENDING, APPROVED, REJECTED, CANCELLED
- Cancel pending orders

---

### 7.9 My Inventory (User Only)
- Personal inventory tracking
- Inventory items from approved orders
- Item metadata: Name, Quantity, Source, Added date
- Consume item functionality
- Source types: PURCHASED

---

### 7.10 Logout
- Session termination
- Token invalidation

---

## 8. Functional Requirements

- Role-based access control
- Product CRUD
- Inventory state transitions
- Real-time dashboard updates
- Deterministic data behavior
- Web & mobile parity

---

## 9. API Architecture

### 9.1 REST APIs
Used for:
- Authentication
- Product CRUD
- User management
- Activity logging

### 9.2 GraphQL APIs
Used for:
- Product queries
- Dashboard analytics
- Aggregated activity views

> Both REST and GraphQL **must be actively used by the UI**.

---

## 10. Automation & Test Readiness (Mandatory)

### UI Design Rules
- Every interactive element must have:
  - Stable ID
  - Unique ID
  - Predictable naming
- No auto-generated or random IDs
- Parent-child hierarchy must be consistent

### Automation Goals
- UI automation
- API automation
- Cross-platform automation (web & mobile)
- Rerunnable, deterministic scripts

---

## 11. Technology Stack

### Frontend (Web)
- React
- Component-based architecture
- Clean routing aligned to demo flow

### Mobile
- React Native
- Same APIs and flow as web
- No mock logic

### Backend
- Java
- Spring Boot
- REST + GraphQL support

### Database
- PostgreSQL
- Versioned schema
- Seeded demo data

---

## 12. Environment Strategy

### Environments
| Environment | Purpose |
|-----------|---------|
| dev | Development |
| demo | Customer demos |
| prod-demo | Public demo (controlled) |

### Promotion Flow
dev → demo → prod-demo

yaml
Copy code

---

## 13. CI/CD Requirements

### CI/CD Objectives
- Zero manual deployment
- Repeatable builds
- Rollback-friendly
- Automation validation before demo exposure

---

### CI/CD Pipeline Stages
1. Code checkout
2. Static analysis & linting
3. Unit tests
4. Docker image build
5. API & integration tests
6. UI smoke automation
7. Deploy to demo
8. Health checks

---

## 14. Testing Strategy in CI

### Included in CI
- Backend unit tests
- API contract tests
- UI smoke tests

### Excluded from CI
- Full regression suites
- Long-running UI tests

---

## 15. Containerization Strategy

### Mandatory
- Dockerfile for:
  - Backend
  - Frontend
  - Database
- Multi-stage builds
- Health checks in containers

---

## 16. Docker Compose

### Responsibilities
- Service orchestration
- Network isolation
- Environment configuration
- One-command startup

```bash
docker-compose up -d
```

## 17. Configuration Management
Environment variables only

No hardcoded secrets

.env per environment

Example:

```env
APP_ENV
DB_HOST
DB_PORT
DB_NAME
API_BASE_URL
GRAPHQL_ENDPOINT
JWT_SECRET
```

## 18. Database Strategy
### Schema Management
Flyway or Liquibase

Backward-compatible migrations

### Demo Data
Seed scripts

Reset scripts for clean demos

```bash
./reset-demo.sh
```

## 19. Security (Demo-Appropriate)
- JWT-based authentication
- Role enforcement at backend
- Secrets injected via CI/CD
- No credentials in source code

## 20. Monitoring & Health
### Mandatory Endpoints
- /health
- /readiness
- /version

### Logging
- Structured logs
- Correlation IDs
- Centralized log readiness

## 21. Rollback Strategy
- Immutable Docker images
- Versioned tags
- Redeploy previous image for rollback
- No breaking DB changes without compatibility

## 22. Demo Stability Rules
- No random data
- No flaky UI behavior
- Resettable demo state
- Health check before demos
- Predictable flows only

## 23. Non-Goals (Explicitly Out of Scope)
- Payments
- External integrations
- Performance tuning beyond demo needs
- Enterprise-grade security hardening
- Complex business rules

## 24. Success Criteria
PostQode Nexus is successful when:

- Demo can be run without engineers present
- CI/CD deploys without manual steps
- Automation runs reliably
- Web & mobile tell the same story
- Business users understand value in < 5 minutes

## 25. Next Deliverables
Recommended implementation order:

1. Repo structure
2. API contracts
3. DB schema
4. Docker & Compose files
5. CI/CD pipeline YAML
6. Automation smoke suite
7. Demo scripts & reset flows

## 26. Final Note
PostQode Nexus is a strategic demo platform, not a throwaway app.
Every design decision must support:

- Stability
- Storytelling
- Automation credibility
- Long-term reuse
