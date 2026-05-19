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


def initialize_note_store() -> None:
    with _get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                category TEXT NOT NULL DEFAULT 'general',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.commit()


def _infer_category(content: str) -> str:
    lowered = content.lower()
    if any(keyword in lowered for keyword in ["study", "exam", "course", "lecture"]):
        return "study"
    if any(keyword in lowered for keyword in ["bug", "code", "api", "function", "repo"]):
        return "technical"
    if any(keyword in lowered for keyword in ["meeting", "project", "plan", "roadmap"]):
        return "planning"
    return "general"


def create_note(user_id: str, title: str, content: str, category: Optional[str] = None) -> dict[str, Any]:
    initialize_note_store()
    normalized_category = category or _infer_category(content)
    with _get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO notes (user_id, title, content, category)
            VALUES (?, ?, ?, ?)
            """,
            (user_id, title.strip(), content.strip(), normalized_category),
        )
        connection.commit()
        note_id = cursor.lastrowid

    return {
        "id": note_id,
        "user_id": user_id,
        "title": title.strip(),
        "content": content.strip(),
        "category": normalized_category,
    }


def list_notes(user_id: str = "demo-user") -> list[dict[str, Any]]:
    initialize_note_store()
    with _get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, user_id, title, content, category, created_at, updated_at
            FROM notes
            WHERE user_id = ?
            ORDER BY updated_at DESC, created_at DESC
            """,
            (user_id,),
        ).fetchall()

    return [dict(row) for row in rows]


def search_notes(user_id: str, query: str) -> list[dict[str, Any]]:
    initialize_note_store()
    lowered_query = query.strip().lower()
    if not lowered_query:
        return []

    notes = list_notes(user_id)
    matches: list[dict[str, Any]] = []
    for note in notes:
        haystack = f"{note['title']} {note['content']} {note['category']}".lower()
        if lowered_query in haystack:
            matches.append(note)
    return matches
