---
name: ril_writer
description: "Writes discovered/verified locators, flows, and fixtures back to the RIL catalogs. Enforces sanitization at write time."
---

# RIL Writer Skill

## Context Requirements
- `.repository-intelligence/component-catalog/<area>.md`
- `.repository-intelligence/functional-map/<area>.md`
- `.repository-intelligence/test-catalog.md`
- `.repository-intelligence/pattern-catalog.md`
- `.repository-intelligence/exploration-ledger.json`
- `.repository-intelligence/metadata.json`

## References
- `references/ril-write-rules.md`
- `references/sanitization-rules.md`

## Key Capabilities

### 1. Component Catalog Promotion
- Promote entries from `[hypothesis]` (seeded from Appendix A in WF1) or `[Pending Verification]` to `[Verified]` once `live_explorer` evidence confirms them — link each entry to the exact `automation/pages/<Class>.py` method that encodes it.
- Add genuinely new locators discovered during a batch that weren't in Appendix A at all.

### 2. Pattern Catalog Updates
- Add new reusable wait/interaction patterns discovered during a batch (e.g. a new dialog-scoping helper) to `pattern-catalog.md`, with the Python snippet.

### 3. Test Catalog & Task Resolver
- Mark Test IDs `Automated` in `test-catalog.md` once their batch's `run_verified.status === "success"` and it's archived.
- Update `task-resolver.md` if a new functional area or sub-area was created.

### 4. Fixture Registry
- Merge newly proven fixtures into `reusable-fixtures.json` (read-merge-write).

### 5. Exploration Ledger
- Register/update `brain/scripts/*.py` entries per `live_explorer/references/exploration-ledger-schema.md`.

### 6. Sanitized Writing (Mandatory Pre-Write Check)
Before writing to any shared RIL file, check the pending diff for batch-specific leaks (literal `batch-\d+` references, one-off order/product IDs created purely for a single test run) and strip them — keep the durable content (selector, pattern, date, target file path). `.repository-intelligence/reusable-fixtures.json` is explicitly exempt (it's the fixture cache and is allowed to contain concrete IDs).

### 7. Metadata & Index Sync
- Any addition/rename/status change to a RIL artifact must update every affected index file in the same pass: if a functional-map file changes, also touch `functional-map/index.md`, `task-resolver.md`, and `metadata.json.artifact_freshness`.
