---
name: code_generator
description: "Generates behave feature files, step definitions, Playwright-based Page Objects, and data-driven fixtures from an approved plan.md. Runs behave autonomously and hands failures to the debugger skill."
---

# Code Generator Skill

Implements the automation code strictly from the approved `plan.md` — it trusts the plan's Live Verification Evidence and does not re-verify locators itself (that already happened in `live_explorer`, Architect-owned).

## Context Requirements
- Approved batch `plan.md` (must have `Status: [x] Approved` under `## QA Review Sign-off`)
- `.repository-intelligence/component-catalog/<area>.md`
- `.repository-intelligence/pattern-catalog.md`
- Existing `automation/pages/*.py`, `automation/features/steps/*.py`

## References
_(read on-demand — only when a capability below cites it, never pre-loaded)_
- `references/code-conventions.md` — needed for Capability 1 (Code Generation)
- `../../rules/batch-schema.md` — needed for Capability 3 (Autonomous Run — writing `run_verified`)
- `../../rules/automation-framework.md` — needed for Capability 1 (POM/BDD conventions to follow)


## Key Capabilities

### 1. Code Generation
- Implement each `## Implementation Build Stages` checkbox from `plan.md` in order; skip already-`[x]`-completed stages.
- **Feature file:** write/extend `automation/features/<area>/<file>.feature` using the plan's Gherkin outline, tagged `@<TEST-ID>` per scenario. Reuse an existing `Background:` if one already covers the same setup in that file.
- **Page objects:** add new locator/action methods to the target `automation/pages/<Class>.py` named in the plan. If the file doesn't exist yet, create it extending `BasePage`. **Never add assertions here.**
- **Step definitions:** add new `@given`/`@when`/`@then` functions to `automation/features/steps/<area>_steps.py`. Steps call page-object methods; assertions live here using `playwright.sync_api.expect(...)`.
- **Data files:** create/extend `automation/data/<file>.json` per the plan's Data-Driven Plan section, and wire it up via `utils/data_loader.py`.
- **Additive-only:** never edit the body/signature of an existing shared method (`BasePage`, `api_clients/*`, `common_steps.py`) to fix this batch's need — add a new method with a distinct name.
- **Locator reuse:** before adding a new locator method, check whether an equivalent one already exists on the target page class (or `BasePage`); reuse rather than duplicate.

### 2. Status Tracking
- Set the batch/test status to `in_progress` in `index.json` as soon as files are written for a stage.

### 3. Autonomous Run (Phase 7)
- Run `behave` scoped to the batch's Test ID tags, e.g.:
  ```bash
  cd automation && behave features/auth --tags=@AUTH-E2E-001,@AUTH-E2E-002,@AUTH-E2E-003,@AUTH-E2E-004,@AUTH-E2E-005
  ```
  via `execute_command` — autonomous, no per-run approval needed (per `general-conventions.md §4`).
- On success: write `run_verified` into `batch-meta.json`:
  ```json
  "run_verified": {"status": "success", "date": "<ISO-8601>", "command": "<exact behave cmd>", "scenarios_passed": ["AUTH-E2E-001", "..."], "scenarios_failed": []}
  ```
- On failure: invoke the **`debugger`** skill (do not ad-hoc patch). Loop: debugger diagnoses → applies fix → re-run `behave` → repeat until pass or debugger's Failure Count reaches its escalation ceiling.

### 4. Troubleshooting Fallback (before invoking debugger for a truly new class of failure)
- Check `.repository-intelligence/exploration-ledger.json` and `brain/scripts/verify_<area>.py` — the same script that verified this locator in Phase 3 can be re-run quickly to check "did the app change since verification?" before assuming the generated code itself is wrong.

## 5. UI Interaction Robustness (POM-embedded, not step-level)
These live in `BasePage`/page-object methods, not scattered across step files:
1. **Dialog scoping:** resolve `page.get_by_role("dialog")` first, then scope all control lookups inside it.
2. **Dropdowns/overlays:** open trigger, then resolve the panel via `aria-controls` if present before falling back to a generic overlay locator.
3. **Search/filter rows in dropdowns:** skip filter-input/header rows before selecting an option.
4. **Checkbox/radio state:** click, then verify the resulting `checked`/`aria-checked` state — don't assume the click worked.
5. **Stale locators:** always re-resolve a `Locator` fresh per interaction (Playwright locators are lazy — this is naturally handled if page-object methods return fresh `Locator`s per call as required in `automation-framework.md §2`).
