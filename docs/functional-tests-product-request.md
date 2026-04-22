# Functional Test Cases — Product Request Wizard

> **Scope:** End-to-end journeys through the Product Request Wizard page  
> **Focus:** Multi-step form with dynamic UI, chained dependencies, loading overlays, and conditional rendering  
> **Last Updated:** 2026-04-22

---

## Global Prerequisites

| # | Prerequisite | How to Verify |
|---|-------------|---------------|
| P1 | Backend API running on `localhost:8080` | `curl http://localhost:8080/api/v1/products` returns 200 |
| P2 | Frontend running on `localhost:3000` | Login page loads |
| P3 | Regular user exists (`user / User@123`) | Can log in and see "Request Product" in navigation |
| P4 | Product Request Wizard accessible | Navigate to `/product-request` shows wizard page |

---

## Test 1: Minimal Request Flow (New Product, Standard Approval)

**Test ID:** PRW-E2E-001  
**Role:** Regular User (`user / User@123`)  
**Journey:** Select "New Product" → Fill minimal fields → Submit

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in as `user / User@123` | Redirected to Dashboard |
| 2 | Click **Request Product** in the navigation | URL is `/product-request`, wizard page loads with step 1 |
| 3 | Observe the progress indicator | Shows 4 steps, step 1 is active (blue), others are inactive (gray) |
| 4 | Click the **"New Product"** card | Full-page overlay appears with "Processing selection..." |
| 5 | Wait for overlay to disappear | Overlay disappears after 400-700ms, "New Product" card is selected (blue border) |
| 6 | Observe the "Next" button | Button is enabled (request type selected) |
| 7 | Click **Next** | Overlay appears with "Preparing next step...", then step 2 loads |
| 8 | Wait for overlay to disappear | Step 2 heading "Product Details" is visible, progress indicator shows step 2 active |
| 9 | Type "Test Product" in the **Product Name** field | Text appears in input field |
| 10 | Wait 2 seconds | No similar products panel appears (name too generic or debounce not triggered) |
| 11 | Click **Next** | Overlay appears, then step 3 loads |
| 12 | Wait for overlay to disappear | Step 3 heading "Justification & Priority" is visible |
| 13 | Select **"Under $100"** from Budget Range dropdown | Overlay appears with "Determining approval requirements..." |
| 14 | Wait for overlay to disappear | Approval Level badge shows "standard", no vendor panel (budget < $100) |
| 15 | Select **"Standard"** from Urgency dropdown | Overlay appears with "Calculating timeline..." |
| 16 | Wait for overlay to disappear | Urgency selected, no delivery date field (not urgent) |
| 17 | Wait 3 seconds | Timeline badge appears: "Estimated Timeline: 3-5 days" |
| 18 | Type "Test justification for automation" in **Justification** field | Text appears, character count updates |
| 19 | Wait 2 seconds | Approval preview panel appears: "Ready for Review" |
| 20 | Click **Next** | Overlay appears, then step 4 loads |
| 21 | Wait for overlay to disappear | Step 4 heading "Review Your Request" is visible |
| 22 | Verify request type shows "new" | Request Type section shows "new" |
| 23 | Verify product name shows "Test Product" | Product Details section shows "Test Product" |
| 24 | Verify budget range shows "Under $100" | Justification section shows budget range |
| 25 | Click **Submit Request** | Overlay appears with "Submitting your request..." |
| 26 | Wait for overlay message to change | Message changes to "Request submitted successfully!" |
| 27 | Wait for redirect | Redirected to `/my-orders`, success toast appears with request ID |
| 28 | Click **Logout** from the user menu | User is logged out, redirected to login page |

---

## Test 2: Full Request Flow (Similar Product, Executive Approval)

