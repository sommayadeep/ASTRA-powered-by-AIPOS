from fastapi import APIRouter, BackgroundTasks, File, UploadFile
from pydantic import BaseModel

from app.services.documents import get_documents_overview, ingest_uploaded_document, index_document_bytes

router = APIRouter(prefix="/documents", tags=["documents"])


class DocumentUpload(BaseModel):
    filename: str


@router.get("")
def list_documents() -> dict[str, list[dict[str, str]]]:
    return {"items": get_documents_overview()}


@router.post("/upload")
async def upload_document(background_tasks: BackgroundTasks, file: UploadFile = File(...)) -> dict[str, str]:
    # Read uploaded bytes and schedule indexing in the background to avoid blocking or failing
    raw = await file.read()
    if background_tasks:
        background_tasks.add_task(index_document_bytes, file.filename, raw, file.content_type)
        return {"status": "accepted", "filename": file.filename, "chunks": "0"}

    # If BackgroundTasks not available, perform synchronous ingest (best-effort)
    result = ingest_uploaded_document(file)
    return {"status": result["status"], "filename": result["filename"], "chunks": str(result["chunks"])}
