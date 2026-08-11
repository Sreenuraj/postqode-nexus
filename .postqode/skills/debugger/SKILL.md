---
name: debugger
description: "Trigger when a behave run fails in Phase 7 of 02-plan-and-automate.md. Manages a per-step failure counter and an escalation ladder, replacing ad-hoc trial-and-error fixes."
---

# Debugger Skill

Structured, counter-driven troubleshooting when `behave` reports failures. Prevents guess-and-check fixes.

## Context Requirements
- Batch `plan.md` and `diagnostics.md` (created by this skill inside the batch folder)
- `automation/` source (pages, steps, features)
- `.repository-intelligence/exploration-ledger.json`, `component-catalog/<area>.md`
- `behave` failure output / Playwright trace-on-failure artifacts (if enabled)

## References
_(read on-demand — only when a capability below cites it, never pre-loaded)_
- `../../rules/lessons-learned.md` — needed at Level 1 (Local Triage) before applying any fix
- `../../rules/general-conventions.md` — needed for Capability 5 (Rules Compliance, e.g. §11 additive-only, §13 DB safety)
- `../code_generator/SKILL.md` — needed if handing a fix back for regeneration
- `../live_explorer/SKILL.md` — needed at Level 1 when re-running `verify_<area>.py`
- `../qa_reviewer/SKILL.md` — needed for Capability 3 (Pre-Execution QA Gate)


## Key Capabilities

### 1. Per-Step Failure Counter
Track in `diagnostics.md` inside the batch folder:
```markdown
## Debugger State
- **Failing Step:** "<exact Gherkin step text>"
- **Failure Count:** <N>
- **Escalation Level:** <1-5>
```
- Same failing step text as last time → increment count. Different step → reset to 1.

### 2. Escalation Ladder

**Level 1 — Local Triage**
- Read the `behave` failure output (assertion message, traceback) and any Playwright trace/screenshot captured on failure.
- Check `.repository-intelligence/exploration-ledger.json` and re-run the relevant `brain/scripts/verify_<area>.py` quickly — did the app change since Phase 3 verified this? (Very common root cause: app state drifted, e.g. someone ran `reset-demo.sh` mid-session.)
- Apply an additive fix to the page object/step definition.
- Document the fix + reasoning in `diagnostics.md` under `## Mistake & Learning Log`.

**Level 2 — Cross-Feature Audit**
All of Level 1, plus:
- Read at least 2–3 other `.feature` files in the same or adjacent functional area for a similar setup/assertion pattern that already works.
- Check `component-catalog/<area>.md` for an already-`[Verified]` alternative locator.

**Level 3 — Fixture/DB Probing**
All of Levels 1–2, plus:
- Check whether the failure is a fixture/data problem, not a code problem: run a read-only Postgres check (`utils/db_helper.py`) or a `GET` API call to confirm the actual current state of the product/order/user involved.
- If demo data is in an unexpected state, consider whether `./scripts/reset-demo.sh` needs to be run (ask the user first — destructive).

**Level 4 — Re-Read Source Docs**
All of Levels 1–3, plus:
- Re-read the original Test ID's Step/Action/Expected-Result table in `docs/e2e-test-cases.md` (and companion docs if referenced) end-to-end — check for a missed precondition or a detail that was summarized away during planning.

**Level 5 — Halt & Ask User**
All of Levels 1–4 documented with no resolution:
- Ask the user via `ask_followup_question`:
  > "I've tried 4 structured debugging levels (local triage, cross-feature audit, fixture/DB probing, doc re-read) on step '<step text>' with no resolution. How would you like to proceed?"
  > Options: `["Let me look at it live (you drive the browser)", "Escalate to Mode C (re-plan this Test ID)", "Skip/defer this Test ID for now"]`

### 3. Pre-Execution QA Gate
Before asking the user to re-run/confirm after any fix (Level 1+), invoke `qa_reviewer`'s escalation-effort audit to confirm the fix is evidence-based, not a guess, and that additive-only was respected.

### 4. Post-Success Cleanup
Once `behave` passes:
1. Remove any temporary debug print statements added during troubleshooting.
2. Invoke `qa_reviewer` for the final Phase 8 code review — do not mark the stage `[x] Completed` without that sign-off.

### 5. Rules Compliance
- Additive-only on shared files.
- Read-only DB access only.
- No hardcoded credentials in any diagnostic script.
- No trial-and-error: every fix must trace to evidence documented at its escalation level.
