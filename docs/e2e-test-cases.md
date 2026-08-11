# End-to-End Test Cases — PostQode Nexus (Web Application)

> **Scope:** Complete end-to-end user journeys covering **every feature** available to the **Admin** and **Standard User** roles in the web app (`http://localhost:3000`).
> **Sources:** Live application verification (2026-08-11), `application-functionality.md`, `requirement document.md`, `functional-tests-dynamic-ui.md`, `functional-tests-product-request.md`, `preferences_reference.md`, `insight_CC_myactivity.md`.
> **Companion docs:** Dynamic-page deep dives live in `functional-tests-dynamic-ui.md` (Insights / Command Center / My Activity) and `functional-tests-product-request.md` (Request Wizard). This document is the master E2E catalogue; where a journey overlaps, it references those docs instead of duplicating every step.

---

## 1. Environment & Global Prerequisites

| # | Prerequisite | How to Verify |
|---|--------------|---------------|
| P1 | Backend API running on `localhost:8080` | `curl http://localhost:8080/health` returns `{"status":"UP"}` |
| P2 | Frontend running on `localhost:3000` | `http://localhost:3000/login` loads the login card |
| P3 | Admin account exists | `admin / Admin@123` can log in |
| P4 | Standard user account exists | `user / User@123` can log in |
| P5 | At least one ACTIVE product with stock > 10 exists | Visible in Product Catalog with 🟢 ACTIVE badge |
| P6 | At least one PENDING order exists (for approve/reject/cancel journeys) | Visible in Order Management / Command Center / My Orders |
| P7 | Demo data reset available | `./scripts/reset-demo.sh` restores baseline state |

### 1.1 Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `Admin@123` |
| Standard User | `user` | `User@123` |

### 1.2 Navigation Map (verified against live app)

| Role | Visible Nav Items |
|------|-------------------|
| Admin | Dashboard, Insights, Products, Categories, Users, Order Management, Command Center, Preferences |
| User | Dashboard, Insights, Products, My Orders, My Inventory, My Activity, Request Product, Preferences |
| Both | Avatar menu (top-right): username + role label, **Profile** (disabled), **Logout** |

### 1.3 Automation Conventions (apply to ALL tests)

1. **Locators:** prefer role/name (`getByRole('button', { name: 'Sign In' })`) or `data-testid` (`inventory-button-add`, `command-center-button-approve-${orderId}`). Never index-based locators on mutable lists.
2. **Waiting:** no fixed `waitForTimeout`. Use web-first assertions (`expect(...).toBeVisible()`), `waitForURL`, skeleton/overlay disappearance, or `aria-busy="false"`.
3. **Toasts:** treat as optional assertions; the primary assertion is always the persistent state change.
4. **Overlays (wizard):** after every action wait for the full-page overlay to appear *and* disappear before the next interaction.
5. **Live timestamps:** assert format/pattern (`/\d+m ago/`), never exact text.
6. **State hygiene:** tests that mutate shared data (approve/cancel/consume/delete) must restore state via API or run against freshly seeded data (`./scripts/reset-demo.sh`).
7. **Logout:** every journey ends with Logout via the avatar menu and assertion of redirect to `/login` (except negative/RBAC tests that end differently).

---

## 2. Authentication & Session (Both Roles)

### AUTH-E2E-001 — Admin login success
**Role:** Admin | **Journey:** Login → redirect → welcome toast → admin nav visible

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `http://localhost:3000/login` | Login card shows "POSTQODE NEXUS", "From requirements to reality", Username, Password, Sign In, demo credentials block |
| 2 | Enter `admin` / `Admin@123` | Fields accept input; password is masked |
| 3 | Click **Sign In** | Redirected to `/dashboard`; success toast "Welcome back, admin!" |
| 4 | Inspect navigation | Admin nav items visible: Dashboard, Insights, Products, Categories, Users, Order Management, Command Center, Preferences |
| 5 | Open avatar menu | Shows "admin" + "Administrator"; **Profile** item is disabled; **Logout** present |

