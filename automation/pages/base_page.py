"""
Base Page Object. Every page class extends this. Holds shared waits and
common actions only — never assertions (assertions live in steps/*.py).
See ../.postqode/rules/automation-framework.md §2.
"""
from playwright.sync_api import Page, expect

from utils.wait_helpers import wait_for_overlay_settle, wait_for_toast


class BasePage:
    def __init__(self, page: Page):
        self.page = page

    def goto(self, url: str):
        self.page.goto(url)

    def dialog(self):
        """Return the currently visible dialog container, scoped for control lookups inside it."""
        return self.page.get_by_role("dialog")

    def wait_for_dialog(self, timeout: int = 5_000):
        expect(self.dialog()).to_be_visible(timeout=timeout)

    def wait_for_dialog_closed(self, timeout: int = 5_000):
        expect(self.dialog()).to_be_hidden(timeout=timeout)

    def wait_for_overlay_settle(self, timeout: int = 10_000):
        wait_for_overlay_settle(self.page, timeout=timeout)

    def wait_for_toast(self, text_pattern, timeout: int = 5_000):
        return wait_for_toast(self.page, text_pattern, timeout=timeout)

    def avatar_menu_button(self):
        # [Verified 2026-08-11 via brain/scripts/verify_auth.py]. No data-testid
        # is rendered; the trigger is a Radix dropdown-menu button whose only
        # identifying content is the initials avatar (e.g. "AD" for admin).
        # aria-haspopup="menu" is the stable, role-based way to find it.
        return self.page.locator("button[aria-haspopup='menu']").first

    def open_avatar_menu(self):
        self.avatar_menu_button().click()

    def logout(self):
        self.open_avatar_menu()
        self.page.get_by_role("menuitem", name="Logout").click()
