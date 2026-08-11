"""
Dashboard Page Object (stub — extended per-batch as Admin/User dashboard
journeys are automated). Locators HYPOTHESIS until live-verified.
"""
from pages.base_page import BasePage


class DashboardPage(BasePage):
    def heading(self):
        return self.page.get_by_role("heading", name="Dashboard")

    def nav_item(self, label: str):
        return self.page.get_by_role("link", name=label)

    def refresh_button(self):
        return self.page.get_by_test_id("dashboard-button-refresh")
