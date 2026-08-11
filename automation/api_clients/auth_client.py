"""
API-first fixture client for authentication. See ../.postqode/rules/fixture-api-rules.md.
"""
import requests

from utils.config import Config


class AuthClient:
    def __init__(self):
        self.base_url = Config.API_BASE_URL

    def login(self, username: str, password: str) -> str:
        """POST /api/v1/auth/login -> returns JWT token string."""
        resp = requests.post(
            f"{self.base_url}/api/v1/auth/login",
            json={"username": username, "password": password},
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("token") or data.get("accessToken")

    def auth_headers(self, username: str, password: str) -> dict:
        token = self.login(username, password)
        return {"Authorization": f"Bearer {token}"}
