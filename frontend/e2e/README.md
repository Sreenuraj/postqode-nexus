# PostQode Nexus E2E & WebMCP Demo Guide

This directory contains end-to-end tests and client presentation demo scripts for **PostQode Nexus**, showcasing the difference between **Traditional Web Automation** and **Google Chrome WebMCP (Web Model Context Protocol)**.

---

## Prerequisites

Ensure the local Nexus stack is running in Docker before executing tests:

```bash
# From repository root
docker compose -f docker/docker-compose.yml up -d
```

Verify services are accessible:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080/api/v1/health
- **Postgres:** `localhost:5432`

---

## Client Demo Scripts

Both demo scripts perform the **exact same complete business lifecycle scenario**:
> **Scenario:**
> 1. **User Session:** Log in as `user` $\rightarrow$ Navigate to `/products` $\rightarrow$ Search & buy product $\rightarrow$ Log out.
> 2. **Admin Session:** Log in as `admin` $\rightarrow$ Navigate to Order Management (`/orders`) $\rightarrow$ Locate pending order $\rightarrow$ Approve order $\rightarrow$ Log out.
> 3. **User Session:** Log back in as `user` $\rightarrow$ Navigate to `/my-orders` $\rightarrow$ Validate order status is `APPROVED`.

### 1. Traditional Flow (`e2e/demo-traditional.spec.ts`)
Demonstrates how traditional web automation handles multi-session lifecycles:
* Relies on **14+ fragile DOM locators** (`#login-input-username`, navbar buttons, `#catalog-table-products`, modal inputs, table row filters, AlertDialog buttons, avatar dropdowns).
* Requires multiple element scrapes, synthetic clicks, and waiting for Radix modal dialog animations.
* Vulnerable to DOM structure changes, CSS refactoring, and UI timing races.

### 2. WebMCP Flow (`e2e/demo-webmcp.spec.ts`)
Demonstrates how next-gen web agents use native Chrome WebMCP:
* Uses `document.modelContext.getTools()` and `document.modelContext.executeTool()`.
* **0 DOM selectors** for page navigation, catalog searching, order placement, admin approval, or order verification.
* Returns typed JSON directly into the agent context with full JSON Schema validation across all 3 user sessions.
* 100% deterministic, zero visual misclicks, and sub-second tool execution.

---

## Available Commands

Run these commands from the `frontend/` directory:

| Command | Description | Mode |
| :--- | :--- | :--- |
| `npm run demo:traditional` | Runs traditional automation with human-visible keystrokes (`SLOWMO=500`) | Headed |
| `npm run demo:webmcp` | Runs WebMCP agent flow with tool logs and toast verification | Headed |
| `npm run demo` | Runs both scripts sequentially for side-by-side comparison | Headed |
| `npm run test:e2e` | Runs all 10 E2E tests (including full WebMCP spec validation) | Headless |
| `npm run test:e2e:headed` | Runs all E2E tests in a visible browser | Headed |
| `npm run test:e2e:ui` | Launches interactive Playwright UI mode for debugging | UI |

---

## Speed & SlowMo Configuration

Adjust execution speed during live demos using the `SLOWMO` environment variable (in milliseconds):

```bash
# Run traditional demo slower (e.g. 800ms pause per click/type for live explanation)
SLOWMO=800 npm run demo:traditional

# Run traditional demo at native speed (benchmark mode)
SLOWMO=0 npm run demo:traditional

# Run full test suite with custom speed
SLOWMO=300 npm run test:e2e:headed
```

---

## Registered WebMCP Tools in Nexus

| Tool Name | Scope | Description | Schema / Annotations |
| :--- | :--- | :--- | :--- |
| `navigate_to_page` | Global (`Layout.tsx`) | Direct client-side router navigation | `path: string` |
| `get_current_user_profile` | Global (`Layout.tsx`) | Current auth state & permissions | `readOnlyHint: true` |
| `logout_user` | Global (`Layout.tsx`) | Log out the authenticated user | `consequentialHint: true` |
| `search_products` | Page (`ProductCatalogPage.tsx`) | Query & filter product catalog | `readOnlyHint: true` |
| `get_product_details` | Page (`ProductCatalogPage.tsx`) | Fetch details for a specific item | `productId: string` |
| `place_order` | Page (`ProductCatalogPage.tsx`) | Submit purchase order directly | `consequentialHint: true` |
| `get_orders` | Page (`OrderManagementPage.tsx`) | List all purchase orders (Admin) | `readOnlyHint: true` |
| `approve_order` | Page (`OrderManagementPage.tsx`) | Admin order approval | `consequentialHint: true` |
| `reject_order` | Page (`OrderManagementPage.tsx`) | Admin order rejection | `consequentialHint: true` |
| `get_my_orders` | Page (`MyOrdersPage.tsx`) | List current user order history | `readOnlyHint: true` |

### Declarative Forms (HTML Form Discovery)
In addition to imperative tools, standard HTML forms expose WebMCP attributes:
* `toolname="user_login"` on `<form id="login-form">`
* `toolname="search_catalog"` on `<form id="catalog-form-search">`
* `toolparamdescription` on form input fields
