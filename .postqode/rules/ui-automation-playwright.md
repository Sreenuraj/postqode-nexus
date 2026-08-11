## Brief overview

- Project-specific rules for UI end-to-end automation of the PostQode Nexus web app (frontend `http://localhost:3000`, backend `http://localhost:8080`) using **Playwright + TypeScript**.
- The master test catalogue is `docs/e2e-test-cases.md` (maintained on branch `feature/e2e-test-cases`, not on `main`). Dynamic-UI deep dives live in `docs/functional-tests-dynamic-ui.md`, `docs/functional-tests-product-request.md`, `docs/preferences_reference.md`, and `docs/insight_CC_myactivity.md`.
- Automation lives in the same monorepo as the app (`backend/`, `frontend/`, `mobile/`, `automation/`). These rules must be followed in every session so work stays consistent across sessions.

## Test placement & structure

- Put Playwright specs under `automation/ui-tests/`, named after the user journey they exercise, not the component (e.g. `order-lifecycle.spec.ts`, `admin-product-crud.spec.ts`, `auth-session.spec.ts`).
- Map every spec to a Test ID from `docs/e2e-test-cases.md` (AUTH-*, ADM-*, USR-*, CROSS-*, NEG-*) and include the ID in the test title, e.g. `test('ADM-E2E-003 — Add Product', ...)`.
- Shared setup (admin/user login, API cleanup, storage state) goes in co-located fixtures using `test.extend`; do not duplicate login code per spec.
- Playwright config: `baseURL: 'http://localhost:3000'`, trace/video off by default, retries only in CI.

## Locators

- Prefer role-based locators (`getByRole('button', { name: 'Sign In' })`) and the app's stable `data-testid` hooks (`inventory-button-add`, `command-center-button-approve-${orderId}`, `my-activity-chip-${viewId}` — full list in Appendix A of `docs/e2e-test-cases.md`).
- Never use index/position-based locators on lists that reorder or mutate (order queue, catalog rows, activity timeline).
- Scope searches to overlays: `page.getByRole('dialog').getByRole('button', { name: 'Save' })`.
- `/product-request` (wizard) and `/preferences` have dynamic IDs and rotating labels: use semantic locators only (labels, roles, headings, placeholders, `/save/i` regex). Never `fld_*` or timestamp-suffixed IDs, never exact rotated label text.
- If the app lacks a stable hook a test needs, add a `data-testid` to the frontend component following the existing `{screen}-{element-type}-{name}` convention instead of writing a brittle selector.

## Waiting & assertions

- No `waitForTimeout`. Use web-first retrying assertions (`toBeVisible()`, `toHaveCount()`, `toContainText()`), `waitForURL`, and skeleton/overlay-disappearance waits.
- Wizard: after every action wait for the full-page overlay to appear AND disappear before the next interaction.
- Debounced inputs (catalog search ~300ms, wizard product-name search): fill, then assert with a retrying assertion that covers debounce + network round-trip.
- Optimistic mutations (Command Center approve/reject, steppers): wait for `aria-busy="false"`, then assert the persistent state change (card absent by testid, footer metric delta).
- Toasts are optional assertions only; the primary assertion is always the persistent state change.
- Live relative timestamps: assert a pattern (`/\d+m ago/`), never exact text.

## Test data & isolation

- Tests must be deterministic and rerunnable. Journeys that mutate shared data (approve, cancel, consume, delete) must create their own data first (UI or API) or restore state via API in `beforeEach`/`afterEach`.
- Use unique entities per run (timestamped SKUs/usernames, e.g. `E2E-${Date.now()}`) to avoid collisions with seed data.
- Full-suite baseline: `./scripts/reset-demo.sh` (seeds `admin/Admin@123`, `user/User@123`, 20 products). Verify prerequisites P1–P7 from `docs/e2e-test-cases.md` before runs.
- Each test starts from a clean auth state (UI login or storage-state fixture); never leak sessions between tests.

## Same-repo best practices

- Keep docs and specs in sync: when a journey or selector changes, update `docs/e2e-test-cases.md` (on its branch) and the spec together in the same change.
- Ensure services are up before running specs (`scripts/start-dev.sh`); backend health via `curl http://localhost:8080/health`.
- TypeScript strict; do not add new dependencies for test code beyond Playwright.
- Cross-role journeys (CROSS-*) use two browser contexts (admin + user) in one spec, asserting server-side consistency via the UI after each mutation.
