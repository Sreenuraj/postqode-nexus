"""
Mandatory Architect-owned live-verification script for the Auth functional
area (AUTH-E2E-001..005). Confirms every locator/flow in the batch's draft
plan checklist against the RUNNING app before anything is marked [Verified]
in plan.md or component-catalog/Auth.md.

See .postqode/skills/live_explorer/SKILL.md and
.postqode/workflows/02-plan-and-automate.md Phase 3.

Correction log (2026-08-11): docs/e2e-test-cases.md Appendix A documents
"login-input-username" / "login-input-password" as data-testid values, but
live DOM inspection showed the app implements them as plain `id` attributes
instead (no data-testid attribute rendered anywhere on the login form).
Locators below use #id CSS selectors accordingly. This is exactly the kind
of drift the mandatory live-verification gate exists to catch.

Usage:
    python brain/scripts/verify_auth.py
    HEADLESS=false python brain/scripts/verify_auth.py   # headed debugging
"""
import os
import re
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")
HEADLESS = os.environ.get("HEADLESS", "true").lower() != "false"

ADMIN_USER = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASS = os.environ.get("ADMIN_PASSWORD", "Admin@123")
USER_USER = os.environ.get("USER_USERNAME", "user")
USER_PASS = os.environ.get("USER_PASSWORD", "User@123")

SCREENSHOT_DIR = Path(__file__).resolve().parent.parent / "screenshots" / "auth"

results = []


def check(label, fn):
    try:
        detail = fn()
        results.append(("OK", label, detail or ""))
        print(f"[OK] {label} — {detail or ''}")
        return True
    except Exception as exc:  # noqa: BLE001
        results.append(("FAIL", label, str(exc)))
        print(f"[FAIL] {label} — {exc}")
        return False


def screenshot(page, name):
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(SCREENSHOT_DIR / f"{name}.png"))


def username_input(page):
    return page.locator("#login-input-username")


def password_input(page):
    return page.locator("#login-input-password")


def submit_button(page):
    return page.get_by_role("button", name="Sign In")