### AUTH-E2E-002 — User login success
**Role:** User | **Journey:** Login → user dashboard → user nav visible

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in as `user / User@123` | Redirected to `/dashboard`; toast "Welcome back, user!" |
| 2 | Inspect navigation | User nav items visible: Dashboard, Insights, Products, My Orders, My Inventory, My Activity, Request Product, Preferences |
| 3 | Verify admin-only items absent | Categories, Users, Order Management, Command Center are NOT visible |

### AUTH-E2E-003 — Login failure and validation
**Role:** Anonymous

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Submit empty form | Inline/validation error (username/password required); no navigation |
| 2 | Enter valid username + wrong password, submit | Error message shown (invalid credentials); stays on `/login` |
| 3 | Toggle password show/hide eye button | Password text becomes visible / masked again |
| 4 | Enter correct credentials and submit | Login succeeds (proves recovery from error state) |

### AUTH-E2E-004 — Logout and session termination
**Role:** Any

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open avatar menu → click **Logout** | Redirected to `/login`; toast "You have been logged out" |
| 2 | Press browser Back / navigate to `/dashboard` | Redirected back to `/login` (JWT/session cleared, route protected) |

### AUTH-E2E-005 — Route protection & RBAC enforcement
**Role:** User (negative)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | As `user`, navigate directly to `/categories` | Access denied / redirected (admin-only route not rendered) |
| 2 | Navigate to `/users` | Blocked |
| 3 | Navigate to `/orders` | Blocked |
| 4 | Navigate to `/command-center` | Blocked |
| 5 | Navigate to `/my-orders` | Allowed (user route) |
| 6 | As unauthenticated visitor, navigate to `/products` | Redirected to `/login` |

---

## 3. Admin Journeys

### ADM-E2E-001 — Admin Dashboard analytics
**Role:** Admin | **Journey:** Dashboard metrics, order overview, charts, activity, refresh

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in as admin → `/dashboard` | Heading "Dashboard", subtitle "Real-time inventory analytics and metrics" |
| 2 | Observe summary cards | Total Products, Active, Low Stock, Out of Stock show non-negative integers consistent with catalog |
| 3 | Observe Order Overview | Total Orders, Pending, Approved, Rejected counts shown; Pending + Approved + Rejected ≤ Total |
| 4 | Observe "Products by Status" pie chart | Chart renders with legend ACTIVE / LOW STOCK / OUT OF_STOCK and counts |
| 5 | Observe "Products Added Today" | Number + trend icon rendered |
| 6 | Observe "Activity by User (Last 7 Days)" | Bar list with usernames and action counts |
| 7 | Observe "Recent Activity" | Entries like `admin added "Test Product"` with relative time and action badge (CREATE/UPDATE/…) |
| 8 | Click the refresh icon button (top-right) | Data reloads (skeleton/spinner then settled content); no console errors |

