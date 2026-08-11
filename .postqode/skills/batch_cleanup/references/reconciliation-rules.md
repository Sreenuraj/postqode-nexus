# Reconciliation Rules Reference

## Three-Gate Validation (must ALL pass before promotion/archive)
1. **L1 — Tag exists:** `@<TEST-ID>` present, uncommented, in a `.feature` file under `automation/features/`.
2. **L2 — Structural:** run `behave --dry-run` on the relevant feature; every step must resolve to a defined step function (no `Undefined` reported), and the scenario has at least one Given/When/Then.
3. **L3 — Verified run:** `batch-meta.json.run_verified.status === "success"` AND `code_review.status === "success"` — both written only after a real `behave` execution and QA sign-off, never hand-set.

## Dry-Run Output Buckets
- `promotions` — passes all 3 gates, eligible for status bump to `implemented`.
- `blocked_promotions` — fails L2 (structural issue) — report, don't promote.
- `archive_candidates` — batch-level, passes L3 for every test in the batch.
- `blocked_archives` — looks complete but missing `run_verified`/`code_review` — report, don't archive.
- `legacy_untracked` — a `@<TEST-ID>` tag exists in code with no `index.json` entry (pre-dates this system) — record in `test-catalog.md`, never auto-archive.
