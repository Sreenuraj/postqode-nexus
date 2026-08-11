"""
API-first fixture client for users (admin operations). See ../.postqode/rules/fixture-api-rules.md.
"""
import requests

from utils.config import Config


class UserClient:
    def __init__(self, auth_headers: dict):
        self.base_url = Config.API_BASE_URL
        self.headers = auth_headers

    def create_user(self, username: str, email: str, password: str, role: str = "USER") -> dict:
        resp = requests.post(
            f"{self.base_url}/api/v1/users",
            json={"username": username, "email": email, "password": password, "role": role},
            headers=self.headers,
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()

    def set_enabled(self, user_id: str, enabled: bool) -> dict:
        resp = requests.patch(
            f"{self.base_url}/api/v1/users/{user_id}/status",
            params={"enabled": str(enabled).lower()},
            headers=self.headers,
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()

    def list_users(self) -> list:
        resp = requests.get(f"{self.base_url}/api/v1/users", headers=self.headers, timeout=10)
        resp.raise_for_status()
        return resp.json()
