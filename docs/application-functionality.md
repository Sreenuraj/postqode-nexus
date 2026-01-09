# PostQode Nexus – Application Functionality Document

## Document Info
| Field | Value |
|-------|-------|
| Version | v1.0 |
| Status | Draft |
| Based On | Requirement Document v1.0 |
| Created | 2026-01-08 |

---

## 1. Application Overview

### What is PostQode Nexus?

PostQode Nexus is an **Inventory & Product Management System** designed for demonstration purposes. It allows organizations to:

- **Manage Products** – Add, view, update, and remove products from inventory
- **Track Inventory Status** – Monitor stock levels with clear status indicators
- **View Analytics** – Access real-time dashboards showing inventory metrics
- **Control Access** – Role-based permissions for Admin and Standard users

### Application Purpose

This is a **demo application** that showcases:
- Complete end-to-end user journeys
- REST and GraphQL API integration
- Role-based access control
- Real-time data updates
- Cross-platform consistency (Web & Mobile)

---

## 2. User Roles & Permissions

### 2.1 Admin User

**Description**: Full access to all system features. Can manage products, view analytics, and perform all inventory operations.

| Feature | Access |
|---------|--------|
| Login/Logout | ✓ |
| View Product Catalog | ✓ |
| Search/Sort/Filter Products | ✓ |
| Add New Products | ✓ |
| Edit Product Details | ✓ |
| Delete Products | ✓ |
| Change Product Status | ✓ |
| View Dashboard Analytics | ✓ |
| View Activity Logs | ✓ |
| Manage Categories | ✓ |
| Manage Users | ✓ |
| Manage Orders | ✓ |

**Demo Credentials**:
- Username: `admin`
- Password: `Admin@123`

---

### 2.2 Standard User

**Description**: Read-only access to the product catalog. Can browse, search, and filter products but cannot make modifications.

| Feature | Access |
|---------|--------|
| Login/Logout | ✓ |
| View Product Catalog | ✓ |
| Search/Sort/Filter Products | ✓ |
| Add New Products | ✗ |
| Edit Product Details | ✗ |
| Delete Products | ✗ |
| Change Product Status | ✗ |
| View Dashboard Analytics | ✗ |
| View Activity Logs | ✗ |
| Place Orders | ✓ |
| View Order History | ✓ |
| Manage Own Orders | ✓ |
| Manage Personal Inventory (CRUD) | ✓ |

**Demo Credentials**:
- Username: `user`
- Password: `User@123`

---

## 3. Primary User Flow

```
┌─────────┐    ┌──────────────────┐    ┌────────────────────┐    ┌───────────┐    ┌────────┐
│  LOGIN  │ -> │  PRODUCT CATALOG │ -> │ INVENTORY ACTIONS  │ -> │ DASHBOARD │ -> │ LOGOUT │
└─────────┘    └──────────────────┘    └────────────────────┘    └───────────┘    └────────┘
                      │                        │                       │
                      │                        │                       │
                  [All Users]              [Admin Only]            [Admin Only]
                      │                        │
                      v                        v
              ┌────────────────┐       ┌────────────────┐
              │  ORDER FLOW    │       │ USER & CAT MGT │
              └────────────────┘       └────────────────┘
                     │ [User]             [Admin Only]
                     v
              ┌────────────────┐
              │  MY INVENTORY  │
              └────────────────┘
                     [User]
```

---

## 4. Screen-by-Screen Functionality

---

### 4.1 Login Screen

**Purpose**: Authenticate users and establish role-based sessions.

#### Layout

```
┌─────────────────────────────────────────────┐
│                                             │
│              POSTQODE NEXUS                 │
│          From requirements to reality       │
│                                             │
│  ┌────────────────────────────────────┐     │
│  │  Username                          │     │
│  └────────────────────────────────────┘     │
│                                             │
│  ┌────────────────────────────────────┐     │
│  │  Password                     👁️   │     │
│  └────────────────────────────────────┘     │
│                                             │
│  ┌────────────────────────────────────┐     │
│  │            SIGN IN                 │     │
│  └────────────────────────────────────┘     │
│                                             │
│            [Error Message Area]             │
│                                             │
└─────────────────────────────────────────────┘
```

