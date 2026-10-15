---
name: WebMCP Tool Map
description: Discovered WebMCP tools and parameter schemas across application routes
type: reference
---

# WebMCP Application Map

## Mapped Routes and Tools

### 1. Login (`/login`)
- `user_login(username, password)`: Authenticate user credentials.

### 2. Products Catalog (`/products`)
- `search_products(status, search, categoryId, sortBy, sortOrder)`: Search and filter catalog items.
- `place_order(productId, quantity)`: Purchase an item. Returns `{ id, status, quantity, product, user }`.
- `get_product_details(productId)`: Retrieve single product information.
- `navigate_to_page(path)`: Client-side navigation (`/dashboard`, `/products`, `/orders`, `/my-orders`).
- `logout_user()`: Log out current user and redirect to `/login`.

### 3. Orders Management (`/orders`)
- `get_orders(status)`: List orders with optional status filter (`ALL`, `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`).
- `approve_order(orderId)`: Approve a pending order.
- `reject_order(orderId)`: Reject a pending order.
- `navigate_to_page(path)`: Client-side navigation.
- `logout_user()`: Log out current user.

### 4. My Orders (`/my-orders`)
- `get_my_orders()`: List all orders placed by the currently logged-in user.
- `navigate_to_page(path)`: Client-side navigation.
- `logout_user()`: Log out current user.
