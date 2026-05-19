from fastapi import APIRouter
from pydantic import BaseModel, Field

from backend.app.services.settings import get_settings, upsert_settings

router = APIRouter(prefix="/settings", tags=["settings"])


class SettingsPayload(BaseModel):
    user_id: str = Field(default="demo-user", min_length=1)
    display_name: str = Field(default="")
    preferred_provider: str = Field(default="ollama")
    theme: str = Field(default="dark")
    notifications_enabled: bool = True


@router.get("")
def read_settings(user_id: str = "demo-user") -> dict[str, object]:
    return get_settings(user_id)


@router.put("")
def update_settings(payload: SettingsPayload) -> dict[str, object]:
    return upsert_settings(
        payload.user_id,
        payload.display_name,
        payload.preferred_provider,
        payload.theme,
        payload.notifications_enabled,
    )