#### Functionality

| Feature | Description |
|---------|-------------|
| **Username Input** | Text field for entering username (required) |
| **Password Input** | Password field with show/hide toggle (required) |
| **Sign In Button** | Submits credentials for authentication |
| **Error Display** | Shows validation errors or login failures |
| **Remember Me** | Optional: remember username for next visit |

#### User Interactions

1. User enters username
2. User enters password
3. User clicks "Sign In"
4. System validates credentials
5. On success: Redirect to Product Catalog
6. On failure: Display error message

#### Validation Rules

| Field | Rules |
|-------|-------|
| Username | Required, 3-50 characters |
| Password | Required, minimum 6 characters |

#### Error Messages

| Scenario | Message |
|----------|---------|
| Empty username | "Username is required" |
| Empty password | "Password is required" |
| Invalid credentials | "Invalid username or password" |
| Account locked | "Account temporarily locked. Try again later" |
| Server error | "Something went wrong. Please try again" |

#### Success Behavior

- JWT token stored in local storage
- User role stored in session
- Redirect to Product Catalog
- Activity log entry created: `LOGIN`

---

### 4.2 Product Catalog Screen

**Purpose**: Display all products with search, sort, filter, and pagination capabilities.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ☰  POSTQODE NEXUS                                    [User] ▼  [Logout]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Product Catalog                              [+ Add Product] (Admin)   │
│                                                                         │
│  ┌──────────────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ 🔍 Search products...│  │ Status ▼    │  │ Sort: Name (A-Z) ▼      │ │
│  └──────────────────────┘  └─────────────┘  └─────────────────────────┘ │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ SKU      │ Name              │ Price   │ Qty  │ Status      │ Act  ││
│  ├──────────┼───────────────────┼─────────┼──────┼─────────────┼──────┤│
│  │ PRD-001  │ Wireless Mouse    │ $29.99  │ 150  │ 🟢 Active   │ ⋮    ││
│  │ PRD-002  │ Mechanical Keyb...│ $89.99  │ 5    │ 🟡 Low Stock│ ⋮    ││
│  │ PRD-003  │ USB-C Hub         │ $49.99  │ 0    │ 🔴 Out      │ ⋮    ││
│  │ PRD-004  │ Monitor Stand     │ $45.00  │ 75   │ 🟢 Active   │ ⋮    ││
│  │ ...      │ ...               │ ...     │ ...  │ ...         │ ...  ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  Showing 1-10 of 47 products          [◀ Prev] [1] [2] [3] ... [Next ▶] │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Functionality

| Feature | Description | Available To |
|---------|-------------|--------------|
| **Search** | Real-time search by product name or SKU | All Users |
| **Filter by Status** | Dropdown to filter by Active/Low Stock/Out of Stock | All Users |
| **Sort** | Sort by Name, SKU, Price, Quantity, or Status | All Users |
| **Pagination** | Navigate through product pages (10 items per page) | All Users |
| **Add Product** | Button to open add product form | Admin Only |
| **Actions Menu** | Edit, Delete, Change Status options | Admin Only |

#### Product Table Columns

| Column | Description | Sortable |
|--------|-------------|----------|
| SKU | Unique product identifier | Yes |
| Name | Product display name | Yes |
| Price | Product price (formatted as currency) | Yes |
| Quantity | Current stock quantity | Yes |
| Status | Current inventory status with color indicator | Yes |
| Actions | Context menu for Admin actions | No |

#### Status Indicators

