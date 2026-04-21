# Implementation Plan — Dynamic UI Pages (Web Frontend)

> Branch: `feature/dynamic-ui-pages`
> Scope: **Web frontend only** (`frontend/`). No mobile, no backend changes.
> Status: **DRAFT — awaiting approval before implementation.**

---

## 1. Context — What the Existing App Is

**PostQode Nexus** is an inventory & product management web app.

**Stack (verified from source):**
- React 18 + TypeScript + Vite
- React Router v6 (`BrowserRouter`, nested routes under a `Layout`)
- Tailwind CSS + shadcn/ui (Radix primitives) — components in `frontend/src/components/ui/`
- Auth via `AuthContext` (JWT in `localStorage`, `isAdmin` flag, `ProtectedRoute` with optional `requireAdmin`)
- Data layer: Axios (`src/services/api.ts`) for REST + a `graphql.ts` service used by the dashboard
- Notifications: `sonner` toast (`richColors`, `top-right`)
- Charts: `recharts`
- Forms: `react-hook-form` + `zod` + `@hookform/resolvers`
- Icons: `lucide-react`

**Existing pages:**
`LoginPage`, `DashboardPage`, `ProductCatalogPage`, `CategoriesPage` (admin), `UsersPage` (admin), `OrderManagementPage` (admin), `MyOrdersPage` (user), `MyInventoryPage` (user).

**Established patterns to mirror exactly:**
- Page header block: `h1.text-3xl.font-bold.tracking-tight` + `p.text-slate-500.mt-1` subtitle + right-aligned primary action.
- Filter row: `Input` with leading `Search` icon, `Select` dropdowns, a trailing icon-only `RefreshCw` button.
- Tables wrapped in `div.border.rounded-lg` (or `rounded-md border bg-white`) using `Table/TableHeader/TableBody`.
- Skeleton loaders: `Array.from({ length: 5 }).map` → `<Skeleton />` rows during fetch.
- Empty states: single full-row cell with centered icon + message.
- Pagination: `Previous / Next` `Button variant="outline"` with `page X of Y`.
- Dialogs: `Dialog` from `components/ui/dialog`, `DialogHeader > DialogTitle`, body (`space-y-4 py-4`), `DialogFooter` with `Cancel` + primary button.
- Row / action menus: `DropdownMenu` with `MoreVertical` trigger.
- Badges: shadcn `Badge` with `default / secondary / destructive / outline` variants, sometimes prefixed with an emoji icon.
- Admin/User divergence in `Layout.tsx` `navItems` via `show: isAdmin` / `show: !isAdmin`.
- IDs follow the convention `<page>-<component>-<purpose>` (e.g. `catalog-input-search`, `dashboard-card-total`, `catalog-row-${id}`). New pages will follow the same.
- `space-y-6` vertical rhythm for page sections.
- Debounced search via `setTimeout` + `clearTimeout` in a `useEffect` (300 ms).

**API surface available without backend changes:**
- `productApi.getAll / getById` (paginated, filterable, sortable)
- `categoryApi.getAll`
- `orderApi.getMyOrders / getAllOrders / getById` (+ approve/reject/cancel)
- `userInventoryApi.getMyInventory / getById`
- `userApi.getAllUsers` (admin)
- `dashboardApi.*` (GraphQL metrics, status counts, user activity, recent activity)

> The new pages will be **composed from existing endpoints only** — no backend changes required.

---

## 2. Goals of the New Pages

Introduce pages that expand useful surface area of the app while exercising a broad range of realistic, production-looking dynamic UI behaviors:

- Dynamically changing element attributes (disabled/aria-busy/data-state)
- Asynchronously loaded content triggered by user action (detail fetch on expand, drill-down)
- State-driven visibility & re-rendering (tabs, filters, inline edit)
- Dynamic collections (sortable, filterable, ordered, paginated lists)
- Content that updates in response to user interaction (auto-refresh, inline mutations)
- Nested/layered components (modal within drawer, confirm-within-modal, embedded chart)
- Multiple similar elements that need contextual disambiguation (per-row action menus, per-card inline controls)
- UI transitions/animations (staggered load-in, skeleton→content crossfade, collapse/expand, toasts)

All behaviors must read as standard product features. Nothing visually signals "test fixture" or "dynamic demo".

---

## 3. New Pages

Three new pages, routed inside the existing `Layout`, consistent with nav conventions.

### 3.1 `Insights` (all users) — `/insights`
A richer, drill-through analytics surface complementing the existing `Dashboard`.

