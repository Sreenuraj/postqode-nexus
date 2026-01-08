# API Strategy & Usage Guidelines

This document outlines the architectural decision to use a hybrid approach of **REST** and **GraphQL** APIs in PostQode Nexus. It serves as a reference for frontend and mobile developers to know which API to consume for specific features.

## 1. Executive Summary

- **REST API**: Used for **Write Operations** (CRUD), Authentication, and simple resource fetching. It follows standard HTTP verbs and status codes.
- **GraphQL API**: Used for **Read-Heavy Operations**, complex data aggregation (Dashboard), and flexible list fetching (Catalog) where filtering/sorting is required.

---

## 2. API Usage by Feature

| Feature Area | API Style | Endpoints / Query Root | Reasoning |
| :--- | :--- | :--- | :--- |
| **Authentication** | **REST** | `POST /api/v1/auth/login`<br>`POST /api/v1/auth/logout` | Standard security flows, simple request/response. |
| **User Management** | **REST** | `GET /api/v1/users` | Simple admin resource management. |
| **Inventory (Write)** | **REST** | `POST /api/v1/products`<br>`PUT /api/v1/products/{id}`<br>`DELETE /api/v1/products/{id}` | Standard transactional CRUD operations are more predictable with REST status codes (201, 403, etc). |
| **Product Status** | **REST** | `PATCH /api/v1/products/{id}/status` | Simple state transition resources. |
| **Product Catalog (Read)** | **GraphQL** | `query products(...)` | The catalog requires complex **search**, **multi-field filtering**, **sorting**, and **pagination**. GraphQL avoids "over-fetching" and multiple query parameters. |
| **Dashboard** | **GraphQL** | `query dashboardMetrics`<br>`query productsByStatus`<br>`query activityByUser` | The dashboard needs data from 4-5 different sources. GraphQL allows fetching all of this in a **single network request**, significantly improving load performance. |

---

## 3. Implementation Details

### 3.1 REST API (Client Implementation)
Use standard `fetch` or `axios` with the Authorization header.

**Base URL**: `http://localhost:8080/api/v1`

**Headers**:
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

### 3.2 GraphQL API (Client Implementation)
Use `Apollo Client` or `urql`.

**Endpoint**: `http://localhost:8080/graphql`

**Example: Catalog Query**
```graphql
query GetCatalog($search: String, $page: Int) {
  products(search: $search, page: $page, pageSize: 10) {
    items {
      id
      name
      sku
      status
      price
    }
    pageInfo {
      totalPages
      hasNextPage
    }
  }
}
```

**Example: Dashboard Query**
```graphql
query GetDashboard {
  dashboardMetrics {
    totalProducts
    activeProducts
    lowStockProducts
  }
  recentActivity(limit: 5) {
    actionType
    createdAt
    user {
      username
    }
  }
}
```
