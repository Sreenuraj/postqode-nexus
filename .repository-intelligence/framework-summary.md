# Framework / Technical Summary

## Primary Technology
Python 3.12, Playwright (sync API), behave (BDD/Gherkin), requests (REST fixture clients), psycopg2 (read-only Postgres verification).

## Project Structure
```
automation/
├── features/<area>/*.feature   # Gherkin, tagged @<TEST-ID>
├── features/steps/*.py         # behave step definitions
├── features/environment.py     # lifecycle hooks
├── pages/*.py                  # Page Object Model
├── api_clients/*.py            # REST fixture clients
├── data/*.json                 # data-driven fixtures
└── utils/                      # config, wait helpers, db helper
```

## Test / Automation Tooling
- Runner: `behave` (JUnit output to `reports/junit`)
- Browser: Playwright Chromium, headless by default (`HEADLESS=false` for headed)
- Assertion style: `playwright.sync_api.expect()` + plain `assert`

## Local Execution Guide
- **Setup:** `cd automation && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && playwright install chromium`
- **Run all:** `behave` (from `automation/`)
- **Run one area:** `behave features/auth`
- **Run specific tags:** `behave --tags=@AUTH-E2E-001,@AUTH-E2E-002`
- **Mandatory live verification (before any batch is planned as buildable):** `python brain/scripts/verify_<area>.py` (run from repo root)

## Key Conventions
See `.postqode/rules/automation-framework.md` for full detail:
- Page Object Model, zero assertions in `pages/`
- Locator priority: `data-testid` → role/name → label (never index-based on mutable lists)
- Data-driven: `Scenario Outline`+`Examples:` for simple variation, `data/*.json` for larger sets
- API-first fixtures via `api_clients/`
- Mandatory Playwright+Python live verification of every locator/flow before it's marked `[Verified]`

_Sources: automation/README.md, .postqode/rules/automation-framework.md | Last updated: 2026-08-11_
