"""
Generic reusable steps: navigation, generic waits. Steps for specific
functional areas live in <area>_steps.py and call page-object methods —
this file is the one narrow exception allowed to touch page.* directly for
trivial generic waits, per ../.postqode/rules/automation-framework.md §2.
"""
from behave import given
from playwright.sync_api import expect

from utils.config import Config


@given("the login page is open")
def step_open_login_page(context):
    from pages.login_page import LoginPage

    context.login_page = LoginPage(context.page)
    context.login_page.open(Config.BASE_URL)
    expect(context.login_page.username_input()).to_be_visible()
