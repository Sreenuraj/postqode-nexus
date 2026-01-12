# Mobile Gap Analysis

## 1. Product Catalog
- **Issue**: Not loading data.
- **Cause**: `getProducts` service expects array but backend returns pagination object.
- **Missing UI**: Search, Filter (Status, Category), Sort.
- **Missing Actions**:
  - User: "Buy" button.
  - Admin: "Edit", "Delete" buttons.

## 2. Dashboard (Admin)
- **Issue**: Uses mock data.
- **Missing Metrics**:
  - Total Products, Active, Low Stock, Out of Stock (Real data).
  - Products Added Today (Count + Chart).
  - Activity by User (Chart).
  - Recent Activity Feed.
  - Order Overview (Pending, Approved, Rejected).

## 3. Dashboard (User)
- **Issue**: Needs verification (likely mock or missing).
- **Missing Metrics**:
  - My Orders count.
  - Pending Orders count.
  - Total Spend.
  - Inventory Items count.

## 4. Order Management (Admin)
- **Issue**: Missing screen.
- **Requirement**: List all orders, Approve/Reject actions.

## 5. User Features
- **My Orders**: Verify Cancel functionality.
- **My Inventory**: Verify Add/Edit/Consume functionality.

## 6. Navigation
- **Issue**: Admin needs access to Order Management.
