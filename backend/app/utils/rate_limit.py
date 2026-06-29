"""
Rate limiting using slowapi (Flask-Limiter port for FastAPI).

Strategy:
  - Identify the caller by user_id when authenticated (Pro tier gets a
    higher quota), otherwise by remote IP address.
  - Limits configured per route family via settings (RATE_LIMIT_*).
  - In dev or when RATE_LIMIT_ENABLED is False, the limiter still tracks
    counts but never raises — so feature work is never blocked locally.

Storage backend:
  - Defaults to in-memory (per-process). Single uvicorn worker on a small
    VPS is fine. If you scale to multiple workers/instances, set
    RATELIMIT_STORAGE_URI to redis://... and add Redis to your stack.

Use as a dependency on routes:

    @router.post("/login", dependencies=[Depends(limit_auth)])
    async def login(...):
        ...
"""
from __future__ import annotations

import logging
import os
from typing import Awaitable, Callable, Optional

from fastapi import Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config import settings

logger = logging.getLogger("rate_limit")


def _identify_caller(request: Request) -> str:
    """Identify the caller for limit accounting.

    Authenticated users are identified by their user_id (so a Pro user
    who's also behind a NAT doesn't get throttled by their neighbor's
    activity). Falls back to remote IP for anonymous traffic.
    """
    auth = request.headers.get("authorization")
    if auth:
        try:
            from app.services.auth_service import decode_access_token

            scheme, _, token = auth.partition(" ")
            if scheme.lower() == "bearer" and token:
                payload = decode_access_token(token)
                user_id = payload.get("sub")
                if user_id:
                    return f"user:{user_id}"
        except Exception:  # noqa: BLE001
            pass
    return f"ip:{get_remote_address(request)}"


# Storage URI: respect environment override, default to in-memory.
_STORAGE_URI = os.getenv("RATELIMIT_STORAGE_URI", "memory://")

limiter = Limiter(
    key_func=_identify_caller,
    default_limits=[settings.RATE_LIMIT_FREE_HOURLY] if settings.RATE_LIMIT_ENABLED else [],
    storage_uri=_STORAGE_URI,
    enabled=settings.RATE_LIMIT_ENABLED,
)


def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """Custom 429 response with Retry-After header."""
    from fastapi.responses import JSONResponse

    retry_after = getattr(exc, "retry_after", 60)
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "detail": (
                f"Rate limit exceeded ({exc.detail}). "
                # [Phase 3] Restore: "Slow down or upgrade to Pro for higher limits."
                "Please try again later."
            )
        },
        headers={"Retry-After": str(retry_after)},
    )


# ── Reusable per-family decorators ────────────────────────────────────
# Use as: @limiter.limit(settings.RATE_LIMIT_AUTH) on routes that take
# `request: Request` as a parameter (slowapi requires it for accounting).
# For routes that don't need to access request, use Depends(...) below.


def limit_auth(request: Request):
    """Dependency-style limiter for auth endpoints (login, signup, reset)."""
    if settings.RATE_LIMIT_ENABLED:
        # slowapi's Limiter.limit decorator is the supported path; this
        # dependency form mirrors it for routes that prefer Depends().
        try:
            limiter.limit(settings.RATE_LIMIT_AUTH)(lambda r: None)(request)
        except RateLimitExceeded as exc:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many auth attempts. Try again in a minute.",
                headers={"Retry-After": "60"},
            ) from exc


def limit_processing(request: Request):
    """Dependency-style limiter for PDF processing endpoints."""
    if settings.RATE_LIMIT_ENABLED:
        try:
            limiter.limit(settings.RATE_LIMIT_PROCESSING)(lambda r: None)(request)
        except RateLimitExceeded as exc:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                # [Phase 3] Restore: "Too many processing requests this hour. Upgrade to Pro for higher limits."
                detail="Too many processing requests this hour. Please try again later.",
                headers={"Retry-After": "3600"},
            ) from exc


def limit_ai(request: Request):
    """Dependency-style limiter for AI endpoints (most expensive)."""
    if settings.RATE_LIMIT_ENABLED:
        try:
            limiter.limit(settings.RATE_LIMIT_AI)(lambda r: None)(request)
        except RateLimitExceeded as exc:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                # [Phase 3] Restore: "AI quota exceeded for this hour. Upgrade to Pro for higher limits."
                detail="AI quota exceeded for this hour. Please try again later.",
                headers={"Retry-After": "3600"},
            ) from exc