**Test ID:** PRW-E2E-002  
**Role:** Regular User (`user / User@123`)  
**Journey:** Select "Similar to Existing" → Navigate category chain → Fill all fields → Submit

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/product-request` as user | Wizard page loads on step 1 |
| 2 | Click the **"Similar to Existing"** card | Overlay appears with "Processing selection..." |
| 3 | Wait for overlay to disappear | Card selected, overlay changes to "Loading categories..." |
| 4 | Wait for second overlay to disappear | Category dropdown appears with 5 options |
| 5 | Open the **Category** dropdown and select "Electronics" | Overlay appears with "Loading subcategories..." |
| 6 | Wait for overlay to disappear | Subcategory dropdown appears with 4 options (Monitors, Keyboards, Mice, Webcams) |
| 7 | Open the **Subcategory** dropdown and select "Monitors" | Overlay appears with "Checking for related products..." |
| 8 | Wait for overlay to disappear | Subcategory selected, "Next" button is still disabled (need product name) |
| 9 | Click **Next** | Button is disabled, nothing happens |
| 10 | Type "4K Gaming Monitor" in the **Product Name** field | Text appears in input |
| 11 | Wait 1 second | Overlay appears with "Searching for similar products..." |
| 12 | Wait for overlay to disappear | Similar products panel appears showing matches |
| 13 | Observe similar products panel | Shows up to 3 similar products with stock status badges |
| 14 | Type "High refresh rate monitor for gaming" in **Description** | Text appears |
| 15 | Type "599.99" in **Estimated Price** field | Value appears |
| 16 | Click **Next** | Overlay appears, step 3 loads |
| 17 | Wait for overlay to disappear | Step 3 heading visible, all fields empty |
| 18 | Select **"Over $500"** from Budget Range | Overlay appears with "Determining approval requirements..." |
| 19 | Wait for overlay to disappear | Approval Level shows "executive", overlay changes to "Loading vendor options..." |
| 20 | Wait for second overlay to disappear | Vendor recommendations panel appears with 3 vendors |
| 21 | Observe vendor panel | Shows vendor names with star ratings |
| 22 | Select **"Urgent"** from Urgency dropdown | Overlay appears with "Calculating timeline..." |
| 23 | Wait for overlay to disappear | Delivery date field appears (required for urgent) |
| 24 | Wait 3 seconds | Timeline badge appears: "Estimated Timeline: 1-2 days" |
| 25 | Select tomorrow's date in **Required Delivery Date** | Date selected |
| 26 | Type "Needed for new developer workstation setup. Current monitors are outdated and causing productivity issues." in **Justification** | Text appears, character count shows ~120 characters |
| 27 | Wait 2 seconds | Approval preview panel appears: "Ready for Review" with "executive approval" |
| 28 | Click **Next** | Overlay appears, step 4 loads |
| 29 | Wait for overlay to disappear | Review page shows all entered data |
| 30 | Verify all details are correct | Request type, product details, and justification all match entered data |
| 31 | Click **Submit Request** | Overlay appears with "Submitting your request..." |
| 32 | Wait for overlay message to change | Message changes to "Request submitted successfully!" after 2-3 seconds |
| 33 | Wait for redirect | Redirected to `/my-orders` with success toast |
| 34 | Click **Logout** | User logged out |

---

## Test 3: Bulk Order Flow with Back Navigation

**Test ID:** PRW-E2E-003  
**Role:** Regular User (`user / User@123`)  
**Journey:** Select "Bulk Order" → Fill fields → Go back → Change values → Submit

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/product-request` as user | Wizard on step 1 |
| 2 | Click the **"Bulk Order"** card | Overlay appears, then card selected |
| 3 | Wait for overlay to disappear | "Bulk Order" card has blue border |
| 4 | Click **Next** | Overlay appears, step 2 loads |
| 5 | Wait for overlay to disappear | Step 2 visible with "Quantity Needed" field (bulk-specific) |
| 6 | Type "Office Chairs" in **Product Name** | Text appears |
| 7 | Wait 1 second | Overlay appears searching for similar products |
| 8 | Wait for overlay to disappear | Similar products panel may or may not appear |
| 9 | Type "50" in **Quantity Needed** field | Value appears |
| 10 | Type "250" in **Estimated Price** field | Value appears |
| 11 | Click **Next** | Overlay appears, step 3 loads |
| 12 | Wait for overlay to disappear | Step 3 visible |
| 13 | Select **"$100 - $500"** from Budget Range | Overlay appears, approval level shows "manager" |
| 14 | Wait for overlay to disappear | Vendor panel appears (budget > $100) |
| 15 | Click **Back** | Overlay appears with "Going back..." |
| 16 | Wait for overlay to disappear | Back on step 2, all fields retain values |
| 17 | Change **Quantity Needed** to "75" | Value updates |
| 18 | Click **Next** | Overlay appears, step 3 loads |
| 19 | Wait for overlay to disappear | Step 3 visible, budget range still selected |
| 20 | Select **"Low Priority"** from Urgency | Overlay appears |
| 21 | Wait for overlay to disappear | Urgency selected, no delivery date field |
| 22 | Wait 3 seconds | Timeline badge appears: "Estimated Timeline: 1-2 weeks" |
| 23 | Type "Bulk order for office renovation project" in **Justification** | Text appears |
| 24 | Wait 2 seconds | Approval preview appears |
| 25 | Click **Next** | Overlay appears, step 4 loads |
| 26 | Wait for overlay to disappear | Review shows quantity = 75 |
| 27 | Click **Submit Request** | Overlay appears, submits |
| 28 | Wait for completion | Redirected to `/my-orders` |
| 29 | Click **Logout** | User logged out |

