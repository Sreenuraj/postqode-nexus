---
name: live_explorer
description: "MANDATORY Architect-owned skill. Runs Playwright+Python headless verification scripts against the running app to confirm every locator/flow in the draft plan before it is marked resolved. Always runs — never skipped, even when Appendix A already documents a selector."
---

# Live Explorer Skill

This is the most important behavioral change from the source system: verification is **mandatory for every batch**, not a last-resort fallback. It is explicitly the **Architect persona's** responsibility (Phase 3 of `02-plan-and-automate.md`), and it uses the exact same Playwright+Python stack that the final automation runs on — a verification script can become the first draft of a page object.

## Context Requirements
- The draft `plan.md`'s `## Locator / Flow Verification Checklist` (from `enrichment_engine` Phase 2)
- `.repository-intelligence/exploration-ledger.json`
- Running app at `http://localhost:3000` (frontend) and `http://localhost:8080` (API)
- `automation/.env` (or a local equivalent) for demo credentials

## References
- `references/script-template.py`
- `references/exploration-ledger-schema.md`

## Key Capabilities

### 0. Preconditions
- Confirm the app is reachable: `curl -s http://localhost:8080/health` and `curl -s http://localhost:3000/login` (or equivalent quick check). If not running, ask the user to start it (`./scripts/start-all.sh` or similar) — this is a legitimate mid-run pause, not a workflow failure.
- Confirm demo credentials are available (from `docs/e2e-test-cases.md` §1.1: `admin/Admin@123`, `user/User@123`) — load them via `utils/config.py`/`.env`, never hardcode inline in the verification script beyond a first draft that gets sanitized before commit (see `general-conventions.md §12`).

### 1. Ledger Check & Script Reuse (Mandatory First Step)
- Before writing any script, read `.repository-intelligence/exploration-ledger.json` for an existing script covering the batch's functional area.
- **Reuse boundary:** you may extend an existing script only if the new checks are within the same functional area already recorded in its ledger entry. A different area → write a new script, don't repurpose an unrelated one.
- If no matching script exists, create `brain/scripts/verify_<area>.py` from `references/script-template.py`.

### 2. What Gets Verified (per checklist row from plan.md)
For every element/flow in the draft plan's checklist, **regardless of whether Appendix A already lists a selector**:
1. **Locators:** navigate to the right page/state, assert the element exists, is visible, and is interactable (not just present in DOM) using the exact selector strategy from `automation-framework.md §2` (data-testid → role → label).
2. **Flows:** actually perform the action (click login, submit a dialog, approve an order) and confirm the described transition happens (redirect, toast, row/badge update) — not just that the trigger element exists.
3. **Dynamic/async behavior:** confirm debounce timing, overlay settle timing, and optimistic-update behavior actually match Appendix B's documented patterns on the live app (timings can drift from docs).

### 3. Script Requirements
- Python + Playwright **sync API**, headless by default (env var toggle for headed debugging).
- Location: `brain/scripts/verify_<area>.py`, one script per functional area, extended across batches (never one script per test case).
- Each run prints one structured line per checked item:
  - `[OK] <element/flow> — <one-line detail>` or
  - `[FAIL] <element/flow> — tried: <selector1>, <selector2> — <observed DOM/error>`
- On failure, save a screenshot to `brain/screenshots/<area>/<element>-fail.png` for later inspection.
- No hardcoded secrets: load credentials from env vars or a local (gitignored) config, consistent with `general-conventions.md §12`.

### 4. Progress-Based Iteration Loop
- If a check fails, try alternative selector strategies (role → label → nearby text) and re-run — keep iterating as long as you're making progress (trying a genuinely different approach) or the failure signature changes.
- Stop and treat as a business-rule Open Question only if: the element/flow truly doesn't exist as described (documentation/app mismatch that isn't a locator problem — the feature itself behaves differently than documented), or a real application error (500, console exception) blocks progress.
- Minimum two verification attempts (initial + at least one refinement) before ever filing anything as unresolved.

### 5. Evidence Write-Back
- After the script run, write one row per checklist item into `plan.md`'s `## Live Verification Evidence` table (this is `enrichment_engine`'s table to finalize, but `live_explorer` supplies the raw evidence: script path, what was checked, observed result, pass/fail).
- This table is the **sole evidence contract** with `qa_reviewer` — do not report verification results only in chat; they must land in `plan.md`.

### 6. Ledger Registration
- After the script run, register or update the script's entry in `.repository-intelligence/exploration-ledger.json` (`scripts{}` map): location, functional area(s), what it verifies, selectors confirmed, last-used date.
- If the script's checks were incorporated directly into a page object (common here, since both are Playwright+Python), note the corresponding `automation/pages/*.py` class/method in the ledger entry too — this creates a traceable link from "verified in brain/scripts" to "implemented in pages/".

### 7. Script Disposition (avoid script sprawl)
- A script that only ever checked one specific batch's narrow, one-off state (not reusable) should have its durable findings (selectors/flows confirmed) merged into the ledger, and the throwaway script itself may be deleted — the knowledge survives in the ledger and in `plan.md` evidence regardless of whether the file is kept.
- A script that is genuinely reusable for the whole functional area should be kept and extended in future batches.
