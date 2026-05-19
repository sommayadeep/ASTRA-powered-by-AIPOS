from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional

from backend.app.services.notes import create_note as store_note, list_notes, search_notes

router = APIRouter(prefix="/notes", tags=["notes"])


class NoteCreate(BaseModel):
    user_id: str = Field(default="demo-user", min_length=1)
    title: str = Field(min_length=1)
    content: str = Field(min_length=1)
    category: Optional[str] = None


class NoteSearchRequest(BaseModel):
    user_id: str = Field(default="demo-user", min_length=1)
    query: str = Field(min_length=1)


@router.get("")
def read_notes(user_id: str = "demo-user") -> dict[str, list[dict[str, str]]]:
    return {"items": list_notes(user_id)}


@router.post("")
def create_note(payload: NoteCreate) -> dict[str, object]:
    return store_note(payload.user_id, payload.title, payload.content, payload.category)


@router.post("/search")
def search_user_notes(payload: NoteSearchRequest) -> dict[str, list[dict[str, str]]]:
    return {"items": search_notes(payload.user_id, payload.query)}
