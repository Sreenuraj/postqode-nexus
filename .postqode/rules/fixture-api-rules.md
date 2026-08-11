# Fixture API Rules (API-First, No Oracle/JDBC)

Replaces the source system's Java fixture modernization rules with a much smaller contract, since PostQode Nexus already exposes a complete, documented REST API and a one-command demo-data reset.

## 1. Principle
All test fixture/preconditions setup MUST prefer the documented Nexus REST API over UI clicks. UI clicks are reserved for the actual story being verified — not for getting into position to verify it.

| Precondition need | Preferred mechanism |
|---|---|
| Auth token / logged-in session | `POST /api/v1/auth/login` via `api_clients/auth_client.py`. For UI tests needing to skip the login screen, use Playwright's `storage_state` captured from an API-authenticated session, or simply drive the login UI once per scenario (cheap — no long wizard chain like the source system had). |
| A product in a known state (ACTIVE/LOW_STOCK/OUT_OF_STOCK, specific quantity) | `POST /api/v1/products`, `PATCH /api/v1/products/{id}/status`, `PATCH /api/v1/products/{id}` via `api_clients/product_client.py` |
| A PENDING/APPROVED/REJECTED/CANCELLED order | `POST /api/v1/orders` as the `user` role via `api_clients/order_client.py`; use admin approve/reject endpoints to move it to the desired terminal state before the UI test begins, if the terminal state itself isn't the thing being tested |
| A category | `POST /api/v1/categories` via `api_clients/category_client.py` |
| A user (enabled/disabled, admin/user role) | `POST /api/v1/users` (admin) via `api_clients/user_client.py` |
| Full clean baseline before a suite run | `./scripts/reset-demo.sh` (destructive — truncates and reseeds; call out to the user before the first run in a session) |
| Reading current state to assert against | `utils/db_helper.py` — **read-only** Postgres `SELECT`, or the equivalent `GET` REST endpoint. Never used to create/mutate fixture data. |

## 2. Zero Direct DML
There is no Oracle, no JDBC seeder, no manual primary-key allocation anywhere in this system. If a REST endpoint does not exist for a needed precondition, the correct escalation is:
1. Check `docs/testing-guide.md` §3 and Swagger (`http://localhost:8080/swagger-ui.html`) again to confirm the endpoint really doesn't exist.
2. If truly missing, fall back to driving the UI to create the precondition (acceptable — this app's flows are short), and note in `plan.md` that this precondition uses UI setup rather than API setup.
3. Never write raw SQL `INSERT`/`UPDATE`/`DELETE` against the Postgres database from automation code.

## 3. Registry (`reusable-fixtures.json`)
`fixture_resolver` maintains `.repository-intelligence/reusable-fixtures.json` — a small cache of proven fixture states (e.g. "a PENDING order for user X on product Y exists with ID Z") to avoid re-creating the same precondition across scenarios in the same run. Read-merge-write on every update; never overwrite the whole file.

```json
{
  "fixtures": [
    {
      "type": "pending_order",
      "created_by": "api_clients/order_client.py",
      "order_id": "ord-xxxx",
      "product_id": "aaaaaaaa-...",
      "user": "user",
      "verified_date": "<ISO-8601>"
    }
  ]
}
```

## 4. Reset Discipline
- `./scripts/reset-demo.sh` is destructive (truncates `orders`, `products`, `categories`, `user_inventory`, `activity_logs` and reseeds). Run it only at the start of a full-suite run or when explicitly asked, and always surface to the user that it is about to run before the first invocation in a session.
- Within a single batch's scenario set, prefer creating fresh, uniquely-named/SKU'd fixtures over relying on exact seed-data row identities (seed data can change), except where a scenario specifically depends on the documented seed baseline (see `docs/testing-guide.md` §5 "Seed Data Summary").
