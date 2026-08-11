---
name: batch_cleanup
description: "Redoes/deletes batches, scans for orphaned files, and reconciles the index against automation/features/**."
---

# Batch Cleanup Skill

## Context Requirements
- `.repository-intelligence/test-outputs/index.json`
- `.repository-intelligence/test-outputs/archive/index-archive.json`
- `.repository-intelligence/test-catalog.md`

## References
- `references/cleanup-rules.md`
- `references/reconciliation-rules.md`

## Key Capabilities

### 1. Redo (Mode D)
- Look up the batch in `index.json` (active) then `archive/index-archive.json` (archived).
- **Active batch:** delete `test-outputs/<area>/batch-NNN/`, remove entries from `index.json`.
- **Archived batch:** ask the user to confirm first, showing which `automation/features/**` files reference the batch's Test IDs (`@<TEST-ID>` tag scan) — these become orphaned codebase artifacts on redo.
- Evict any related entries from `reusable-fixtures.json`.
- **Feature-file redo rule:** if a `.feature` file is shared with other batches, instruct the user to surgically remove only the scenarios/Examples rows for this batch's Test IDs — never auto-delete a shared file. If exclusive to this batch, it may be deleted.

### 2. Workspace Smart Scan (Mode E)
- Scan for orphaned folders under `test-outputs/`, stale `brain/scripts/*.py` not referenced in `exploration-ledger.json`, and RIL leaks (batch-specific strings that should have been sanitized).
- Present findings and ask the user: `["Fix all", "Review one by one", "Skip"]`.

### 3. Index Reconciliation
- Two-step: dry-run first (report `promotions`, `blocked_promotions`, `archive_candidates`, `blocked_archives`, `legacy_untracked` buckets), then apply only after user confirmation.
- **Gates enforced:**
  1. `@<TEST-ID>` tag exists uncommented in a `.feature` file.
  2. Structural: the scenario references real, defined steps (no `Undefined` steps reported by `behave --dry-run`).
  3. `batch-meta.json.run_verified.status === "success"` AND `code_review.status === "success"`.
- Never bypass the gate — if a batch looks complete but is missing a verification artifact, the fix is to re-run Phase 7/8 of `02-plan-and-automate.md`, not to hand-edit the JSON.
