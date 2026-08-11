# Batch Schema Reference

## Folder Structure

```
.repository-intelligence/test-outputs/
├── index.json                          ← Master index (single source of truth)
├── Auth/
│   ├── batch-001/
│   │   ├── plan.md
│   │   └── batch-meta.json
├── Admin/
│   ├── batch-002/
│   │   └── ...
├── User/
├── CrossRole/
├── Negative/
└── archive/
    ├── index-archive.json
    └── <area>/batch-NNN/
```

- **Batch IDs** are auto-incremented globally: `batch-001`, `batch-002`, etc.
- Each batch gets its own subfolder under the appropriate `<area>/` directory (`Auth`, `Admin`, `User`, `CrossRole`, `Negative` — matching the section headings of `docs/e2e-test-cases.md`).

## `index.json` Schema

```json
{
  "version": 1,
  "last_updated": "ISO-8601 timestamp",
  "next_batch_id": 2,
  "batches": {
    "batch-001": {
      "area": "Auth",
      "source_doc": "docs/e2e-test-cases.md",
      "created": "ISO-8601",
      "status": "has_open_questions | all_buildable | partial_buildable | in_progress | needs_review | all_implemented | archived",
      "test_ids": ["AUTH-E2E-001", "AUTH-E2E-002", "AUTH-E2E-003", "AUTH-E2E-004", "AUTH-E2E-005"],
      "buildable": ["AUTH-E2E-001"],
      "blocked": [],
      "implemented": [],
      "path": "Auth/batch-001"
    }
  },
  "test_index": {
    "AUTH-E2E-001": { "batch": "batch-001", "status": "buildable", "area": "Auth" }
  }
}
```

### Canonical status vocabulary
- **Batch statuses**: `has_open_questions`, `all_buildable`, `partial_buildable`, `in_progress`, `needs_review`, `all_implemented`, `archived`.
- **Test statuses**: `blocked`, `buildable`, `partial_buildable`, `in_progress`, `needs_review`, `implemented`, `archived`.

## `batch-meta.json` Schema

Location: `.repository-intelligence/test-outputs/<area>/batch-NNN/batch-meta.json`

```json
{
  "batch_id": "batch-001",
  "area": "Auth",
  "source_doc": "docs/e2e-test-cases.md",
  "created": "ISO-8601",
  "last_updated": "ISO-8601",
  "status": "has_open_questions",
  "test_ids": ["AUTH-E2E-001", "AUTH-E2E-002", "AUTH-E2E-003", "AUTH-E2E-004", "AUTH-E2E-005"],
  "buildable_ids": [],
  "blocked_ids": [],
  "implemented_ids": [],
  "run_verified": { "status": "pending" },
  "code_review": { "status": "pending" }
}
```

### `run_verified` artifact (replaces the source system's separate `build_verified`/`test_run_verified` split — Python has no compile step)
Written by `code_generator` after the agent runs `behave` and the user/agent confirms the outcome:
```json
"run_verified": {
  "status": "success",
  "date": "<ISO-8601 UTC>",
  "command": "behave features/auth --tags=@AUTH-E2E-001,@AUTH-E2E-002",
  "scenarios_passed": ["AUTH-E2E-001", "AUTH-E2E-002"],
  "scenarios_failed": []
}
```
`status` is one of `success`, `partial`, `failed`, `failed_due_to_application_defect`, `skipped`.

### `code_review` artifact
```json
"code_review": { "status": "success", "date": "<ISO-8601 UTC>" }
```

## Archiving Preconditions
A batch may be archived only when:
- `status === "all_implemented"`.
- `blocked_ids` is empty and no test is `in_progress`/`needs_review`.
- No unresolved `## Open Questions` remain in `plan.md`.
- `run_verified.status === "success"`.
- `code_review.status === "success"`.
