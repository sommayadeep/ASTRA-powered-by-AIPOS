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


def initialize_memory_store() -> None:
    with _get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS memories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                memory_text TEXT NOT NULL,
                importance_score REAL NOT NULL DEFAULT 0.5,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.commit()


def add_memory(user_id: str, memory_text: str, importance_score: float = 0.5) -> dict[str, Any]:
    initialize_memory_store()
    with _get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO memories (user_id, memory_text, importance_score)
            VALUES (?, ?, ?)
            """,
            (user_id, memory_text.strip(), importance_score),
        )
        connection.commit()
        memory_id = cursor.lastrowid

    return {
        "id": memory_id,
        "user_id": user_id,
        "memory_text": memory_text.strip(),
        "importance_score": importance_score,
    }


def list_memories(user_id: str) -> list[dict[str, Any]]:
    initialize_memory_store()
    with _get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, user_id, memory_text, importance_score, created_at
            FROM memories
            WHERE user_id = ?
            ORDER BY importance_score DESC, created_at DESC
            """,
            (user_id,),
        ).fetchall()

    return [dict(row) for row in rows]


def get_memory_summary(user_id: str) -> str:
    memories = list_memories(user_id)
    if not memories:
        return "No saved memory yet."

    top_memories = memories[:3]
    return " | ".join(memory["memory_text"] for memory in top_memories)
