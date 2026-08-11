"""
Step definitions for automation/features/auth/*.feature.
Steps call page-object methods and hold all assertions (Playwright expect()
or plain assert) — page objects themselves never assert. See
../.postqode/rules/automation-framework.md §2.
"""
import re

from behave import given, then, when
from playwright.sync_api import expect

from pages.dashboard_page import DashboardPage
from pages.login_page import LoginPage
from utils.config import Config
from utils.data_loader import DataLoader


def _login_page(context) -> LoginPage:
    if not hasattr(context, "login_page"):
        context.login_page = LoginPage(context.page)
    return context.login_page


@when("the admin logs in with valid credentials")
def step_admin_login(context):
    creds = DataLoader.get("users.json", "valid_admin")
    _login_page(context).login(creds["username"], creds["password"])


@when("the user logs in with valid credentials")
def step_user_login(context):
    creds = DataLoader.get("users.json", "valid_user")
    _login_page(context).login(creds["username"], creds["password"])


@when('the user attempts to log in with username "{username}" and password "{password}"')
def step_attempt_login(context, username, password):
    _login_page(context).login(username, password)


@then("the admin is redirected to the dashboard")
@then("the user is redirected to the dashboard")
def step_redirected_to_dashboard(context):
    context.page.wait_for_url(re.compile(r".*/dashboard"))
    context.dashboard_page = DashboardPage(context.page)
    expect(context.dashboard_page.heading()).to_be_visible()


@then('a welcome toast is shown for "{username}"')
def step_welcome_toast(context, username):
    # Optional/secondary assertion per Appendix B conventions — primary
    # assertion is the redirect + nav visibility checked in other steps.
    context.dashboard_page.wait_for_toast(re.compile(f"Welcome back, {username}", re.IGNORECASE))


@then("the admin navigation items are visible")
def step_admin_nav_visible(context):
    for label in ["Dashboard", "Insights", "Products", "Categories", "Users", "Order Management", "Command Center", "Preferences"]:
        expect(context.dashboard_page.nav_item(label)).to_be_visible()


@then("the user navigation items are visible")
def step_user_nav_visible(context):
    for label in ["Dashboard", "Insights", "Products", "My Orders", "My Inventory", "My Activity", "Request Product", "Preferences"]:
        expect(context.dashboard_page.nav_item(label)).to_be_visible()


@then("admin-only navigation items are not visible")
def step_admin_nav_not_visible(context):
    for label in ["Categories", "Users", "Order Management", "Command Center"]:
        expect(context.dashboard_page.nav_item(label)).to_have_count(0)


@then('the login "{outcome}" is observed')
def step_login_outcome(context, outcome):
    if outcome == "stays_on_login_page":
        # Verified real app behavior (see login_page.py docstring): no
        # visible error/toast is rendered on invalid login. Oracle is that
        # the user remains on /login with the form usable again.
        context.page.wait_for_timeout(1500)
        assert _login_page(context).stayed_on_login_page(), (
            f"expected to remain on /login after invalid credentials, got {context.page.url}"
        )
    elif outcome == "error_shown":
        expect(_login_page(context).error_message()).to_be_visible()
    else:
        raise ValueError(f"Unknown login outcome: {outcome}")



@given("the admin is logged in")
def step_admin_logged_in(context):
    _login_page(context)
    context.login_page.open(Config.BASE_URL)
    creds = DataLoader.get("users.json", "valid_admin")
    context.login_page.login(creds["username"], creds["password"])
    context.page.wait_for_url(re.compile(r".*/dashboard"))
    context.dashboard_page = DashboardPage(context.page)


@when("the admin logs out")
def step_admin_logout(context):
    context.dashboard_page.logout()


@then("the admin is redirected to the login page")
def step_redirected_to_login(context):
    context.page.wait_for_url(re.compile(r".*/login"))
    expect(_login_page(context).username_input()).to_be_visible()


@then("navigating back to the dashboard redirects to login")
def step_dashboard_redirects_to_login(context):
    context.page.goto(f"{Config.BASE_URL}/dashboard")
    context.page.wait_for_url(re.compile(r".*/login"))
