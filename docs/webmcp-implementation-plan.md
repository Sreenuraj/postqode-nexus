# WebMCP Integration Plan for PostQode Nexus (Demo-First & Playwright 1.64)

## 1. Executive Summary & Demo-First Strategy

[WebMCP (Web Model Context Protocol)](https://developer.chrome.com/docs/ai/webmcp) is a proposed web standard (Origin Trial from Chrome 149+, flag `chrome://flags/#enable-webmcp-testing`) designed by Google Chrome and W3C WebMachineLearning group. It allows web applications to expose structured tools directly to browser AI agents (Gemini in Chrome, Chrome extensions, PostQode WebAgent, Playwright automation), eliminating flaky DOM scraping and sluggish multi-step actuation.

### Purpose for PostQode Nexus
PostQode Nexus is a customer demo asset and testing platform. The primary goal of WebMCP integration is to empower **PostQode WebAgent demos** with:
1. **Sub-second Tool Execution**: Replace 15-second DOM inspection loops with direct structured tool calls (`document.modelContext.executeTool`).
2. **Visual Actuation ("The WOW Factor")**: When an AI agent executes a tool, the UI visibly illuminates and focuses (`:tool-form-active` glow and `:tool-submit-active` pulse).
3. **100% Deterministic Reliability**: Strict JSON schemas prevent hallucinated form inputs or misclicks on modals.
4. **Dual API Showcase**: Demonstrates both the **Declarative API** (zero-JS HTML form attributes) and **Imperative API** (`registerTool` with `AbortSignal` lifecycle).
5. **Zero Disruption / Progressive Enhancement**: Functions transparently in Docker and standard browsers; non-WebMCP browsers continue operating with zero degradation.

---

## 2. Architecture & API Specifications

### 2.1 WebMCP Standards Overview
- **Registration**: `document.modelContext.registerTool(toolDefinition, { signal })`
- **Discovery**: `document.modelContext.getTools({ fromOrigins: [...] })`
- **Execution**: `document.modelContext.executeTool(tool, args)`
- **Annotations**:
  - `readOnlyHint`: Boolean (indicates tool only reads data, e.g. search).
  - `consequentialHint`: Boolean (indicates high-stakes/irreversible state change, e.g. order placement).
  - `untrustedContentHint`: Boolean (signals tool output includes external/user content).
  - `debugging`: Boolean (marks developer/testing tools).
- **Declarative Form Attributes**:
  - `<form toolname="..." tooldescription="..." toolautosubmit>`
  - `<input toolparamdescription="...">`
  - Submit event extensions: `event.agentInvoked`, `event.respondWith(promise)`.
  - Focus pseudo-classes: `:tool-form-active`, `:tool-submit-active`.

### 2.2 React Lifecycle Integration Architecture
```
┌────────────────────────────────────────────────────────┐
│                   PostQode Nexus                       │
│                   (React + Vite)                       │
├────────────────────────────────────────────────────────┤
│  App.tsx / Layout.tsx                                  │
│  ├── WebMCP Detection & Development Polyfill Shim      │
│  └── Global Tools: 'navigate_to_page', 'get_profile'  │
│                                                        │
│  ProductCatalogPage.tsx                                │
│  ├── useWebMcpTool()                                   │
│  │   ├── 'search_products'                             │
│  │   ├── 'get_product_details'                         │
│  │   └── 'place_order'                                 │
│  └── Declarative Annotations on Search & Order Modal   │
│                                                        │
│  OrderManagementPage.tsx                               │
│  └── useWebMcpTool()                                   │
│      ├── 'get_orders'                                  │
│      └── 'approve_order' / 'reject_order'              │
└────────────────────────────────────────────────────────┘
```

---

## 3. Local Docker Setup & Environment

The full application runs locally via Docker Compose:
- **Database**: PostgreSQL 15 on port `5432` (`nexus-db`)
- **Backend**: Spring Boot 3 on port `8080` (`nexus-backend`)
- **Frontend**: React + Vite on port `3000` / nginx on port `80` (`nexus-frontend`)

### Healthcheck Configuration
Ensure container healthchecks use IPv4 (`http://127.0.0.1:80` and `http://127.0.0.1:8080/actuator/health`) to avoid IPv6 loopback connection refusal on Alpine Linux.

---

## 4. Playwright 1.64 Testing Strategy

Playwright (version `1.64.1`) is configured to run headless/headed Chromium with the WebMCP flag enabled:
```ts
// playwright.config.ts
use: {
  baseURL: 'http://localhost:3000',
  launchOptions: {
    args: ['--enable-features=WebMCPTesting']
  }
}
```

### Automated E2E Test Suite (`frontend/e2e/webmcp.spec.ts`):
1. **ModelContext Availability**: Verifies `document.modelContext` exists and conforms to the spec.
2. **Tool Discovery**: Verifies registered tools (`search_products`, `place_order`, `navigate_to_page`) are returned by `getTools()`.
3. **Imperative Tool Execution**: Executes `search_products` and validates returned catalog items.
4. **Declarative Actuation**: Verifies `<form toolname="...">` receives `:tool-form-active` styling during actuation.
5. **Simulated Agent Flow**: End-to-end autonomous flow where an agent searches for a product and triggers order placement.

---

## 5. Implementation Steps

1. **Fix Docker healthcheck** for `nexus-frontend` (`127.0.0.1`).
2. **Create TypeScript definitions** in `frontend/src/types/webmcp.d.ts`.
3. **Implement WebMCP utilities & fallback polyfill** in `frontend/src/utils/webmcp.ts`.
4. **Implement React Hook** `frontend/src/hooks/useWebMcpTool.ts`.
5. **Annotate UI & Register Tools** in:
   - `frontend/src/components/Layout.tsx` (Global navigation tools)
   - `frontend/src/pages/ProductCatalogPage.tsx` (Catalog search, details, order placement)
   - `frontend/src/pages/OrderManagementPage.tsx` (Order approval/rejection)
6. **Add Actuation Styling** in `frontend/src/index.css` (`:tool-form-active`, `:tool-submit-active`).
7. **Install Playwright 1.64** and write tests in `frontend/e2e/webmcp.spec.ts`.
8. **Run & Validate**: Run Playwright suite and verify test execution against the local Docker instance.
