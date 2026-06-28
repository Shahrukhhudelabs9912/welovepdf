"""
Admin endpoints — gated by ADMIN_TOKEN.

Currently exposes:
  GET  /api/admin/cleanup/status   → sweeper config + temp dir disk usage
  POST /api/admin/cleanup/run      → trigger one sweep on demand
  GET  /api/admin/ai/status        → cloud LLM quota info
  GET  /api/admin/contact-submissions       → paginated list of contact messages
  PATCH /api/admin/contact-submissions/{id} → update status (new/read/replied)
  POST /api/admin/contact-submissions/{id}/reply → send reply email to user

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

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from pydantic import BaseModel, Field
from bson import ObjectId

from app.config import settings
from app.services.cleanup_service import run_once
from app.services import cloud_ai_service
from app.utils.db_utils import get_database
from app.services.email_service import send_email

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


# ─── Contact submissions management ─────────────────────────────────────────


@router.get("/contact-submissions", dependencies=[Depends(require_admin_token)])
async def list_contact_submissions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
) -> dict:
    """Paginated list of contact form submissions."""
    db = get_database()
    query: dict = {}
    if status_filter:
        query["status"] = status_filter

    total = await db.contact_submissions.count_documents(query)
    skip = (page - 1) * limit
    cursor = db.contact_submissions.find(query).sort("submitted_at", -1).skip(skip).limit(limit)
    submissions = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        submissions.append(doc)

    return {
        "submissions": submissions,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
    }


class UpdateStatusBody(BaseModel):
    status: str = Field(..., pattern=r"^(new|read|replied)$")


@router.patch("/contact-submissions/{submission_id}", dependencies=[Depends(require_admin_token)])
async def update_submission_status(submission_id: str, body: UpdateStatusBody) -> dict:
    """Mark a contact submission as read/replied/new."""
    db = get_database()
    try:
        oid = ObjectId(submission_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid submission ID")

    result = await db.contact_submissions.update_one(
        {"_id": oid},
        {"$set": {"status": body.status}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"ok": True, "status": body.status}


class ReplyBody(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000)
    subject: str | None = None


@router.post("/contact-submissions/{submission_id}/reply", dependencies=[Depends(require_admin_token)])
async def reply_to_submission(submission_id: str, body: ReplyBody) -> dict:
    """Send a reply email to the user and mark submission as replied."""
    db = get_database()
    try:
        oid = ObjectId(submission_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid submission ID")

    doc = await db.contact_submissions.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Submission not found")

    if not settings.RESEND_API_KEY:
        raise HTTPException(status_code=503, detail="Email not configured (RESEND_API_KEY missing)")

    import html as html_mod
    safe_message = html_mod.escape(body.message).replace("\n", "<br>")
    html_body = f"""
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
  <p style="color: #333; line-height: 1.6;">Hi {html_mod.escape(doc['first_name'])},</p>
  <div style="color: #333; line-height: 1.6;">{safe_message}</div>
  <p style="margin-top: 24px; color: #666;">&mdash; The WeLovePDF Team</p>
</div>
""".strip()

    text_body = f"Hi {doc['first_name']},\n\n{body.message}\n\n— The WeLovePDF Team\n"
    reply_subject = body.subject or f"Re: {doc['subject']}"

    sent = await send_email(
        to=doc["email"],
        subject=reply_subject,
        html_body=html_body,
        text_body=text_body,
        from_email=settings.CONTACT_FROM_EMAIL,
    )
    if not sent:
        raise HTTPException(status_code=502, detail="Failed to send email via Resend")

    await db.contact_submissions.update_one(
        {"_id": oid},
        {"$set": {"status": "replied"}},
    )
    return {"ok": True, "message": "Reply sent successfully"}