### ADM-E2E-002 — Product Catalog: search, filter, sort, refresh (Admin view)
**Role:** Admin

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/products` | Heading "Product Catalog", "Showing X of Y products", table with columns SKU, Name, Category, Price, Quantity, Status, Actions |
| 2 | Type a known product name fragment in search | Table filters (debounced) to matching rows; count text updates |
| 3 | Clear search | All rows return |
| 4 | Open **All Status** combobox → select a status (e.g., Active) | Only rows with that status badge remain |
| 5 | Open **All Categories** combobox → select a category | Only rows of that category remain |
| 6 | Open sort combobox → change from "Name (A-Z)" to another option (e.g., Price high→low) | Row order changes accordingly |
| 7 | Click refresh icon button | Catalog reloads with filters preserved or reset per implementation; no errors |
| 8 | Verify admin affordances | **Add Product** button visible; each row has a kebab/actions menu button |

### ADM-E2E-003 — Add Product (full CRUD create)
**Role:** Admin

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | On `/products`, click **Add Product** | Product form dialog opens (SKU, Name, Description, Price, Quantity, Category, Status) |
| 2 | Submit empty form | Required-field validation errors; dialog stays open |
| 3 | Fill SKU (unique, e.g. `E2E-<timestamp>`), Name, Price > 0, Quantity ≥ 0, category, status | Fields accept values |
| 4 | Set Quantity = 0 | Status forced/suggested to Out of Stock per auto-status rule |
| 5 | Click **Save** | Dialog closes; success toast "Product added successfully"; new row appears in catalog with correct values and status badge |
| 6 | Navigate to `/dashboard` | Total Products count increased by 1 |
| 7 | Check Recent Activity | CREATE entry for the new product |

### ADM-E2E-004 — Edit Product
**Role:** Admin

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open row actions menu for a known product → **Edit** | Edit dialog pre-filled with current values; SKU read-only |
| 2 | Change Name and Price; Save | Toast "Product updated successfully"; catalog row shows updated values |
| 3 | Verify activity | UPDATE entry recorded (visible in Insights → Activity or dashboard Recent Activity) |

### ADM-E2E-005 — Change Product Status
**Role:** Admin

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open row actions menu → **Change Status** (or status control) | Dialog shows current status and new-status options |
| 2 | Select a different status → **Update** | Toast "Status updated successfully"; badge colour/text updates (🟢//🔴) |
| 3 | Verify dashboard | "Products by Status" distribution reflects the change after refresh |
| 4 | Verify activity | STATE_CHANGE entry with old→new values |

### ADM-E2E-006 — Delete Product
**Role:** Admin

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open row actions menu → **Delete** | Confirmation dialog shows SKU + name and "cannot be undone" warning |
| 2 | Click **Cancel** | Dialog closes; product still present |
| 3 | Open Delete again → click **Delete** | Toast "Product deleted successfully"; row removed from catalog; counts update |

### ADM-E2E-007 — Category Management CRUD
**Role:** Admin | **Page:** `/categories` (table: Name, Description, Created, Actions)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/categories` | Category list renders; **Add Category** button visible |
| 2 | Click **Add Category**, fill Name + Description, Save | New category row appears; toast shown |
| 3 | Edit the category (row action) → change description → Save | Row updates |
| 4 | Assign the category to a product via Edit Product dialog | Product row shows the category; catalog **All Categories** filter includes it |
| 5 | Delete an empty category (row action) with confirmation | Category removed |
| 6 | Attempt delete of a category with products attached | Blocked or warned per business rule (no orphaned products) |

### ADM-E2E-008 — User Management
**Role:** Admin | **Page:** `/users` (table: Username, Email, Role, Status, Created, Actions)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/users` | User list renders with role badges (ADMIN/USER) and status badges (Enabled/Disabled); **Add User** visible |
| 2 | Click **Add User**; fill Username, Email, Password, Role; Save | New user row appears |
| 3 | Edit the user (pencil action) → change role or password → Save | Row updates |
| 4 | Click disable action (user-off icon) on the new user | Status flips to Disabled |
| 5 | Attempt login as the disabled user | Login rejected (account disabled) |
| 6 | Re-enable the user; login succeeds | Status Enabled; login works |

### ADM-E2E-009 — Order Management: approve & reject with stock effects
**Role:** Admin | **Page:** `/orders` (table: Order ID, User, Product, Quantity, Total, Stock, Status, Created, Actions)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/orders` | Orders list shows mixed statuses (PENDING/APPROVED/REJECTED/CANCELLED) |
| 2 | Note a PENDING order's product and current Stock column value | Remember values |
| 3 | Click **Approve** on that order | Status → APPROVED; Stock column decreases by order quantity |
| 4 | Verify catalog quantity | Product quantity reduced accordingly |
| 5 | Click **Reject** on another PENDING order | Status → REJECTED; stock unchanged |
| 6 | Verify no actions on non-pending orders | Approve/Reject buttons only on PENDING rows |
| 7 | Verify dashboard Order Overview | Approved/Rejected counters incremented |

