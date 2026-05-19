from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any

DATABASE_PATH = Path(__file__).resolve().parents[2] / "data" / "aipos.db"


def _get_connection() -> sqlite3.Connection:
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_notification_store() -> None:
    with _get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                body TEXT NOT NULL,
                is_read INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.commit()


def seed_notifications(user_id: str = "demo-user") -> None:
    initialize_notification_store()
    with _get_connection() as connection:
        existing = connection.execute(
            "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ?",
            (user_id,),
        ).fetchone()
        if existing and existing["count"]:
            return

        connection.executemany(
            """
            INSERT INTO notifications (user_id, title, body, is_read)
            VALUES (?, ?, ?, ?)
            """,
            [
                (user_id, "Documents indexed", "Your recent upload is ready for semantic search.", 0),
                (user_id, "Memory updated", "AIPOS saved a new preference for future personalization.", 0),
                (user_id, "Task reminder", "You have a high-priority task due today.", 1),
            ],
        )
        connection.commit()


def list_notifications(user_id: str = "demo-user") -> list[dict[str, Any]]:
    seed_notifications(user_id)
    with _get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, user_id, title, body, is_read, created_at
            FROM notifications
            WHERE user_id = ?
            ORDER BY created_at DESC, id DESC
            """,
            (user_id,),
        ).fetchall()

    items = [dict(row) for row in rows]
    for item in items:
        item["is_read"] = bool(item["is_read"])
    return items


def create_notification(user_id: str, title: str, body: str) -> dict[str, Any]:
    initialize_notification_store()
    with _get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO notifications (user_id, title, body, is_read)
            VALUES (?, ?, ?, 0)
            """,
            (user_id, title.strip(), body.strip()),
        )
        connection.commit()
        notification_id = cursor.lastrowid
    return {
        "id": notification_id,
        "user_id": user_id,
        "title": title.strip(),
        "body": body.strip(),
        "is_read": False,
    }


def mark_notification_read(notification_id: int, user_id: str = "demo-user") -> dict[str, Any]:
    initialize_notification_store()
    with _get_connection() as connection:
        connection.execute(
            """
            UPDATE notifications
            SET is_read = 1
            WHERE id = ? AND user_id = ?
            """,
            (notification_id, user_id),
        )
        connection.commit()

    return {"id": notification_id, "is_read": True}
