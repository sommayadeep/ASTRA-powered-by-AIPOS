from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.memory import add_memory, get_memory_summary, list_memories

router = APIRouter(prefix="/memory", tags=["memory"])


class MemoryCreate(BaseModel):
    user_id: str = Field(min_length=1)
    memory_text: str = Field(min_length=1)
    importance_score: float = Field(default=0.5, ge=0.0, le=1.0)


class MemorySummaryQuery(BaseModel):
    user_id: str = Field(min_length=1)


@router.get("")
def read_memories(user_id: str) -> dict[str, list[dict[str, str]]]:
    return {"items": list_memories(user_id)}


@router.post("")
def create_memory(payload: MemoryCreate) -> dict[str, object]:
    return add_memory(payload.user_id, payload.memory_text, payload.importance_score)


@router.post("/summary")
def memory_summary(payload: MemorySummaryQuery) -> dict[str, str]:
    return {"summary": get_memory_summary(payload.user_id)}