---

## Test 4: Chained Dependencies - Category to Subcategory Flow

**Test ID:** PRW-E2E-004  
**Role:** Regular User (`user / User@123`)  
**Journey:** Test the full category → subcategory chain with multiple selections

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/product-request` as user | Wizard on step 1 |
| 2 | Click **"Similar to Existing"** card | Overlay appears |
| 3 | Wait for overlay to disappear | Category dropdown appears |
| 4 | Select **"Office Supplies"** from Category | Overlay appears with "Loading subcategories..." |
| 5 | Wait for overlay to disappear | Subcategory dropdown shows 3 options (Pens & Pencils, Paper Products, Organizers) |
| 6 | Select **"Organizers"** from Subcategory | Overlay appears with "Checking for related products..." |
| 7 | Wait for overlay to disappear | Subcategory selected |
| 8 | Click **Back** to Category dropdown | Overlay appears |
| 9 | Wait for overlay to disappear | Still on step 1 (Back button doesn't change steps) |
| 10 | Change Category to **"Furniture"** | Overlay appears, subcategory dropdown clears |
| 11 | Wait for overlay to disappear | Subcategory dropdown shows 3 new options (Desks, Chairs, Storage) |
| 12 | Verify previous subcategory is cleared | Subcategory dropdown shows placeholder "Select a subcategory" |
| 13 | Select **"Chairs"** from Subcategory | Overlay appears |
| 14 | Wait for overlay to disappear | Subcategory selected |
| 15 | Type "Ergonomic Office Chair" in Product Name (after clicking Next) | Name entered |
| 16 | Complete the wizard with minimal data | Submit successfully |
| 17 | Click **Logout** | User logged out |

---

## Test 5: Conditional Fields - Urgency Drives Delivery Date

**Test ID:** PRW-E2E-005  
**Role:** Regular User (`user / User@123`)  
**Journey:** Test urgency-driven conditional rendering of delivery date field

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/product-request` as user | Wizard on step 1 |
| 2 | Select "New Product" and proceed to step 3 | On step 3 after filling step 2 |
| 3 | Select **"Under $100"** from Budget Range | Overlay appears, approval level "standard" |
| 4 | Wait for overlay to disappear | No vendor panel (budget < $100) |
| 5 | Select **"Low Priority"** from Urgency | Overlay appears |
| 6 | Wait for overlay to disappear | No delivery date field visible |
| 7 | Wait 3 seconds | Timeline badge appears: "1-2 weeks" |
| 8 | Change Urgency to **"Standard"** | Overlay appears |
| 9 | Wait for overlay to disappear | Still no delivery date field |
| 10 | Wait 3 seconds | Timeline badge updates: "3-5 days" |
| 11 | Change Urgency to **"Urgent"** | Overlay appears |
| 12 | Wait for overlay to disappear | Delivery date field appears (required) |
| 13 | Wait 3 seconds | Timeline badge updates: "1-2 days" |
| 14 | Observe "Next" button | Button is disabled (delivery date required but not filled) |
| 15 | Select tomorrow's date in **Required Delivery Date** | Date selected |
| 16 | Type justification text | Text entered |
| 17 | Observe "Next" button | Button is now enabled |
| 18 | Complete wizard and submit | Request submitted successfully |
| 19 | Click **Logout** | User logged out |

---

## Test 6: Debounced Search - Similar Products Panel

