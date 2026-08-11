"""
behave lifecycle hooks. Launches one Playwright browser for the whole run,
a fresh context+page per scenario (isolation), screenshots on failure.
"""
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

# Make automation/ the import root so `from pages...`, `from utils...` etc. work
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from utils.config import Config  # noqa: E402

SCREENSHOT_DIR = Path(__file__).resolve().parent.parent / "reports" / "screenshots"


def before_all(context):
    context.playwright = sync_playwright().start()
    context.browser = context.playwright.chromium.launch(headless=Config.HEADLESS)


def before_scenario(context, scenario):
    context.browser_context = context.browser.new_context()
    context.page = context.browser_context.new_page()


def after_scenario(context, scenario):
    if scenario.status == "failed":
        SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
        safe_name = "".join(c if c.isalnum() else "_" for c in scenario.name)[:80]
        screenshot_path = SCREENSHOT_DIR / f"{safe_name}.png"
        try:
            context.page.screenshot(path=str(screenshot_path))
        except Exception:  # noqa: BLE001
            pass
    context.browser_context.close()


def after_all(context):
    context.browser.close()
    context.playwright.stop()
