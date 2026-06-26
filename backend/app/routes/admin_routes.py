"""
Admin endpoints — gated by ADMIN_TOKEN.

Currently exposes:
  GET  /api/admin/cleanup/status   → sweeper config + temp dir disk usage
  POST /api/admin/cleanup/run      → trigger one sweep on demand

These endpoints are guarded by a static bearer token configured via the
ADMIN_TOKEN env var. If ADMIN_TOKEN is empty, the endpoints are disabled
and return 503 — that's intentional so a deployment without the env var
can't accidentally expose admin actions.

This is good enough for a single-operator side project. If multiple admins
join, swap this for a proper auth scheme (JWT roles, OAuth, etc.).
"""
from __future__ import annotations
import secrets
import shutil
import tempfile

from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.config import settings
from app.services.cleanup_service import run_once
from app.services import cloud_ai_service

router = APIRouter()


def require_admin_token(authorization: str | None = Header(default=None)) -> None:
    """Reject the request unless a valid admin bearer token is supplied."""
    if not settings.ADMIN_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin endpoints disabled. Set ADMIN_TOKEN to enable.",
        )
    expected = f"Bearer {settings.ADMIN_TOKEN}"
    # if authorization != expected:
    if not authorization or not secrets.compare_digest(authorization, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing admin token.",
        )


@router.get("/cleanup/status", dependencies=[Depends(require_admin_token)])
async def cleanup_status() -> dict:
    """Return the sweeper config and current temp-dir disk usage."""
    temp_dir = tempfile.gettempdir()
    try:
        usage = shutil.disk_usage(temp_dir)
        disk = {
            "total_gb": round(usage.total / (1024 ** 3), 2),
            "used_gb": round(usage.used / (1024 ** 3), 2),
            "free_gb": round(usage.free / (1024 ** 3), 2),
        }
    except OSError as exc:
        disk = {"error": str(exc)}
    return {
        "enabled": settings.CLEANUP_ENABLED,
        "interval_seconds": settings.CLEANUP_INTERVAL_SECONDS,
        "retention_seconds": settings.CLEANUP_RETENTION_SECONDS,
        "system_temp_dir": temp_dir,
        "app_temp_dir": settings.TEMP_DIR,
        "custom_cleanup_dirs": settings.CUSTOM_CLEANUP_DIRS,
        "disk": disk,
    }


@router.post("/cleanup/run", dependencies=[Depends(require_admin_token)])
async def cleanup_run_now() -> dict:
    """Trigger one cleanup sweep immediately and return its summary."""
    summary = await run_once()
    return {
        "ok": True,
        "deleted": summary["deleted"],
        "bytes_freed": summary["bytes_freed"],
        "mb_freed": round(summary["bytes_freed"] / (1024 * 1024), 2),
        "errors": summary["errors"],
    }


@router.get("/ai/status", dependencies=[Depends(require_admin_token)])
async def ai_status() -> dict:
    """Cloud LLM quota tracker — best-effort process-local request counts.

    The reported count resets on backend restart and is per-worker. Use it
    for at-a-glance health checks; the authoritative quota is Groq's own
    rate limiter (which returns 429 when exceeded, triggering HF fallback).
    """
    quota = cloud_ai_service.quota_snapshot()
    return {
        "cloud_llm_enabled": settings.USE_CLOUD_LLM,
        "groq_configured": bool(settings.GROQ_API_KEY),
        "groq_available": cloud_ai_service.is_available(),
        "model": settings.GROQ_MODEL,
        "quota": quota,
        "free_tier_daily_limit": 14400,
    }
