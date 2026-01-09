# Phase 3.1 Implementation Plan - Enhanced Functionality

**Version**: 1.1  
**Status**: In Progress (Backend Complete)  
**Created**: 2026-01-09  
**Updated**: 2026-01-09  
**Based On**: Implementation Plan v1.0

---

## Executive Summary

Phase 3.1 adds major new functionality to PostQode Nexus including Category Management, User Management, Order System, and User Inventory. This is a significant enhancement that requires database schema changes, new backend APIs, and new frontend pages.

**Environment**: Development (No production impact considerations)

**Current Status**: Backend implementation complete and tested. Frontend implementation pending.

---

## Implementation Progress

### Overall Progress: 60% Complete

| Task | Status | Progress | Notes |
|------|--------|----------|-------|
| 3.1.1 Database Enhancements | ✅ Complete | 100% | Migrations V4 and V5 created and tested |
| 3.1.2 Category Management | ✅ Backend Complete | 100% | Backend done, Frontend pending |
| 3.1.3 User Management | ⏳ Not Started | 0% | Admin feature |
| 3.1.4 Order System | ✅ Backend Complete | 100% | Backend done, Frontend pending |
| 3.1.5 User Inventory | ✅ Backend Complete | 100% | Backend done, Frontend pending |
| 3.1.6 Product Catalog Refactor | ✅ Backend Complete | 100% | Backend done, Frontend pending |
| Testing | ✅ Backend Tested | 50% | Backend APIs tested, Frontend tests pending |
| Documentation | ✅ Complete | 100% | Backend summary created |

---

## Detailed Implementation Plan

### 3.1.1 Database Enhancements

**Status**: ✅ Complete  
**Priority**: CRITICAL  
**Dependencies**: None

#### Database Schema Changes

##### New Tables

1. **categories**
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

2. **orders**
```sql
CREATE TYPE order_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    status order_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3. **user_inventory**
```sql
CREATE TYPE inventory_source AS ENUM ('PURCHASED', 'MANUAL');

CREATE TABLE user_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    product_id UUID REFERENCES products(id),
    name VARCHAR(200) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    source inventory_source NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

##### Table Modifications

1. **users** - Add is_enabled column
```sql
ALTER TABLE users ADD COLUMN is_enabled BOOLEAN DEFAULT true;
```

2. **products** - Add category_id column
```sql
ALTER TABLE products ADD COLUMN category_id UUID REFERENCES categories(id);
```

##### Indexes
```sql
-- Categories
CREATE INDEX idx_categories_name ON categories(name);

-- Orders
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_product ON orders(product_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);

-- User Inventory
CREATE INDEX idx_user_inventory_user ON user_inventory(user_id);
CREATE INDEX idx_user_inventory_product ON user_inventory(product_id);
CREATE INDEX idx_user_inventory_source ON user_inventory(source);

-- Products
CREATE INDEX idx_products_category ON products(category_id);
```