| Status | Color | Icon | Trigger Condition |
|--------|-------|------|-------------------|
| Active | Green | 🟢 | Quantity > 10 |
| Low Stock | Yellow | 🟡 | Quantity 1-10 |
| Out of Stock | Red | 🔴 | Quantity = 0 |

#### Search Behavior

- **Debounced**: 300ms delay after typing stops
- **Fields searched**: Name, SKU, Description
- **Case insensitive**: "mouse" matches "Mouse" and "MOUSE"
- **Partial match**: "wire" matches "Wireless Mouse"

#### Filter Options

| Filter | Options |
|--------|---------|
| Status | All, Active, Low Stock, Out of Stock |

#### Sort Options

| Option | Direction |
|--------|-----------|
| Name (A-Z) | Ascending |
| Name (Z-A) | Descending |
| Price (Low to High) | Ascending |
| Price (High to Low) | Descending |
| Quantity (Low to High) | Ascending |
| Quantity (High to Low) | Descending |
| Newest First | Created Date Descending |
| Oldest First | Created Date Ascending |

#### Pagination

- **Page size**: 10 items (configurable: 10, 25, 50)
- **Controls**: Previous, Next, Page numbers
- **Display**: "Showing X-Y of Z products"
- **Category Grouping**: Option to view products grouped by category

---

### 4.6 Category Management (Admin Only)

**Purpose**: Organize products into categories.

#### Functionality

| Feature | Description |
|---------|-------------|
| **List Categories** | View all categories |
| **Add Category** | Create new category (Name, Description) |
| **Edit Category** | Update category details |
| **Delete Category** | Remove category (if no products attached) |

#### Data Fields

| Field | Description |
|-------|-------------|
| Name | Category name (unique) |
| Description | Optional description |

---

### 4.7 User Management (Admin Only)

**Purpose**: Manage system users.

#### Functionality

| Feature | Description |
|---------|-------------|
| **List Users** | View all users and their roles |
| **Add User** | Create new user (Username, Password, Role) |
| **Update User** | Update password or toggle status |
| **Enable/Disable** | Activate or deactivate user access |

#### Add/Edit User Modal

- **Username**: Text (Required, Unique)
- **Password**: Password (Required for creation, optional for update)
- **Role**: Admin/User
- **Status**: Enabled/Disabled

---

### 4.8 Order Management

**Purpose**: Allow users to purchase products and admins to approve them.

#### 4.8.1 Place Order (User)

**Trigger**: "Buy Now" or "Add to Cart" -> Checkout from Product Catalog

**Flow**:
1. User selects product and quantity.
2. User confirms order.
3. Order status set to `PENDING`.

#### 4.8.2 My Orders (User)

**Features**:
- List all orders placed by the user.
- Filter by status (Pending, Approved, Rejected).
- **Cancel Order**: User can cancel order if status is `PENDING`.

#### 4.8.3 Manage Orders (Admin)

**Features**:
- View all orders.
- Approve Order:
  - Reduces Product Quantity.
  - Changes status to `APPROVED`.
- Reject Order:
  - Changes status to `REJECTED`.

**Business Logic**:
- Cannot approve if product quantity < order quantity.
- Stock is reduced ONLY upon approval.
- **Approval Effect**: Approved orders automatically create entries in "My Inventory".

---

### 4.9 My Inventory (User)

**Purpose**: Manage products owned by the user.

#### Functionality

| Feature | Description |
|---------|-------------|
| **List My Items** | View purchased and manually added items. |
| **Add Item (Create)** | Manually add a personal item to inventory. |
| **Edit Item (Update)** | Edit details (Name, Notes) of owned items. |
| **Delete Item (Delete)** | Remove item from personal inventory. |
| **View Details (Read)** | See item details. |

#### Integration with Orders
- When an Order is **APPROVED**, the products are automatically added to this list.
- Users can modifications to these records without affecting the global catalog.

#### Data Fields (User Inventory Item)
- **Source**: "PURCHASED" or "MANUAL"
- **Original Product ID**: Link to catalog (if purchased)
- **Name**: Editable
- **Quantity**: Editable
- **Notes**: Personal user notes

