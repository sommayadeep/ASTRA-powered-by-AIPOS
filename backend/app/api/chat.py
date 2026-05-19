from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from typing import Any, Dict, List, Optional

from pydantic import BaseModel

from app.services.ai import generate_chat_reply, stream_chat_reply

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatMessage(BaseModel):
    # Accept either a single `message` string or an OpenAI-style `messages` array.
    message: Optional[str] = None
    messages: Optional[List[Dict[str, Any]]] = None
    user_id: Optional[str] = None


def _extract_text(payload: ChatMessage) -> str:
    # Priority: explicit `message` field, then first user content in `messages`, else empty string
    if payload.message:
        return payload.message
    if payload.messages:
        for item in payload.messages:
            role = item.get("role", "")
            content = item.get("content") or item.get("message") or ""
            if role == "user" and content:
                return content
        # fallback: take content of first message
        first = payload.messages[0]
        return first.get("content") or first.get("message") or ""
    return ""


@router.post("")
def create_chat_response(payload: ChatMessage) -> dict[str, str]:
    text = _extract_text(payload)
    return {"reply": generate_chat_reply(text, payload.user_id)}


@router.post("/stream")
def stream_chat_response(payload: ChatMessage) -> StreamingResponse:
    text = _extract_text(payload)
    return StreamingResponse(stream_chat_reply(text, payload.user_id), media_type="text/plain; charset=utf-8")


@router.get("/history")
def get_chat_history() -> dict[str, list[dict[str, str]]]:
    return {"items": []}