**Structure:**
- Page header ("Insights" + subtitle + right-aligned date-range `Select`: `7d / 30d / 90d`, and `RefreshCw` icon button).
- **Tab bar** (new shadcn-style `Tabs` component — see §5): `Overview`, `Products`, `Orders`, `Activity`.
- Each tab panel is independently fetched, with its own loading state.
- **Overview tab:** 4 metric cards (reuse pattern), a `recharts` line/area chart of orders over time (derived from `orderApi.getAllOrders` / `getMyOrders` grouped by day).
- **Products tab:**
  - Filter row (search, status, category) — same conventions as `ProductCatalogPage`.
  - A virtualized-feel grid of product "insight cards" (image placeholder, name, stock bar, trend badge).
  - Clicking a card opens an **inline detail drawer** (right-hand `Sheet` — already in `ui/sheet.tsx`) that async-fetches `productApi.getById` and shows tabs-inside-drawer: Details, Activity, Orders-for-this-product.
- **Orders tab:**
  - Sortable, filterable table built from `orderApi.getAllOrders()` (admin) or `getMyOrders()` (user).
  - Row "expand" affordance (chevron) that lazily loads and inlines the order's product details below the row (accordion-style expansion, stagger animation).
- **Activity tab:**
  - Infinite-scroll-style feed ("Load more" button appending results) sourced from `dashboardApi.getRecentActivity(n)` with increasing `n`.
  - Filter chips (All / Create / Update / Delete / Login) that toggle visibility client-side.

**Dynamic behaviors exercised:** tab state, lazy-load per tab, async drawer, async accordion row expansion, chip filters, "Load more" with stable list keys, skeletons→content.

---

### 3.2 `Command Center` (admin only) — `/command-center`
Operational workspace for admins to triage orders and products without leaving the page.

**Structure:**
- Page header + global `RefreshCw`.
- **Two-column layout** on `lg:` breakpoint, stacked on smaller.
- **Left column — Pending Queue:** list of pending orders (from `getAllOrders` filtered `status==='PENDING'`), each item is a card showing requester, product, qty, requested-at (relative time that ticks).
  - Each card has inline `Approve` / `Reject` buttons whose `disabled` attribute is driven by an in-flight state (button shows spinner icon while awaiting, `aria-busy="true"`).
  - A "Select" checkbox per card (new shadcn `Checkbox` — see §5) + a bulk-action bar that appears when ≥1 selected (slide-in transition), exposing "Approve Selected" / "Reject Selected".
  - Approving/rejecting mutates state optimistically and reorders the list; a success toast fires; a small "undo" toast stays for 5 s (client-only revert).
- **Right column — Product Watchlist:**
  - Sticky filter: `Status` (`LOW_STOCK`, `OUT_OF_STOCK`, `ACTIVE`) + search.
  - List of product tiles; each tile has an inline "Quick edit quantity" stepper (– / value / +) with debounced auto-save via `productApi.update` (toast on save, rollback on error).
  - A `…` menu per tile (`DropdownMenu`) with `View details` (opens the shared drawer from 3.1) and `Mark inactive`.
- **Footer strip:** real-time-feeling mini-metrics (pending count, approved today, rejected today) that animate when numbers change (number flip via `key` remount + CSS transition).

**Dynamic behaviors exercised:** contextual per-row actions across many similar elements, async button state, optimistic list mutation + re-ordering, bulk-action bar visibility state, inline edit with debounced save, animated number changes, nested dialogs (confirm-within-drawer), toasts.

---

### 3.3 `My Activity` (all users) — `/my-activity`
A personal timeline + saved-views page.

**Structure:**
- Page header + "Create saved view" button (opens dialog).
- **Saved Views strip:** horizontally scrollable chips of user-defined filter presets (persisted to `localStorage` — no backend needed). Clicking a chip applies its filters. Long-press / menu to rename or delete.
- **Timeline panel:** reverse-chronological list combining the user's orders (`getMyOrders`) and inventory changes (`userInventoryApi.getMyInventory`). Each entry is a timeline dot + card.
  - Filter row: type multi-select (Orders / Inventory), status, date range.
  - Each card is **expandable inline** to reveal contextual actions (cancel order if pending, consume inventory if owned, etc.). Expansion uses height-animation.
  - Pending orders show a small **countdown** (relative time) that updates every 30 s via `setInterval`.
- **Right rail (lg+):** "Summary" card with live-computed stats (total orders, pending count, total spend) that recompute as filters change.

**Dynamic behaviors exercised:** localStorage-persisted dynamic collections, multi-select filters, expand/collapse animation, live-updating elements, multiple similar cards each with contextual actions, derived stats re-rendering.

---

## 4. Integration with Existing App

**Routing (`App.tsx`):**
- Add three new routes inside the `Layout` element.
- `/insights` and `/my-activity` → `<ProtectedRoute>`.
- `/command-center` → `<ProtectedRoute requireAdmin>`.

**Navigation (`Layout.tsx`):**
- Extend `navItems` with:
  - `{ path: '/insights', label: 'Insights', icon: LineChart, show: true }`
  - `{ path: '/command-center', label: 'Command Center', icon: Radar, show: isAdmin }`
  - `{ path: '/my-activity', label: 'My Activity', icon: Activity, show: !isAdmin }`
- Icon choices from `lucide-react` already in dependencies (no new packages).
- If the nav bar becomes too wide, no layout change — items wrap naturally within the existing flex container (matches current behavior on narrower widths).