**Test ID:** PRW-E2E-006  
**Role:** Regular User (`user / User@123`)  
**Journey:** Test debounced product name search and similar products panel

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/product-request` as user, proceed to step 2 | On step 2 |
| 2 | Type "M" in **Product Name** field | Single character entered |
| 3 | Wait 1 second | No overlay appears (< 3 characters) |
| 4 | Type "ou" (completing "Mou") | Now 3 characters |
| 5 | Wait 1 second | Overlay appears with "Searching for similar products..." |
| 6 | Wait for overlay to disappear | Similar products panel appears showing "Wireless Mouse" |
| 7 | Observe panel contents | Shows product name and stock status badge |
| 8 | Continue typing "se" (completing "Mouse") | Text updates |
| 9 | Wait 1 second | Overlay appears again (debounce triggered) |
| 10 | Wait for overlay to disappear | Similar products panel updates with refined results |
| 11 | Clear the field and type "XYZ" | Text entered |
| 12 | Wait 1 second | Overlay appears |
| 13 | Wait for overlay to disappear | Similar products panel disappears (no matches) |
| 14 | Type "Keyboard" | Text entered |
| 15 | Wait 1 second | Overlay appears |
| 16 | Wait for overlay to disappear | Similar products panel appears showing "Mechanical Keyboard" |
| 17 | Complete wizard and submit | Request submitted |
| 18 | Click **Logout** | User logged out |

---

## Test 7: Budget-Driven Approval Level and Vendor Panel

**Test ID:** PRW-E2E-007  
**Role:** Regular User (`user / User@123`)  
**Journey:** Test budget range driving approval level and vendor recommendations

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/product-request` as user, proceed to step 3 | On step 3 |
| 2 | Select **"Under $100"** from Budget Range | Overlay appears |
| 3 | Wait for overlay to disappear | Approval Level badge shows "standard", no vendor panel |
| 4 | Change Budget Range to **"$100 - $500"** | Overlay appears with "Determining approval requirements..." |
| 5 | Wait for overlay to disappear | Approval Level changes to "manager", overlay changes to "Loading vendor options..." |
| 6 | Wait for second overlay to disappear | Vendor recommendations panel appears with 3 vendors |
| 7 | Observe vendor panel | Shows vendor names with star ratings (e.g., "TechSupply Co ★ 4.5") |
| 8 | Change Budget Range to **"Over $500"** | Overlay appears |
| 9 | Wait for overlay to disappear | Approval Level changes to "executive", vendor panel updates |
| 10 | Observe vendor panel | May show different vendors (all vendors, not just budget-friendly) |
| 11 | Change Budget Range back to **"Under $100"** | Overlay appears |
| 12 | Wait for overlay to disappear | Approval Level back to "standard", vendor panel disappears |
| 13 | Complete wizard and submit | Request submitted |
| 14 | Click **Logout** | User logged out |

---

## Test 8: Back Navigation Preserves State

**Test ID:** PRW-E2E-008  
**Role:** Regular User (`user / User@123`)  
**Journey:** Fill wizard, navigate back through steps, verify data persists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/product-request` as user | Wizard on step 1 |
| 2 | Select "New Product" and proceed to step 2 | On step 2 |
| 3 | Type "Test Product Alpha" in Product Name | Text entered |
| 4 | Type "Test description" in Description | Text entered |
| 5 | Type "99.99" in Estimated Price | Value entered |
| 6 | Click **Next** to step 3 | On step 3 |
| 7 | Select "Under $100" from Budget Range | Selected |
| 8 | Wait for overlay to disappear | Approval level shows |
| 9 | Select "Standard" from Urgency | Selected |
| 10 | Wait for overlay to disappear | Urgency selected |
| 11 | Type "Test reason" in Justification | Text entered |
| 12 | Click **Back** | Overlay appears, returns to step 2 |
| 13 | Wait for overlay to disappear | Step 2 visible |
| 14 | Verify Product Name still shows "Test Product Alpha" | Data persisted |
| 15 | Verify Description still shows "Test description" | Data persisted |
| 16 | Verify Estimated Price still shows "99.99" | Data persisted |
| 17 | Click **Back** again | Returns to step 1 |
| 18 | Wait for overlay to disappear | Step 1 visible |
| 19 | Verify "New Product" card is still selected | Selection persisted |
| 20 | Click **Next** twice to return to step 3 | Back on step 3 |
| 21 | Wait for overlays to disappear | Step 3 visible |
| 22 | Verify Budget Range still shows "Under $100" | Data persisted |
| 23 | Verify Urgency still shows "Standard" | Data persisted |
| 24 | Verify Justification still shows "Test reason" | Data persisted |
| 25 | Complete wizard and submit | Request submitted |
| 26 | Click **Logout** | User logged out |

---

## Test 9: Auto-Save Functionality

**Test ID:** PRW-E2E-009  
**Role:** Regular User (`user / User@123`)  
**Journey:** Verify auto-save triggers and updates timestamp

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/product-request` as user, proceed to step 2 | On step 2 |
| 2 | Type "Auto-save Test Product" in Product Name | Text entered |
| 3 | Wait 15 seconds | Auto-save may trigger (random 5-15s interval) |
| 4 | Proceed to step 4 (review) | On step 4 |
| 5 | Observe bottom of review section | May show "Last auto-saved: [time]" if auto-save triggered |
| 6 | Wait 15 more seconds | Timestamp may update |
| 7 | Note: Auto-save is non-deterministic | Test should not fail if timestamp doesn't appear |
| 8 | Complete wizard and submit | Request submitted |
| 9 | Click **Logout** | User logged out |

