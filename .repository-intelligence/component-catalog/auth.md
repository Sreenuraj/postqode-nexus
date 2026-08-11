# Component Catalog: Auth

## Page Objects

### LoginPage (`automation/pages/login_page.py`)
- **Purpose:** Login form interactions
- **Functional Area:** Auth
- **Key Elements:**
  - `username_input()` → `page.locator("#login-input-username")` — **[Verified 2026-08-11]**. Correction vs. Appendix A: implemented as `id`, not `data-testid`.
  - `password_input()` → `page.locator("#login-input-password")` — **[Verified 2026-08-11]**. Same correction as above.
  - `submit_button()` → `page.get_by_role("button", name="Sign In")` — **[Verified 2026-08-11]**
  - `password_toggle_button()` → sibling button of the password input (eye icon, no id/testid) — **[Verified 2026-08-11]**
  - `error_message()` → `page.get_by_role("alert")` — **[Verified 2026-08-11 — finding: never renders]**. The app shows no visible error UI on invalid login.
  - `stayed_on_login_page()` → checks URL + submit button visible — the real oracle for invalid-login scenarios
- **Confidence:** High
_Source: live verification 2026-08-11 (brain/scripts/verify_auth.py) | Last validated: 2026-08-11_

### DashboardPage (`automation/pages/dashboard_page.py`)
- **Purpose:** Post-login landing page — heading, nav items, refresh
- **Functional Area:** Auth (nav verification), Dashboard (metrics — not yet mapped)
- **Key Elements:**
  - `heading()` → `page.get_by_role("heading", name="Dashboard")` — **[Verified 2026-08-11]**
  - `nav_item(label)` → `page.get_by_role("link", name=label)` — **[Verified 2026-08-11]** for all 8 admin + 8 user nav labels
- **Confidence:** High
_Source: live verification 2026-08-11 | Last validated: 2026-08-11_

### BasePage (`automation/pages/base_page.py`)
- **Purpose:** Shared avatar menu / logout / dialog / overlay / toast helpers used across all areas
- **Key Elements:**
  - `avatar_menu_button()` → `page.locator("button[aria-haspopup='menu']").first` — **[Verified 2026-08-11]**. No data-testid rendered; only identifiable via the Radix `aria-haspopup="menu"` attribute (visible text is just user initials, e.g. "AD").
  - `logout()` → opens avatar menu, clicks `page.get_by_role("menuitem", name="Logout")` — **[Verified 2026-08-11]**
- **Confidence:** High
_Source: live verification 2026-08-11 | Last validated: 2026-08-11_

## Correction Log (Appendix A vs. Live DOM)
| Appendix A documented | Actual implementation | Verified |
|---|---|---|
| `data-testid="login-input-username"` | `id="login-input-username"` (no data-testid attr rendered anywhere on login page) | 2026-08-11 |
| `data-testid="login-input-password"` | `id="login-input-password"` | 2026-08-11 |
| Avatar menu (implied testid) | `button[aria-haspopup="menu"]`, no testid | 2026-08-11 |
| AUTH-E2E-003 "Error message shown" | No error UI rendered at all; button reverts silently | 2026-08-11 |
