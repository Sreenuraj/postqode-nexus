# PostQode Web Agent vs WebMCP Agent: Side-by-Side Comparison Demo

This document outlines the live sales and client presentation demo comparing **PostQode's Built-in Web Agent (Traditional DOM Automation)** against the **Custom WebMCP Agent (Google Chrome Web Model Context Protocol)**.

---

## The Demo Prompt

Provide the **exact same prompt** to both agents in PostQode:

> **"Log in as user (`user` / `User@123`), search the catalog for available items, place an order for 1 unit, and log out. Next, log in as admin (`admin` / `Admin@123`), navigate to Order Management, find the pending order, approve it, and log out. Finally, log back in as user, navigate to My Orders, and verify that the order is APPROVED."**

---

## Architectural Comparison

```
+-----------------------------------------------------------------------------------------+
|                                    DEMO PROMPT                                         |
|  "User orders item -> Admin approves order -> User verifies order status is APPROVED"   |
+-----------------------------------------------------------------------------------------+
                                 |                                 |
                                 v                                 v
        +----------------------------------+     +----------------------------------+
        |   Built-in: web-automator        |     |   Custom: webmcp-agent           |
        |   (Traditional DOM Agent)        |     |   (WebMCP ModelContext Agent)    |
        +----------------------------------+     +----------------------------------+
        | - Accessibility tree scraping    |     | - document.modelContext query    |
        | - 14+ CSS / XPath selectors      |     | - Typed JSON Schema validation   |
        | - Simulated mouse clicks         |     | - Direct client-side tool calls  |
        | - Modal dialog animation waits   |     | - 0 DOM locators for operations  |
        | - Scrapes table text for status  |     | - Receives structured JSON data  |
        +----------------------------------+     +----------------------------------+
        | Execution: ~18s (headed)         |     | Execution: ~4.5s (headed)        |
        | Reliability: Fragile to UI drift |     | Reliability: 100% Deterministic  |
        +----------------------------------+     +----------------------------------+
```

---

## Detailed Step-by-Step Breakdown

| Step | Built-in Web Agent (Traditional) | Custom WebMCP Agent (`webmcp-agent`) |
| :---: | :--- | :--- |
| **1. Login** | Locates `#login-input-username`, types keystrokes, clicks `#login-button-submit`. | Discovers declarative `<form toolname="user_login">` or fills credentials. |
| **2. Navigate to Catalog** | Scrapes navbar DOM, finds button inside `nav a[href="/products"]`, simulates mouse click. | Calls `navigate_to_page({ path: '/products' })` directly via router. |
| **3. Search Products** | Clicks `#catalog-input-search`, types query, waits for 300ms debounce. | Calls `search_products({ search: '' })`, receives typed JSON array. |
| **4. Place Order** | Finds table row, clicks `Buy`, waits for Radix modal dialog, types quantity, clicks submit. | Calls `place_order({ productId, quantity: 1 })`. |
| **5. User Logout** | Clicks avatar button `header button.rounded-full`, waits for dropdown, clicks `Logout`. | Calls `logout_user()`. |
| **6. Admin Login** | Fills credentials for `admin`. | Fills credentials for `admin`. |
| **7. Navigate to Orders** | Scrapes navbar, finds and clicks `Order Management`. | Calls `navigate_to_page({ path: '/orders' })`. |
| **8. Approve Order** | Searches table rows for `PENDING` text, clicks check icon, waits for AlertDialog, clicks `Approve`. | Calls `approve_order({ orderId })`. |
| **9. Admin Logout** | Clicks avatar dropdown, clicks `Logout`. | Calls `logout_user()`. |
| **10. User Login** | Fills credentials for `user`. | Fills credentials for `user`. |
| **11. Verify Order** | Navigates to `/my-orders`, scrapes table cells, verifies text contains `APPROVED`. | Calls `get_my_orders()`, verifies `order.status === 'APPROVED'`. |

---

## Live Demo Execution Instructions

### Option A: Trigger via Pre-Configured Playwright Scripts
To demonstrate both execution models with visual browser presentation to an audience:

```bash
# 1. Show the Traditional Agent Flow (keystroke pacing, DOM clicking, modal waits)
npm run demo:traditional

# 2. Show the WebMCP Agent Flow (sub-second, zero misclicks, structured tools)
npm run demo:webmcp

# 3. Or run them back-to-back
npm run demo
```

### Option B: Invoke the Custom PostQode Agent
1. Open the PostQode extension in VS Code.
2. Select **`webmcp-agent`** from the agent dropdown.
3. Paste the demo prompt above.
4. The agent loads the `playwright-cli` and `webmcp-automation` skills, executes the lifecycle workflow, and reports structured receipts.

---

## Key Talking Points for Client Presentations

1. **The Brittle DOM Problem**: Today's web agents spend 80% of their compute trying to guess CSS selectors, avoid misclicks, and handle modal dialog overlays. If a frontend team redesigns a button or renames an ID, the agent breaks.
2. **The WebMCP Solution**: Google Chrome's WebMCP turns web apps into first-class API servers inside the browser. Web agents execute typed tools with JSON Schema validation.
3. **Speed & Efficiency**: WebMCP reduces agent round-trip times by up to **75%** and eliminates 100% of DOM selector drift.
