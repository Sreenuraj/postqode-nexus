# Cleanup Rules Reference

## Redo Protocol Detail
1. Resolve batch location (active vs. archived).
2. If archived, list every `automation/features/**/*.feature` file containing an `@<TEST-ID>` tag matching the batch's `test_ids` — show this list to the user before deleting anything.
3. Delete the batch folder and remove its `index.json`/`index-archive.json` entries (read-merge-write).
4. Evict `reusable-fixtures.json` entries tied to the batch's Test IDs.
5. Never auto-delete a shared `.feature` file — only ever instruct removal of specific scenarios/Examples rows belonging to the redone batch.

## Session Cache Handling
- If a local session cache (e.g. cached auth token/storage_state) references data from a redone batch, invalidate it rather than silently reusing stale state.
