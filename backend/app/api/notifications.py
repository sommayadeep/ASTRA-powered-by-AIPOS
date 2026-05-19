from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.notifications import create_notification, list_notifications, mark_notification_read

router = APIRouter(prefix="/notifications", tags=["notifications"])


class NotificationCreate(BaseModel):
    user_id: str = Field(default="demo-user", min_length=1)
    title: str = Field(min_length=1)
    body: str = Field(min_length=1)


class NotificationReadUpdate(BaseModel):
    user_id: str = Field(default="demo-user", min_length=1)


@router.get("")
def read_notifications(user_id: str = "demo-user") -> dict[str, list[dict[str, object]]]:
    return {"items": list_notifications(user_id)}


@router.post("")
def create_user_notification(payload: NotificationCreate) -> dict[str, object]:
    return create_notification(payload.user_id, payload.title, payload.body)


@router.put("/{notification_id}/read")
def mark_notification_as_read(notification_id: int, payload: NotificationReadUpdate) -> dict[str, object]:
    return mark_notification_read(notification_id, payload.user_id)
