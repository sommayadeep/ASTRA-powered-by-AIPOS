from __future__ import annotations

import os
import sys
from dataclasses import dataclass


@dataclass(frozen=True)
class ProviderRequirements:
    provider: str
    required_keys: tuple[str, ...]


PROVIDER_REQUIREMENTS = {
    "ollama": ProviderRequirements("ollama", ("OLLAMA_BASE_URL", "OLLAMA_MODEL")),
    "groq": ProviderRequirements("groq", ("GROQ_API_KEY", "GROQ_MODEL")),
    "gemini": ProviderRequirements("gemini", ("GEMINI_API_KEY", "GEMINI_MODEL")),
    "openrouter": ProviderRequirements("openrouter", ("OPENROUTER_API_KEY", "OPENROUTER_MODEL")),
    "openai": ProviderRequirements("openai", ("OPENAI_API_KEY", "OPENAI_MODEL")),
}


def main() -> int:
    provider = os.getenv("AIPOS_AI_PROVIDER", "ollama").strip().lower() or "ollama"
    environment = os.getenv("AIPOS_ENV", "development").strip().lower() or "development"
    frontend_origins = os.getenv("FRONTEND_ORIGINS", "").strip()

    errors: list[str] = []
    warnings: list[str] = []

    requirements = PROVIDER_REQUIREMENTS.get(provider)
    if not requirements:
        errors.append(f"Unsupported AIPOS_AI_PROVIDER: {provider}")
    else:
        for key in requirements.required_keys:
            if not os.getenv(key):
                errors.append(f"Missing required environment variable for {provider}: {key}")

    if environment == "production" and not frontend_origins:
        errors.append("FRONTEND_ORIGINS must be set in production")

    if provider == "ollama":
        warnings.append("Development is configured for local Ollama inference.")
    if provider == "groq" and not os.getenv("GROQ_API_KEY"):
        errors.append("GROQ_API_KEY must be set when provider is groq")

    if errors:
        for message in errors:
            print(f"ERROR: {message}")
        for message in warnings:
            print(f"WARNING: {message}")
        return 1

    print("AIPOS environment check passed.")
    print(f"Provider: {provider}")
    print(f"Environment: {environment}")
    if warnings:
        for message in warnings:
            print(f"WARNING: {message}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
