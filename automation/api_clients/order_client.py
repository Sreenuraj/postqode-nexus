"""
API-first fixture client for orders. See ../.postqode/rules/fixture-api-rules.md.
"""
import requests

from utils.config import Config


class OrderClient:
    def __init__(self, auth_headers: dict):
        self.base_url = Config.API_BASE_URL
        self.headers = auth_headers

    def create_order(self, product_id: str, quantity: int) -> dict:
        resp = requests.post(
            f"{self.base_url}/api/v1/orders",
            json={"productId": product_id, "quantity": quantity},
            headers=self.headers,
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()

    def approve_order(self, order_id: str) -> dict:
        resp = requests.post(f"{self.base_url}/api/v1/orders/{order_id}/approve", headers=self.headers, timeout=10)
        resp.raise_for_status()
        return resp.json()

    def reject_order(self, order_id: str) -> dict:
        resp = requests.post(f"{self.base_url}/api/v1/orders/{order_id}/reject", headers=self.headers, timeout=10)
        resp.raise_for_status()
        return resp.json()

    def cancel_order(self, order_id: str) -> dict:
        resp = requests.post(f"{self.base_url}/api/v1/orders/{order_id}/cancel", headers=self.headers, timeout=10)
        resp.raise_for_status()
        return resp.json()

    def get_order(self, order_id: str) -> dict:
        resp = requests.get(f"{self.base_url}/api/v1/orders/{order_id}", headers=self.headers, timeout=10)
        resp.raise_for_status()
        return resp.json()
