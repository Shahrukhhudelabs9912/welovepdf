"""
Cloud AI service — Groq Llama 3.3 70B backed summarize / key-points / title /
sentiment for PDF analysis.

Why Groq:
- Free tier covers 14,400 requests/day (no credit card required)
- 10x faster inference than local CPU HuggingFace
- Llama 3.3 70B output quality dramatically better than bart-large-cnn

Failure mode is intentional: every public function returns ``None`` on any
error (network, quota, malformed JSON, timeout). Callers MUST treat ``None``
as "fall back to local HuggingFace pipeline". This keeps the AI features
online even if the cloud is unreachable or quota is exhausted.

Daily quota tracker (process-local, in-memory) is best-effort — it resets on
process restart. For multi-worker deployments, swap for Redis if you ever
need precise enforcement, but Groq's own 429 response is the actual gate.
"""
from __future__ import annotations

import json
import logging
import re
from datetime import date
from threading import Lock
from typing import Dict, List, Optional, Tuple

from app.config import settings

logger = logging.getLogger("cloud_ai")

# Lazy-loaded Groq client. Set to None until first use; recreated if config
# changes between calls (rare).
_GROQ_CLIENT = None
_CLIENT_LOCK = Lock()


# ── Quota tracker ──────────────────────────────────────────────────────

class _DailyCounter:
    """Best-effort, process-local request counter."""

    def __init__(self) -> None:
        self._lock = Lock()
        self._date = date.today()
        self._count = 0

    def _roll_if_new_day(self) -> None:
        today = date.today()
        if today != self._date:
            self._date = today
            self._count = 0

    def increment(self) -> int:
        with self._lock:
            self._roll_if_new_day()
            self._count += 1
            return self._count

    def snapshot(self) -> Tuple[date, int]:
        with self._lock:
            self._roll_if_new_day()
            return self._date, self._count


_QUOTA = _DailyCounter()


def quota_snapshot() -> Dict:
    """Return today's request count for monitoring / admin endpoint."""
    d, n = _QUOTA.snapshot()
    return {"date": d.isoformat(), "requests": n}


# ── Client lifecycle ───────────────────────────────────────────────────

def _get_client():
    """Return a Groq client or None if cloud LLM is not configured."""
    global _GROQ_CLIENT
    if not settings.USE_CLOUD_LLM or not settings.GROQ_API_KEY:
        return None
    if _GROQ_CLIENT is not None:
        return _GROQ_CLIENT
    with _CLIENT_LOCK:
        if _GROQ_CLIENT is not None:
            return _GROQ_CLIENT
        try:
            from groq import Groq

            _GROQ_CLIENT = Groq(
                api_key=settings.GROQ_API_KEY,
                timeout=settings.GROQ_TIMEOUT_SECONDS,
            )
            logger.info("Groq client initialized (model=%s)", settings.GROQ_MODEL)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Groq client init failed: %s", exc)
            return None
    return _GROQ_CLIENT


def is_available() -> bool:
    """True if cloud LLM is enabled and a client is reachable."""
    return _get_client() is not None


# ── Low-level chat helper ──────────────────────────────────────────────

def _chat(
    system_prompt: str,
    user_prompt: str,
    *,
    json_mode: bool = False,
    max_tokens: int = 1024,
    temperature: float = 0.2,
) -> Optional[str]:
    """One-shot chat completion. Returns response text or None on failure."""
    client = _get_client()
    if client is None:
        return None
    try:
        kwargs: Dict = {
            "model": settings.GROQ_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "max_completion_tokens": max_tokens,
            "temperature": temperature,
        }
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}
        resp = client.chat.completions.create(**kwargs)
        _QUOTA.increment()
        text = resp.choices[0].message.content
        return text.strip() if text else None
    except Exception as exc:  # noqa: BLE001
        # Common reasons: 429 quota, network error, model unavailable.
        # Caller will treat None as "fall back to HF local".
        logger.warning("Groq call failed (%s): %s", type(exc).__name__, exc)
        return None


