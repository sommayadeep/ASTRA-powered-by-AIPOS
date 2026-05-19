from __future__ import annotations

import os
import threading
import time
from collections import defaultdict, deque
from dataclasses import dataclass
from typing import Deque, Optional

from fastapi import HTTPException, Request, status


@dataclass(frozen=True)
class RateLimitConfig:
    max_requests: int = int(os.getenv("RATE_LIMIT_REQUESTS", "60"))
    window_seconds: int = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))


class RateLimiter:
    def __init__(self, config: Optional[RateLimitConfig] = None) -> None:
        self.config = config or RateLimitConfig()
        self._requests: dict[str, Deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        window_start = now - self.config.window_seconds

        with self._lock:
            bucket = self._requests[key]
            while bucket and bucket[0] < window_start:
                bucket.popleft()

            if len(bucket) >= self.config.max_requests:
                return False

            bucket.append(now)
            return True


rate_limiter = RateLimiter()


def get_client_key(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    client_host = request.client.host if request.client else "unknown"
    return client_host


def enforce_rate_limit(request: Request) -> None:
    client_key = get_client_key(request)
    if not rate_limiter.allow(client_key):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please slow down and try again.",
        )


def get_rate_limit_status() -> str:
    return f"{rate_limiter.config.max_requests} requests per {rate_limiter.config.window_seconds} seconds"


def sanitize_response_text(text: str, max_length: int = 8000) -> str:
    import re

    if not text or not text.strip():
        raise ValueError("Empty model response")

    cleaned = text.strip()

    # Remove common status/banner lines produced by some models
    # e.g., lines containing 'Status:', 'Functionality:', 'Ready to Assist', etc.
    lines = []
    for line in cleaned.splitlines():
        low = line.lower()
        if "status:" in low or "functionality:" in low or "ready to assist" in low:
            continue
        # remove bold/markdown-only blocks that look like banners
        if re.match(r"^\*{1,3}.*\*{1,3}$", line.strip()):
            continue
        lines.append(line)

    cleaned = "\n".join(lines).strip()

    # Collapse multiple blank lines
    cleaned = re.sub(r"\n{2,}", "\n\n", cleaned)

    return cleaned[:max_length]
