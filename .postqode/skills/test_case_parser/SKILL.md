---
name: test_case_parser
description: "Parses test cases directly from docs/e2e-test-cases.md and its companion docs, triages against active/archived batches, detects pre-existing automation, and initializes/merges batches."
---

# Test Case Parser Skill

Handles ingestion and triage of test cases from the local Markdown doc corpus. No Jira/Xray/CSV — the source of truth is `docs/e2e-test-cases.md` plus its two companions.

## Context Requirements
- `docs/e2e-test-cases.md`
- `docs/functional-tests-dynamic-ui.md`
- `docs/functional-tests-product-request.md`
- `.repository-intelligence/task-resolver.md`
- `.repository-intelligence/test-outputs/index.json`
- `.repository-intelligence/test-outputs/archive/index-archive.json`

## References
- `../../rules/batch-schema.md`

## Key Capabilities

### 1. Doc Corpus Scan (used by WF1 Phase 1)
- Read `docs/e2e-test-cases.md` top-to-bottom once to extract: system purpose (from the header/scope note), the Credentials table (§1.1), the Navigation Map (§1.2), and the Automation Conventions (§1.3) — these seed `repository-overview.md` and `framework-summary.md`.

### 2. Test ID Parsing
- Each Test ID appears as a `### <ID> — <Title>` heading (e.g. `### AUTH-E2E-001 — Admin login success`), immediately followed by `**Role:**` / `**Journey:**` metadata and a `| Step | Action | Expected Result |` table.
- For a requested Test ID or a requested section (e.g. "section 2" / "Auth"), extract:
  - ID, Title, Role, Journey summary
  - The full Step/Action/Expected Result table (verbatim — do not paraphrase Expected Result text, it is the assertion oracle)
  - Any cross-references to companion docs (e.g. "Detail steps: `functional-tests-dynamic-ui.md` Tests 4–6") — if present, also open that companion doc and pull the referenced test's full step table into context.
- Companion docs (`functional-tests-dynamic-ui.md`, `functional-tests-product-request.md`) follow the same `### <ID> — <Title>` + table structure — parse them identically when referenced.

### 3. Functional Area Resolution
- Resolve area from the section heading in `e2e-test-cases.md`:
  - §2 Authentication & Session → area `Auth`
  - §3 Admin Journeys → area `Admin`
  - §4 Standard User Journeys → area `User`
  - §5 Cross-Role End-to-End Journeys → area `CrossRole`
  - §6 Negative & Edge-Case Tests → area `Negative`
- Cross-reference `.repository-intelligence/task-resolver.md` to confirm the area name matches an existing functional-map/component-catalog file; if not yet present, this is expected pre-WF1 and should be flagged (WF1 should run first).

### 4. Pre-Existing Automation Detection
- Scan `automation/features/**/*.feature` for `@<TEST-ID>` tags (e.g. `@AUTH-E2E-001`), case-sensitive exact match, ignoring commented-out lines (`# @AUTH-E2E-001`).
- If already automated: inform the user immediately, skip it from the new batch unless the user explicitly asks to re-implement (in which case tag the plan with a re-implementation warning banner and note the existing `.feature` path that will need surgical scenario replacement).

### 5. Active Batch Triage & Merging
- Read `index.json` and `archive/index-archive.json` (read-then-merge, never overwrite; create with default clean structure if missing: `{"version":1,"last_updated":"","next_batch_id":1,"batches":{},"test_index":{}}`).
- **Smart Grouping:** if a batch already exists for the same area (any status, including `archived`), propose merging the new Test IDs into it rather than creating a new batch — maximizes scenario/feature-file reuse.
  - Merging into an **archived** batch → **Re-opening Protocol**: move the folder from `archive/<area>/batch-NNN/` back to `<area>/batch-NNN/`, move the registry entry back to `index.json`, set batch status to `in_progress`, set the new Test IDs' status to `buildable`/`blocked` as appropriate while keeping existing ones `implemented`.
  - Merging into an active batch → append Test IDs, update `test_index`, keep existing statuses untouched.
- If no match, allocate a new batch: read `next_batch_id`, use it, increment it, create `<area>/batch-NNN/`, write `batch-meta.json` immediately (per `general-conventions.md §5` — read-merge-write, never blind overwrite).
- **Path rule:** always forward slashes, area folder must be one of `Auth|Admin|User|CrossRole|Negative` (or a new area explicitly confirmed against `task-resolver.md` — never the repo name itself).

### 6. Grouping & Naming (Interactive when ambiguous)
- Default feature-file naming: `<Area>/<sub_area>.feature` (e.g. `auth/login.feature`, `admin/product_catalog.feature`), matching the `automation/features/` layout in `automation-framework.md`.
- If a new Test ID doesn't cleanly fit an existing feature file's `Background:`/setup, ask the user via `ask_followup_question` whether to add a new `Scenario`/`Scenario Outline` to the existing file or create a new one.