# ── Public API: each returns Optional — None means "fallback to HF" ────


def summarize(text: str, *, max_words: int = 80) -> Optional[str]:
    """Generate a clean prose summary of the document text."""
    if len(text.strip()) < 50:
        return None
    truncated = text[:8000]
    system = (
        "You are an expert document analyst. Produce concise, factual summaries "
        "that capture the most important information. Plain prose only — no "
        "bullet points, no preamble, no meta-commentary."
    )
    user = (
        f"Summarize the following document in approximately {max_words} words. "
        f"Focus on key facts, decisions, and outcomes. Output only the summary "
        f"text — no headings, no quotes around the summary.\n\n"
        f"DOCUMENT:\n{truncated}"
    )
    return _chat(system, user, max_tokens=400, temperature=0.2)


def extract_key_points(text: str, *, num_points: int = 5) -> Optional[List[str]]:
    """Extract the top N key points as a list of distinct insights."""
    if len(text.strip()) < 50:
        return None
    truncated = text[:8000]
    system = (
        "You extract key insights from documents. Each point must be a "
        "complete, standalone sentence. Return strictly valid JSON."
    )
    user = (
        f'Extract exactly {num_points} key points from the following document. '
        f'Each point must be a complete, distinct insight that captures a '
        f'unique fact or decision (no overlap between points). '
        f'Respond with ONLY this JSON shape:\n'
        f'{{"points": ["point 1", "point 2", ...]}}\n\n'
        f"DOCUMENT:\n{truncated}"
    )
    raw = _chat(system, user, json_mode=True, max_tokens=600, temperature=0.2)
    if not raw:
        return None
    try:
        data = json.loads(raw)
        points = data.get("points")
        if isinstance(points, list) and all(isinstance(p, str) for p in points):
            cleaned = [p.strip() for p in points if p.strip()]
            return cleaned[:num_points] if cleaned else None
    except (json.JSONDecodeError, AttributeError) as exc:
        logger.warning("key-points JSON parse failed: %s", exc)
    return None


def generate_title(text: str) -> Optional[str]:
    """Generate a short, meaningful document title."""
    if len(text.strip()) < 30:
        return None
    truncated = text[:4000]
    system = (
        "You generate concise, descriptive titles for documents. "
        "5-12 words, title case, no quotes, no trailing punctuation."
    )
    user = (
        f"Generate a single short title for this document. Output only the "
        f"title text, nothing else.\n\nDOCUMENT:\n{truncated}"
    )
    raw = _chat(system, user, max_tokens=60, temperature=0.3)
    if not raw:
        return None
    # Strip stray quotes / trailing punctuation the model sometimes adds.
    cleaned = raw.strip().strip('"\'').rstrip(".!?")
    return cleaned or None


def analyze_sentiment(text: str) -> Optional[Tuple[str, float]]:
    """Return (label, confidence_percent). Label is positive/neutral/negative."""
    if len(text.strip()) < 30:
        return None
    truncated = text[:4000]
    system = (
        "You analyze document sentiment. Return strictly valid JSON only."
    )
    user = (
        'Analyze the overall sentiment of this document. Respond with ONLY '
        'this JSON shape:\n'
        '{"sentiment": "positive" | "neutral" | "negative", '
        '"confidence": <number 0-100>}\n\n'
        f"DOCUMENT:\n{truncated}"
    )
    raw = _chat(system, user, json_mode=True, max_tokens=80, temperature=0.0)
    if not raw:
        return None
    try:
        data = json.loads(raw)
        label = str(data.get("sentiment", "")).lower().strip()
        if label not in {"positive", "neutral", "negative"}:
            return None
        confidence = float(data.get("confidence", 0))
        confidence = max(0.0, min(100.0, confidence))
        return label, confidence
    except (json.JSONDecodeError, ValueError, TypeError) as exc:
        logger.warning("sentiment JSON parse failed: %s", exc)
    return None