---

### 4.3 Inventory Management (Admin Only)

**Purpose**: Allow administrators to add, edit, delete products and manage inventory status.

---

#### 4.3.1 Add Product Modal

**Trigger**: Click "Add Product" button on catalog screen

```
┌─────────────────────────────────────────────┐
│  Add New Product                        ✕   │
├─────────────────────────────────────────────┤
│                                             │
│  SKU *                                      │
│  ┌────────────────────────────────────┐     │
│  │ PRD-XXX                            │     │
│  └────────────────────────────────────┘     │
│                                             │
│  Product Name *                             │
│  ┌────────────────────────────────────┐     │
│  │                                    │     │
│  └────────────────────────────────────┘     │
│                                             │
│  Description                                │
│  ┌────────────────────────────────────┐     │
│  │                                    │     │
│  │                                    │     │
│  └────────────────────────────────────┘     │
│                                             │
│  Price *                  Quantity *        │
│  ┌─────────────────┐      ┌─────────────┐   │
│  │ $ 0.00          │      │ 0           │   │
│  └─────────────────┘      └─────────────┘   │
│                                             │
│  Initial Status                             │
│  ┌────────────────────────────────────┐     │
│  │ Active                         ▼   │     │
│  └────────────────────────────────────┘     │
│                                             │
│         [Cancel]              [Save]        │
│                                             │
└─────────────────────────────────────────────┘
```

#### Form Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| SKU | Text | Yes | Unique, format: PRD-XXX |
| Name | Text | Yes | 3-200 characters |
| Description | Textarea | No | Max 1000 characters |
| Price | Currency | Yes | > 0, max 2 decimals |
| Quantity | Number | Yes | >= 0, integer only |
| Status | Dropdown | Yes | Active, Low Stock, Out of Stock |

#### Behavior

- **Auto-generate SKU**: Suggest next available SKU
- **Status auto-calculation**: If quantity is 0, force "Out of Stock"
- **Validation**: Real-time field validation
- **Save**: Creates product and returns to catalog
- **Cancel**: Closes modal without saving

#### Success Actions

- Product added to database
- Activity log entry: `CREATE`
- Catalog refreshes to show new product
- Success toast notification: "Product added successfully"

---

#### 4.3.2 Edit Product Modal

**Trigger**: Click "Edit" from product actions menu

Same layout as Add Product, pre-filled with existing data.

#### Additional Behavior

- SKU field is **read-only** (cannot be changed)
- Shows "Last Updated" timestamp
- Activity log entry: `UPDATE`
- Success message: "Product updated successfully"

---

#### 4.3.3 Delete Product

**Trigger**: Click "Delete" from product actions menu

```
┌─────────────────────────────────────────────┐
│  Delete Product                         ✕   │
├─────────────────────────────────────────────┤
│                                             │
│  ⚠️ Are you sure you want to delete this    │
│     product?                                │
│                                             │
│     SKU: PRD-001                            │
│     Name: Wireless Mouse                    │
│                                             │
│     This action cannot be undone.           │
│                                             │
│         [Cancel]         [Delete]           │
│                                             │
└─────────────────────────────────────────────┘
```

#### Behavior

- Confirmation required before deletion
- Soft delete: Product marked as deleted, not removed
- Activity log entry: `DELETE`
- Success message: "Product deleted successfully"
- Catalog refreshes

---

#### 4.3.4 Change Product Status

**Trigger**: Click "Change Status" from product actions menu OR inline status dropdown

```
┌─────────────────────────────────────────────┐
│  Change Status                          ✕   │
├─────────────────────────────────────────────┤
│                                             │
│  Product: Wireless Mouse (PRD-001)          │
│  Current Status: 🟢 Active                  │
│                                             │
│  New Status:                                │
│  ┌────────────────────────────────────┐     │
│  │ ○ Active                           │     │
│  │ ● Low Stock                        │     │
│  │ ○ Out of Stock                     │     │
│  └────────────────────────────────────┘     │
│                                             │
│         [Cancel]         [Update]           │
│                                             │
└─────────────────────────────────────────────┘
```

