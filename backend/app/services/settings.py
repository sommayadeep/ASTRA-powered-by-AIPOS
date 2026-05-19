from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any

DATABASE_PATH = Path(__file__).resolve().parents[2] / "data" / "aipos.db"


def _get_connection() -> sqlite3.Connection:
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_settings_store() -> None:
    with _get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS user_settings (
                user_id TEXT PRIMARY KEY,
                display_name TEXT NOT NULL DEFAULT '',
                preferred_provider TEXT NOT NULL DEFAULT 'ollama',
                theme TEXT NOT NULL DEFAULT 'dark',
                notifications_enabled INTEGER NOT NULL DEFAULT 1,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.commit()


def get_settings(user_id: str = "demo-user") -> dict[str, Any]:
    initialize_settings_store()
    with _get_connection() as connection:
        row = connection.execute(
            """
            SELECT user_id, display_name, preferred_provider, theme, notifications_enabled, updated_at
            FROM user_settings
            WHERE user_id = ?
            """,
            (user_id,),
        ).fetchone()

    if row is None:
        return {
            "user_id": user_id,
            "display_name": "",
            "preferred_provider": "ollama",
            "theme": "dark",
            "notifications_enabled": True,
            "updated_at": None,
        }

    settings = dict(row)
    settings["notifications_enabled"] = bool(settings["notifications_enabled"])
    return settings


def upsert_settings(
    user_id: str,
    display_name: str,
    preferred_provider: str,
    theme: str,
    notifications_enabled: bool,
) -> dict[str, Any]:
    initialize_settings_store()
    normalized_theme = theme if theme in {"dark", "light", "system"} else "dark"
    normalized_provider = preferred_provider if preferred_provider in {"ollama", "groq", "gemini", "openrouter", "openai"} else "ollama"
    with _get_connection() as connection:
        connection.execute(
            """
            INSERT INTO user_settings (user_id, display_name, preferred_provider, theme, notifications_enabled, updated_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE SET
                display_name = excluded.display_name,
                preferred_provider = excluded.preferred_provider,
                theme = excluded.theme,
                notifications_enabled = excluded.notifications_enabled,
                updated_at = CURRENT_TIMESTAMP
            """,
            (user_id, display_name.strip(), normalized_provider, normalized_theme, int(notifications_enabled)),
        )
        connection.commit()

    return get_settings(user_id)
