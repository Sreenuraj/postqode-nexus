# Domain Summary

## Core Entity Relationships
| Entity | Description | Key Relationships |
|---|---|---|
| User | Admin or Standard User account | Creates Orders, owns UserInventory, generates ActivityLog entries |
| Product | Catalog item (SKU, price, quantity, status) | Belongs to Category, referenced by Orders |
| Category | Product grouping | Has many Products |
| Order | A user's purchase request | Belongs to User + Product, has status lifecycle |
| UserInventory | A user's owned items (purchased or manual) | Optionally linked to Product (if PURCHASED) |
| ActivityLog | Audit trail of CREATE/UPDATE/STATE_CHANGE/LOGIN events | References User + optionally Product |

## Cross-Area Workflows

### Order Lifecycle (CROSS-E2E-001)
1. User → Product Catalog → Buy → creates Order (PENDING)
2. Admin → Order Management/Command Center → Approve → Order APPROVED, Product quantity decremented
3. User → My Inventory → item appears (Source PURCHASED)
4. Admin → Dashboard → Order Overview reflects Approved count

### Stock Propagation (CROSS-E2E-003)
1. Admin edits Product quantity/status (via Command Center stepper or Edit Product)
2. User-facing catalog reflects new status/quantity on next load
3. Buy button disabled/absent when OUT_OF_STOCK

_Sources: docs/e2e-test-cases.md §5, database/seeds/V999__demo_data.sql | Last updated: 2026-08-11_
