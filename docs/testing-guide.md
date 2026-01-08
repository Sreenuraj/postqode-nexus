# PostQode Nexus - Testing Guide

> **Version**: 1.0 | **Last Updated**: 2026-01-08

---

## Table of Contents

1. [Testing Overview](#1-testing-overview)
2. [Manual Testing by Phase](#2-manual-testing-by-phase)
3. [API Testing with Swagger](#3-api-testing-with-swagger)
4. [Automated Testing](#4-automated-testing)
5. [Test Data Management](#5-test-data-management)
6. [Testing Checklist Template](#6-testing-checklist-template)

---

## 1. Testing Overview

### Testing Pyramid

```
                    ┌─────────────────┐
                    │   E2E / Manual  │  ← Demo Flows
                    │    (Slowest)    │
                   ─┴─────────────────┴─
                  ┌─────────────────────┐
                  │  Integration Tests  │  ← API + DB
                  │    (Medium Speed)   │
                 ─┴─────────────────────┴─
                ┌─────────────────────────┐
                │      Unit Tests         │  ← Business Logic
                │      (Fastest)          │
                └─────────────────────────┘
```

### Testing Tools

| Layer | Tool | Purpose |
|-------|------|---------|
| Backend Unit | JUnit 5 | Java unit tests |
| Backend Integration | Testcontainers | DB integration tests |
| API Contract | REST Assured | API contract validation |
| Frontend Unit | Vitest | React component tests |
| Frontend E2E | Playwright | Browser automation |
| Mobile | Detox | Native app testing |

---

## 2. Manual Testing by Phase

### Phase 1: Foundation

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Repo structure | `ls -la` | All folders exist |
| 2 | Backend starts | `cd backend && ./mvnw spring-boot:run` | Port 8080 |
| 3 | Frontend starts | `cd frontend && npm run dev` | Port 5173 |
| 4 | DB accessible | `psql -h localhost -U nexus -d nexus` | Connected |
| 5 | Docker works | `docker-compose up -d && docker-compose ps` | All healthy |

---

### Phase 2: Core Backend

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Login API | POST `/api/v1/auth/login` with `{"username":"admin","password":"Admin@123"}` | JWT token |
| 2 | Login fail | POST `/api/v1/auth/login` with wrong password | 401 Unauthorized |
| 3 | Get me | GET `/api/v1/auth/me` with token | User info |
| 4 | Logout | POST `/api/v1/auth/logout` | Success message |
| 5 | Get products | GET `/api/v1/products` | Product list |
| 6 | Create product (Admin) | POST `/api/v1/products` | 201 Created |
| 7 | Create product (User) | POST `/api/v1/products` as User | 403 Forbidden |
| 8 | Update status | PATCH `/api/v1/products/{id}/status?status=LOW_STOCK` | Status changed |
| 9 | GraphQL query | POST `/graphql` with `{products{items{id,name}}}` | Products data |
| 10 | Dashboard metrics | POST `/graphql` with `{dashboardMetrics{totalProducts}}` | Metrics |

---

### Phase 2.1: API Documentation

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Swagger UI | Visit `http://localhost:8080/swagger-ui.html` | API docs page |
| 2 | Try Auth | Use Swagger to test login | Token returned |
| 3 | Authorize | Click "Authorize", paste token | 🔒 shown |
| 4 | Try Products | Use Swagger to get products | Product list |

---

### Phase 3: Frontend

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Login success | Enter admin/Admin@123 | Redirects to catalog |
| 2 | Login failure | Enter wrong password | Error message |
| 3 | View catalog | Navigate to catalog | Products table |
| 4 | Search | Type in search box | Filters products |
| 5 | Filter status | Select "Low Stock" | Only low stock shown |
| 6 | Pagination | Click page 2 | Next 10 products |
| 7 | Add product | Click Add, fill form, Save | Product added |
| 8 | Edit product | Click Edit, modify, Save | Product updated |
| 9 | Delete product | Click Delete, Confirm | Product removed |
| 10 | Dashboard | Navigate to Dashboard | Charts display |
| 11 | Logout | Click Logout | Returns to login |
| 12 | Role restriction | Login as User | No Add button |

---

## 3. API Testing with Swagger

### Access Swagger UI

```
http://localhost:8080/swagger-ui.html
```

### Authentication Flow

1. **Login**: Use `/api/v1/auth/login` endpoint
2. **Copy Token**: Copy the JWT from response
3. **Authorize**: Click "Authorize" button
4. **Paste Token**: Enter `Bearer <your-token>`
5. **Test APIs**: Now all protected endpoints work

### Common API Calls

#### Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'
```

#### Get Products

```bash
curl -X GET http://localhost:8080/api/v1/products \
  -H "Authorization: Bearer <token>"
```

#### Create Product

```bash
curl -X POST http://localhost:8080/api/v1/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"sku":"TEST-001","name":"Test Product","price":99.99,"quantity":100}'
```

---

## 4. Automated Testing

### Backend Tests

```bash
cd backend

# All tests
./mvnw test

# Specific test class
./mvnw test -Dtest=AuthServiceTest

# With coverage
./mvnw test jacoco:report
# Report: target/site/jacoco/index.html
```

### Frontend Tests

```bash
cd frontend

# All tests
npm run test

# With coverage
npm run test:coverage

# Specific test
npm run test -- LoginForm
```

### E2E Tests

```bash
cd frontend

# Run Playwright tests
npx playwright test

# With UI
npx playwright test --ui

# Specific test
npx playwright test login.spec.ts
```

### Mobile Tests

```bash
cd mobile

# Unit tests
npm run test

# E2E (Android)
npx detox test -c android.emu.debug

# E2E (iOS)
npx detox test -c ios.sim.debug
```

---

## 5. Test Data Management

### Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | Admin@123 |
| User | user | User@123 |

### Seed Data Summary

| Entity | Count |
|--------|-------|
| Users | 2 |
| Products | 20 |
| Activity Logs | 3 |

### Product Status Distribution

| Status | Count |
|--------|-------|
| ACTIVE | 10 |
| LOW_STOCK | 6 |
| OUT_OF_STOCK | 4 |

### Reset Demo Data

```bash
./scripts/reset-demo.sh
```

This will:
- Clear all activity logs
- Reset products to seed data
- Keep demo users

### Load Fresh Seed Data

```bash
# Via Docker
docker exec -i nexus-db psql -U nexus -d nexus < database/seeds/V999__demo_data.sql

# Via psql
psql -h localhost -U nexus -d nexus -f database/seeds/V999__demo_data.sql
```

---

## 6. Testing Checklist Template

### Phase Sign-off Template

```markdown
## Phase X: [Name] Testing Sign-off

**Date**: YYYY-MM-DD
**Tester**: [Name]

### Automated Tests

| Test Suite | Command | Pass/Fail |
|------------|---------|-----------|
| Unit Tests | `mvn test` | ⬜ |
| Integration | `mvn verify` | ⬜ |
| E2E | `npx playwright test` | ⬜ |

### Manual Tests

| # | Test | Pass/Fail | Notes |
|---|------|-----------|-------|
| 1 | [Test 1] | ⬜ | |
| 2 | [Test 2] | ⬜ | |

### Issues Found

| # | Description | Severity | Status |
|---|-------------|----------|--------|
| 1 | [Issue] | High/Med/Low | Open/Fixed |

### Sign-off

- [ ] All automated tests passing
- [ ] All manual tests passing
- [ ] No critical issues open
- [ ] Documentation updated

**Approved**: [ ] Yes [ ] No
**Signed**: _______________
```

---

*For development setup, see [Development Guide](./development-guide.md)*
