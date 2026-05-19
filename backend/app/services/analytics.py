from __future__ import annotations

from typing import Any

from app.services.documents import get_documents_overview
from app.services.memory import list_memories
from app.services.notes import list_notes
from app.services.notifications import list_notifications
from app.services.tasks import list_tasks


def get_dashboard_analytics(user_id: str = "demo-user") -> dict[str, Any]:
    tasks = list_tasks(user_id)
    notes = list_notes(user_id)
    memories = list_memories(user_id)
    notifications = list_notifications(user_id)
    documents = get_documents_overview()

    completed_tasks = len([task for task in tasks if task.get("status") == "done"])
    active_tasks = len([task for task in tasks if task.get("status") != "done"])
    unread_notifications = len([notification for notification in notifications if not notification.get("is_read")])
    overview_values = {
        "documents": len(documents),
        "tasks": len(tasks),
        "notes": len(notes),
        "memories": len(memories),
        "notifications": len(notifications),
    }

    return {
        "user_id": user_id,
        "overview": overview_values,
        "productivity": {
            "completed_tasks": completed_tasks,
            "active_tasks": active_tasks,
            "unread_notifications": unread_notifications,
        },
        "series": [
            {"label": "documents", "value": len(documents)},
            {"label": "tasks", "value": len(tasks)},
            {"label": "notes", "value": len(notes)},
            {"label": "memories", "value": len(memories)},
            {"label": "notifications", "value": len(notifications)},
        ],
        "recent_activity": {
            "top_note_categories": sorted({note.get("category", "general") for note in notes}),
            "memory_count": len(memories),
            "recent_notification_titles": [notification["title"] for notification in notifications[:3]],
        },
    }
