# Code Conventions Reference (Playwright + Python + behave)

Canonical source for the "Framework Rules" a generated batch must follow. Referenced by `plan.md`'s implementation stages.

## File/Class Naming
- Page objects: `PascalCase` class name matching the page (`LoginPage`, `ProductCatalogPage`, `CommandCenterPage`), one file per class in `automation/pages/`, filename `snake_case.py` (`login_page.py`).
- Step files: `<area>_steps.py` in `automation/features/steps/` (`auth_steps.py`, `admin_steps.py`).
- Feature files: `snake_case.feature` in `automation/features/<area>/`.
- API clients: `<resource>_client.py` in `automation/api_clients/` (`auth_client.py`, `product_client.py`).

## Page Object Example
```python
from pages.base_page import BasePage


class ProductCatalogPage(BasePage):
    def search_input(self):
        return self.page.get_by_test_id("catalog-input-search")

    def add_product_button(self):
        return self.page.get_by_role("button", name="Add Product")

    def row_by_sku(self, sku: str):
        return self.page.locator("tr", has_text=sku)

    def search(self, term: str):
        self.search_input().fill(term)

    def open_add_product_dialog(self):
        self.add_product_button().click()
        self.wait_for_dialog()
```

## Step Definition Example
```python
from playwright.sync_api import expect
from pages.product_catalog_page import ProductCatalogPage


@when('the admin searches for "{term}"')
def step_impl(context, term):
    context.catalog_page = ProductCatalogPage(context.page)
    context.catalog_page.search(term)


@then('only products matching "{term}" are shown')
def step_impl(context, term):
    expect(context.catalog_page.row_by_sku(term)).to_be_visible()
```

## Data-Driven Example
```python
# utils/data_loader.py
import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"


class DataLoader:
    @staticmethod
    def load(filename: str):
        with open(DATA_DIR / filename) as f:
            return json.load(f)
```
```gherkin
Scenario Outline: Login validation
  Given the login page is open
  When the user logs in with "<username>" and "<password>"
  Then the result is "<expected>"

  Examples:
    | username | password   | expected |
    | admin    | Admin@123  | success  |
    | admin    | wrongpass  | error    |
```

## Framework Rules Checklist (copy into `plan.md` §? per batch, quoting only what's batch-specific)
- Locator priority: `data-testid` → role/name → label (never index-based on mutable lists).
- Zero assertions in `pages/*.py`.
- No fixed `time.sleep()` — use `expect(...)` auto-retry or explicit `wait_for_*` helpers in `BasePage`.
- Additive-only on shared files (`BasePage`, `api_clients/*`, `common_steps.py`).
- Credentials from `.env` via `utils/config.py`, never inline.
- DB access read-only only.