#### Business Rules

| Current Status | Can Change To |
|----------------|---------------|
| Active | Low Stock, Out of Stock |
| Low Stock | Active, Out of Stock |
| Out of Stock | Active, Low Stock |

#### Automatic Status Rules

| Condition | Automatic Status |
|-----------|------------------|
| Quantity = 0 | Out of Stock |
| Quantity 1-10 | Low Stock (suggested) |
| Quantity > 10 | Active (suggested) |

> **Note**: Admin can override automatic suggestions

#### Behavior

- Activity log entry: `STATE_CHANGE`
- Old and new status logged
- Dashboard metrics update
- Success message: "Status updated successfully"

---

### 4.4 Dashboard Screen (Admin Only)

**Purpose**: Display real-time analytics and activity metrics for inventory management.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ☰  POSTQODE NEXUS                                    [Admin] ▼ [Logout]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Dashboard                                              🔄 Refresh      │
│                                                                         │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────┐│
│  │ Total Products  │ │ Active          │ │ Low Stock       │ │Out Stock││
│  │      47         │ │    32           │ │     10          │ │    5    ││
│  │                 │ │  🟢             │ │  🟡             │ │  🔴     ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────┘│
│                                                                         │
│  ┌──────────────────────────────────┐ ┌─────────────────────────────────┐
│  │ Products by Status               │ │ Products Added Today           │
│  │                                  │ │                                │
│  │      [PIE CHART]                 │ │         5 products             │
│  │   Active: 68%                    │ │                                │
│  │   Low Stock: 21%                 │ │   ┌──────────────────────┐     │
│  │   Out of Stock: 11%              │ │   │ [BAR CHART - 7 days] │     │
│  │                                  │ │   └──────────────────────┘     │
│  └──────────────────────────────────┘ └─────────────────────────────────┘
│                                                                         │
│  ┌──────────────────────────────────┐ ┌─────────────────────────────────┐
│  │ Activity by User (Last 7 Days)   │ │ Recent Activity                │
│  │                                  │ │                                │
│  │   admin ████████████ 45         │ │ • admin added "USB Hub"     2m │
│  │   user  ████ 12                  │ │ • admin updated PRD-005   15m │
│  │                                  │ │ • admin changed status    1h  │
│  │                                  │ │ • user logged in          2h  │
│  └──────────────────────────────────┘ └─────────────────────────────────┘
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Dashboard Components

---

##### 4.4.1 Summary Cards

| Card | Metric | Description |
|------|--------|-------------|
| Total Products | Count | Total number of products in system |
| Active | Count | Products with Active status |
| Low Stock | Count | Products with Low Stock status |
| Out of Stock | Count | Products with Out of Stock status |

**Behavior**:
- Click on card filters catalog to that status
- Real-time updates (polling every 30 seconds or WebSocket)

---

##### 4.4.2 Products by Status (Pie Chart)

**Data Source**: GraphQL query `productsByStatus`

