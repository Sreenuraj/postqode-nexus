# Workflow: Plan & Automate (merged Architect + Developer)
**Location:** `.postqode/workflows/02-plan-and-automate.md`

## Purpose
Single orchestrated pipeline that takes Test IDs from `docs/e2e-test-cases.md` (or its companion docs) all the way to a passing, archived `behave` batch: ingest → plan → **mandatory live verification** → review → generate Playwright/Python code → run autonomously → debug → review → write back → archive.

This workflow replaces the source system's separate WF2 (Enrich & Plan) and WF3 (Implement) — this project's scope doesn't need two long, separately-gated phases. Every quality gate from the source system is preserved as an explicit phase below; nothing is skipped, just co-located in one workflow.

**This workflow file is a thin orchestrator.** Each phase names the skill responsible and the gate that must pass before advancing. All procedural detail — how to parse, how to verify, how to generate code, how to review — lives in the skill files under `.postqode/skills/`, not here.

## Core Rules Loaded
- `.postqode/rules/general-conventions.md`
- `.postqode/rules/automation-framework.md`
- `.postqode/rules/lessons-learned.md`
- `.postqode/rules/fixture-api-rules.md`
- `.postqode/rules/batch-schema.md`
- `.postqode/rules/companion-communication.md` (if enabled)

## Entry Mode Detection
- **Mode A (Fresh):** User provides Test IDs (e.g. `AUTH-E2E-001,AUTH-E2E-002,...`) or says "automate section 2" / "automate the Auth journeys". Run Phases 1→10.
- **Mode B (Answers):** User answers a previously-raised Open Question for a batch. Resume at Phase 4.
- **Mode C (Escalation):** `debugger` hits Failure Count 5 and needs Architect-level input (e.g. a locator genuinely doesn't exist / business rule ambiguity). Resume at Phase 2/3.
- **Mode D (Redo):** `batch_cleanup` handles wiping and resetting a batch.
- **Mode E (Cleanup/Reconcile):** `batch_cleanup` handles workspace-wide reconciliation.

---

## Phase 1 — Ingest & Triage
- **[Persona Activation] Activating Ingestion Specialist Persona**
- Invoke **`test_case_parser`** → parse the requested Test IDs from `docs/e2e-test-cases.md` (+ companions if relevant), detect pre-existing automation via `@<TEST-ID>` tag scan in `automation/features/**`, allocate/merge a batch under the correct `<area>/batch-NNN/`, write `index.json` + `batch-meta.json` immediately.
- **Gate to advance:** batch folder + initial `batch-meta.json` exist, `next_batch_id` incremented.

## Phase 2 — Static Enrichment
- **[Persona Activation] Activating Architect Persona**
- Invoke **`enrichment_engine`** (Tier 1/2 only) → read `functional-map/<area>.md`, `component-catalog/<area>.md` (Appendix A hypotheses), and any existing `automation/pages/*.py` / `automation/features/**` for reusable flows. Draft the Gherkin scenario shape and the list of locators/flows that need live verification.
- **Gate to advance:** a draft locator/flow list exists (even if every entry is `[Pending Verification]`).

## Phase 3 — Mandatory Live Verification (ALWAYS runs — never skipped)
- Invoke **`live_explorer`** → Architect persona writes/extends a Playwright+Python script under `brain/scripts/` for the batch's functional area and runs it headless against the running app (`localhost:3000` / `localhost:8080`) to confirm every locator and flow from Phase 2 — **even ones Appendix A already documents.**
- **Gate to advance:** every locator/flow in the draft has a corresponding pass/fail evidence line; all failures are resolved (locator corrected) or converted to a genuine business-rule Open Question (never left silently unresolved).

## Phase 4 — Finalize Plan
- Invoke **`enrichment_engine`** → write the final `plan.md` (drop any draft banner), including the `## Live Verification Evidence` section populated from Phase 3, the Gherkin outline, target page-object/step-file names, and data file needs.
- **Gate to advance:** `plan.md` exists with no `[Pending]` markers outside of genuine Open Questions.

## Phase 5 — QA Plan Review
- **[Persona Activation] Activating QA Reviewer Persona**
- Invoke **`qa_reviewer`** (plan-level gates): coverage check (every Test ID has a scenario), executable-assertion audit, Live-Verification Evidence Audit (new — rejects any locator/flow lacking evidence), POM/data-driven compliance pre-check, credentials-leak scan.
- **Gate to advance:** `plan.md` contains `Status: [x] Approved` under `## QA Review Sign-off`.

## Phase 6 — Code Generation
- **[Persona Activation] Activating Developer Persona**
- Invoke **`code_generator`** → write/extend `automation/features/<area>/*.feature`, `automation/features/steps/<area>_steps.py`, `automation/pages/*.py`, and `automation/data/*.json` strictly from the approved `plan.md`. Additive-only on shared files.
- **Gate to advance:** all planned files exist on disk.

## Phase 7 — Autonomous Run & Debug Loop
- Invoke **`code_generator`** to run `behave` (via `execute_command`, autonomous — no per-run approval needed) scoped to the batch's tags.
- **On failure:** invoke **`debugger`** (escalation-counter model, see its SKILL.md) → apply fix → re-run. Loop until pass or Failure Count 5 (→ Mode C escalation back to Phase 2/3, or user intervention per debugger's own gate).
- **Gate to advance:** `behave` run reports all of the batch's scenarios passing; `run_verified` written to `batch-meta.json`.

## Phase 8 — QA Code Review
- Invoke **`qa_reviewer`** (code-level gates): additive-only freeze audit (`git diff` on shared files), POM discipline audit (no assertions in `pages/`, no raw locators in `steps/`), data-driven audit (no hardcoded large datasets inline), credentials-leak scan, assertion-sufficiency audit.
- **Gate to advance:** `plan.md` contains `Status: [x] Code Approved`; `batch-meta.json.code_review.status === "success"`.

## Phase 9 — RIL Write-Back
- **[Persona Activation] Activating RIL Archivist Persona**
- Invoke **`ril_writer`** → promote verified locators from `[hypothesis]`/`[Pending Verification]` to `[Verified]` in `component-catalog/<area>.md`, add any new reusable wait patterns to `pattern-catalog.md`, mark Test IDs `Automated` in `test-catalog.md`, register/merge fixtures in `reusable-fixtures.json`, update `exploration-ledger.json` for any `brain/scripts/*.py` touched.
- **Gate to advance:** RIL files updated, no unsanitized batch-specific leaks.

## Phase 10 — Archive
- Invoke **`archiver`** → verify all archiving preconditions from `batch-schema.md`, move the batch folder to `archive/<area>/batch-NNN/`, partition `index.json` → `index-archive.json`.
- **Gate:** hard preconditions in `batch-schema.md` §Archiving Preconditions must all be true, or archiver refuses and reports why.

---

## Completion Summary (mandatory at the end of every run, ≤10 lines)
- **Current Status:** e.g. "batch-001 (Auth) archived" / "Awaiting your answer to 1 Open Question" / "Phase 7 debug loop, 3/5 attempts used".
- **Action Taken:** 1–2 sentences.
- **Next Action / Question for User:** **bolded**.
