---
name: qa_reviewer
description: "Audits plan.md (Phase 5) and generated code (Phase 8) for intent alignment, live-verification evidence completeness, POM/data-driven compliance, and additive-only freeze."
---

# QA Reviewer Skill

Runs the two review gates in `02-plan-and-automate.md`: Phase 5 (plan review) and Phase 8 (code review).

## Context Requirements
- Batch `plan.md`
- `docs/e2e-test-cases.md` (+ companions) for the original manual steps

## References
_(read on-demand — only when a capability below cites it, never pre-loaded)_
- `references/review-checklist.md` — quick-reference checklist for Capabilities 1 and 2
- `../../rules/batch-schema.md` — needed for Capability 2 (writing `code_review` into `batch-meta.json`)


## Key Capabilities

### 1. Phase 5 — Plan Review
- **Coverage check:** every Test ID in the batch has a corresponding Scenario/Scenario Outline row in the plan's Gherkin outline. No silent drops.
- **Step fidelity:** compare the plan's Gherkin against the original manual Step/Action/Expected-Result table in `docs/e2e-test-cases.md` — no summarizing/dropping of Expected Result detail.
- **Live-Verification Evidence Audit (mandatory, new for this project):** every row in `## Locator / Flow Verification Checklist` has a matching row in `## Live Verification Evidence` with a concrete script path, what was checked, and Pass/Fail. Reject the plan if any checklist row lacks evidence, or if evidence is vague (e.g. "looked fine" without specifics).
- **Fixture classification review:** every precondition is classified `[API-First]` (naming the exact `api_clients/` method) or `[UI-Setup]` (with a stated reason no endpoint exists) — reject unclassified preconditions.
- **Data-driven compliance pre-check:** confirm the plan's Data-Driven Plan section correctly separates simple `Examples:` variation from larger `data/*.json` fixture needs — reject if a large dataset is planned to be hardcoded inline in the feature file.
- **Open Question eligibility:** any `## Open Questions` entries must be genuine business-rule ambiguities, not technical locator gaps (which should have been resolved by `live_explorer`'s iteration loop) — reject and bounce back to Phase 3 if a technical gap was mislabeled as an Open Question.
- **Credentials leak scan:** no real credential strings in `plan.md`.
- Sign off: write `Status: [x] Approved` under `## QA Review Sign-off` with date, only once all of the above pass.

### 2. Phase 8 — Code Review
- **Additive-only freeze audit:** run `git diff` on shared files (`automation/pages/base_page.py`, `automation/api_clients/*.py`, `automation/features/steps/common_steps.py`, `automation/utils/*.py`). Reject if any existing method body/signature was modified rather than a new method being added.
- **POM discipline audit:** scan new/modified `automation/pages/*.py` for any `assert`/`expect(...)` call — reject if found (assertions belong only in `steps/*.py`).
- **Raw locator leak audit:** scan new/modified `automation/features/steps/*.py` for direct `page.locator(...)`/`page.get_by_*(...)` calls outside `common_steps.py`'s documented generic-wait exceptions — reject if a step file bypasses the page object layer.
- **Data-driven audit:** scan new feature files/step files for large hardcoded data blocks that should have been externalized to `data/*.json` — reject if found.
- **Assertion sufficiency audit:** for every manual Expected Result, confirm a corresponding `expect(...)`/`assert` exists in the step file — not just a click-through with no verification.
- **Credentials leak audit:** scan all new/modified files for hardcoded credential strings — reject if found, require `.env`/`utils/config.py` loading instead.
- **Locator dedup audit:** confirm no new locator method duplicates an existing one already defined on the same page class or `BasePage`.
- Sign off: write `Status: [x] Code Approved` under `## QA Code Review Sign-off` with date, and `"code_review": {"status": "success", "date": "<ISO-8601>"}` into `batch-meta.json`, only once all of the above pass.

### 3. Buildable/Blocked Split
- If only some Test IDs in the batch have gaps (unresolved Open Questions), proceed with the buildable subset through Phase 6+ and keep the blocked subset at `blocked` status — do not block the whole batch over one Test ID's genuine ambiguity.

### 4. Escalation-Effort Audit (Mode C)
- When reviewing a `debugger` escalation (Failure Count reaching its ceiling), verify the escalation actually followed its own diagnostic tiers (re-read docs, check RIL, try alternate selectors) before accepting the escalation as genuine rather than premature.