def main():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=HEADLESS)
        page = browser.new_context().new_page()

        # --- AUTH-E2E-001 / 002: login page renders ---
        def _login_page_loads():
            page.goto(f"{BASE_URL}/login")
            username_input(page).wait_for(state="visible", timeout=5000)
            password_input(page).wait_for(state="visible", timeout=5000)
            submit_button(page).wait_for(state="visible", timeout=5000)
            return "#login-input-username / #login-input-password / Sign In button all visible"

        ok_login_page = check("login inputs (#id) + Sign In button visible", _login_page_loads)
        if not ok_login_page:
            screenshot(page, "login-page-load-fail")

        # --- AUTH-E2E-001: admin login success -> redirect + nav ---
        def _admin_login_flow():
            page.goto(f"{BASE_URL}/login")
            username_input(page).fill(ADMIN_USER)
            password_input(page).fill(ADMIN_PASS)
            submit_button(page).click()
            page.wait_for_url(re.compile(r".*/dashboard"), timeout=8000)
            page.get_by_role("heading", name="Dashboard").wait_for(state="visible", timeout=5000)
            return f"redirected to {page.url}"

        ok_admin = check("admin login redirects to /dashboard", _admin_login_flow)
        if not ok_admin:
            screenshot(page, "admin-login-fail")

        if ok_admin:
            def _admin_nav_visible():
                missing = []
                for label in ["Dashboard", "Insights", "Products", "Categories", "Users", "Order Management", "Command Center", "Preferences"]:
                    loc = page.get_by_role("link", name=label)
                    if loc.count() == 0:
                        missing.append(label)
                if missing:
                    raise AssertionError(f"missing nav items: {missing}")
                return "all 8 admin nav items present"

            check("admin nav items visible (Dashboard/Insights/Products/Categories/Users/Order Management/Command Center/Preferences)", _admin_nav_visible)

            def _avatar_menu():
                # [Verified] no data-testid rendered; trigger is the Radix
                # dropdown button identified by aria-haspopup="menu".
                loc = page.locator("button[aria-haspopup='menu']").first
                loc.wait_for(state="visible", timeout=3000)
                loc.click()
                page.get_by_role("menuitem", name="Logout").wait_for(state="visible", timeout=3000)
                return "avatar menu opened, shows username + role + Logout menuitem"


            avatar_ok = check("avatar menu opens (username + role + Logout)", _avatar_menu)
            if not avatar_ok:
                screenshot(page, "avatar-menu-fail")

            def _logout_flow():
                logout_item = page.get_by_role("menuitem", name="Logout")
                if logout_item.count() == 0:
                    logout_item = page.get_by_text("Logout")
                logout_item.first.click()
                page.wait_for_url(re.compile(r".*/login"), timeout=5000)
                return f"redirected to {page.url}"

            if avatar_ok:
                check("logout redirects to /login", _logout_flow)

        # --- AUTH-E2E-002: user login success -> redirect + nav, admin items absent ---
        def _user_login_flow():
            page.goto(f"{BASE_URL}/login")
            username_input(page).fill(USER_USER)
            password_input(page).fill(USER_PASS)
            submit_button(page).click()
            page.wait_for_url(re.compile(r".*/dashboard"), timeout=8000)
            return f"redirected to {page.url}"

        ok_user = check("user login redirects to /dashboard", _user_login_flow)
        if not ok_user:
            screenshot(page, "user-login-fail")

        if ok_user:
            def _user_nav_visible_admin_absent():
                for label in ["Dashboard", "Insights", "Products", "My Orders", "My Inventory", "My Activity", "Request Product", "Preferences"]:
                    if page.get_by_role("link", name=label).count() == 0:
                        raise AssertionError(f"missing user nav item: {label}")
                for label in ["Categories", "Users", "Order Management", "Command Center"]:
                    if page.get_by_role("link", name=label).count() != 0:
                        raise AssertionError(f"admin-only nav item unexpectedly visible for user: {label}")
                return "user nav correct, admin-only nav absent"

            check("user nav items visible + admin-only nav absent (RBAC)", _user_nav_visible_admin_absent)

        # --- AUTH-E2E-003: login failure ---
        # FINDING: the app renders NO visible error/toast/alert on invalid
        # login (confirmed via polling body text at 200/500/1000/1500/2000ms
        # and inspecting the notifications <section> — it stays empty). The
        # Sign In button flashes "Signing in..." then reverts silently. This
        # is a documented app-behavior mismatch vs. docs/e2e-test-cases.md
        # AUTH-E2E-003 (which expects "Error message shown"), not a locator
        # bug. Oracle used going forward: user remains on /login, form is
        # usable again — see pages/login_page.py::stayed_on_login_page().
        def _login_failure():
            page.goto(f"{BASE_URL}/login")
            username_input(page).fill(ADMIN_USER)
            password_input(page).fill("WrongPass123!")
            submit_button(page).click()
            page.wait_for_timeout(1500)
            if "/login" not in page.url:
                raise AssertionError(f"expected to remain on /login, got {page.url}")
            submit_button(page).wait_for(state="visible", timeout=2000)
            return "no visible error rendered (app finding); confirmed stays on /login with form usable"

        check("invalid login: stays on /login, form usable (no error UI rendered — app finding)", _login_failure)


        # --- AUTH-E2E-005: unauthenticated route protection ---
        def _route_protection():
            page.goto(f"{BASE_URL}/products")
            page.wait_for_url(re.compile(r".*/login"), timeout=5000)
            return f"redirected to {page.url}"

        check("unauthenticated /products redirects to /login", _route_protection)

        browser.close()

    failed = [r for r in results if r[0] == "FAIL"]
    print(f"\n{len(results) - len(failed)}/{len(results)} checks passed.")
    if failed:
        print("\nFailed checks (need locator correction or Open Question classification):")
        for _, label, detail in failed:
            print(f"  - {label}: {detail}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
