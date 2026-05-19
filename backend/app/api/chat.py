from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from backend.app.services.ai import generate_chat_reply, stream_chat_reply

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatMessage(BaseModel):
    message: str


@router.post("")
def create_chat_response(payload: ChatMessage) -> dict[str, str]:
    return {"reply": generate_chat_reply(payload.message)}


@router.post("/stream")
def stream_chat_response(payload: ChatMessage) -> StreamingResponse:
    return StreamingResponse(stream_chat_reply(payload.message), media_type="text/plain; charset=utf-8")


@router.get("/history")
def get_chat_history() -> dict[str, list[dict[str, str]]]:
    return {"items": []}
