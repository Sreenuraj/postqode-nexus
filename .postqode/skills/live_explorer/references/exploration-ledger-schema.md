# Exploration Ledger Schema

Location: `.repository-intelligence/exploration-ledger.json`

```json
{
  "version": 1,
  "last_updated": "<ISO-8601>",
  "scripts": {
    "brain/scripts/verify_auth.py": {
      "areas": ["Auth"],
      "does": "Verifies login/logout/RBAC locators and flows against localhost:3000",
      "selectors_verified": [
        "login-input-username",
        "login-input-password",
        "login-button-submit"
      ],
      "flows_verified": [
        "admin login redirects to /dashboard",
        "logout redirects to /login"
      ],
      "linked_page_objects": ["automation/pages/login_page.py::LoginPage"],
      "last_used": "<ISO-8601>"
    }
  },
  "routes": {
    "/login": "public",
    "/dashboard": "authenticated"
  },
  "discoveries": []
}
```

- `scripts` — one entry per file under `brain/scripts/`. Read-merge-write; never overwrite the whole file.
- `routes` — cumulative map of confirmed route behavior (public/authenticated/admin-only), useful for RBAC test planning.
- `discoveries` — free-form notes for durable findings that didn't originate from a specific kept script (e.g. a script was deleted after its findings were merged here per the disposition rule).