### ADM-E2E-010 — Command Center queue operations
**Role:** Admin | **Page:** `/command-center` | *Detail steps: `functional-tests-dynamic-ui.md` Tests 4–6 (CC-E2E-001…003).*

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open Command Center | Two-column layout: Pending Queue (left) + Product Watchlist (right); footer metrics strip (Pending Orders / Approved Today / Rejected Today) |
| 2 | Approve first pending order | Card removed optimistically; success toast with **Undo**; footer metrics update |
| 3 | Click **Undo** in toast | Order returns to queue; metrics revert |
| 4 | Reject the same order | Card removed; "Rejected Today" +1; order shows REJECTED in `/orders` |
| 5 | Select 2–3 orders via checkboxes | Bulk bar appears with "N selected", **Approve Selected**, **Reject Selected** |
| 6 | Approve Selected | All selected cards removed; metrics reflect bulk count |
| 7 | Watchlist: search "Mouse", clear search | Filtering works |
| 8 | Use +/− quantity stepper on a product | Debounced save toast "Quantity updated for …"; quantity persists (verify in Insights/Products) |
| 9 | Open ⋯ menu → **View details** | Product drawer slides in; close via X |
| 10 | Open ⋯ menu → **Mark inactive** | Product status badge flips to OUT_OF_STOCK |

### ADM-E2E-011 — Insights analytics drill-down
**Role:** Admin | **Page:** `/insights` | *Detail steps: `functional-tests-dynamic-ui.md` Tests 1–3 (INS-E2E-001…003).*

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open Insights → Overview tab | 4 metric cards non-zero-capable; orders-over-time area chart renders with date axis |
| 2 | Change date range (7/30/90 days) | Metrics + chart refetch and update |
| 3 | Products tab: search, status/category filters | Grid filters (debounced search) |
| 4 | Click a product card | Right drawer opens; Details tab shows SKU, stock bar, status badge |
| 5 | Drawer → Activity tab; Drawer → Orders tab | Product-scoped activity logs and orders listed |
| 6 | Close drawer (X) | Grid fully visible again |
| 7 | Orders tab: status filter, product search, expand/collapse row (chevron), date range | Table filters; expanded row shows full order detail |
| 8 | Activity tab: filter chips (All/Create/Update/Delete/Login), **Load more** | Feed filters; load-more appends entries |
| 9 | Refresh button | All panels reload with skeletons then settle |

### ADM-E2E-012 — Preferences (metadata-driven form, all profiles)
**Role:** Admin (also applies to User) | **Page:** `/preferences` | *Reference: `preferences_reference.md`.*

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open Preferences | Form loads after spinner (500–1500 ms); title/subtitle and submit button label from metadata (labels may rotate) |
| 2 | **Personal** profile: fill Display Name (required), bio, avatar color; submit via Save button (`/save/i`) | Spinner 0.8–2.1 s; success toast; "Last updated" timestamp appears/updates |
| 3 | Switch to **Work** profile | displayName value preserved; label may rotate ("Full Name"); jobTitle/department/workPhone fields present |
| 4 | Switch to **Notifications**: set method = email | emailAddress field appears (after dependency re-fetch); set method = sms → email field disappears, phoneNumber appears |
| 5 | Switch to **Localization**: change country (e.g., US → IN) | Region select label updates after stale-label window (~0.6–1.8 s); timezone/dateFormat options present |
| 6 | Submit each valid profile | All save successfully |
| 7 | Verify locators are semantic | No reliance on `fld_*` IDs or rotating label text (they change per fetch) |

---

## 4. Standard User Journeys

### USR-E2E-001 — User Dashboard personal stats
**Role:** User

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in as user → `/dashboard` | Heading "Dashboard", subtitle "Your personal overview" |
| 2 | Observe cards | My Orders, Pending Orders, Total Spend ($ formatted), Inventory Items (N items + "(M units)") |
| 3 | Click **View My Orders** | Navigates to `/my-orders` |
| 4 | Back to dashboard; click **Manage Inventory** | Navigates to `/my-inventory` |
| 5 | Click refresh button | Stats reload consistently with My Orders / My Inventory data |