**Styling:**
- 100% Tailwind + existing shadcn components.
- No new colors, fonts, spacing tokens. Reuse the same page scaffold (`space-y-6`), table wrapper, badge variants, and button variants.
- Dark mode parity preserved (all existing classes use `dark:` variants where the current pages do).

**Data:**
- No backend or schema changes. All data via existing `api.ts` / `graphql.ts` services.
- Saved views and any UI-only preferences: `localStorage` key `nexus:ui:<page>:<user-id>`.

**State management:**
- Follow the existing per-page `useState` + `useEffect` pattern (no Zustand stores introduced — consistent with how `ProductCatalogPage` / `DashboardPage` are written).
- Shared helpers (relative-time formatter, debounce hook) will live in `src/utils/` to avoid duplicating the inline helpers currently in `DashboardPage`.

---

## 5. Components to Add / Extend

All additions follow the shadcn/ui pattern already in `frontend/src/components/ui/`. Adding these primitives is consistent with the existing library (shadcn components are commonly added piecewise).

New primitives (only the ones actually needed):
- `tabs.tsx` — Radix Tabs wrapper (used by Insights page).
- `checkbox.tsx` — Radix Checkbox (Command Center bulk select).
- `progress.tsx` — lightweight stock-bar (Insights product cards).
- `scroll-area.tsx` — optional, for Saved Views strip; if not added, a plain overflow-x-auto will suffice.

New composite components (under `src/components/`):
- `InsightsProductDrawer.tsx` — right-side `Sheet` with tabs + async fetch.
- `OrderQueueCard.tsx` — card with inline approve/reject + checkbox.
- `QuickQtyStepper.tsx` — debounced +/– editor.
- `TimelineEntry.tsx` — expandable timeline card.
- `SavedViewsChips.tsx` — localStorage-backed preset chips.

Utilities under `src/utils/`:
- `relativeTime.ts` — shared formatter (replaces inline copy in `DashboardPage`).
- `useDebouncedValue.ts` / `useInterval.ts` — small hooks.

**Radix packages needed (versions already pinned elsewhere):**
- `@radix-ui/react-tabs` (new)
- `@radix-ui/react-checkbox` (new)
- `@radix-ui/react-progress` (new)

All three are pulled in via `package.json` under `dependencies`. No other new dependencies.

---

## 6. Accessibility & Naming

- Every interactive element gets a stable `id` following the existing convention: `<page>-<kind>-<name>`, e.g. `insights-tab-products`, `command-center-button-approve-${orderId}`, `my-activity-input-search`.
- All dialogs, sheets, dropdowns inherit Radix a11y (focus trap, Esc to close, aria roles).
- All async buttons set `disabled` + `aria-busy` during in-flight state.

---

## 7. Reference Document (internal only)

After implementation, a file `frontend/DYNAMIC_UI_REFERENCE.md` will be created documenting:
- Each new page, its route, and role gating.
- Every dynamic behavior (what triggers it, what UI element changes, timing if any).
- Stable selector IDs and any data-attributes useful for automation.
- Notes on transitions / timing / debounce values.

This file will be added to the root `.gitignore` (new entry: `frontend/DYNAMIC_UI_REFERENCE.md`) so it is **not committed**. Nothing in the running app links to or exposes it.

---

## 8. Out of Scope

- No backend, DB, or API contract changes.
- No mobile (`mobile/`) changes.
- No test additions (automation is in `automation/` and handled separately).
- No changes to existing pages except the minimal `App.tsx` route additions and `Layout.tsx` nav entries.

---

## 9. File Change Summary (planned)

Added:
- `frontend/src/pages/InsightsPage.tsx`
- `frontend/src/pages/CommandCenterPage.tsx`
- `frontend/src/pages/MyActivityPage.tsx`
- `frontend/src/components/ui/tabs.tsx`
- `frontend/src/components/ui/checkbox.tsx`
- `frontend/src/components/ui/progress.tsx`
- `frontend/src/components/InsightsProductDrawer.tsx`
- `frontend/src/components/OrderQueueCard.tsx`
- `frontend/src/components/QuickQtyStepper.tsx`
- `frontend/src/components/TimelineEntry.tsx`
- `frontend/src/components/SavedViewsChips.tsx`
- `frontend/src/utils/relativeTime.ts`
- `frontend/src/utils/useDebouncedValue.ts`
- `frontend/src/utils/useInterval.ts`
- `frontend/DYNAMIC_UI_REFERENCE.md` *(git-ignored)*

Modified:
- `frontend/src/App.tsx` — three new routes.
- `frontend/src/components/Layout.tsx` — three new nav items.
- `frontend/package.json` — three new Radix primitives.
- `.gitignore` — ignore `frontend/DYNAMIC_UI_REFERENCE.md`.

---

## 10. Approval Needed

Please review §3 (the three pages) and §5 (the handful of new shadcn primitives and three new Radix packages).

**Awaiting explicit approval before implementation begins.**
