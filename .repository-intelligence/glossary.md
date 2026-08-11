# Glossary

| Term | Full Form | Definition | Source |
|---|---|---|---|
| SKU | Stock Keeping Unit | Unique product identifier | docs/testing-guide.md |
| RBAC | Role-Based Access Control | Admin vs. User route/nav restrictions | docs/e2e-test-cases.md §2 |
| JWT | JSON Web Token | Auth token issued by `/api/v1/auth/login` | docs/testing-guide.md §3 |
| POM | Page Object Model | Automation design pattern — locators+actions in `pages/`, no assertions | .postqode/rules/automation-framework.md |
| BDD | Behavior-Driven Development | Gherkin `.feature` files + `behave` step definitions | .postqode/rules/automation-framework.md |
| PENDING/APPROVED/REJECTED/CANCELLED | Order statuses | Order lifecycle states | docs/e2e-test-cases.md §3, §5 |
| ACTIVE/LOW_STOCK/OUT_OF_STOCK | Product statuses | Product stock lifecycle states | docs/e2e-test-cases.md §3 |
| CC | Command Center | Admin optimistic-update order queue + watchlist page | docs/functional-tests-dynamic-ui.md |

_Last updated: 2026-08-11_
