from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Optional, Tuple

from openai import OpenAI


@dataclass(frozen=True)
class ProviderConfig:
    name: str
    model: str
    base_url: Optional[str]
    api_key: Optional[str]


def _clean_provider(value: Optional[str]) -> str:
    return (value or "").strip().lower()


def resolve_provider_config() -> ProviderConfig:
    provider = _clean_provider(os.getenv("AIPOS_AI_PROVIDER"))
    deployment = _clean_provider(os.getenv("AIPOS_ENV", "development"))

    if not provider:
        provider = "groq" if deployment in {"production", "prod", "staging"} else "ollama"

    if provider == "ollama":
        return ProviderConfig(
            name="ollama",
            model=os.getenv("OLLAMA_MODEL", "qwen3:8b"),
            base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1"),
            api_key=os.getenv("OLLAMA_API_KEY", "ollama"),
        )
    if provider == "groq":
        return ProviderConfig(
            name="groq",
            model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
            base_url=os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1"),
            api_key=os.getenv("GROQ_API_KEY"),
        )
    if provider == "gemini":
        return ProviderConfig(
            name="gemini",
            model=os.getenv("GEMINI_MODEL", "gemini-2.0-flash"),
            base_url=os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai/"),
            api_key=os.getenv("GEMINI_API_KEY"),
        )
    if provider == "openrouter":
        return ProviderConfig(
            name="openrouter",
            model=os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini"),
            base_url=os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
            api_key=os.getenv("OPENROUTER_API_KEY"),
        )

    return ProviderConfig(
        name="openai",
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        base_url=os.getenv("OPENAI_BASE_URL"),
        api_key=os.getenv("OPENAI_API_KEY"),
    )


def build_openai_client() -> Tuple[Optional[OpenAI], ProviderConfig]:
    config = resolve_provider_config()
    if not config.api_key and config.name != "ollama":
        return None, config

    client = OpenAI(api_key=config.api_key or "ollama", base_url=config.base_url)
    return client, config


def provider_status_message() -> str:
    config = resolve_provider_config()
    if config.name == "ollama":
        return f"Provider: Ollama | Model: {config.model} | Base URL: {config.base_url}"
    if config.name == "groq":
        return f"Provider: Groq | Model: {config.model}"
    if config.name == "gemini":
        return f"Provider: Gemini | Model: {config.model}"
    if config.name == "openrouter":
        return f"Provider: OpenRouter | Model: {config.model}"
    return f"Provider: OpenAI | Model: {config.model}"
