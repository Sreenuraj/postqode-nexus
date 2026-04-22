# Functional Test Cases — Dynamic UI Pages

> **Scope:** End-to-end journeys across Insights, Command Center, and My Activity  
> **Focus:** User workflows covering tabs, filters, search, drawers, approvals, undo, saved views, and cross-page interactions  
> **Last Updated:** 2026-04-21

---

## Global Prerequisites

| # | Prerequisite | How to Verify |
|---|-------------|---------------|
| P1 | Backend API running on `localhost:8080` | `curl http://localhost:8080/api/v1/products` returns 200 |
| P2 | Frontend running on `localhost:3000` | Login page loads |
| P3 | Rich demo data loaded (V6 migration) | Dashboard shows 30+ products, 30+ orders, 60+ activity logs |
| P4 | Admin user exists (`admin / Admin@123`) | Can log in and access admin nav items |
| P5 | Regular user exists (`user / User@123`) | Can log in and see My Activity nav item |
| P6 | At least 3 orders with status `PENDING` exist | Visible in Command Center queue |

---

## Test 1: Insights — Drill-Down from Overview to Product Detail

**Test ID:** INS-E2E-001  
**Role:** Admin  
**Journey:** Overview metrics → Products tab → Search → Open drawer → Switch drawer tabs → Close drawer

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in as `admin / Admin@123` | Redirected to Dashboard |
| 2 | Click **Insights** in the top navigation | URL is `/insights`, page header shows "Insights" |
| 3 | On Overview tab, observe the 4 metric cards | Values are non-zero (Total Products, Total Orders, Pending Orders, Low-Stock Products) |
| 4 | Observe the area chart below the metrics | Chart renders with a line/area showing orders over time, X-axis has date labels |
| 5 | Click the **Products** tab | Tab becomes active, product grid starts loading |
| 6 | Type "Monitor" in the search input | Grid updates to show only products matching "Monitor" |
| 7 | Click the product card for "Gaming Monitor 27"" | Right-side drawer slides in with title "Gaming Monitor 27"" |
| 8 | In the drawer, observe the Details tab | SKU shows PRD-021, stock bar is visible, status badge is green |
| 9 | Click the **Activity** tab inside the drawer | Activity logs for this product are listed |
| 10 | Click the **Orders** tab inside the drawer | Orders containing this product are listed with quantities and statuses |
| 11 | Click the **X** close button on the drawer | Drawer slides out, product grid is fully visible again |
| 12 | Click the **RefreshCw** icon button in the page header | All content refreshes, skeleton loaders appear briefly |
| 13 | Click **Logout** from the user menu in the top-right | User is logged out, redirected to login page |
| 14 | Close the browser | Browser session ends |

---

## Test 2: Insights — Orders Tab Filter, Expand, and Date Range

