from __future__ import annotations

import hashlib
import math
import os
from functools import lru_cache
from typing import Any, Optional

from fastapi import HTTPException

DEFAULT_EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
DEFAULT_CHROMA_PATH = os.getenv("CHROMA_PATH", ".chroma")


@lru_cache(maxsize=1)
def _load_embedding_model() -> Optional[Any]:
    try:
        from sentence_transformers import SentenceTransformer

        return SentenceTransformer(DEFAULT_EMBEDDING_MODEL)
    except Exception:
        # Sentence-transformers or Torch may not be available in the environment.
        # Return None and let the caller fall back to OpenAI embeddings if configured.
        return None


@lru_cache(maxsize=1)
def _load_chroma_client() -> Any:
    import chromadb

    return chromadb.PersistentClient(path=DEFAULT_CHROMA_PATH)


def get_chroma_client() -> Any:
    return _load_chroma_client()


def get_chroma_collection(collection_name: str = "aipos_documents") -> Any:
    client = get_chroma_client()
    return client.get_or_create_collection(name=collection_name)


def sanitize_user_text(text: str) -> str:
    lowered = text.lower()
    suspicious_patterns = [
        "ignore previous instructions",
        "reveal system prompt",
        "ignore all instructions",
        "developer message",
    ]
    if any(pattern in lowered for pattern in suspicious_patterns):
        raise ValueError("Potential prompt injection detected")
    return text.strip()


def get_embedding_vector(text: str) -> list[float]:
    model = _load_embedding_model()
    if model is not None:
        try:
            vector = model.encode([text], normalize_embeddings=True)[0]
            return vector.tolist()
        except Exception as exc:
            # Fall through and attempt OpenAI embeddings
            pass

    # Fallback to OpenAI embeddings if API key is provided
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        try:
            import openai

            openai.api_key = openai_api_key
            resp = openai.Embedding.create(input=text, model=os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"))
            return resp["data"][0]["embedding"]
        except Exception as exc:  # pragma: no cover - runtime guard
            raise HTTPException(status_code=500, detail=f"Embedding service error: {exc}")

    return _fallback_hash_embedding(text)


def _fallback_hash_embedding(text: str, dimensions: int = 384) -> list[float]:
    """Pure-Python fallback so documents remain searchable even without ML deps."""
    vector = [0.0] * dimensions
    tokens = [token for token in text.lower().split() if token]
    if not tokens:
        return vector

    for token in tokens:
        digest = hashlib.sha1(token.encode("utf-8")).hexdigest()
        index = int(digest[:8], 16) % dimensions
        weight = 1.0 + (len(token) / 10.0)
        vector[index] += weight

    norm = math.sqrt(sum(value * value for value in vector))
    if norm:
        vector = [value / norm for value in vector]
    return vector


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 120) -> list[str]:
    cleaned_text = text.strip()
    if not cleaned_text:
        return []

    chunks: list[str] = []
    start = 0
    while start < len(cleaned_text):
        end = min(len(cleaned_text), start + chunk_size)
        chunks.append(cleaned_text[start:end])
        if end >= len(cleaned_text):
            break
        start = max(end - overlap, start + 1)
    return chunks


def index_document_chunks(filename: str, content: str, content_type: Optional[str] = None) -> dict[str, Any]:
    sanitized_content = sanitize_user_text(content)
    chunks = chunk_text(sanitized_content)
    if not chunks:
        raise ValueError("Document text is empty")

    collection = get_chroma_collection()
    base_id = hashlib.sha1(f"{filename}:{len(chunks)}:{sanitized_content[:128]}".encode("utf-8")).hexdigest()
    ids = [f"{base_id}:{index}" for index in range(len(chunks))]
    embeddings = [get_embedding_vector(chunk) for chunk in chunks]
    metadatas = [
        {
            "filename": filename,
            "chunk_index": index,
            "content_type": content_type or "text/plain",
        }
        for index in range(len(chunks))
    ]

    collection.upsert(ids=ids, documents=chunks, embeddings=embeddings, metadatas=metadatas)
    return {
        "filename": filename,
        "status": "indexed",
        "chunks": len(chunks),
    }


def list_indexed_documents(collection_name: str = "aipos_documents") -> list[dict[str, Any]]:
    try:
        collection = get_chroma_collection(collection_name)
        result = collection.get(include=["metadatas"])
    except Exception:
        return []

    grouped: dict[str, dict[str, Any]] = {}
    ids = result.get("ids", [])
    metadatas = result.get("metadatas", [])
    for index, record_id in enumerate(ids):
        metadata = metadatas[index] if index < len(metadatas) else {}
        filename = metadata.get("filename", "untitled")
        entry = grouped.setdefault(filename, {"name": filename, "chunks": 0, "status": "Indexed"})
        entry["chunks"] += 1
        entry["document_ids"] = entry.get("document_ids", []) + [record_id]
    return list(grouped.values())


def query_retrieval_context(query: str, collection_name: str = "aipos_documents", top_k: int = 4) -> list[dict[str, Any]]:
    try:
        safe_query = sanitize_user_text(query)
        collection = get_chroma_collection(collection_name)
        query_vector = get_embedding_vector(safe_query)
        result = collection.query(query_embeddings=[query_vector], n_results=top_k)
    except Exception:
        return []

    documents = result.get("documents", [[]])[0]
    metadatas = result.get("metadatas", [[]])[0]
    distances = result.get("distances", [[]])[0]

    sources: list[dict[str, Any]] = []
    for index, document in enumerate(documents):
        sources.append(
            {
                "content": document,
                "metadata": metadatas[index] if index < len(metadatas) else {},
                "distance": distances[index] if index < len(distances) else None,
            }
        )
    return sources


def generate_rag_answer(query: str, document_ids: list[str]) -> dict[str, Any]:
    sources = query_retrieval_context(query)
    if not sources:
        return {
            "answer": (
                "RAG stack is configured for local embeddings and ChromaDB, but no indexed document "
                "chunks are available yet."
            ),
            "sources": document_ids,
        }

    return {
        "answer": f"Retrieved {len(sources)} relevant chunks for: {query}",
        "sources": document_ids,
        "matches": sources,
    }
