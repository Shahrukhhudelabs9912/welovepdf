"""
Tier-based file upload limits.

Resolves the per-request upload limit from:
  1. The optional Authorization header (Bearer token)
  2. The authenticated user's tier ("pro" → PRO_MAX_UPLOAD_SIZE,
     anything else → FREE_MAX_UPLOAD_SIZE)
  3. Anonymous requests fall back to FREE_MAX_UPLOAD_SIZE

Use as a FastAPI dependency on any upload route:

    @router.post("/merge-pdf")
    async def merge_pdf(
        files: List[UploadFile] = File(...),
        limit: int = Depends(get_upload_limit),
    ):
        for f in files:
            enforce_upload_limit(f, limit)
        ...
"""
from __future__ import annotations

import logging
from typing import Optional

from fastapi import Depends, Header, HTTPException, UploadFile, status

from app.config import settings

logger = logging.getLogger("file_limits")


def _tier_to_limit(tier: Optional[str]) -> int:
    """Resolve byte limit from a user-tier string. Unknown / None → FREE."""
    if tier and tier.lower() == "pro":
        return settings.PRO_MAX_UPLOAD_SIZE
    return settings.FREE_MAX_UPLOAD_SIZE


async def get_upload_limit(
    authorization: Optional[str] = Header(default=None),
) -> int:
    """FastAPI dependency: returns the byte limit applicable to this request.

    Decoding the JWT is best-effort — any failure (no header, malformed token,
    expired signature, DB lookup failure) silently falls back to the FREE tier
    limit. We never block a request just to resolve the limit.
    """
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
        if not user:
            return settings.FREE_MAX_UPLOAD_SIZE
        return _tier_to_limit(user.get("tier"))
    except Exception as exc:  # noqa: BLE001
        logger.debug("upload limit: defaulting to FREE (%s)", exc)
        return settings.FREE_MAX_UPLOAD_SIZE


def _format_mb(n: int) -> str:
    return f"{n / (1024 * 1024):.0f} MB"


def enforce_upload_limit(file: UploadFile, limit: int) -> None:
    """Raise HTTP 413 if the file exceeds the byte limit.

    Reads the file pointer position to determine size, then resets it.
    The error message tells the user the actual limit and how to upgrade.
    """
    try:
        file.file.seek(0, 2)  # end
        size = file.file.tell()
        file.file.seek(0)
    except (OSError, AttributeError):
        # If we can't tell, let the actual read attempt fail downstream.
        return
    if size > limit:
        is_pro_limit = limit == settings.PRO_MAX_UPLOAD_SIZE
        upgrade_hint = (
            "" if is_pro_limit
            else f" Upgrade to Pro for {_format_mb(settings.PRO_MAX_UPLOAD_SIZE)} uploads."
        )
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=(
                f"File '{file.filename}' is {_format_mb(size)}, exceeds your "
                f"{_format_mb(limit)} limit.{upgrade_hint}"
            ),
        )
