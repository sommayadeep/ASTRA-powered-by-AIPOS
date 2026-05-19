from fastapi import APIRouter
from pydantic import BaseModel

from backend.app.services.rag import generate_rag_answer

router = APIRouter(prefix="/rag", tags=["rag"])


class RagQuery(BaseModel):
    query: str
    document_ids: list[str] = []


@router.post("/query")
def query_documents(payload: RagQuery) -> dict[str, object]:
    return generate_rag_answer(payload.query, payload.document_ids)
