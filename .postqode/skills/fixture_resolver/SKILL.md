---
name: fixture_resolver
description: "Resolves and registers test fixtures (products, orders, categories, users) via the Nexus REST API. Owns reusable-fixtures.json. No Oracle/JDBC — API-first, with UI-setup fallback only when no endpoint exists."
---

# Fixture Resolver Skill

Ensures a verified precondition (a product in a known state, a PENDING order, an enabled/disabled user, etc.) exists before a scenario runs, using the Nexus REST API wherever possible.

## Context Requirements
- `.repository-intelligence/reusable-fixtures.json`
- `docs/testing-guide.md` §3 (API reference) and Swagger at `http://localhost:8080/swagger-ui.html`
- `automation/api_clients/*.py`

## References
- `../../rules/fixture-api-rules.md`

## Key Capabilities

### 1. Cache Check & Sufficiency Audit
- Read `.repository-intelligence/reusable-fixtures.json` for an existing fixture matching the required type/state (e.g. `type: pending_order, product_id: X`).
- If found and still valid (verify via a quick read-only GET, since demo data can be reset), reuse it.
- If missing or stale (e.g. the cached order was since approved/cancelled by another test), create a fresh one.

### 2. API-First Creation
- Use the exact `automation/api_clients/*.py` method for the precondition, per `fixture-api-rules.md`'s table (auth token, product state, order state, category, user).
- Never write raw SQL to create/mutate data. Never invent a new API endpoint that doesn't exist in `docs/testing-guide.md` §3 / Swagger — if genuinely missing, fall back to UI-setup and document it in `plan.md`.

### 3. Full Reset
- `./scripts/reset-demo.sh` is the "clean slate" mechanism — destructive, truncates and reseeds. Only run at explicit user request or the start of a full-suite regression run; always call it out to the user the first time in a session before running (per `general-conventions.md §4`).

### 4. Registry Reconciliation
- After successfully creating/confirming a fixture, read-merge-write it into `reusable-fixtures.json`:
  ```json
  {"type": "pending_order", "order_id": "...", "product_id": "...", "user": "user", "verified_date": "<ISO-8601>"}
  ```
- Evict stale entries immediately if a later check finds the cached fixture no longer in the expected state (e.g. someone else's test consumed/mutated it) — read-merge-write, never leave a stale entry in place.

### 5. Cleanup
- If a fixture was created solely for verification purposes (not meant to persist as seed data), and the scenario doesn't need it to survive, clean it up via the API (e.g. cancel a test-created order) after the batch's `behave` run completes, unless the user wants fixtures left in place for manual inspection.
