# Pattern Catalog

## Toast/Notification Scoped Lookup
- **Purpose:** Avoid Playwright strict-mode violations when the same text appears both in a toast and elsewhere on the page (e.g. a heading also reading "Welcome back, user!").
- **When to use:** Any toast/notification assertion.
- **Template:**
  ```python
  notifications = page.get_by_label(re.compile("Notifications", re.IGNORECASE))
  toast = notifications.get_by_text(text_pattern)
  expect(toast).to_be_visible(timeout=5000)
  ```
- **Components used:** `utils/wait_helpers.wait_for_toast()`
- **Gotchas:** The app's notification region has `aria-label="Notifications alt+T"` — matching on `re.compile("Notifications", re.IGNORECASE)` is more stable than the exact string (keyboard-shortcut suffix could change).
- **Confidence:** High
_Source: AUTH-E2E-002 live run, 2026-08-11 | Last validated: 2026-08-11_

## Overlay Settle (Wizard/Dialog transient states)
- **Purpose:** Wait for a transient "Processing.../Loading.../Submitting..." overlay to appear then disappear before the next interaction.
- **When to use:** Request Product Wizard, Preferences form, any async multi-step dialog.
- **Template:**
  ```python
  overlay = page.get_by_text(re.compile(r"Processing|Loading|Calculating|Submitting"))
  try:
      expect(overlay).to_be_visible(timeout=2000)
  except AssertionError:
      pass  # overlay may be too fast to observe appearing
  expect(overlay).to_be_hidden(timeout=10000)
  ```
- **Components used:** `utils/wait_helpers.wait_for_overlay_settle()`
- **Confidence:** Medium (translated from docs/e2e-test-cases.md Appendix B, not yet live-verified against the Wizard)
_Source: docs/e2e-test-cases.md Appendix B | Last validated: not yet (pending Wizard batch)_

## Debounced Search Assertion
- **Purpose:** Assert directly on the filtered result rather than sleeping for the debounce window.
- **Template:**
  ```python
  search_input.fill(term)
  expect(row_locator).to_contain_text(term, timeout=5000)  # expect() retries through the debounce window
  ```
- **Confidence:** Medium (translated from docs, not yet live-verified)
_Source: docs/e2e-test-cases.md §1.3, Appendix B | Last validated: not yet (pending Product Catalog batch)_

## Optimistic Update / Row Removal
- **Purpose:** Wait for an optimistically-removed row/card (e.g. Command Center approve) to reach count 0, rather than asserting on an intermediate state.
- **Template:**
  ```python
  expect(page.get_by_test_id(f"command-center-card-{order_id}")).to_have_count(0, timeout=10000)
  ```
- **Confidence:** Medium (translated from docs, not yet live-verified)
_Source: docs/e2e-test-cases.md Appendix B | Last validated: not yet (pending Command Center batch)_