**Test ID:** INS-E2E-002  
**Role:** Admin  
**Journey:** Orders tab → Status filter → Search by product name → Expand row → Collapse row → Change date range

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/insights` as admin | Overview tab is active |
| 2 | Click the **Orders** tab | Orders table loads with columns: Order ID, Product, Requester, Qty, Status, Date |
| 3 | Open the **Status** dropdown and select "PENDING" | Table shows only PENDING orders |
| 4 | Clear the Status filter (select "All Status") | All orders are displayed again |
| 5 | Type "Wireless" in the search input | Table filters to orders containing "Wireless" in the product name |
| 6 | Click the **chevron** on the first order row | Row expands below showing full order details including exact order ID, product name, quantity, status, and created date |
| 7 | Click the **chevron** again | Expanded details collapse |
| 8 | Open the **Date Range** dropdown and select "Last 90 days" | Orders table updates to show orders from the last 90 days |
| 9 | Open the **Date Range** dropdown and select "Last 7 days" | Table updates to show only recent orders |
| 10 | Click the **RefreshCw** icon button | Table refreshes with current filter settings |
| 11 | Click **Logout** from the user menu in the top-right | User is logged out, redirected to login page |
| 12 | Close the browser | Browser session ends |

---

## Test 3: Insights — Activity Feed Filter and Load More

**Test ID:** INS-E2E-003  
**Role:** Admin  
**Journey:** Activity tab → Filter by action type → Load more entries → Switch to Login filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/insights` as admin | Page loads on Overview tab |
| 2 | Click the **Activity** tab | Activity feed loads with filter chips: All, Create, Update, Delete, Login |
| 3 | Wait for the feed to populate | At least 10 activity entries are visible with descriptions, timestamps, and badges |
| 4 | Click the **Create** filter chip | Only CREATE activities are shown |
| 5 | Click the **Update** filter chip | Only UPDATE activities are shown |
| 6 | Click the **Login** filter chip | Only LOGIN activities are shown |
| 7 | Click the **All** filter chip | All activity types are shown |
| 8 | Scroll to the bottom of the feed and click **Load more** | Additional activity entries are appended below the existing ones |
| 9 | Click **Load more** again | More entries are appended |
| 10 | Click the **RefreshCw** icon button | Feed resets and reloads from the beginning |
| 11 | Click **Logout** from the user menu in the top-right | User is logged out, redirected to login page |
| 12 | Close the browser | Browser session ends |

---

## Test 4: Command Center — Approve, Undo, and Reject Workflow

**Test ID:** CC-E2E-001  
**Role:** Admin  
**Journey:** Command Center → Approve single order → Undo the approve → Reject single order → Observe queue update → Verify metrics

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in as `admin / Admin@123` | Redirected to Dashboard |
| 2 | Click **Command Center** in the navigation | URL is `/command-center`, two-column layout is visible |
| 3 | Note the "Pending Orders" count in the footer strip | Remember the value |
| 4 | In the Pending Queue, note the first order's ID and product | Remember for verification |
| 5 | Click the **Approve** button on the first pending order | Button shows a loading state, then a success toast appears with an **Undo** action |
| 6 | Observe the Pending Queue | The approved order card is no longer in the queue |
| 7 | Observe the footer metrics | "Pending Orders" count decreased by 1, "Approved Today" increased by 1 |
| 8 | Click the **Undo** button on the toast | The toast dismisses, the order card returns to the Pending Queue |
| 9 | Observe the footer metrics | "Pending Orders" count restored to original value, "Approved Today" decreased by 1 |
| 10 | Click the **Reject** button on that same order | Loading state, then a success toast with **Undo** action |
| 11 | Observe the Pending Queue | The rejected order card is removed |
| 12 | Observe the footer metrics | "Pending Orders" decreased by 1, "Rejected Today" increased by 1 |
| 13 | Navigate to **Order Management** page | The rejected order shows status REJECTED |
| 14 | Click **Logout** from the user menu in the top-right | User is logged out, redirected to login page |
| 15 | Close the browser | Browser session ends |

---

## Test 5: Command Center — Bulk Select and Bulk Approve

