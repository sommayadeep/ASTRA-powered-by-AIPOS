from __future__ import annotations

from collections.abc import Iterator

from app.services.rag import query_retrieval_context, sanitize_user_text
from app.services.providers import build_openai_client, provider_status_message, resolve_first_available_provider
from app.services.settings import get_settings
from app.services.security import sanitize_response_text

SYSTEM_PROMPT = (
    "You are ASTRA, the intelligent autonomous AI engine powering AIPOS. "
    "Be calm, futuristic, concise, practical, and structured. "
    "\n\nImportant: Do not output internal status banners or system-style blocks (for example, lines like 'Status: Operational' or 'Functionality: Nominal')."
    "Respond conversationally and briefly when asked personal or status questions (e.g., 'how are you?') without printing operational metadata. "
    "Use ASTRA-flavored language when appropriate, and mention document context only when relevant."
)


def _build_document_context(message: str) -> str:
    sources = query_retrieval_context(message)
    if not sources:
        return ""

    context_lines = ["Relevant uploaded document excerpts:"]
    for source in sources[:4]:
        metadata = source.get("metadata") or {}
        filename = metadata.get("filename", "uploaded document")
        chunk_index = metadata.get("chunk_index", 0)
        content = (source.get("content") or "").strip()
        if content:
            context_lines.append(f"- {filename} [chunk {chunk_index}]: {content[:800]}")
    return "\n".join(context_lines)


def generate_chat_reply(message: str, user_id: str | None = None) -> str:
    safe_message = sanitize_user_text(message)
    document_context = _build_document_context(safe_message)
    preferred_provider = None
    if user_id:
        settings = get_settings(user_id)
        preferred_provider = settings.get("preferred_provider")
    client, config = build_openai_client(preferred_provider)
    if not client:
        fallback_config = resolve_first_available_provider(preferred_provider)
        if fallback_config.name != config.name:
            client, config = build_openai_client(fallback_config.name)
    if not client:
        return (
            f"No AI provider is configured yet. Set {config.name.upper()} credentials to enable the model-backed chat. "
            f"You asked: {safe_message}"
        )

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if document_context:
        messages.append({"role": "system", "content": document_context})
    messages.append({"role": "user", "content": safe_message})

    try:
        response = client.chat.completions.create(
            model=config.model,
            messages=messages,
        )
        return sanitize_response_text(response.choices[0].message.content or "I could not generate a response.")
    except Exception:
        # Provider couldn't be reached or errored. Return a concise local fallback so UI remains responsive.
        simple = safe_message.strip()
        if not simple:
            return "I couldn't reach the AI provider and no question was detected. Check provider settings."
        # Short deterministic fallback: acknowledge and provide brief guidance.
        return sanitize_response_text(
            f"I can't reach the AI model right now. Locally: you asked '{simple}'. Try again after checking your provider settings."
        )


def stream_chat_reply(message: str, user_id: str | None = None) -> Iterator[str]:
    safe_message = sanitize_user_text(message)
    document_context = _build_document_context(safe_message)
    preferred_provider = None
    if user_id:
        settings = get_settings(user_id)
        preferred_provider = settings.get("preferred_provider")
    client, config = build_openai_client(preferred_provider)
    if not client:
        fallback_config = resolve_first_available_provider(preferred_provider)
        if fallback_config.name != config.name:
            client, config = build_openai_client(fallback_config.name)
    if not client:
        yield (
            "No AI provider is configured yet. Set provider credentials to enable the model-backed chat. "
            f"You asked: {safe_message}"
        )
        return

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if document_context:
        messages.append({"role": "system", "content": document_context})
    messages.append({"role": "user", "content": safe_message})

    try:
        stream = client.chat.completions.create(
            model=config.model,
            messages=messages,
            stream=True,
        )
    except Exception:
        # Yield a simple fallback stream so frontend gets an immediate response.
        fallback = f"I can't reach the AI model right now. You asked: {safe_message}. Check provider settings."
        yield fallback
        return

    # Stream while filtering banner/status-like lines so frontend doesn't show them.
    accumulated_raw = ""
    accumulated_clean = ""
    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if not delta:
            continue

        accumulated_raw += delta

        # Try to produce a cleaned version of the accumulated text. If cleaning removes
        # everything (raises), fall back to raw accumulated text for streaming.
        try:
            candidate = sanitize_response_text(accumulated_raw)
        except Exception:
            candidate = accumulated_raw

        # yield only the newly-cleaned portion to avoid re-sending already-streamed text
        if candidate.startswith(accumulated_clean):
            new_part = candidate[len(accumulated_clean) :]
        else:
            # unexpected divergence — send the full candidate as new text
            new_part = candidate

        if new_part:
            yield new_part
            accumulated_clean = candidate


def get_provider_banner() -> str:
    return provider_status_message()