### USR-E2E-002 — Browse catalog & place order (Buy flow)
**Role:** User

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/products` | Catalog renders; **no** Add Product button; rows show **Buy** button for in-stock items |
| 2 | Use search / status / category / sort controls | Filtering & sorting work identically to admin |
| 3 | Verify out-of-stock product (if present) | Buy button disabled/absent for 🔴 OUT OF STOCK row |
| 4 | Click **Buy** on an ACTIVE product | "Buy Product" dialog: Product name, Price, Available stock, Quantity spinbutton (default 1), live Total = price × qty |
| 5 | Set Quantity = 2 | Total updates to 2 × price |
| 6 | Click **Cancel** | Dialog closes; no order created |
| 7 | Open Buy again → **Place Order** | Dialog closes; success toast; order created with status PENDING |
| 8 | Navigate to `/my-orders` | New PENDING order at top with correct product, quantity, total |
| 9 | Navigate to `/dashboard` | My Orders and Pending Orders counts incremented |

### USR-E2E-003 — My Orders: view & cancel pending
**Role:** User | **Page:** `/my-orders` (table: Order ID, Product, Quantity, Total, Status, Created, Actions)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open My Orders | All own orders listed with status badges |
| 2 | Locate a PENDING order → click **Cancel** | Status → CANCELLED; cancel action no longer available on that row |
| 3 | Verify APPROVED/REJECTED rows | No cancel action present |
| 4 | Verify dashboard | Pending Orders count decreased |

### USR-E2E-004 — My Inventory: view & consume
**Role:** User | **Page:** `/my-inventory` (table: Name, Quantity, Source, Added, Actions)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open My Inventory | Items listed with Source badges (PURCHASED / MANUAL) |
| 2 | Click **Consume Item** on an item with quantity > 1 | Quantity decreases by 1 (after confirmation dialog if present) |
| 3 | Consume an item down to 0 | Item auto-removed from list per business rule |
| 4 | Verify dashboard | Inventory Items count/units updated |

### USR-E2E-005 — My Activity timeline, filters, saved views
**Role:** User | **Page:** `/my-activity` | *Detail steps: `functional-tests-dynamic-ui.md` Tests 7–8, 10 (MA-E2E-001…003).*

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open My Activity | Timeline in reverse-chronological order mixing orders + inventory entries; Summary card on right |
| 2 | Apply Type = Orders, Status = PENDING | Timeline narrows accordingly; Summary recomputes |
| 3 | Expand a PENDING entry → **Cancel Order** | Entry badge becomes CANCELLED; Summary pending count decreases |
| 4 | Expand an inventory entry → **Consume** | Quantity decreases / entry updates |
| 5 | Search "Mouse" + combine Type/Status/Date filters | Combined filtering works; clearing filters one-by-one restores full list |
| 6 | **Save current** view → name it → chip appears | Applying chip re-applies the filter combo |
| 7 | Delete the saved view (chip menu / right-click) | Chip removed; survives page reload (localStorage `nexus:saved-views`) |

### USR-E2E-006 — Request Product Wizard: minimal flow (New Product)
**Role:** User | **Page:** `/product-request` | *Detail steps: `functional-tests-product-request.md` Tests 1, 9–11.*

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open Request Product | 4-step progress indicator; step 1 active; Next disabled until type selected |
| 2 | Click **New Product** card | Overlay "Processing selection..." then card selected (blue border); Next enabled |
| 3 | Next → step 2 "Product Details" | Overlay between steps; enter Product Name, optional Description/Price |
| 4 | Next → step 3 "Justification & Priority" | Budget Range = "Under $100" → approval level "standard", no vendor panel; Urgency = "Standard" → timeline badge "3-5 days" (appears after 2–4 s) |
| 5 | Enter Justification | Char count updates; approval preview "Ready for Review" slides in |
| 6 | Next → step 4 Review | All entered values displayed correctly |
| 7 | **Submit Request** | Overlay "Submitting..." → "Request submitted successfully!"; redirect to `/my-orders` with success toast (handle 10% simulated failure with retry) |

### USR-E2E-007 — Request Wizard: full flow (Similar + executive approval + urgent)
**Role:** User | *Detail steps: `functional-tests-product-request.md` Tests 2, 4–7.*

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select **Similar to Existing** | Category dropdown loads (5 options) |
| 2 | Category = Electronics → Subcategory = Monitors | Chained overlays; subcategory options load; changing category clears subcategory |
| 3 | Step 2: name "4K Gaming Monitor" | Debounced "Searching for similar products..." overlay; similar-products panel with stock badges |
| 4 | Step 3: Budget = "Over $500" | Approval level "executive"; vendor recommendations panel (3 vendors with ratings) |
| 5 | Urgency = Urgent | Delivery date field appears (required); timeline "1-2 days"; Next disabled until date + justification filled |
| 6 | Complete and submit | Review shows all data; submit succeeds; redirect to `/my-orders` |

### USR-E2E-008 — Request Wizard: state preservation & conditional logic
**Role:** User | *Detail steps: `functional-tests-product-request.md` Tests 3, 5, 8.*

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Fill steps 1–3 partially, then **Back** through steps | All values preserved (name, price, quantity, budget, urgency, justification); progress indicator shows completed steps with green checkmarks |
| 2 | Bulk Order type shows **Quantity Needed** field | Bulk-specific field present; quantity persists through Back/Next |
| 3 | Toggle urgency Low → Standard → Urgent | Delivery date field only for Urgent; timeline badge updates (1-2 weeks / 3-5 days / 1-2 days) |
| 4 | Toggle budget Under $100 ↔ $100-$500 ↔ Over $500 | Approval level standard/manager/executive; vendor panel appears only when budget > $100 |

### USR-E2E-009 — User Preferences
**Role:** User | Same coverage as **ADM-E2E-012** (Preferences is available to both roles).

---

## 5. Cross-Role End-to-End Journeys

### CROSS-E2E-001 — Full order lifecycle (User buys → Admin approves → inventory sync)
**Roles:** User + Admin (two sessions) | **The flagship E2E journey**

| Step | Actor | Action | Expected Result |
|------|-------|--------|-----------------|
| 1 | User | Record product quantity Q from catalog | Remember Q |
| 2 | User | Buy 2 units → Place Order | Order PENDING in My Orders |
| 3 | Admin | Open `/orders` | New PENDING order visible with User, Product, Qty 2, Stock Q |
| 4 | Admin | **Approve** the order | Status APPROVED; Stock = Q−2 |
| 5 | User | Refresh catalog | Product quantity shows Q−2 |
| 6 | User | Open My Inventory | Item present (Source PURCHASED) with quantity merged (+2 if pre-existing entry) |
| 7 | User | Open Dashboard | Total Spend includes order value; Inventory Items updated; Pending Orders decremented |
| 8 | Admin | Open Dashboard | Order Overview Approved +1; Recent Activity shows approval-related entries |

### CROSS-E2E-002 — User cancels; admin sees cancellation
**Roles:** User + Admin

| Step | Actor | Action | Expected Result |
|------|-------|--------|-----------------|
| 1 | User | Place order (PENDING) | Visible in My Orders |
| 2 | Admin | Verify order PENDING in `/orders` and Command Center queue | Present in both |
| 3 | User | Cancel the order in My Orders (or via My Activity expand → Cancel Order) | Status CANCELLED |
| 4 | Admin | Refresh `/orders` / Command Center | Order gone from pending queue; status CANCELLED; stock unchanged |

### CROSS-E2E-003 — Admin stock edit propagates to user-facing views
**Roles:** Admin + User

| Step | Actor | Action | Expected Result |
|------|-------|--------|-----------------|
| 1 | Admin | Command Center watchlist stepper: set product quantity to 0 (or edit product quantity to 0) | Status becomes OUT_OF_STOCK after save |
| 2 | User | Open catalog | Product shows 🔴 OUT OF STOCK; Buy disabled/absent |
| 3 | Admin | Restore quantity > 10 | Status ACTIVE; user can Buy again |

### CROSS-E2E-004 — Insights ↔ Command Center consistency
**Role:** Admin | *Reference: `functional-tests-dynamic-ui.md` Test 9 (CROSS-E2E-001).*

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Insights → Products: note a product's quantity in drawer | Value X |
| 2 | Command Center: stepper +5 on same product, wait for save toast | Quantity X+5 |
| 3 | Insights → Products: reopen drawer | Shows X+5 (cross-page state consistency) |

---

## 6. Negative & Edge-Case Tests

| Test ID | Scenario | Expected |
|---------|----------|----------|
| NEG-E2E-001 | User navigates to admin routes (`/categories`, `/users`, `/orders`, `/command-center`) | Blocked/redirected; no admin data rendered |
| NEG-E2E-002 | Admin UI shows no user-only nav (My Orders, My Inventory, My Activity, Request Product) | Items absent (admin uses Order Management instead) |
| NEG-E2E-003 | Buy quantity > available stock | Validation error or clamped; order not placed with invalid qty |
| NEG-E2E-004 | Buy on OUT_OF_STOCK product | Buy disabled; no dialog |
| NEG-E2E-005 | Approve order when stock < order qty | Blocked with error message; stock unchanged (business rule) |
| NEG-E2E-006 | Cancel a non-PENDING order | No cancel action available |
| NEG-E2E-007 | Login with disabled account | Rejected with clear error |
| NEG-E2E-008 | Duplicate SKU on Add Product | Validation error; product not created |
| NEG-E2E-009 | Wizard submit failure (10% simulated) | Error toast "Failed to submit request. Please try again."; retry succeeds |
| NEG-E2E-010 | Deep-link to `/product-request` as admin | Route allowed but nav hidden (per implementation `show: !isAdmin`); verify graceful render or redirect per product decision |

---

## 7. Demo-Flow Regression Suites

### 7.1 Admin 5-minute demo (maps to journeys above)
AUTH-E2E-001 → ADM-E2E-002 → ADM-E2E-003 → ADM-E2E-005 → ADM-E2E-009 → ADM-E2E-001 → AUTH-E2E-004

### 7.2 User 3-minute demo
AUTH-E2E-002 → USR-E2E-002 → USR-E2E-003 → USR-E2E-004 → AUTH-E2E-004

---

## Appendix A — Stable Selector Reference (verified / documented)

| Area | Selectors |
|------|-----------|
| Login | `login-input-username`, `login-input-password`, `login-button-submit` (or roles) |
| Catalog | `catalog-input-search`, status/category/sort comboboxes, `inventory-button-add`, row kebab menus |
| Inventory dialogs | `inventory-form-product`, `inventory-button-save`, `inventory-button-edit-{id}`, `inventory-button-delete-{id}` |
| Insights | `insights-tab-*`, `insights-select-range`, `insights-card-product-${id}`, `insights-row-order-${id}`, `insights-chip-activity-${type}`, `insights-button-load-more`, `insights-drawer-tab-*` |
| Command Center | `command-center-card-${orderId}`, `command-center-checkbox-${orderId}`, `command-center-button-approve-${orderId}`, `command-center-button-reject-${orderId}`, `command-center-button-bulk-approve/reject`, `command-center-stepper-${productId}` |
| My Activity | `my-activity-input-search`, `my-activity-select-type/status/date`, `my-activity-timeline-${id}`, `my-activity-expand-${id}`, `my-activity-button-cancel-${id}`, `my-activity-button-consume-${id}`, `my-activity-button-save-view`, `my-activity-chip-${viewId}` |
| Wizard | Semantic locators only (labels/roles/headings) — all IDs are dynamic |
| Preferences | Semantic locators only (`logicalKey`-based, role `/save/i`) — fieldIds/labels rotate |

## Appendix B — Wait-Strategy Snippets

```typescript
// Wizard overlay settle
await expect(page.getByText(/Processing|Loading|Calculating|Submitting/)).toBeVisible();
await expect(page.getByText(/Processing|Loading|Calculating|Submitting/)).toBeHidden();

// Debounced catalog search
await catalogSearch.fill('Mouse');
await expect(rowLocator).toContainText('Mouse'); // retries until debounce + fetch settle

// Optimistic approve: wait for in-flight end, then assert absence by ID
await expect(approveBtn).toHaveAttribute('aria-busy', 'false');
await expect(page.getByTestId(`command-center-card-${orderId}`)).toHaveCount(0);
```

## Appendix C — Test Data Notes

- Baseline seed: 20 products (10 ACTIVE / 6 LOW_STOCK / 4 OUT_OF_STOCK), users admin/user (+ demo users sarah, mike, jessica, david), orders across statuses, activity logs — see `database/seeds/V999__demo_data.sql` and `testing-guide.md`.
- Reset between full-suite runs: `./scripts/reset-demo.sh`.
- Wizard + Preferences use simulated latency/mock data; assertions must be timing-tolerant.

---

*Document maintained by PostQode Team — generated 2026-08-11 from live-app verification + docs corpus.*
