"""Transactional email service backed by Resend.

Used by the contact form (and reusable for future flows like password
reset). Stays a thin wrapper around Resend's HTTPS API — no Resend
Python SDK dependency, since we already need httpx for other things and
the API surface is tiny.

Behaviour:
- If RESEND_API_KEY is empty, send_email() logs a warning and returns
  False. Callers should treat this as a non-fatal degradation (e.g. the
  contact form still saves the submission to Mongo).
- Network errors and non-2xx responses are logged and surface as False;
  they never raise. This is intentional — a transient email outage
  should not turn into a 5xx for the user.
"""
from __future__ import annotations

import html
import logging
from typing import Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

RESEND_ENDPOINT = "https://api.resend.com/emails"


async def send_email(
    *,
    to: str,
    subject: str,
    html_body: str,
    text_body: str,
    reply_to: Optional[str] = None,
    from_email: Optional[str] = None,
) -> bool:
    """Send a transactional email via Resend. Returns True on success.

    A False return value is recoverable — the caller decides how to
    surface it. Errors are logged here so callers don't have to.
    """
    api_key = settings.RESEND_API_KEY
    if not api_key:
        logger.warning(
            "Resend API key not configured — skipping email",
            extra={"to": to, "subject": subject},
        )
        return False

    sender = from_email or settings.CONTACT_FROM_EMAIL or settings.SMTP_FROM_EMAIL
    payload = {
        "from": sender,
        "to": [to],
        "subject": subject,
        "html": html_body,
        "text": text_body,
    }
    if reply_to:
        payload["reply_to"] = reply_to

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                RESEND_ENDPOINT,
                json=payload,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
            )
        if resp.status_code >= 400:
            logger.error(
                "Resend rejected email",
                extra={
                    "status_code": resp.status_code,
                    "body": resp.text[:500],
                    "to": to,
                },
            )
            return False
        return True
    except httpx.HTTPError as exc:
        logger.exception("Resend request failed", extra={"to": to, "error": str(exc)})
        return False


def render_contact_email(
    *,
    first_name: str,
    last_name: str,
    email: str,
    subject: str,
    message: str,
    submitted_at: str,
    ip: str,
) -> tuple[str, str]:
    """Return (html_body, text_body) for a contact-form notification.

    `submitted_at` should already be ISO-formatted. We don't import
    datetime here so callers can pin the exact value they wrote to Mongo.
    """
    safe = {
        "first_name": html.escape(first_name),
        "last_name": html.escape(last_name),
        "email": html.escape(email),
        "subject": html.escape(subject),
        "message": html.escape(message).replace("\n", "<br>"),
        "submitted_at": html.escape(submitted_at),
        "ip": html.escape(ip),
    }
    html_body = f"""
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #4F46E5; border-bottom: 2px solid #eee; padding-bottom: 8px;">
    New contact form submission
  </h2>
  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr><td style="padding: 6px 0; color: #666;">From</td><td><strong>{safe['first_name']} {safe['last_name']}</strong></td></tr>
    <tr><td style="padding: 6px 0; color: #666;">Email</td><td><a href="mailto:{safe['email']}">{safe['email']}</a></td></tr>
    <tr><td style="padding: 6px 0; color: #666;">Subject</td><td>{safe['subject']}</td></tr>
    <tr><td style="padding: 6px 0; color: #666;">Submitted</td><td>{safe['submitted_at']} (IP: {safe['ip']})</td></tr>
  </table>
  <div style="margin-top: 16px; padding: 16px; background: #f8f9fa; border-left: 3px solid #4F46E5; border-radius: 4px;">
    <p style="margin: 0 0 8px; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
    <div style="color: #222; line-height: 1.6;">{safe['message']}</div>
  </div>
  <p style="margin-top: 24px; color: #888; font-size: 12px;">
    Reply directly to this email to respond to the sender.
  </p>
</div>
""".strip()

    text_body = (
        f"New contact form submission\n"
        f"From: {first_name} {last_name} <{email}>\n"
        f"Subject: {subject}\n"
        f"Submitted: {submitted_at} (IP: {ip})\n\n"
        f"Message:\n{message}\n"
    )
    return html_body, text_body


def render_auto_reply_email(*, first_name: str, subject: str) -> tuple[str, str]:
    """Return (html_body, text_body) for the auto-reply confirmation sent to the user."""
    safe_name = html.escape(first_name)
    safe_subject = html.escape(subject)

    html_body = f"""
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #4F46E5; border-bottom: 2px solid #eee; padding-bottom: 8px;">
    We received your message
  </h2>
  <p style="color: #333; line-height: 1.6;">
    Hi {safe_name},
  </p>
  <p style="color: #333; line-height: 1.6;">
    Thanks for reaching out! We received your message regarding
    <strong>&ldquo;{safe_subject}&rdquo;</strong> and will get back to you
    within 1&ndash;2 business days.
  </p>
  <p style="color: #333; line-height: 1.6;">
    If your issue is urgent, feel free to reply to this email directly.
  </p>
  <p style="margin-top: 24px; color: #666;">
    &mdash; The WeLovePDF Team
  </p>
</div>
""".strip()

    text_body = (
        f"Hi {first_name},\n\n"
        f"Thanks for reaching out! We received your message regarding "
        f"\"{subject}\" and will get back to you within 1-2 business days.\n\n"
        f"If your issue is urgent, feel free to reply to this email directly.\n\n"
        f"— The WeLovePDF Team\n"
    )
    return html_body, text_body
