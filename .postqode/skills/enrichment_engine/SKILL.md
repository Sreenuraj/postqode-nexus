---
name: enrichment_engine
description: "Performs static enrichment from RIL/existing code, drafts and finalizes plan.md, and resolves Open Questions. Owns the plan.md lifecycle for the merged workflow's Phases 2 and 4."
---

# Enrichment Engine Skill

Plans the automation context for a batch: what Gherkin scenarios look like, which page objects/steps already exist, what's genuinely new, and what needs live verification. Does NOT perform browser verification itself (that's `live_explorer`) — it drafts the checklist that `live_explorer` executes against.

## Context Requirements
- `.repository-intelligence/functional-map/<area>.md`
- `.repository-intelligence/component-catalog/<area>.md`
- `.repository-intelligence/pattern-catalog.md`
- Existing `automation/pages/*.py`, `automation/features/steps/*.py`, `automation/features/<area>/*.feature`

## References
_(read on-demand — only when a capability below cites it, never pre-loaded)_
- `references/plan-template.md` — needed for Capability 2 (Draft Checkpoint Save)
- `../../rules/fixture-api-rules.md` — needed for Capability 1 (Fixture planning)
- `../../rules/automation-framework.md` — needed for Capability 1 (data-driven planning)


## Key Capabilities

### 1. Static Enrichment (Phase 2 of `02-plan-and-automate.md`)
- Read the batch's Test IDs' full Step/Action/Expected-Result tables (from `test_case_parser`'s output) and the matching `functional-map/<area>.md` entry.
- For each Test ID, draft the Gherkin scenario shape (Given/When/Then lines) mapped as closely as possible to the manual steps — **do not summarize or drop any Expected Result detail; it is the assertion oracle.**
- For each referenced UI element/flow, look up `component-catalog/<area>.md` for an Appendix-A-seeded hypothesis and any prior `[Verified]` entry from an earlier batch. Look up `pattern-catalog.md` for the matching wait strategy (debounce, overlay settle, optimistic update).
- Check existing `automation/pages/*.py` for a page object method that already does what's needed — reuse it by reference in the plan rather than planning a duplicate.
- Produce a **Locator/Flow Verification Checklist** — one row per element/flow that Phase 3 (`live_explorer`) must confirm, whether or not Appendix A already has a hypothesis. Nothing is marked resolved yet at this stage; that only happens after live verification.
- **Data-driven planning:** identify which parts of the scenario should be `Scenario Outline` + `Examples:` (simple 2-4 row variation) vs. which need a `data/*.json` fixture (larger/reusable datasets) — document the choice and the exact dataset/file to use or create.
- **Fixture planning:** for every precondition (e.g. "at least one PENDING order exists"), classify it `[API-First]` (name the exact `api_clients/` method) or `[UI-Setup]` (no REST endpoint exists — document why) per `fixture-api-rules.md`.

### 2. Draft Checkpoint Save
- Write the draft `plan.md` (using `references/plan-template.md`) with a `⚠️ DRAFT — Live Verification Pending` banner at the top, containing the draft Gherkin outline, the Locator/Flow Verification Checklist (all rows `[Pending Verification]`), and the fixture classification table.
- This draft is the hand-off artifact `live_explorer` consumes in Phase 3.

### 3. Plan Finalization (Phase 4 of `02-plan-and-automate.md`)
- After `live_explorer` returns its evidence (pass/fail per row), incorporate it into `plan.md`'s `## Live Verification Evidence` section (see `references/plan-template.md`).
- Remove the draft banner.
- Resolve any locator that failed verification: either the corrected locator/flow is now documented as `[Verified]`, or — only if the mismatch reveals a genuine business-rule ambiguity (not a technical fix) — add it to `## Open Questions`.
- Finalize the `## Implementation Build Stages` section: exact target files (`automation/features/<area>/<file>.feature`, `automation/features/steps/<area>_steps.py`, `automation/pages/<Class>.py`, `automation/data/<file>.json`), each as a checkbox `[ ]` for `code_generator` to work through.

### 4. Open Question Resolution (Mode B)
- When the user answers a previously-raised Open Question: update `plan.md`, and if the answer implies a locator/flow needs (re-)verification, hand back to `live_explorer` for a targeted check before finalizing.
- Re-evaluate the affected Test ID's status from `blocked` → `buildable` in `index.json`/`batch-meta.json`.

### 5. Open-Question Eligibility Filter
Only genuine business-rule ambiguities are eligible as Open Questions to the user — e.g. "the doc doesn't specify what happens if quantity exceeds stock by exactly 1" or a real contradiction between two docs. **Not eligible:** any technical locator/flow gap (that's `live_explorer`'s job to resolve, looping until resolved or proven to be a genuine app behavior worth asking about).