**Test ID:** CC-E2E-002  
**Role:** Admin  
**Journey:** Select multiple orders via checkbox → Bulk action bar appears → Approve all → Queue empties → Undo one

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/command-center` as admin | Pending Queue shows at least 3 orders |
| 2 | Click the **checkbox** on the first order card | Card is selected, checkbox is checked |
| 3 | Click the **checkbox** on the second order card | Both cards are selected |
| 4 | Click the **checkbox** on the third order card | Three cards are selected |
| 5 | Observe the bulk action bar | A bar appears showing "3 selected" with "Approve Selected" and "Reject Selected" buttons |
| 6 | Click **Approve Selected** | Success toasts appear for each order, cards are removed from queue |
| 7 | Observe the bulk action bar | Bar disappears when no cards remain selected |
| 8 | Observe the footer metrics | "Pending Orders" shows 0 (or reduced count), "Approved Today" shows the bulk count |
| 9 | Click the **Undo** button on one of the toasts | That single order card returns to the Pending Queue |
| 10 | Observe the footer metrics | "Pending Orders" increased by 1, "Approved Today" decreased by 1 |
| 11 | If queue is now empty, observe the empty state | Shows "No pending orders" with "All caught up!" message |
| 12 | Click **Logout** from the user menu in the top-right | User is logged out, redirected to login page |
| 13 | Close the browser | Browser session ends |

---

## Test 6: Command Center — Product Watchlist Quantity Edit and Drawer

**Test ID:** CC-E2E-003  
**Role:** Admin  
**Journey:** Watchlist search → Quantity stepper → View details drawer → Mark inactive

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/command-center` as admin | Product Watchlist is visible in the right column |
| 2 | Type "Mouse" in the Watchlist search box | Only products with "Mouse" in the name are displayed |
| 3 | Clear the search box | All products are displayed again |
| 4 | Find "Wireless Mouse" and note its current quantity | |
| 5 | Click the **+** button on the quantity stepper twice | Quantity increases by 2 in the UI |
| 6 | Wait briefly | A success toast appears: "Quantity updated for Wireless Mouse" |
| 7 | Click the **-** button once | Quantity decreases by 1 in the UI |
| 8 | Wait briefly | Success toast appears again |
| 9 | Click the **three-dots (⋯)** menu on "Wireless Mouse" | Dropdown opens with "View details" and "Mark inactive" |
| 10 | Click **View details** | Product detail drawer slides in showing full product info |
| 11 | Click the **X** to close the drawer | Drawer closes, back to Command Center |
| 12 | Click the **three-dots** menu again and select **Mark inactive** | Product status changes, toast appears |
| 13 | Click **Logout** from the user menu in the top-right | User is logged out, redirected to login page |
| 14 | Close the browser | Browser session ends |

---

## Test 7: My Activity — Full Timeline Journey with Saved Views

**Test ID:** MA-E2E-001  
**Role:** Regular User (`user / User@123`)  
**Journey:** Timeline view → Apply filters → Expand entry → Cancel pending order → Save view → Apply view → Delete view

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in as `user / User@123` | Redirected to Dashboard |
| 2 | Click **My Activity** in the navigation | URL is `/my-activity` |
| 3 | Observe the timeline | Entries are in reverse chronological order, showing both orders and inventory items |
| 4 | Open the **Type** dropdown and select "Orders" | Only order entries are shown |
| 5 | Open the **Status** dropdown and select "PENDING" | Only PENDING orders are shown |
| 6 | Note the count of PENDING orders in the Summary card on the right | |
| 7 | Click the **expand arrow** on a PENDING order | Entry expands showing "Cancel Order" button |
| 8 | Click **Cancel Order** | Order status changes to CANCELLED |
| 9 | Observe the timeline | The entry now shows CANCELLED status badge |
| 10 | Observe the Summary card | "Pending" count decreased by 1 |
| 11 | Click the **expand arrow** again | Entry collapses |
| 12 | Click **"Save current"** button next to "Saved Views" | Dialog opens asking for view name |
| 13 | Type "Pending Orders" and click **Save** | Dialog closes, "Pending Orders" chip appears in Saved Views |
| 14 | Clear filters: set Type="All Types", Status="All Status" | All entries are shown |
| 15 | Click the **"Pending Orders"** saved view chip | Filters automatically apply: Type="Orders", Status="PENDING" |
| 16 | Right-click the **"Pending Orders"** chip | Options appear including Delete |
| 17 | Click **Delete** | Chip is removed from Saved Views |
| 18 | Refresh the page | The deleted view does not reappear |

---

## Test 8: My Activity — Inventory Consume and Live Stats Update

