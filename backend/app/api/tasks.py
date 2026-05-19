from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional

from app.services.tasks import create_task as store_task, list_tasks as get_tasks, update_task_status

router = APIRouter(prefix="/tasks", tags=["tasks"])


class TaskCreate(BaseModel):
    user_id: str = Field(default="demo-user", min_length=1)
    title: str = Field(min_length=1)
    priority: str = Field(default="medium")
    due_date: Optional[str] = None


class TaskStatusUpdate(BaseModel):
    user_id: str = Field(default="demo-user", min_length=1)
    status: str = Field(default="todo")


@router.get("")
def list_tasks(user_id: str = "demo-user") -> dict[str, list[dict[str, str]]]:
    return {"items": get_tasks(user_id)}


@router.post("")
def create_task(payload: TaskCreate) -> dict[str, object]:
    return store_task(payload.user_id, payload.title, payload.priority, payload.due_date)


@router.put("/{task_id}/status")
def change_task_status(task_id: int, payload: TaskStatusUpdate) -> dict[str, object]:
    return update_task_status(task_id, payload.status, payload.user_id)
