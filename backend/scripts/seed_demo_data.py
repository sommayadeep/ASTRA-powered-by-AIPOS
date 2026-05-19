from __future__ import annotations

from backend.app.services.memory import add_memory, list_memories
from backend.app.services.notes import create_note, list_notes
from backend.app.services.notifications import create_notification, list_notifications
from backend.app.services.tasks import create_task, list_tasks


def seed_demo_data(user_id: str = "demo-user") -> None:
    if not list_tasks(user_id):
        create_task(user_id, "Review AI productivity trends", "high", "2026-05-21")
        create_task(user_id, "Refine portfolio README", "medium", "2026-05-22")
        create_task(user_id, "Prepare interview talking points", "medium", "2026-05-23")

    if not list_notes(user_id):
        create_note(
            user_id,
            "Study roadmap",
            "Build a weekly roadmap covering RAG, agent workflows, FastAPI, and deployment for the next four weeks.",
        )
        create_note(
            user_id,
            "Architecture memo",
            "AIPOS uses Ollama for development, Groq for production demos, ChromaDB for retrieval, and SQLite for local workspace data.",
        )

    if not list_memories(user_id):
        add_memory(user_id, "User prefers Python, FastAPI, and practical full-stack AI systems.", 0.95)
        add_memory(user_id, "User is building AIPOS as a flagship AI portfolio project.", 0.9)

    if not list_notifications(user_id):
        create_notification(user_id, "Welcome to AIPOS", "Demo data has been seeded for the dashboard and workspace modules.")
        create_notification(user_id, "RAG ready", "Your uploaded documents can be queried from the documents workspace.")
        create_notification(user_id, "Agent workflow available", "Open the agent studio to route prompts through the orchestrator.")


def main() -> int:
    seed_demo_data()
    print("Seeded demo data for AIPOS.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
