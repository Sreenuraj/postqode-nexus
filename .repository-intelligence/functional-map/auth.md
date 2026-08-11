# Functional Map: Auth

## Purpose
Login, logout, session management, and RBAC route protection for Admin and Standard User roles.

## User Journey
**Entry point:** `/login` (unauthenticated root redirects here)
**Preconditions:** none — public route

**Flow:**
1. User enters username/password → submits → `POST /api/v1/auth/login`
2. On success: JWT stored, redirect to `/dashboard`, welcome toast shown, role-specific nav rendered
3. On failure: **[Verified finding]** no visible error/toast is rendered — button flashes "Signing in..." then reverts; user stays on `/login`
4. Logout via avatar menu (top-right, `aria-haspopup="menu"` trigger, shows username + role + Logout menuitem) → redirect to `/login`
5. Direct navigation to a protected route while unauthenticated → redirect to `/login`

## Business Rules
- Admin sees 8 nav items: Dashboard, Insights, Products, Categories, Users, Order Management, Command Center, Preferences
- User sees 8 different nav items: Dashboard, Insights, Products, My Orders, My Inventory, My Activity, Request Product, Preferences
- Admin-only items (Categories, Users, Order Management, Command Center) are absent for User role — _Source: live verification 2026-08-11_
- Disabled user accounts are rejected at login — _Source: docs/e2e-test-cases.md NEG-E2E-007 (not yet live-verified)_

## Data
| Direction | What | Source / Destination |
|---|---|---|
| Input | username, password | User input → `POST /api/v1/auth/login` |
| Output | JWT token | Backend → stored client-side, used for subsequent API calls |

## UI Behaviour
- Login button text changes to "Signing in..." during the request, then reverts on completion (success → navigates away; failure → reverts to "Sign In")
- Avatar shows initials (e.g. "AD" for admin)

## Dependencies
- **Feeds into:** every other functional area (all routes except `/login` require auth)

## Open Questions
- None currently. AUTH-E2E-003's documented "Error message shown" expectation does not match verified app behavior (no error UI at all) — resolved as a documented finding, not escalated as a business question (app team may want to fix this UX gap, but automation now asserts real behavior).

_Sources: docs/e2e-test-cases.md §2, live verification via brain/scripts/verify_auth.py (2026-08-11) | Confidence: High | Last updated: 2026-08-11_
