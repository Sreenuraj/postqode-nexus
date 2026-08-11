"""
Template for brain/scripts/verify_<area>.py

Mandatory Architect-owned live-verification script (Phase 3 of 02-plan-and-automate.md).
Confirms every locator/flow in the batch's draft plan.md checklist against the
RUNNING app before anything is marked [Verified]. Headless by default.

Usage:
    python brain/scripts/verify_<area>.py
    HEADLESS=false python brain/scripts/verify_<area>.py   # headed debugging
"""
import os
import sys
from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")
HEADLESS = os.environ.get("HEADLESS", "true").lower() != "false"

# Load demo credentials from env — never hardcode inline beyond local scratch use.
ADMIN_USER = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASS = os.environ.get("ADMIN_PASSWORD", "Admin@123")
USER_USER = os.environ.get("USER_USERNAME", "user")
USER_PASS = os.environ.get("USER_PASSWORD", "User@123")

results = []


def check(label, fn):
    try:
        detail = fn()
        results.append(("OK", label, detail or ""))
        print(f"[OK] {label} — {detail or ''}")
    except Exception as exc:  # noqa: BLE001
        results.append(("FAIL", label, str(exc)))
        print(f"[FAIL] {label} — {exc}")


def login(page, username, password):
    page.goto(f"{BASE_URL}/login")
    page.get_by_test_id("login-input-username").fill(username)
    page.get_by_test_id("login-input-password").fill(password)
    page.get_by_role("button", name="Sign In").click()
    page.wait_for_url("**/dashboard")


def main():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=HEADLESS)
        context = browser.new_context()
        page = context.new_page()

        # Example checks — replace with the batch's actual checklist items.
        check(
            "login-input-username visible",
            lambda: (page.goto(f"{BASE_URL}/login"), page.get_by_test_id("login-input-username").wait_for(state="visible"))[1] and "present",
        )
        check(
            "admin login redirects to /dashboard",
            lambda: (login(page, ADMIN_USER, ADMIN_PASS), page.url)[1],
        )

        browser.close()

    failed = [r for r in results if r[0] == "FAIL"]
    print(f"\n{len(results) - len(failed)}/{len(results)} checks passed.")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
