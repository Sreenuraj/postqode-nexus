"""
Shared wait strategies mirroring docs/e2e-test-cases.md §1.3 and Appendix B,
translated to Playwright-Python `expect()` patterns. No fixed time.sleep().
"""
import re

from playwright.sync_api import Page, expect

OVERLAY_TEXT_PATTERN = re.compile(r"Processing|Loading|Calculating|Submitting")


def wait_for_overlay_settle(page: Page, timeout: int = 10_000):
    """Wait for a transient wizard/dialog overlay to appear then disappear."""
    overlay = page.get_by_text(OVERLAY_TEXT_PATTERN)
    try:
        expect(overlay).to_be_visible(timeout=2_000)
    except AssertionError:
        # Overlay may be too fast to observe appearing — that's fine.
        pass
    expect(overlay).to_be_hidden(timeout=timeout)


def wait_for_debounced_search(locator, expected_text: str, timeout: int = 5_000):
    """Assert on the debounced-search result directly; expect() retries through the debounce window."""
    expect(locator).to_contain_text(expected_text, timeout=timeout)


def wait_for_toast(page: Page, text_pattern, timeout: int = 5_000):
    """Wait for a toast matching text_pattern (str or re.Pattern) to appear.
    Optional/secondary assertion. Scoped to the notifications region
    (aria-label="Notifications...") because the same text can also appear
    elsewhere on the page (e.g. a heading), which would otherwise trip
    Playwright's strict-mode "resolved to N elements" error. Discovered
    2026-08-11 while running AUTH-E2E-002 — see lessons-learned.md."""
    notifications = page.get_by_label(re.compile("Notifications", re.IGNORECASE))
    toast = notifications.get_by_text(text_pattern)
    expect(toast).to_be_visible(timeout=timeout)
    return toast



def wait_for_row_removed(page: Page, test_id: str, timeout: int = 10_000):
    """Wait for an optimistically-removed row/card (e.g. Command Center approve) to reach count 0."""
    expect(page.get_by_test_id(test_id)).to_have_count(0, timeout=timeout)
