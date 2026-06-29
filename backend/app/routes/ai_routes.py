"""AI Tools API routes — summarization, key points, title generation, report export."""
import io
import logging
from typing import Optional

from fastapi import APIRouter, File, Form, Header, HTTPException, Request, UploadFile, status
from fastapi.responses import Response

from app.services.ai_tools_service import analyze_pdf, generate_report
from app.services.auth_service import (
    get_user_by_id,
    _sanitize_user,
    check_usage_limit,
    increment_daily_usage,
    get_usage_remaining,
)
from app.utils.db_utils import get_database
from app.utils.rate_limit import limiter
from app.utils import run_blocking, heavy_job_slot
from app.config import settings

logger = logging.getLogger("ai_routes")

router = APIRouter(prefix="/ai-tools", tags=["AI Tools"])


# ---------------------------------------------------------------------------
# Tracking helpers
# ---------------------------------------------------------------------------

async def _track_usage(
    user_id: Optional[str],
    action: str,
    metadata: Optional[dict] = None,
) -> None:
    """Record a usage event in the user_activity collection."""
    from datetime import datetime, timezone
    db = get_database()
    await db.user_activity.insert_one({
        "user_id": user_id or "anonymous",
        "action": action,
        "metadata": metadata or {},
        "timestamp": datetime.now(timezone.utc),
    })


async def _save_ai_history(
    user_id: Optional[str],
    original_filename: str,
    analysis_result: dict,
) -> None:
    """Save an AI analysis result to the user's history."""
    from datetime import datetime, timezone
    db = get_database()
    await db.ai_history.insert_one({
        "user_id": user_id or "anonymous",
        "original_filename": original_filename,
        "title": analysis_result.get("title", "Untitled"),
        "summary": analysis_result.get("summary", ""),
        "key_points": analysis_result.get("keyPoints", []),
        "word_count": analysis_result.get("wordCount", 0),
        "page_count": analysis_result.get("pageCount", 0),
        "reading_time": analysis_result.get("readingTime", ""),
        "sentiment": analysis_result.get("sentiment", "neutral"),
        "confidence": analysis_result.get("confidence", 0),
        "created_at": datetime.now(timezone.utc),
    })


# ---------------------------------------------------------------------------
# Helper: resolve current user from Authorization header (optional)
# ---------------------------------------------------------------------------


async def _resolve_current_user(authorization: Optional[str] = None) -> Optional[dict]:
    """Resolve a user dict from the Bearer token, or return None."""
    if not authorization:
        return None
    from app.services.auth_service import decode_access_token
    try:
        scheme, _, token = authorization.partition(" ")
        if scheme.lower() != "bearer" or not token:
            return None
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if user_id:
            return await get_user_by_id(user_id)
    except Exception:
        pass
    return None


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.post("")
@limiter.limit(settings.RATE_LIMIT_AI)
async def analyze_pdf_endpoint(
    request: Request,
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    """Run AI analysis on an uploaded PDF: summary, key points, title, sentiment.

    Authenticated users have their daily usage tracked and limited.
    Anonymous users are allowed but tracked under ``"anonymous"``.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported.",
        )

    # Optionally resolve the current user for usage tracking
    current_user = await _resolve_current_user(authorization)

    try:
        pdf_bytes = await file.read()
        if not pdf_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty file uploaded.",
            )

        # Check daily usage limit for authenticated users
        if current_user:
            can_proceed = await check_usage_limit(current_user["id"], "ai_analyses")
            if not can_proceed:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    # [Phase 3] Restore: "Daily analysis limit reached. Upgrade to Pro for unlimited access."
                    detail="Daily analysis limit reached. Please try again tomorrow.",
                )

        # Run analysis off the event loop (CPU-bound: torch/transformers).
        async with heavy_job_slot():
            result = await run_blocking(analyze_pdf, pdf_bytes)
        result["filename"] = file.filename

        # Increment usage counter for authenticated users
        if current_user:
            await increment_daily_usage(current_user["id"], "ai_analyses")

        # Save to history and track usage
        user_id = current_user["id"] if current_user else None
        await _save_ai_history(user_id, file.filename, result)
        await _track_usage(user_id, "ai_analysis", {"filename": file.filename})

        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI analysis failed: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI analysis failed. Please try again.",
        )


@router.post("/report")
@limiter.limit(settings.RATE_LIMIT_AI)
async def generate_report_endpoint(
    request: Request,
    file: UploadFile = File(...),
    summary: str = Form(""),
    title: str = Form(""),
    key_points_raw: str = Form(""),  # JSON array string
    wordCount: int = Form(0),
    pageCount: int = Form(0),
    readingTime: str = Form(""),
    sentiment: str = Form("neutral"),
    confidence: float = Form(0.0),
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    """Generate a formatted DOCX report from pre-computed AI analysis data.

    Authenticated users have their daily report export limit enforced.
    """
    import json
    try:
        key_points = json.loads(key_points_raw) if key_points_raw else []
    except (json.JSONDecodeError, TypeError):
        key_points = []

    analysis_result = {
        "title": title or file.filename or "Document Analysis",
        "summary": summary,
        "keyPoints": key_points,
        "wordCount": wordCount,
        "pageCount": pageCount,
        "readingTime": readingTime or "< 1 minute",
        "sentiment": sentiment,
        "confidence": confidence,
    }

    # Optionally resolve the current user for usage tracking
    current_user = await _resolve_current_user(authorization)

    try:
        # Check daily report limit for authenticated users
        if current_user:
            can_proceed = await check_usage_limit(current_user["id"], "reports")
            if not can_proceed:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    # [Phase 3] Restore: "Daily report export limit reached. Upgrade to Pro for unlimited reports."
                    detail="Daily report export limit reached. Please try again tomorrow.",
                )

        docx_bytes = await run_blocking(generate_report, analysis_result, file.filename or "document.pdf")

        # Increment usage counter for authenticated users
        if current_user:
            await increment_daily_usage(current_user["id"], "reports")

        user_id = current_user["id"] if current_user else None
        await _track_usage(user_id, "report_export", {"filename": file.filename})

        download_name = file.filename.replace(".pdf", "_ai_report.docx") if file.filename else "ai_report.docx"

        return Response(
            content=docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f'attachment; filename="{download_name}"'},
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Report generation failed: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Report generation failed. Please try again.",
        )