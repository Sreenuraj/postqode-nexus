# Automation Framework Rules (Playwright + Python + behave)

Guidelines for working with the `automation/` Python BDD project that targets PostQode Nexus (`http://localhost:3000` UI, `http://localhost:8080` API).

## 1. Framework Architecture
- **Pattern:** Behavior-Driven Development (BDD) with strict Page Object Model (POM).
- **Layers:**
  - `features/**/*.feature` — Gherkin scenarios, grouped by functional area (`auth/`, `admin/`, `user/`, `cross_role/`, `negative/`), tagged with the exact Test ID from `docs/e2e-test-cases.md` (e.g. `@AUTH-E2E-001`).
  - `steps/*_steps.py` — behave step definitions. Steps call page object methods; steps never touch `page.locator(...)` directly except trivial generic waits in `common_steps.py`.
  - `pages/*.py` — Page Object classes. One class per page or major reusable component (e.g. `LoginPage`, `ProductCatalogPage`, `ProductFormDialog` as a nested helper). Locators + action methods only — **zero assertions**.
  - `api_clients/*.py` — REST client wrappers for fixture setup (never used for the primary story assertion, only for setup/preconditions).
  - `data/*.json` — data-driven fixtures loaded via `utils/data_loader.py`.
  - `utils/*.py` — config loader, wait helpers, DB read-only helper.
  - `features/environment.py` — behave lifecycle hooks (`before_all`, `before_scenario`, `after_scenario`, `after_all`).

## 2. Page Object Model — Non-Negotiable Rules
- Every page class inherits from `pages.base_page.BasePage`, which stores `self.page` (a Playwright `Page`) and exposes shared helpers (`wait_for_overlay_settle()`, `wait_for_toast(text_pattern)`, `wait_for_debounced_search()`).
- Locators are **methods or properties returning a Playwright `Locator`**, resolved fresh on every call (never cached as an attribute at `__init__` time — the DOM can re-render).
  ```python
  class LoginPage(BasePage):
      def username_input(self):
          return self.page.get_by_test_id("login-input-username")

      def password_input(self):
          return self.page.get_by_test_id("login-input-password")

      def submit_button(self):
          return self.page.get_by_role("button", name="Sign In")

      def login(self, username: str, password: str):
          self.username_input().fill(username)
          self.password_input().fill(password)
          self.submit_button().click()
  ```
- **Locator priority** (mirrors `docs/e2e-test-cases.md` Appendix A / §1.3 Automation Conventions):
  1. `data-testid` via `get_by_test_id(...)` where documented.
  2. Semantic role + accessible name via `get_by_role(...)` for buttons/links/dialogs.
  3. Label text via `get_by_label(...)` for form fields without a `data-testid`.
  4. Never index-based locators (`nth()`) on mutable lists (order rows, product rows) — always scope by a stable identifier (order ID, SKU) first.
- **Zero assertions inside page objects.** A page object may return values (`get_row_count()`, `get_status_badge_text(order_id)`) but the `assert`/`expect(...)` call always lives in the step definition.
- **Dialogs/overlays:** resolve the dialog container first (`page.get_by_role("dialog")` or `[role="dialog"]`), then scope all control lookups inside it — never use page-level locators for controls that might also exist behind an open modal.

## 3. BDD (behave) Conventions
- Every scenario is tagged with its exact Test ID from `docs/e2e-test-cases.md`, e.g.:
  ```gherkin
  @AUTH-E2E-001 @admin
  Scenario: Admin login success
    Given the login page is open
    When the admin logs in with valid credentials
    Then the admin is redirected to the dashboard
    And the admin navigation items are visible
  ```
- Use `Scenario Outline` + `Examples:` for simple per-test parameterization (e.g. varying role/credentials). Use `data/*.json` + `utils/data_loader.py` for larger/reusable datasets — never hardcode large data blocks inline in `.feature` files or step defs.
- Group related scenarios that share expensive setup (e.g. login) under the same `Feature:`, using `Background:` for the shared `Given` steps.
- No duplicate step phrasings — check `.repository-intelligence/pattern-catalog.md` and existing `steps/*.py` before writing a new step; reuse an existing step text if one already expresses the same intent.

## 4. Waiting Strategy (mirrors `docs/e2e-test-cases.md` §1.3 and Appendix B)
- **No fixed `time.sleep()`.** Use Playwright's auto-waiting plus explicit `expect(locator).to_be_visible()` / `to_be_hidden()` / `to_contain_text()` assertions, which retry internally.
- **Debounced search:** fill the input, then assert on the resulting row content directly — `expect(locator).to_contain_text(term)` will retry through the debounce window; do not add a manual sleep.
- **Wizard/overlay steps:** wait for the transient overlay text (e.g. "Processing selection...") to appear and then disappear before the next interaction:
  ```python
  overlay = self.page.get_by_text(re.compile("Processing|Loading|Calculating|Submitting"))
  expect(overlay).to_be_visible()
  expect(overlay).to_be_hidden()
  ```
- **Optimistic UI updates (Command Center approve/reject):** wait for the card to reach a stable end-state (`to_have_count(0)` for the removed card) rather than asserting on an intermediate state.
- **Toasts:** treat as a secondary/optional assertion; the primary assertion is always the persistent state change (row updated, redirect happened, badge changed).

## 5. Data-Driven Rules
- `data/users.json` — credential sets (admin, user, disabled user, bad-password variants for `AUTH-E2E-003`).
- `data/products.json` — product payloads for Add/Edit/Status/Delete journeys (`ADM-E2E-003..006`).
- `data/orders.json` — order payloads for Buy/Approve/Reject/Cancel journeys (`USR-E2E-002`, `ADM-E2E-009`, `CROSS-E2E-001..003`).
- Loaded via `utils/data_loader.DataLoader.load("<file>.json")`, returning parsed Python `dict`/`list` — never re-implement JSON parsing in a step file.
- The same dataset should drive both API-based fixture setup (`api_clients/`) and UI-side assertions, so a single source of truth exists per test.

## 6. Credentials and Environment Handling
- All environment/config values (`BASE_URL`, `API_BASE_URL`, credentials, `HEADLESS`) are loaded via `utils/config.py` from `automation/.env` (gitignored; `.env.example` documents required keys). Never hardcode a URL or credential string directly in a step/page file.

## 7. Framework-First Pattern Search Policy
- Before writing a new step, page-object method, or locator, search existing `features/**/*.feature` files in the same functional area for a complete flow that already sets up the same business state (e.g. an existing "place a PENDING order" background before writing a new one for a cancel scenario).
- Search semantically, not just by exact words — e.g. "Buy" in the doc may map to a step named `the user purchases the product`.
- Treat an existing feature's `Background:` as authoritative setup documentation before writing new setup steps.

## 8. Additive-Only Changes Policy
- Never change the behavior of an existing step definition, page object method, or feature file's existing scenario to fix a different scenario's problem.
- Add new methods/steps alongside existing ones. If an existing locator method is wrong, add a new one with a different name and migrate call sites deliberately (not silently overwrite the old method body for unrelated callers).
