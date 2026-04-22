## Brief overview
Guidelines for AI agents to safely explore web applications with dynamic UI behaviors and produce stable, non-flaky automation tests. These rules apply to any frontend stack (React, Vue, Svelte, Angular) and any automation framework (Playwright, Cypress, Selenium, WebdriverIO).

---

## 1. Exploration before automation

- **Always take an accessibility snapshot first** when landing on an unknown page. Do not assume element names, roles, or positions from a design doc or test case.
- **Interact with every interactive element once** during exploration to confirm its actual behavior (e.g., does a tab switch content immediately or load async? does a drawer push content or overlay it?).
- **Document discovered stable selectors** (data-testid, aria-label, role + name) in a scratchpad before writing test code. Never hardcode refs from a snapshot directly into a test.
- **Identify the "settled state" of each screen** — the point where all async work (network, animations, skeletons) is complete and the DOM is stable.

---

## 2. Locator strategy for dynamic elements

- **Prefer semantic locators over CSS**: `getByRole('button', { name: 'Approve' })` or `getByTestId('command-center-button-approve')` over `.queue-card button:nth-child(2)`.
- **Avoid locators that depend on visual order** when the list is sortable, filterable, or mutates optimistically (e.g., after approve/reject). Locate by unique content (order ID, product SKU) instead of index.
- **For elements inside drawers/modals/sheets**, scope the search to the dialog container: `page.getByRole('dialog').getByRole('tab', { name: 'Activity' })`.
- **For per-row action menus**, target the specific row first by its unique text, then open the menu: `page.getByText(orderId).locator('..').getByRole('button', { name: 'Actions' })`.

---

## 3. Handling async loading

- **Never assert on content immediately after navigation or tab switch**. Wait for the absence of skeleton loaders or loading spinners first, or use a web-first assertion that retries.
- **Wait for network idle when switching tabs** that fetch independently. Example: after clicking "Products" tab, wait for the product grid request to finish before clicking a card.
- **Do not use fixed `waitForTimeout`**. Use framework-native waiting: `expect(locator).toBeVisible()`, `page.waitForResponse()`, or `page.waitForLoadState('networkidle')`.
- **For skeleton → content transitions**, assert that the skeleton disappears and the real content appears as a single atomic check.

---

## 4. Handling debounced and live-updating inputs

- **After typing into a debounced search field, wait for the debounce period + one network round-trip** before asserting filtered results. Do not assert immediately after the last keystroke.
- **For inline editors with debounced auto-save** (e.g., quantity steppers), trigger the change, wait for the save indicator or success toast, then assert the persisted value.
- **Do not assert exact text on live-updating elements** (relative timestamps, countdown timers, ticking metrics). Assert presence, format, or range instead: expect text to match `/\d+m ago/`, not to equal `"5m ago"`.

---

## 5. Handling state-driven visibility

- **For elements that appear conditionally** (bulk action bars, empty states, error messages, undo toasts), assert the condition that triggers them first, then assert the element. Do not assume the element is already present.
- **For checkboxes that drive bulk actions**, check the box, wait for the bulk bar to appear, then interact with it. Uncheck all, wait for the bar to disappear.
- **For optimistic UI updates**, assert the immediate UI change (card removed from list), then verify server consistency via a subsequent fetch or page reload.

---

## 6. Handling animations and transitions

- **After triggering a drawer/modal/toast**, wait for the enter animation to complete before interacting with elements inside it. Use `expect(dialog).toBeVisible()` which handles the transition.
- **After dismissing an overlay**, wait for it to be detached from the DOM before asserting elements behind it are reachable.
- **For expand/collapse accordion rows**, click the trigger, wait for the content to be visible, interact, then collapse and wait for hidden state.

---

## 7. Handling dynamic collections and pagination

- **When asserting list length after a filter or mutation**, do not hardcode an expected count unless the data is fully controlled. Assert `>= 0`, `> 0`, or exact match only when seed data is guaranteed.
- **For "Load more" patterns**, record the initial item count, click load-more, wait for new items to append, then assert the count increased.
- **For paginated tables**, assert the current page label ("Page X of Y") updates when navigating. Do not rely on row index alone.

---

## 8. Handling toasts and transient feedback

- **Treat toasts as optional assertions**. Assert them when confirming a mutation, but do not fail the test if a toast is missed due to timing. The primary assertion should be the persistent state change.
- **If asserting a toast, use the shortest possible timeout** (e.g., Playwright's default 5s) and accept that rapid successive actions may replace the toast before assertion.

---

## 9. Cross-page state verification

- **When a mutation on Page A should reflect on Page B**, navigate to Page B via a full page load or client-side navigation, wait for settle, then assert. Do not assume shared cache or real-time sync.
- **For localStorage-backed state** (saved views, preferences), mutate on Page A, reload Page A, then assert persistence. Do not assert localStorage keys directly unless the framework exposes them.

---

## 10. Test isolation and determinism

- **Each test must start from a clean auth state**. Log in via UI or load a saved storage state. Do not carry auth cookies from a previous test session blindly.
- **Reset dynamic data between test runs** when tests mutate shared state (approving orders, consuming inventory, deleting saved views). Use API cleanup, database seeds, or distinct test accounts.
- **Avoid tests that depend on exact wall-clock time**. If testing date-range filters, use fixed seed data with known dates rather than "today" minus N days.

---

## 11. Anti-patterns to avoid

- Do not use `waitForTimeout(300)` to "wait for debounce" — use an assertion that retries.
- Do not assert `innerText` on elements that re-render frequently — assert `toHaveText` with a matcher or check a data attribute.
- Do not chain multiple actions without intermediate settle checks (e.g., click tab → click row → assert detail) without confirming each step succeeded.
- Do not write tests that pass only when run slowly or fail under load — they are flaky by definition.