| Segment | Color | Value |
|---------|-------|-------|
| Active | Green (#22C55E) | Count + Percentage |
| Low Stock | Yellow (#EAB308) | Count + Percentage |
| Out of Stock | Red (#EF4444) | Count + Percentage |

**Interactivity**:
- Hover: Show exact count
- Click: Filter catalog to that status

---

##### 4.4.3 Products Added Today

**Data Source**: GraphQL query `productsAddedToday`

| Display | Description |
|---------|-------------|
| Number | Large count of products added today |
| Chart | Bar chart showing last 7 days trend |

---

##### 4.4.4 Activity by User

**Data Source**: GraphQL query `activityByUser`

| Column | Description |
|--------|-------------|
| Username | User who performed actions |
| Action Count | Number of actions in period |
| Visual Bar | Proportional bar chart |

**Time Range**: Last 7 days (configurable)

---

##### 4.4.5 Recent Activity Feed

**Data Source**: GraphQL query `recentActivity`

| Field | Description |
|-------|-------------|
| User | Who performed the action |
| Action | What they did (added, updated, deleted, changed status) |
| Target | Product affected |
| Time | Relative time (2m ago, 1h ago) |

**Display**: Last 10 activities, scrollable

**Action Types Displayed**:
- "added [Product Name]"
- "updated [Product Name]"
- "deleted [Product Name]"
- "changed [Product Name] status to [Status]"
- "logged in"
- "logged out"

---

### 4.5 Logout

**Purpose**: Terminate user session securely.

#### Trigger Locations
- Header dropdown menu
- Session timeout
- Manual navigation to /logout

#### Behavior

1. User clicks "Logout"
2. Confirmation (optional): "Are you sure you want to logout?"
3. JWT token invalidated server-side
4. Local storage cleared
5. Activity log entry: `LOGOUT`
6. Redirect to Login screen
7. Success message: "You have been logged out"

#### Session Timeout

- **Duration**: 24 hours (configurable)
- **Warning**: Show warning 5 minutes before expiry
- **Behavior**: Automatic logout, redirect to login

---

## 5. Navigation Structure

### 5.1 Sidebar Menu (Desktop)

```
┌─────────────────────┐
│  POSTQODE NEXUS     │
│  ─────────────────  │
│                     │
│  📦 Products        │  <- All Users
│  📊 Dashboard       │  <- Admin Only
│                     │
│  ─────────────────  │
│                     │
│  👤 Profile         │
│  🚪 Logout          │
│                     │
└─────────────────────┘
```

### 5.2 Bottom Navigation (Mobile)

```
┌─────────────────────────────────────────────┐
│    📦          📊          👤          🚪    │
│  Products   Dashboard   Profile    Logout   │
└─────────────────────────────────────────────┘
```

### 5.3 Route Structure

| Route | Screen | Access |
|-------|--------|--------|
| `/login` | Login | Public |
| `/` | Product Catalog | Authenticated |
| `/products` | Product Catalog | Authenticated |
| `/products/:id` | Product Details | Authenticated |
| `/dashboard` | Dashboard | Admin Only |
| `/profile` | User Profile | Authenticated |
| `/logout` | Logout Handler | Authenticated |

---

## 6. Data Models

### 6.1 Product

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| sku | String | Stock keeping unit (PRD-XXX) |
| name | String | Product display name |
| description | String | Product description |
| price | Decimal | Product price |
| quantity | Integer | Current stock quantity |
| status | Enum | ACTIVE, LOW_STOCK, OUT_OF_STOCK |
| createdBy | UUID | User who created |
| updatedBy | UUID | User who last updated |
| createdAt | DateTime | Creation timestamp |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |
| categoryId | UUID | Foreign key to Category (optional) |

### 6.2 Category

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| name | String | Category name (Unique) |
| description | String | Description |

### 6.3 Order

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| userId | UUID | User who placed order |
| productId | UUID | Product ordered |
| quantity | Integer | Quantity ordered |
| status | Enum | PENDING, APPROVED, REJECTED, CANCELLED |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### 6.4 User

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| username | String | Login username |
| email | String | User email |
| role | Enum | ADMIN, USER |
| createdAt | DateTime | Registration date |
| isEnabled | Boolean | Account status (True/False) |

### 6.5 UserInventoryItem

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| userId | UUID | Owner |
| productId | UUID | Reference to Catalog Product (optional) |
| name | String | Item name |
| quantity | Integer | Quantity owned |
| source | Enum | PURCHASED, MANUAL |
| notes | String | User notes |
| createdAt | DateTime | Creation timestamp |

### 6.6 Activity Log

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| userId | UUID | User who performed action |
| productId | UUID | Affected product (optional) |
| actionType | Enum | CREATE, UPDATE, DELETE, STATE_CHANGE, LOGIN, LOGOUT |
| oldValue | JSON | Previous state |
| newValue | JSON | New state |
| createdAt | DateTime | When action occurred |

---

## 7. Business Rules

### 7.1 Product Rules

| Rule | Description |
|------|-------------|
| SKU Uniqueness | Each product must have a unique SKU |
| SKU Format | Must match pattern: PRD-[0-9]{3,} |
| Price Minimum | Price must be greater than 0 |
| Quantity Range | Must be 0 or positive integer |
| Auto-Status | Quantity 0 = Out of Stock |

### 7.2 Order Rules

| Rule | Description |
|------|-------------|
| Stock Reduction | Stock decreases only when Admin approves order |
| Insufficient Stock | Admin cannot approve order if stock < order qty |
| Cancellation | User can only cancel PENDING orders |
| Modification | Approved orders cannot be modified |

### 7.3 Access Rules

| Rule | Description |
|------|-------------|
| Authentication | All routes except /login require valid JWT |
| Admin Routes | /dashboard requires ADMIN role |
| Modification Actions | Add/Edit/Delete require ADMIN role |
| Token Expiry | JWT expires after 24 hours |

### 7.4 Audit Rules

| Rule | Description |
|------|-------------|
| Log All Changes | Every CRUD action creates activity log |
| Log Authentication | Login/Logout actions logged |
| Preserve History | Activity logs never deleted |
| Capture Context | Old and new values stored |

---

## 8. Error Handling

### 8.1 Error Messages

| Scenario | Message | Action |
|----------|---------|--------|
| Network Error | "Unable to connect. Check your connection." | Retry button |
| Unauthorized | "Session expired. Please login again." | Redirect to login |
| Forbidden | "You don't have permission for this action." | None |
| Not Found | "Product not found." | Back button |
| Validation | Field-specific messages | Highlight field |
| Server Error | "Something went wrong. Please try again." | Retry button |

### 8.2 Loading States

| State | Display |
|-------|---------|
| Page Loading | Full-screen spinner |
| Data Loading | Skeleton placeholders |
| Button Loading | Button spinner + disabled |
| Save Loading | "Saving..." text |

---

## 9. Notifications

### 9.1 Toast Notifications

| Type | Duration | Position |
|------|----------|----------|
| Success | 3 seconds | Top-right |
| Error | 5 seconds | Top-right |
| Warning | 4 seconds | Top-right |
| Info | 3 seconds | Top-right |

### 9.2 Common Messages

| Action | Message |
|--------|---------|
| Product Added | "Product added successfully" |
| Product Updated | "Product updated successfully" |
| Product Deleted | "Product deleted successfully" |
| Status Changed | "Status updated successfully" |
| Login Success | "Welcome back, [username]!" |
| Logout Success | "You have been logged out" |

---

## 10. Responsive Behavior

### 10.1 Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 768px | Single column, bottom nav |
| Tablet | 768px - 1024px | Two column, side nav collapsed |
| Desktop | > 1024px | Multi-column, side nav expanded |

### 10.2 Component Adaptations

| Component | Mobile | Desktop |
|-----------|--------|---------|
| Navigation | Bottom tabs | Side drawer |
| Product Table | Card list | Full table |
| Dashboard | Stacked cards | Grid layout |
| Modals | Full screen | Centered popup |

---

## 11. Accessibility

### 11.1 Requirements

| Feature | Implementation |
|---------|----------------|
| Keyboard Navigation | All interactive elements focusable |
| Screen Readers | ARIA labels on all elements |
| Color Contrast | WCAG AA compliance |
| Focus Indicators | Visible focus rings |
| Error Identification | Error messages associated with fields |

### 11.2 ARIA Labels

| Element | Label |
|---------|-------|
| Search Input | "Search products" |
| Status Filter | "Filter by status" |
| Sort Dropdown | "Sort products by" |
| Add Button | "Add new product" |
| Edit Button | "Edit product" |
| Delete Button | "Delete product" |

---

## 12. Demo Scenarios

### 12.1 Admin Demo Flow (5 minutes)

1. **Login as Admin** (30s)
   - Enter admin/Admin@123
   - Observe successful login

2. **View Catalog** (45s)
   - Browse product list
   - Search for "mouse"
   - Filter by "Low Stock"
   - Sort by price

3. **Add Product** (60s)
   - Click "Add Product"
   - Fill form
   - Save and verify in list

4. **Update Product** (45s)
   - Edit existing product
   - Change status to "Out of Stock"
   - Save changes

   - Save changes
   - **Assign Category** to product

5. **Manage Orders** (60s)
   - Navigate to Order Management
   - Approve pending orders
   - Verify stock reduction

6. **View Dashboard** (60s)
   - Navigate to Dashboard
   - Observe updated metrics
   - View recent activity

7. **Logout** (30s)
   - Click Logout
   - Confirm session ended

### 12.2 User Demo Flow (3 minutes)

1. **Login as User** (30s)
   - Enter user/User@123
   - Observe successful login

2. **Browse Catalog** (90s)
   - View product list
   - Search products
   - Apply filters
   - Note: No edit buttons visible

   - Observe access denied

4. **Buy Product** (60s)
   - Select product -> Buy
   - Confirm Order
   - Go to "My Orders" -> See Pending

5. **My Inventory** (30s)
   - Go to "My Inventory"
   - Add personal item manually
   - View purchased items (after approval)

6. **Logout** (30s)
   - Click Logout
   - Confirm session ended

---

## 13. Demo Data Set

### 13.1 Sample Products (20 items)

| SKU | Name | Price | Qty | Status |
|-----|------|-------|-----|--------|
| PRD-001 | Wireless Mouse | $29.99 | 150 | Active |
| PRD-002 | Mechanical Keyboard | $89.99 | 5 | Low Stock |
| PRD-003 | USB-C Hub | $49.99 | 0 | Out of Stock |
| PRD-004 | Monitor Stand | $45.00 | 75 | Active |
| PRD-005 | Webcam HD | $79.99 | 8 | Low Stock |
| PRD-006 | Desk Lamp | $35.00 | 200 | Active |
| PRD-007 | Ergonomic Chair | $299.99 | 0 | Out of Stock |
| PRD-008 | Laptop Stand | $55.00 | 45 | Active |
| PRD-009 | Wireless Charger | $25.99 | 3 | Low Stock |
| PRD-010 | Bluetooth Speaker | $69.99 | 120 | Active |
| PRD-011 | Noise Cancelling Headphones | $199.99 | 15 | Active |
| PRD-012 | USB Flash Drive 64GB | $12.99 | 0 | Out of Stock |
| PRD-013 | External SSD 1TB | $129.99 | 25 | Active |
| PRD-014 | Wireless Earbuds | $59.99 | 7 | Low Stock |
| PRD-015 | HDMI Cable 6ft | $15.99 | 300 | Active |
| PRD-016 | Mouse Pad XL | $19.99 | 2 | Low Stock |
| PRD-017 | Portable Projector | $249.99 | 10 | Low Stock |
| PRD-018 | Smart Power Strip | $39.99 | 55 | Active |
| PRD-019 | Cable Management Kit | $24.99 | 0 | Out of Stock |
| PRD-020 | Webcam Light Ring | $29.99 | 80 | Active |

### 13.2 Summary

- **Total Products**: 20
- **Active**: 10 (50%)
- **Low Stock**: 6 (30%)
- **Out of Stock**: 4 (20%)

---

*Document maintained by PostQode Team*
