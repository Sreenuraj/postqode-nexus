"""
Data-driven fixture loader. Loads JSON files from automation/data/ so that
larger/reusable datasets never get hardcoded inline in step files or feature
files. See ../.postqode/rules/automation-framework.md §5.
"""
import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


class DataLoader:
    @staticmethod
    def load(filename: str):
        """Load a JSON fixture file by name, e.g. DataLoader.load('users.json')."""
        path = DATA_DIR / filename
        if not path.exists():
            raise FileNotFoundError(f"Data file not found: {path}")
        with open(path, encoding="utf-8") as f:
            return json.load(f)

    @staticmethod
    def get(filename: str, key: str):
        """Load a JSON fixture file and return a specific top-level key."""
        data = DataLoader.load(filename)
        if key not in data:
            raise KeyError(f"Key '{key}' not found in {filename}")
        return data[key]
