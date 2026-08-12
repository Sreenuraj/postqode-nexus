# Workflow: Plan & Automate (merged Architect + Developer)
**Location:** `.postqode/workflows/02-plan-and-automate.md`

## Purpose
Single orchestrated pipeline that takes Test IDs from `docs/e2e-test-cases.md` (or its companion docs) all the way to a passing, archived `behave` batch: ingest → plan → **mandatory live exploration & verification** → review → generate Playwright/Python code → run autonomously → debug → review → write back → archive.

This workflow replaces the source system's separate WF2 (Enrich & Plan) and WF3 (Implement) — this project's scope doesn't need two long, separately-gated phases. Every quality gate from the source system is preserved as an explicit phase below; nothing is skipped, just co-located in one workflow.

**This workflow file is a thin orchestrator.** Each phase names the skill responsible and the gate that must pass before advancing. All procedural detail — how to parse, how to verify, how to generate code, how to review — lives in the skill files under `.postqode/skills/`, not here.

**Rule loading is just-in-time (JIT), never ambient.** No rule file is pre-loaded for this workflow as a whole. Each phase below cites the exact rule file(s) it needs, right at the point that phase is reached — read only that file, only when you get there. See `.postqode/rules/general-conventions.md §0` for the full JIT protocol.

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
- **Rules needed at this phase:** read `.postqode/rules/batch-schema.md` (index/metadata schema) and `.postqode/rules/general-conventions.md §5` (Universal Index Merging Rule — read-merge-write, never overwrite) before touching `index.json`/`batch-meta.json`.
- **Gate to advance:** batch folder + initial `batch-meta.json` exist, `next_batch_id` incremented.

