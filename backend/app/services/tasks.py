from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any
from typing import Optional

DATABASE_PATH = Path(__file__).resolve().parents[2] / "data" / "aipos.db"


def _get_connection() -> sqlite3.Connection:
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_task_store() -> None:
    with _get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                priority TEXT NOT NULL DEFAULT 'medium',
                due_date TEXT,
                status TEXT NOT NULL DEFAULT 'todo',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.commit()


def list_tasks(user_id: str = "demo-user") -> list[dict[str, Any]]:
    initialize_task_store()
    with _get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, user_id, title, priority, due_date, status, created_at, updated_at
            FROM tasks
            WHERE user_id = ?
            ORDER BY
                CASE status
                    WHEN 'done' THEN 2
                    WHEN 'doing' THEN 1
                    ELSE 0
                END,
                CASE priority
                    WHEN 'high' THEN 0
                    WHEN 'medium' THEN 1
                    ELSE 2
                END,
                created_at DESC
            """,
            (user_id,),
        ).fetchall()

    return [dict(row) for row in rows]


def create_task(user_id: str, title: str, priority: str = "medium", due_date: Optional[str] = None) -> dict[str, Any]:
    initialize_task_store()
    normalized_priority = priority if priority in {"low", "medium", "high"} else "medium"
    with _get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO tasks (user_id, title, priority, due_date)
            VALUES (?, ?, ?, ?)
            """,
            (user_id, title.strip(), normalized_priority, due_date),
        )
        connection.commit()
        task_id = cursor.lastrowid

    return {
        "id": task_id,
        "user_id": user_id,
        "title": title.strip(),
        "priority": normalized_priority,
        "due_date": due_date,
        "status": "todo",
    }


def update_task_status(task_id: int, status: str, user_id: str = "demo-user") -> dict[str, Any]:
    initialize_task_store()
    normalized_status = status if status in {"todo", "doing", "done"} else "todo"
    with _get_connection() as connection:
        connection.execute(
            """
            UPDATE tasks
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
            """,
            (normalized_status, task_id, user_id),
        )
        connection.commit()

    return {"id": task_id, "status": normalized_status}
