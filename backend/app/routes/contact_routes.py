"""Contact-form route.

Accepts a JSON payload from the website contact page, persists it to
MongoDB (`contact_submissions` collection), and fires a notification
email via Resend. Both side-effects are best-effort independent: if
Resend is down or unconfigured, the submission still lands in Mongo and
the user gets a successful response.

Hardening:
- Rate-limited at 5 submissions per hour per identifier (IP or user) to
  block obvious flood attempts. Tighten via RATE_LIMIT_CONTACT if needed.
- Honeypot field (`website`) — bots fill it, humans don't see it. Silent
  200 on hit so scrapers don't learn what to skip.
- Message body capped at 5000 chars; subject at 200; names at 100.
- Stores the truncated remote IP for abuse triage; never echoed to the
  user.
"""
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Request, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from slowapi.util import get_remote_address

from app.config import settings
from app.utils.db_utils import get_database
from app.utils.rate_limit import limiter
from app.services.email_service import render_contact_email, render_auto_reply_email, send_email
from app.services.captcha_service import generate_challenge, verify_challenge

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Contact"])


class ContactRequest(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    subject: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=10, max_length=5000)
    # Honeypot — must stay empty. Real users never see this field; bots
    # blindly fill every input. Named "website" because that's a common
    # phishing target for scrapers and looks legitimate enough that
    # naïve bots don't skip it.
    fax_number: Optional[str] = Field(default="", max_length=200)
    # Image captcha fields
    captcha_id: str = Field(..., min_length=1, max_length=100)
    captcha_selected: list[int] = Field(..., min_length=1, max_length=9)


class ContactResponse(BaseModel):
    ok: bool = True
    message: str = "Thanks! We received your message and will reply within 1-2 business days."


ContactRequest.model_rebuild()


@router.get("/captcha")
async def get_captcha() -> dict:
    """Generate a new image captcha challenge (3x3 grid)."""
    return generate_challenge()


@router.post("/contact", response_model=ContactResponse)
@limiter.limit("5/hour")
async def submit_contact(request: Request, body: ContactRequest) -> ContactResponse:
    """Persist a contact submission and notify the support inbox.

    Returns a generic success response in two cases:
    - Real submission (everything stored + email queued).
    - Honeypot hit (silently dropped — we don't tell the bot it failed).
    """
    # Honeypot — silent success so spam tooling doesn't learn to skip it.
    if body.fax_number:
        logger.info(
            "Contact form honeypot triggered",
            extra={"ip": get_remote_address(request), "honeypot": body.fax_number[:50]},
        )
        return ContactResponse()

    # Image captcha verification
    if not verify_challenge(body.captcha_id, body.captcha_selected):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Captcha verification failed. Please select the correct images and try again.",
        )

    ip = get_remote_address(request)
    submitted_at = datetime.now(timezone.utc)

    # 1) Persist to Mongo first. If this fails we want to know — a contact
    #    form that silently drops messages is the worst outcome.
    doc = {
        "first_name": body.first_name.strip(),
        "last_name": body.last_name.strip(),
        "email": body.email.lower(),
        "subject": body.subject.strip(),
        "message": body.message.strip(),
        "ip": ip,
        "user_agent": request.headers.get("user-agent", "")[:500],
        "submitted_at": submitted_at,
        "email_sent": False,  # updated below if Resend succeeds
        "status": "new",
    }
    try:
        db = get_database()
        result = await db.contact_submissions.insert_one(doc)
        submission_id = result.inserted_id
    except Exception:  # noqa: BLE001
        logger.exception("Failed to store contact submission")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not save your message. Please try again in a moment.",
        )

    # 2) Fire the notification email. Failure here does NOT fail the
    #    request — the submission is already safely in Mongo and we can
    #    follow up manually if needed.
    to_email = settings.CONTACT_TO_EMAIL
    if to_email:
        html_body, text_body = render_contact_email(
            first_name=doc["first_name"],
            last_name=doc["last_name"],
            email=doc["email"],
            subject=doc["subject"],
            message=doc["message"],
            submitted_at=submitted_at.isoformat(),
            ip=ip,
        )
        email_subject = f"[Contact] {doc['subject']}"
        sent = await send_email(
            to=to_email,
            subject=email_subject,
            html_body=html_body,
            text_body=text_body,
            reply_to=doc["email"],
        )
        if sent:
            try:
                await db.contact_submissions.update_one(
                    {"_id": submission_id},
                    {"$set": {"email_sent": True}},
                )
            except Exception:  # noqa: BLE001
                logger.warning("Could not flag submission as emailed", exc_info=True)
    else:
        logger.info(
            "CONTACT_TO_EMAIL not configured — submission stored without notification",
            extra={"submission_id": str(submission_id)},
        )

    # 3) Auto-reply confirmation to the user. Same non-fatal semantics as
    #    the notification email — failure is logged but doesn't fail the request.
    if settings.RESEND_API_KEY:
        auto_html, auto_text = render_auto_reply_email(
            first_name=doc["first_name"],
            subject=doc["subject"],
        )
        await send_email(
            to=doc["email"],
            subject=f"Re: {doc['subject']} — We received your message",
            html_body=auto_html,
            text_body=auto_text,
            from_email=settings.CONTACT_FROM_EMAIL,
        )
    else:
        logger.warning(
            "Resend API key not configured — skipping auto-reply to user",
            extra={"submission_id": str(submission_id), "user_email": doc["email"]},
        )

    return ContactResponse()
