# PostQode Nexus — Automation (Playwright + Python + behave)

BDD end-to-end automation for [PostQode Nexus](../README.md), implementing the journeys documented in `../docs/e2e-test-cases.md`. Uses **Page Object Model (POM)** and **data-driven** conventions — see `../.postqode/rules/automation-framework.md` for full rules.

## Setup

```bash
cd automation
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
cp .env.example .env   # adjust if your app runs on different ports
```

Make sure the app is running (frontend on `:3000`, backend on `:8080`):
```bash
cd .. && ./scripts/start-all.sh
```

## Running Tests

```bash
# All tests
behave

# One functional area
behave features/auth

# One or more specific Test IDs
behave --tags=@AUTH-E2E-001,@AUTH-E2E-002

# Headed (visible browser) for debugging
HEADLESS=false behave features/auth
```

## Project Layout

```
automation/
├── requirements.txt
├── behave.ini
├── .env.example
├── features/            # Gherkin .feature files + environment.py hooks
│   └── steps/           # behave step definitions (call page objects, hold assertions)
├── pages/               # Page Object Model — locators + actions only, zero assertions

├── api_clients/         # REST client wrappers for API-first fixture setup
├── data/                # data-driven JSON fixtures
├── utils/               # config loader, wait helpers, DB read-only helper
└── reports/             # gitignored — behave/JUnit output
```

## Conventions (enforced by the `.postqode` automation pipeline)
- **POM:** one class per page under `pages/`, locators as methods returning fresh `Locator`s, action methods only, **no assertions**.
- **BDD:** `.feature` files tagged with the exact Test ID from `docs/e2e-test-cases.md` (e.g. `@AUTH-E2E-001`).
- **Data-driven:** simple variation via `Scenario Outline` + `Examples:`; larger/reusable datasets via `data/*.json` + `utils/data_loader.py`.
- **API-first fixtures:** use `api_clients/` for setup wherever a REST endpoint exists; UI-driven setup only when none exists.
- **No hardcoded credentials/URLs** — always via `utils/config.py` reading `.env`.
