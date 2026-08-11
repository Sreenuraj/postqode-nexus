## Overview

Reusable workflow for automating test cases from `docs/e2e-test-cases.md` (branch `feature/e2e-test-cases`) with Playwright + TypeScript in this monorepo. Input is a **Test ID** (e.g. `ADM-E2E-003`) or the full step table. Work proceeds in **phases** tracked per test ID in a batch state file, so a batch can be **paused and resumed in any phase — including a brand-new session — by naming the test ID**.

Rules that always apply: `.postqode/rules/ui-automation-playwright.md` and `.postqode/rules/dynamic-ui-automation.md`.

## Input contract

- Accepted inputs: one or more Test IDs (`AUTH-E2E-001`, `ADM-*`, `USR-*`, `CROSS-*`, `NEG-*`) or pasted step tables.
- Resolve IDs against `docs/e2e-test-cases.md`; if the doc is absent (main branch), check out `feature/e2e-test-cases` first.
- If a referenced journey points at a companion doc (`functional-tests-dynamic-ui.md`, `functional-tests-product-request.md`, `preferences_reference.md`), load it too.

## Phase 0 — Session bootstrap (new sessions)

1. `git branch --show-current` — confirm you are on `feature/e2e-test-cases` (the doc + automation scaffold live there).
2. Read, in order: `README.md`, `.postqode/rules/ui-automation-playwright.md`, `.postqode/rules/dynamic-ui-automation.md`, `docs/e2e-test-cases.md` (§1 prerequisites + Appendix A selectors), and the specific test sections for the requested IDs.
3. Read `automation/batch-state.json` if it exists; resume each requested test ID from its recorded phase instead of restarting.

## Phase 1 — Prerequisites & dependencies

1. Install automation deps if missing: `cd automation && [ -d node_modules ] || npm install --no-audit --no-fund` (installs `@playwright/test`, `allure-playwright`, `allure-commandline`, `typescript`).
2. Verify services: `curl -sf http://localhost:8080/health` and `curl -sf http://localhost:3000/login`; if down, start with `./scripts/start-dev.sh` and re-check.
3. Verify test-data prerequisites P1–P7 from `docs/e2e-test-cases.md`; reset with `./scripts/reset-demo.sh` only when shared state is dirty and the batch allows it.
4. Mark phase `PREREQ` done in the batch state.

## Phase 2 — Batch planning & state file

1. Create/update `automation/batch-state.json`:

```json
{
  "batch": "2026-08-11-admin-crud",
  "tests": [
    { "id": "ADM-E2E-003", "phase": "EXPLORED", "status": "in-progress", "spec": "ui-tests/admin-product-crud.spec.ts", "notes": "" }
  ]
}
```

2. Phases per test: `CONTEXT` → `PREREQ` → `EXPLORED` → `POM` → `SPEC` → `COMPILED` → `RUN` → `REPORTED`.
3. Group IDs into one spec file per journey (e.g. `auth-session.spec.ts`, `admin-product-crud.spec.ts`, `order-lifecycle.spec.ts`).
4. **Pause:** commit the state file + any written code, note the current phase per ID, stop. **Resume:** read the state file, continue at the first phase that is not done.

## Phase 3 — Live UI exploration (mandatory before writing any test)

1. Drive the real app with `postqode_browser_agent`: `goto` the page, `snapshot` for the accessibility tree, then click/fill through the ENTIRE flow of the test ID — every interactive element once.
2. Record in scratchpad/notes: stable locators (role+name, `data-testid` from Appendix A), async settle points (skeletons, overlays, debounce), conditional elements, toast text.
3. Never write a locator from the doc alone; every locator must be confirmed against the live snapshot.
4. Mark phase `EXPLORED` done.

## Phase 4 — Page Object Model (POM)

1. One page object per screen under `automation/ui-tests/pages/`: `login.page.ts`, `catalog.page.ts`, `orders.page.ts`, `command-center.page.ts`, `my-activity.page.ts`, etc.
2. Page objects expose: constructor `(page: Page)`, readonly locators (role/testid based), and intent methods (`login(username, password)`, `approveOrder(orderId)`) that include their own settle waits.
3. Shared auth/fixtures via `test.extend` in `ui-tests/fixtures/auth.fixture.ts` (admin + user contexts; CROSS-* specs use both contexts in one spec).
4. Mark phase `POM` done.

## Phase 5 — Spec authoring

1. Spec file per journey in `automation/ui-tests/`; test titles include the ID: `test('ADM-E2E-003 — Add Product', ...)`.
2. Follow the rules: no `waitForTimeout`, web-first assertions, overlay appear+disappear waits for the wizard, `aria-busy="false"` before post-mutation asserts, toasts optional, unique entities (`E2E-${Date.now()}`), API/`beforeEach` cleanup for mutating journeys.
3. Attach Allure metadata: `test.info().annotations.push({ type: 'testId', description: 'ADM-E2E-003' })` and `allure.epic/feature/story` labels per role/journey.
4. Mark phase `SPEC` done.

## Phase 6 — Compile & run

1. Type-check: `cd automation && npm run typecheck` (`tsc --noEmit`). Fix all errors before running.
2. Run only the batch: `npx playwright test ui-tests/<spec>.spec.ts` (or `-g "ADM-E2E-003"` for a single ID).
3. Default run is **headed Chrome, parallel workers** (see `playwright.config.ts`). On failure: read the trace/screenshot, fix the spec or POM, re-run. Do NOT open any report as a reaction to failure.
4. Mark phase `COMPILED` then `RUN` done per test.

## Phase 7 — Allure report (manual only)

1. After the batch run completes (pass or fail), generate + open manually: `./scripts/open-allure-report.sh` (or `cd automation && npm run report`).
2. Never wire `allure open` into the test command; never auto-open on failure.
3. Mark phase `REPORTED` done; commit specs, page objects, and `batch-state.json` on `feature/e2e-test-cases`.

## Templates

### Page object skeleton

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class CatalogPage {
  readonly page: Page;
  readonly search: Locator;
  readonly addProduct: Locator;

  constructor(page: Page) {
    this.page = page;
    this.search = page.getByRole('textbox', { name: /search products/i });
    this.addProduct = page.getByTestId('inventory-button-add');
  }

  async goto() {
    await this.page.goto('/products');
    await expect(this.page.getByRole('heading', { name: 'Product Catalog' })).toBeVisible();
  }
}
```

### Fixture skeleton

```typescript
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

export const test = base.extend<{ adminPage: Page; userPage: Page }>({ /* login helpers per role */ });
```

## Validation

- Every requested test ID reaches `REPORTED` in `automation/batch-state.json`.
- `npm run typecheck` exits 0; batch run green (or failures documented with root cause).
- Allure report opens via `./scripts/open-allure-report.sh` showing the batch results.
