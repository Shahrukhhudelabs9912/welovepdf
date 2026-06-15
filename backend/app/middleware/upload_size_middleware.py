"""
Upload size middleware — enforces tier-based file upload limits at the
HTTP boundary, before route handlers see the request.

Why middleware (vs per-route Depends):
  - Single point of enforcement; can't be forgotten on a new route.
  - Catches abuse on placeholder/legacy endpoints automatically.
  - Reads Content-Length so we reject huge uploads before the body is buffered.

Behavior:
  - Only applies to multipart/form-data POST/PUT requests under /api/.
  - Resolves the user tier from the optional Authorization header.
  - Rejects with HTTP 413 if Content-Length exceeds the user's tier limit.
  - Always allows /api/admin/* (gated by ADMIN_TOKEN separately).

Limitations:
  - Trusts client Content-Length. The route handler is the second line of
    defense and should still call enforce_upload_limit on individual files
    where per-file (vs per-request) precision is needed.
"""
from __future__ import annotations

import logging
from typing import Optional

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings

logger = logging.getLogger("upload_middleware")


def _format_mb(n: int) -> str:
    return f"{n / (1024 * 1024):.0f} MB"


async def _resolve_tier_limit(authorization: Optional[str]) -> int:
    """Best-effort tier resolution; falls back to FREE on any failure."""
    if not authorization:
        return settings.FREE_MAX_UPLOAD_SIZE
    try:
        from app.services.auth_service import decode_access_token, get_user_by_id

        scheme, _, token = authorization.partition(" ")
        if scheme.lower() != "bearer" or not token:
            return settings.FREE_MAX_UPLOAD_SIZE
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            return settings.FREE_MAX_UPLOAD_SIZE
        user = await get_user_by_id(user_id)
        tier = (user or {}).get("tier", "")
        return (
            settings.PRO_MAX_UPLOAD_SIZE
            if tier.lower() == "pro"
            else settings.FREE_MAX_UPLOAD_SIZE
        )
    except Exception:  # noqa: BLE001
        return settings.FREE_MAX_UPLOAD_SIZE


class UploadSizeLimitMiddleware(BaseHTTPMiddleware):
    """Enforces per-tier upload size limits across all /api/ upload routes."""

    async def dispatch(self, request: Request, call_next):
        # Only check write methods carrying multipart bodies.
        if request.method not in ("POST", "PUT", "PATCH"):
            return await call_next(request)

        path = request.url.path
        if not path.startswith("/api/"):
            return await call_next(request)
        if path.startswith("/api/admin/"):
            return await call_next(request)

        content_type = request.headers.get("content-type", "")
        if "multipart/form-data" not in content_type:
            return await call_next(request)

        content_length_header = request.headers.get("content-length")
        if not content_length_header:
            # Chunked uploads without Content-Length — let route handler
            # enforce per-file via enforce_upload_limit().
            return await call_next(request)

        try:
            content_length = int(content_length_header)
        except ValueError:
            return await call_next(request)

        # Hard ceiling — never accept anything larger than the absolute max.
        if content_length > settings.MAX_UPLOAD_SIZE:
            return JSONResponse(
                status_code=413,
                content={
                    "detail": (
                        f"Request body is {_format_mb(content_length)}, exceeds "
                        f"the {_format_mb(settings.MAX_UPLOAD_SIZE)} hard limit."
                    )
                },
            )

        # Per-tier check
        limit = await _resolve_tier_limit(request.headers.get("authorization"))
        if content_length > limit:
            is_pro_limit = limit == settings.PRO_MAX_UPLOAD_SIZE
            upgrade = (
                ""
                if is_pro_limit
                else f" Upgrade to Pro for {_format_mb(settings.PRO_MAX_UPLOAD_SIZE)} uploads."
            )
            return JSONResponse(
                status_code=413,
                content={
                    "detail": (
                        f"Upload is {_format_mb(content_length)}, exceeds your "
                        f"{_format_mb(limit)} limit.{upgrade}"
                    )
                },
            )

        return await call_next(request)
