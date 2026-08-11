"""
Central config loader. Reads automation/.env (via python-dotenv) and exposes
typed accessors. Never hardcode URLs/credentials in step/page files — always
go through this module.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_ENV_PATH, override=False)


def _get(key: str, default: str = "") -> str:
    return os.environ.get(key, default)


class Config:
    BASE_URL = _get("BASE_URL", "http://localhost:3000")
    API_BASE_URL = _get("API_BASE_URL", "http://localhost:8080")

    ADMIN_USERNAME = _get("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD = _get("ADMIN_PASSWORD", "Admin@123")

    USER_USERNAME = _get("USER_USERNAME", "user")
    USER_PASSWORD = _get("USER_PASSWORD", "User@123")

    HEADLESS = _get("HEADLESS", "true").lower() != "false"

    DB_HOST = _get("DB_HOST", "localhost")
    DB_PORT = int(_get("DB_PORT", "5432"))
    DB_NAME = _get("DB_NAME", "nexus")
    DB_USER = _get("DB_USER", "nexus")
    DB_PASSWORD = _get("DB_PASSWORD", "nexus")

    @classmethod
    def credentials_for(cls, role: str):
        role = role.lower()
        if role == "admin":
            return cls.ADMIN_USERNAME, cls.ADMIN_PASSWORD
        if role == "user":
            return cls.USER_USERNAME, cls.USER_PASSWORD
        raise ValueError(f"Unknown role for credentials: {role}")
