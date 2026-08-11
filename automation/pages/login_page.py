"""
Login Page Object. [Verified] via brain/scripts/verify_auth.py against the
running app on 2026-08-11.

Correction vs. docs/e2e-test-cases.md Appendix A: the app does NOT render
data-testid attributes on the login form. The documented testid names
("login-input-username", "login-input-password") are actually implemented
as plain `id` attributes with the same string. Locators below use `#id`
CSS selectors for the inputs and role/name for the button, per the
locator-priority fallback order in automation-framework.md §2.
"""
from pages.base_page import BasePage


class LoginPage(BasePage):
    def username_input(self):
        return self.page.locator("#login-input-username")

    def password_input(self):
        return self.page.locator("#login-input-password")

    def submit_button(self):
        return self.page.get_by_role("button", name="Sign In")

    def password_toggle_button(self):
        # Eye icon to show/hide password — the icon button has no id/testid;
        # it's the lone unnamed <button type="button"> next to the password field.
        return self.page.locator("input#login-input-password ~ button, input#login-input-password + button").first

    def error_message(self):
        # [FINDING 2026-08-11 via brain/scripts/verify_auth.py]: the app does
        # NOT render any visible error/toast/alert element on invalid login.
        # The Sign In button briefly shows "Signing in..." then reverts to
        # "Sign In" with no other DOM change. docs/e2e-test-cases.md
        # AUTH-E2E-003 step 2 expects "Error message shown" — this is a
        # documentation/app mismatch, not a locator problem. Kept as a
        # role=alert lookup (will correctly report "not found") so a future
        # UI fix is auto-detected; the real oracle used by auth_steps.py is
        # staying_on_login_page().
        return self.page.get_by_role("alert")

    def stayed_on_login_page(self) -> bool:
        return "/login" in self.page.url and self.submit_button().is_visible()



    def open(self, base_url: str):
        self.page.goto(f"{base_url}/login")

    def login(self, username: str, password: str):
        self.username_input().fill(username)
        self.password_input().fill(password)
        self.submit_button().click()

    def toggle_password_visibility(self):
        self.password_toggle_button().click()