---

## Test 10: Submit Failure and Retry

**Test ID:** PRW-E2E-010  
**Role:** Regular User (`user / User@123`)  
**Journey:** Handle submit failure (10% chance) and retry

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/product-request` as user | Wizard on step 1 |
| 2 | Complete wizard with minimal data | On step 4 (review) |
| 3 | Click **Submit Request** | Overlay appears with "Submitting your request..." |
| 4 | Wait for result | Either success (90% chance) or error toast (10% chance) |
| 5 | If error toast appears: | Error message: "Failed to submit request. Please try again." |
| 6 | Click **Submit Request** again | Overlay appears again |
| 7 | Wait for result | Should succeed on retry (or retry again if unlucky) |
| 8 | Verify redirect | Redirected to `/my-orders` with success toast |
| 9 | Click **Logout** | User logged out |

---

## Test 11: Progress Indicator Visual States

**Test ID:** PRW-E2E-011  
**Role:** Regular User (`user / User@123`)  
**Journey:** Verify progress indicator updates correctly through all steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/product-request` as user | Wizard on step 1 |
| 2 | Observe progress indicator | Step 1: blue circle with "1", Steps 2-4: gray circles, no green checkmarks |
| 3 | Select request type and click Next | Overlay appears, step 2 loads |
| 4 | Wait for overlay to disappear | Step 1: green circle with checkmark, Step 2: blue circle with "2", Steps 3-4: gray |
| 5 | Fill product name and click Next | Overlay appears, step 3 loads |
| 6 | Wait for overlay to disappear | Steps 1-2: green checkmarks, Step 3: blue circle with "3", Step 4: gray |
| 7 | Fill justification fields and click Next | Overlay appears, step 4 loads |
| 8 | Wait for overlay to disappear | Steps 1-3: green checkmarks, Step 4: blue circle with "4" |
| 9 | Click **Back** | Returns to step 3 |
| 10 | Wait for overlay to disappear | Steps 1-2: green checkmarks, Step 3: blue circle, Step 4: gray (no longer completed) |
| 11 | Click **Next** | Returns to step 4 |
| 12 | Wait for overlay to disappear | Steps 1-3: green checkmarks, Step 4: blue circle |
| 13 | Submit request | Request submitted |
| 14 | Click **Logout** | User logged out |

---

## Appendix: Overlay Wait Strategy

For all tests, use this pattern after every action:

```typescript
async function waitForOverlayComplete(page) {
  // Wait for overlay to appear (optional - may already be visible)
  try {
    await page.waitForSelector('[class*="z-50"]', { timeout: 1000 });
  } catch {
    // Overlay may not appear for some actions
  }
  
  // Wait for overlay to disappear
  await page.waitForSelector('[class*="z-50"]', { state: 'hidden', timeout: 5000 });
  
  // Small buffer for content to settle
  await page.waitForTimeout(100);
}
```

---

## Appendix: Test Data State

The Product Request Wizard uses mock data (no backend persistence). All data is simulated with variable delays.

| Mock Data | Count | Notes |
|-----------|-------|-------|
| Categories | 5 | Electronics, Office Supplies, Furniture, Software, Hardware |
| Subcategories | 3-4 per category | Varies by category |
| Similar Products | 8 | Filtered by search term |
| Vendors | 6 | Filtered by budget range |

---

*Document maintained by PostQode Team*
*Last updated: 2026-04-22*
