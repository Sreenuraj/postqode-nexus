# Task Resolver

> First stop for every task. Find your area, then load only the listed artifacts.

| Task Intent / Feature Area | Functional Map | Components | Patterns | Notes |
|---|---|---|---|---|
| Login, logout, session, RBAC | functional-map/auth.md | component-catalog/auth.md | Toast/Notification Scoped Lookup | Pilot batch-001, fully verified & automated |
| Dashboard (Admin/User) | functional-map/index.md (pending) | — | — | Not yet mapped |
| Product Catalog (browse/CRUD/Buy) | functional-map/index.md (pending) | — | Debounced Search Assertion | Not yet mapped |
| Categories | functional-map/index.md (pending) | — | — | Not yet mapped |
| Users | functional-map/index.md (pending) | — | — | Not yet mapped |
| Order Management | functional-map/index.md (pending) | — | — | Not yet mapped |
| Command Center | functional-map/index.md (pending) | — | Optimistic Update / Row Removal | Not yet mapped |
| Insights | functional-map/index.md (pending) | — | — | Not yet mapped |
| My Orders / My Inventory / My Activity | functional-map/index.md (pending) | — | — | Not yet mapped |
| Request Product Wizard | functional-map/index.md (pending) | — | Overlay Settle | Semantic-only locators per docs — extra care needed |
| Preferences | functional-map/index.md (pending) | — | Overlay Settle | Semantic-only, rotating field IDs/labels per docs |

## How to Use
1. Identify the task's feature area from the Test ID or task description.
2. Find the matching row above.
3. Load only the specific area artifacts listed. Do NOT load the entire `.repository-intelligence/` directory.
4. If your area is not listed, check `functional-map/index.md` directly, then add a resolver entry once the area is mapped.

_Last updated: 2026-08-11_