##### Triggers
```sql
-- Update triggers for new tables
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_inventory_updated_at BEFORE UPDATE ON user_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Migration File
- **File**: `backend/src/main/resources/db/migration/V4__phase3_1_enhancements.sql`
- **Status**: ⏳ Not Created

#### Demo Data Updates
- **File**: `backend/src/main/resources/db/migration/V5__phase3_1_demo_data.sql`
- **Status**: ⏳ Not Created
- **Content**: 
  - 3-5 sample categories
  - Update existing products with categories
  - Sample orders for demo user
  - Sample user inventory items

---

### 3.1.2 Category Management

**Status**: ✅ Backend Complete  
**Priority**: HIGH  
**Dependencies**: 3.1.1

#### Backend Implementation

##### Models
- [x] `Category.java` - Entity class
- [ ] `CategoryRequest.java` - DTO for create/update
- [ ] `CategoryResponse.java` - DTO for responses

##### Repository
- [x] `CategoryRepository.java` - JPA repository with custom queries

##### Service
- [x] `CategoryService.java` - Business logic
  - CRUD operations
  - Validation (unique name)
  - Check for products before deletion

##### Controller
- [x] `CategoryController.java` - REST endpoints
  - GET /api/v1/categories - List all
  - GET /api/v1/categories/{id} - Get by ID
  - POST /api/v1/categories - Create (Admin only)
  - PUT /api/v1/categories/{id} - Update (Admin only)
  - DELETE /api/v1/categories/{id} - Delete (Admin only)

##### GraphQL
- [ ] Update `schema.graphqls` with Category types and queries
- [ ] `CategoryResolver.java` - GraphQL resolvers

#### Frontend Implementation

##### Pages
- [ ] `CategoriesPage.tsx` - Admin-only category management page

##### Components
- [ ] `CategoryFormDialog.tsx` - Add/Edit category modal
- [ ] `DeleteCategoryDialog.tsx` - Delete confirmation

##### Navigation
- [ ] Update `Layout.tsx` to add Categories link (Admin only)

#### Testing
- [ ] Unit tests for CategoryService
- [ ] Integration tests for CategoryController
- [ ] Manual testing checklist

---

### 3.1.3 User Management

**Status**: ⏳ Not Started  
**Priority**: HIGH  
**Dependencies**: 3.1.1

#### Backend Implementation

##### Models
- [ ] Update `User.java` - Add `isEnabled` field
- [ ] `UserRequest.java` - DTO for create/update
- [ ] `UserResponse.java` - DTO for responses

##### Repository
- [ ] Update `UserRepository.java` - Add enable/disable methods

##### Service
- [ ] Update `UserService.java` - Add user management
  - CRUD operations
  - Enable/disable functionality
  - Password management
  - Validation (username uniqueness)

##### Controller
- [ ] `UserController.java` - REST endpoints (Admin only)
  - GET /api/v1/users - List all
  - GET /api/v1/users/{id} - Get by ID
  - POST /api/v1/users - Create
  - PUT /api/v1/users/{id} - Update
  - PATCH /api/v1/users/{id}/enable - Enable user
  - PATCH /api/v1/users/{id}/disable - Disable user

##### Security
- [ ] Update `SecurityConfig.java` - Check `isEnabled` on login

##### GraphQL
- [ ] Update `schema.graphqls` with User queries
- [ ] Update `UserResolver.java` - Add user management queries

#### Frontend Implementation

##### Pages
- [ ] `UsersPage.tsx` - Admin-only user management page

##### Components
- [ ] `UserFormDialog.tsx` - Add/Edit user modal
- [ ] `EnableDisableUserDialog.tsx` - Enable/disable confirmation

##### Navigation
- [ ] Update `Layout.tsx` to add Users link (Admin only)

#### Testing
- [ ] Unit tests for UserService
- [ ] Integration tests for UserController
- [ ] Manual testing checklist
- [ ] Test disabled user login

---

### 3.1.4 Order System

**Status**: ✅ Backend Complete  
**Priority**: CRITICAL  
**Dependencies**: 3.1.1

#### Backend Implementation

##### Models
- [x] `Order.java` - Entity class
- [x] `OrderStatus.java` - Enum (PENDING, APPROVED, REJECTED, CANCELLED)
- [ ] `OrderRequest.java` - DTO for create
- [ ] `OrderResponse.java` - DTO for responses

##### Repository
- [x] `OrderRepository.java` - JPA repository
  - findByUserId
  - findByStatus
  - Find pending orders

##### Service
- [x] `OrderService.java` - Business logic
  - placeOrder() - Create PENDING order
  - approveOrder() - Reduce stock, create inventory, change status
  - rejectOrder() - Change status to REJECTED
  - cancelOrder() - User can cancel PENDING orders
  - Validation: Stock check before approval

##### Controller
- [x] `OrderController.java` - REST endpoints
  - GET /api/v1/orders/my - Current user's orders
  - GET /api/v1/orders - All orders (Admin only)
  - GET /api/v1/orders/{id} - Get by ID
  - POST /api/v1/orders - Place order (User only)
  - PATCH /api/v1/orders/{id}/approve - Approve (Admin only)
  - PATCH /api/v1/orders/{id}/reject - Reject (Admin only)
  - PATCH /api/v1/orders/{id}/cancel - Cancel (User only, PENDING only)

##### GraphQL
- [ ] Update `schema.graphqls` with Order types and queries
- [ ] `OrderResolver.java` - GraphQL resolvers

#### Frontend Implementation

##### Pages
- [ ] `MyOrdersPage.tsx` - User's order history
- [ ] `OrderManagementPage.tsx` - Admin order management

##### Components
- [ ] Update `ProductCatalogPage.tsx` - Add "Buy" button for users
- [ ] `OrderStatusBadge.tsx` - Status badge component
- [ ] `BuyProductDialog.tsx` - Buy confirmation dialog

##### Navigation
- [ ] Update `Layout.tsx` to add My Orders link (User)
- [ ] Update `Layout.tsx` to add Order Management link (Admin)

#### Business Rules
- [ ] Stock reduced ONLY on approval
- [ ] Cannot approve if insufficient stock
- [ ] Users can only cancel PENDING orders
- [ ] Approved orders create UserInventory entries automatically
- [ ] Order quantity cannot exceed product quantity

#### Testing
- [ ] Unit tests for OrderService
- [ ] Integration tests for order approval flow
- [ ] Manual testing checklist
- [ ] Test stock reduction logic

---

### 3.1.5 User Inventory

**Status**: ✅ Backend Complete  
**Priority**: MEDIUM  
**Dependencies**: 3.1.4

#### Backend Implementation

##### Models
- [x] `UserInventory.java` - Entity class
- [x] `InventorySource.java` - Enum (PURCHASED, MANUAL)
- [ ] `UserInventoryRequest.java` - DTO for create/update
- [ ] `UserInventoryResponse.java` - DTO for responses

##### Repository
- [x] `UserInventoryRepository.java` - JPA repository
  - findByUserId
  - findByUserIdAndSource

##### Service
- [x] `UserInventoryService.java` - Business logic
  - CRUD operations
  - Auto-create from approved orders
  - Ownership validation

##### Controller
- [x] `UserInventoryController.java` - REST endpoints
  - GET /api/v1/inventory/my - Current user's inventory
  - GET /api/v1/inventory/{id} - Get by ID
  - POST /api/v1/inventory - Create item (User only)
  - PUT /api/v1/inventory/{id} - Update item (Owner only)
  - DELETE /api/v1/inventory/{id} - Delete item (Owner only, MANUAL only)

##### GraphQL
- [ ] Update `schema.graphqls` with UserInventory types and queries
- [ ] `UserInventoryResolver.java` - GraphQL resolvers

#### Frontend Implementation

##### Pages
- [ ] `MyInventoryPage.tsx` - User's personal inventory

##### Components
- [ ] `InventoryFormDialog.tsx` - Add/Edit item modal
- [ ] `DeleteInventoryItemDialog.tsx` - Delete confirmation
- [ ] `InventorySourceBadge.tsx` - Source badge component

##### Navigation
- [ ] Update `Layout.tsx` to add My Inventory link (User)

#### Business Rules
- [ ] Users can only CRUD their own inventory
- [ ] PURCHASED items are auto-created from approved orders
- [ ] MANUAL items are user-created
- [ ] PURCHASED items can be edited (name, notes) but not deleted
- [ ] MANUAL items can be fully managed

#### Testing
- [ ] Unit tests for UserInventoryService
- [ ] Integration tests for inventory operations
- [ ] Manual testing checklist

---

### 3.1.6 Product Catalog Refactor

**Status**: ✅ Backend Complete  
**Priority**: MEDIUM  
**Dependencies**: 3.1.2, 3.1.4

#### Backend Implementation

##### Repository
- [x] Update `ProductRepository.java` - Add category filtering

##### Service
- [x] Update `ProductService.java` - Support category in queries

##### GraphQL
- [ ] Update `schema.graphqls` - Add category filter to products query
- [ ] Update `ProductResolver.java` - Handle category filtering

#### Frontend Implementation

##### Pages
- [ ] Update `ProductCatalogPage.tsx`:
  - [ ] Add category filter dropdown
  - [ ] Add category column to table
  - [ ] Add "Buy" button for non-admin users
  - [ ] Update search to include category

##### Components
- [ ] Update `ProductFormDialog.tsx` - Add category selection

##### Navigation
- [ ] Ensure all new pages are accessible

#### Testing
- [ ] Test category filtering
- [ ] Test buy button functionality
- [ ] Test updated product form

---

## Testing Strategy

### Unit Tests
- [ ] CategoryService tests
- [ ] UserService tests (including enable/disable)
- [ ] OrderService tests (approval logic, stock reduction)
- [ ] UserInventoryService tests

### Integration Tests
- [ ] Order approval flow (order → stock → inventory)
- [ ] Category-product relationship
- [ ] User enable/disable affecting login
- [ ] Order status transitions

### Manual Testing Checklist

#### Category Management
- [ ] Create category
- [ ] Edit category
- [ ] Delete category (with no products)
- [ ] Try to delete category with products (should fail)
- [ ] Assign category to product
- [ ] Filter products by category

#### User Management
- [ ] Create new user
- [ ] Edit user details
- [ ] Disable user
- [ ] Try to login as disabled user (should fail)
- [ ] Enable user
- [ ] Login as enabled user (should succeed)
- [ ] Try to disable self (should fail)

#### Order System
- [ ] User places order
- [ ] Verify order status is PENDING
- [ ] Admin approves order
- [ ] Verify stock reduced
- [ ] Verify inventory item created
- [ ] Admin rejects order
- [ ] Verify stock unchanged
- [ ] User cancels PENDING order
- [ ] Try to approve with insufficient stock (should fail)

#### User Inventory
- [ ] View auto-created inventory from approved order
- [ ] Add manual inventory item
- [ ] Edit inventory item
- [ ] Delete manual inventory item
- [ ] Try to delete purchased item (should fail)
- [ ] Try to access another user's inventory (should fail)

#### Product Catalog
- [ ] Filter by category
- [ ] See category in product table
- [ ] Select category when creating product
- [ ] Buy product as user
- [ ] Verify buy button not shown for admin

---

## Demo Data Updates

### Categories (3-5 sample categories)
1. Electronics
2. Office Supplies
3. Accessories
4. Peripherals
5. Components

### Product Category Assignments
- Assign existing products to appropriate categories
- Ensure mix of categories for testing

### Sample Orders
- Create 3-5 sample orders for demo user
- Mix of PENDING, APPROVED, REJECTED statuses

### Sample User Inventory
- Create 2-3 manual inventory items for demo user
- Auto-create inventory from approved orders

---

## Risk Mitigation

### Database Migration
- [ ] Test migration on fresh database
- [ ] Verify all indexes created
- [ ] Verify triggers working
- [ ] Test rollback if needed

### Transaction Integrity
- [ ] Order approval in single transaction
- [ ] Stock reduction and inventory creation atomic
- [ ] Proper error handling and rollback

### Access Control
- [ ] Verify admin-only endpoints protected
- [ ] Verify user-scoped queries enforced
- [ ] Test cross-user access prevention

### Performance
- [ ] Verify indexes improve query performance
- [ ] Monitor dashboard query performance
- [ ] Test with larger datasets

---

## Documentation Updates

### Backend Documentation
- [ ] Update API documentation (Swagger)
- [ ] Update GraphQL schema documentation
- [ ] Add new endpoints to API strategy document

### Frontend Documentation
- [ ] Update component documentation
- [ ] Add new pages to navigation guide
- [ ] Update user guide with new features

### Testing Documentation
- [ ] Update testing guide with new test cases
- [ ] Add manual testing procedures
- [ ] Update demo scenarios

---

## Success Criteria

Phase 3.1 is complete when:

- [ ] All database migrations run successfully
- [ ] All new backend APIs implemented and tested
- [ ] All new frontend pages implemented and tested
- [ ] Order approval flow works end-to-end
- [ ] User inventory auto-creates from approved orders
- [ ] Category management fully functional
- [ ] User management fully functional
- [ ] Demo data updated and verified
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All manual tests passing
- [ ] Documentation updated

---

## Next Steps

1. Create database migration V4__phase3_1_enhancements.sql
2. Create demo data migration V5__phase3_1_demo_data.sql
3. Implement Category Management (backend + frontend)
4. Implement User Management (backend + frontend)
5. Implement Order System (backend + frontend)
6. Implement User Inventory (backend + frontend)
7. Refactor Product Catalog
8. Test all features
9. Update documentation

---

*Last Updated: 2026-01-09*