## Phase 2 — Static Enrichment
- **[Persona Activation] Activating Architect Persona**
- Invoke **`enrichment_engine`** (Tier 1/2 only) → read `functional-map/<area>.md`, `component-catalog/<area>.md` (Appendix A hypotheses), and any existing `automation/pages/*.py` / `automation/features/**` for reusable flows. Draft the Gherkin scenario shape and the list of locators/flows that need live verification.
- **Rules needed at this phase:** read `.postqode/rules/general-conventions.md §3` (RIL-First Search Policy) and `.postqode/rules/general-conventions.md §1` (RIL Operating Contract — load only the relevant area's functional-map/component-catalog, not the whole RIL) before searching.
- **Gate to advance:** a draft locator/flow list exists (even if every entry is `[Pending Verification]`).

## Phase 3 — Mandatory Live Verification & Exploration (ALWAYS runs — never skipped)
- Invoke **`live_explorer`** → Architect persona uses live browser tools (`postqode_browser_agent` / live browser navigation) to explore, inspect, and verify the live app (`localhost:3000` / `localhost:8080`), and writes/extends a Playwright+Python script under `brain/scripts/` for the batch's functional area to confirm every locator and flow from Phase 2 — **even ones Appendix A already documents.**
- **Rules needed at this phase:** read `.postqode/rules/general-conventions.md §12` (Credentials Handling — never hardcode demo creds inline) and `.postqode/rules/general-conventions.md §4` (Terminal-Execution Policy — autonomous script execution is allowed) before writing/running the script.
- **Gate to advance:** every locator/flow in the draft has a corresponding pass/fail evidence line; all failures are resolved (locator corrected) or converted to a genuine business-rule Open Question (never left silently unresolved).

## Phase 4 — Finalize Plan
- Invoke **`enrichment_engine`** → write the final `plan.md` (drop any draft banner), including the `## Live Verification Evidence` section populated from Phase 3, the Gherkin outline, target page-object/step-file names, and data file needs.
- **Rules needed at this phase:** read `.postqode/rules/fixture-api-rules.md` when classifying preconditions as API-first vs. UI-setup for the plan's fixture section.
- **Gate to advance:** `plan.md` exists with no `[Pending]` markers outside of genuine Open Questions.

## Phase 5 — QA Plan Review
- **[Persona Activation] Activating QA Reviewer Persona**
- Invoke **`qa_reviewer`** (plan-level gates): coverage check (every Test ID has a scenario), executable-assertion audit, Live-Verification Evidence Audit (new — rejects any locator/flow lacking evidence), POM/data-driven compliance pre-check, credentials-leak scan.
- **Rules needed at this phase:** read `.postqode/rules/automation-framework.md §2–§5` (POM discipline, BDD conventions, waiting strategy, data-driven rules) to check the draft plan against them.
- **Gate to advance:** `plan.md` contains `Status: [x] Approved` under `## QA Review Sign-off`.

## Phase 6 — Code Generation
- **[Persona Activation] Activating Developer Persona**
- Invoke **`code_generator`** → write/extend `automation/features/<area>/*.feature`, `automation/features/steps/<area>_steps.py`, `automation/pages/*.py`, and `automation/data/*.json` strictly from the approved `plan.md`. Additive-only on shared files.
- **Rules needed at this phase:** read `.postqode/rules/automation-framework.md` (full file — POM/BDD/data-driven/wait-strategy conventions the generated code must follow) and `.postqode/rules/general-conventions.md §11` (Shared Code Integrity — additive-only) before touching any shared module.
- **Gate to advance:** all planned files exist on disk.

## Phase 7 — Autonomous Run & Debug Loop
- Invoke **`code_generator`** to run `behave` (via `execute_command`, autonomous — no per-run approval needed) scoped to the batch's tags.
- **Rules needed at this phase:** read `.postqode/rules/general-conventions.md §4` (Terminal-Execution Policy) before running `behave`.
- **On failure:** invoke **`debugger`** (escalation-counter model, see `.postqode/skills/debugger/SKILL.md`) → apply fix → re-run. Loop until pass or Failure Count 5 (→ Mode C escalation back to Phase 2/3, or user intervention per debugger's own gate). The debugger cites `.postqode/rules/lessons-learned.md` itself when it needs it — do not pre-load it here.
- **Gate to advance:** `behave` run reports all of the batch's scenarios passing; `run_verified` written to `batch-meta.json` per `.postqode/rules/batch-schema.md`.

## Phase 8 — QA Code Review
- Invoke **`qa_reviewer`** (code-level gates): additive-only freeze audit (`git diff` on shared files), POM discipline audit (no assertions in `pages/`, no raw locators in `steps/`), data-driven audit (no hardcoded large datasets inline), credentials-leak scan, assertion-sufficiency audit.
- **Rules needed at this phase:** read `.postqode/rules/general-conventions.md §11` (Shared Code Integrity) for the freeze audit and `.postqode/rules/automation-framework.md §2, §5` for the POM/data-driven audits.
- **Gate to advance:** `plan.md` contains `Status: [x] Code Approved`; `batch-meta.json.code_review.status === "success"`.

## Phase 9 — RIL Write-Back
- **[Persona Activation] Activating RIL Archivist Persona**
- Invoke **`ril_writer`** → promote verified locators from `[hypothesis]`/`[Pending Verification]` to `[Verified]` in `component-catalog/<area>.md`, add any new reusable wait patterns to `pattern-catalog.md`, mark Test IDs `Automated` in `test-catalog.md`, register/merge fixtures in `reusable-fixtures.json`, update `exploration-ledger.json` for any `brain/scripts/*.py` touched.
- **Rules needed at this phase:** read `.postqode/rules/general-conventions.md §6` (Universal RIL Sanitization Rule) before writing to any shared RIL file.
- **Gate to advance:** RIL files updated, no unsanitized batch-specific leaks.

## Phase 10 — Archive
- Invoke **`archiver`** → verify all archiving preconditions from `.postqode/rules/batch-schema.md` §Archiving Preconditions, move the batch folder to `archive/<area>/batch-NNN/`, partition `index.json` → `index-archive.json`.
- **Rules needed at this phase:** read `.postqode/rules/batch-schema.md` §Archiving Preconditions and `.postqode/rules/general-conventions.md §5` (read-merge-write on both index files).
- **Gate:** hard preconditions must all be true, or archiver refuses and reports why.

---

## Persona Activation Logging
Print `[Persona Activation] Activating <Persona> Persona` at each persona switch marked above. Full persona-to-phase mapping and the rule requiring this is in `.postqode/rules/general-conventions.md §9` — read it only when you first hit a `[Persona Activation]` line, not before.

## Completion Summary (mandatory at the end of every run, ≤10 lines)
Format is defined in `.postqode/rules/general-conventions.md §10` — read that section when you reach the end of a run, not in advance.
- **Current Status:** e.g. "batch-001 (Auth) archived" / "Awaiting your answer to 1 Open Question" / "Phase 7 debug loop, 3/5 attempts used".
- **Action Taken:** 1–2 sentences.
- **Next Action / Question for User:** **bolded**.
