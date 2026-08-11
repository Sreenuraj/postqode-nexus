# Test Catalog

| Test ID | Description | Functional Area | Automation Status | Location / Notes |
|---|---|---|---|---|
| AUTH-E2E-001 | Admin login success | Auth | Automated | automation/features/auth/login.feature |
| AUTH-E2E-002 | User login success | Auth | Automated | automation/features/auth/login.feature |
| AUTH-E2E-003 | Login failure and validation | Auth | Automated | automation/features/auth/login.feature (asserts verified real behavior, not documented "error shown") |
| AUTH-E2E-004 | Logout and session termination | Auth | Automated | automation/features/auth/login.feature |
| AUTH-E2E-005 | Route protection & RBAC enforcement | Auth | Planned | live-verified via brain/scripts/verify_auth.py; feature scenario not yet added |
| ADM-E2E-001..012 | Admin journeys (Dashboard, Catalog, CRUD, Categories, Users, Orders, Command Center, Insights, Preferences) | Admin | Manual | Not yet automated |
| USR-E2E-001..009 | User journeys (Dashboard, Buy, My Orders/Inventory/Activity, Request Wizard, Preferences) | User | Manual | Not yet automated |
| CROSS-E2E-001..004 | Cross-role E2E (order lifecycle, cancellation, stock propagation, Insights↔CC consistency) | CrossRole | Manual | Not yet automated |
| NEG-E2E-001..010 | Negative/edge-case tests | Negative | Manual | Not yet automated |

_Last updated: 2026-08-11_
