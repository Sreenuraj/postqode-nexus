"""
API-first fixture client for products. See ../.postqode/rules/fixture-api-rules.md.
"""
import requests

from utils.config import Config


class ProductClient:
    def __init__(self, auth_headers: dict):
        self.base_url = Config.API_BASE_URL
        self.headers = auth_headers

    def create_product(self, payload: dict) -> dict:
        resp = requests.post(f"{self.base_url}/api/v1/products", json=payload, headers=self.headers, timeout=10)
        resp.raise_for_status()
        return resp.json()

    def update_status(self, product_id: str, status: str) -> dict:
        resp = requests.patch(
            f"{self.base_url}/api/v1/products/{product_id}/status",
            params={"status": status},
            headers=self.headers,
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()

    def get_product(self, product_id: str) -> dict:
        resp = requests.get(f"{self.base_url}/api/v1/products/{product_id}", headers=self.headers, timeout=10)
        resp.raise_for_status()
        return resp.json()

    def list_products(self) -> list:
        resp = requests.get(f"{self.base_url}/api/v1/products", headers=self.headers, timeout=10)
        resp.raise_for_status()
        return resp.json()
