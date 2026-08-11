"""
API-first fixture client for categories. See ../.postqode/rules/fixture-api-rules.md.
"""
import requests

from utils.config import Config


class CategoryClient:
    def __init__(self, auth_headers: dict):
        self.base_url = Config.API_BASE_URL
        self.headers = auth_headers

    def create_category(self, name: str, description: str = "") -> dict:
        resp = requests.post(
            f"{self.base_url}/api/v1/categories",
            json={"name": name, "description": description},
            headers=self.headers,
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()

    def list_categories(self) -> list:
        resp = requests.get(f"{self.base_url}/api/v1/categories", headers=self.headers, timeout=10)
        resp.raise_for_status()
        return resp.json()
