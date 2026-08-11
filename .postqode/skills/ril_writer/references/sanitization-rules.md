# Sanitization Rules Reference

Apply before writing to any shared RIL file (`test-catalog.md`, `metadata.json`, `component-catalog/*.md`, `functional-map/*.md`, `pattern-catalog.md`, `glossary.md`, `task-resolver.md`):

1. Strip literal `batch-\d+` references — replace with "a batch in this functional area" or drop entirely.
2. Strip one-off fixture IDs created purely for a single test run (e.g. a throwaway order ID) — replace with a generic description ("a PENDING order").
3. Strip any local absolute file paths — use repo-relative paths only.
4. Never strip: selector strings, page-object class/method names, functional descriptions, dates — these are the durable, valuable content.

**Exception:** `.repository-intelligence/reusable-fixtures.json` MAY contain concrete IDs (product SKU, order ID, username) — it is explicitly the fixture cache and is whitelisted.

If sanitization cannot fully remove a match, refuse the write and surface the offending line to the user rather than silently writing unsanitized content.
