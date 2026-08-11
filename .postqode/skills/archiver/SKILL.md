---
name: archiver
description: "Archives fully implemented batches. Moves the batch folder to archive/, partitions active/archived indices."
---

# Archiver Skill

## Context Requirements
- `.repository-intelligence/test-outputs/index.json`
- `.repository-intelligence/test-outputs/archive/index-archive.json`

## References
- `../../rules/batch-schema.md`

## Key Capabilities

### 1. Verification (Hard Preconditions)
Refuse to archive unless ALL are true — emit an explicit error listing which failed, never silently skip:
- `batch-meta.json.status === "all_implemented"`
- `test_ids.length === implemented.length`
- `blocked.length === 0` and no test `in_progress`/`needs_review`
- No unresolved `## Open Questions` in `plan.md`
- `batch-meta.json.run_verified.status === "success"` (a real `behave` run confirmed passing, not just code generated)
- `batch-meta.json.code_review.status === "success"`

### 2. File Relocation
- Move `.repository-intelligence/test-outputs/<area>/batch-NNN/` → `.repository-intelligence/test-outputs/archive/<area>/batch-NNN/`.
- Update `batch-meta.json.status = "archived"`.

### 3. Index Partitioning
- Move the batch entry and its `test_index` rows from `index.json` to `archive/index-archive.json` (read-merge-write on both).
- Set statuses to `archived`, update path references.