**Test ID:** MA-E2E-002  
**Role:** Regular User (`user / User@123`)  
**Journey:** Filter to inventory → Expand inventory entry → Consume item → Observe summary update

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/my-activity` as user | Timeline and Summary card are visible |
| 2 | Note the "Inventory Items" count in the Summary card | |
| 3 | Open the **Type** dropdown and select "Inventory" | Only inventory entries are shown |
| 4 | Find an entry with status "ACTIVE" and click its **expand arrow** | Entry expands showing "Consume" button |
| 5 | Click **Consume** | Item is consumed, entry updates (status may change or quantity reduces) |
| 6 | Observe the Summary card | "Inventory Items" count may decrease |
| 7 | Clear the Type filter | All entries are shown again |
| 8 | Apply filter: Date Range = "Last 30 days" | Only entries from last 30 days are shown |
| 9 | Observe the Summary card | Stats recalculate based on the filtered subset |
| 10 | Apply filter: Date Range = "All Time" | All entries shown, Summary reverts to full stats |
| 11 | Click **Logout** from the user menu in the top-right | User is logged out, redirected to login page |
| 12 | Close the browser | Browser session ends |

---

## Test 9: Cross-Page — Insights Product Drawer to Command Center Watchlist

**Test ID:** CROSS-E2E-001  
**Role:** Admin  
**Journey:** Insights → Open product drawer → Note details → Command Center → Find same product → Edit quantity → Verify in Insights

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in as admin | Dashboard loads |
| 2 | Navigate to **Insights** → **Products** tab | Product grid loads |
| 3 | Click on "Desk Organizer" product card | Drawer opens showing quantity = 85 |
| 4 | Close the drawer | |
| 5 | Navigate to **Command Center** | |
| 6 | In Product Watchlist, search for "Desk Organizer" | Product tile appears |
| 7 | Click the **+** button 5 times on the stepper | Quantity shows 90 |
| 8 | Wait for the save toast | "Quantity updated for Desk Organizer" |
| 9 | Navigate back to **Insights** → **Products** tab | |
| 10 | Click on "Desk Organizer" card again | Drawer opens showing updated quantity = 90 |
| 11 | Click **Logout** from the user menu in the top-right | User is logged out, redirected to login page |
| 12 | Close the browser | Browser session ends |

---

## Test 10: My Activity — Search, Type, Status, and Date Combined Filters

**Test ID:** MA-E2E-003  
**Role:** Regular User (`user / User@123`)  
**Journey:** Apply multiple simultaneous filters → Verify timeline updates → Clear filters one by one

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/my-activity` as user | Timeline shows all entries |
| 2 | Type "Mouse" in the search box | Only entries containing "Mouse" are shown |
| 3 | Open the **Type** dropdown and select "Orders" | Only order entries containing "Mouse" are shown |
| 4 | Open the **Status** dropdown and select "APPROVED" | Only APPROVED order entries for "Mouse" are shown |
| 5 | Open the **Date Range** dropdown and select "Last 90 days" | Further narrows to recent entries |
| 6 | Observe the Summary card | Stats reflect the fully filtered subset |
| 7 | Open **Date Range** and select "All Time" | Date filter removed, other filters remain |
| 8 | Open **Status** and select "All Status" | Status filter removed |
| 9 | Open **Type** and select "All Types" | Type filter removed |
| 10 | Clear the search box | All entries are displayed |
| 11 | Click **Logout** from the user menu in the top-right | User is logged out, redirected to login page |
| 12 | Close the browser | Browser session ends |

---

## Appendix: Test Data State

After running V6 migration, the system should have:

| Entity | Count | Notes |
|--------|-------|-------|
| Users | 6+ | Including admin, user, sarah, mike, jessica, david |
| Products | 30 | Mix of ACTIVE, LOW_STOCK, OUT_OF_STOCK |
| Orders | 38 | Mix of PENDING, APPROVED, REJECTED, CANCELLED across 90 days |
| User Inventory | 20 | Items for multiple users, mix of PURCHASED and MANUAL |
| Activity Logs | 61 | All action types spread across 90 days |

---
