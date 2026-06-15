"""
Structured JSON logging for production.

Why JSON:
  - Cloud log aggregators (Datadog, Loki, CloudWatch, Sentry) all index JSON.
  - Free-text logs become searchable only after expensive parsing.
  - Crash investigations are 10x faster when every field is queryable.

Behavior:
  - In development (ENVIRONMENT != production), logs are human-readable text.
  - In production, every log line is a single JSON object on stdout.
  - Standard fields: timestamp, level, logger, message, plus any `extra={}`.
  - Exceptions automatically include type + traceback.
  - Request context (method, path, status, duration_ms) is added by
    LoggingMiddleware below.

Usage anywhere in the app:
    logger = logging.getLogger("my_module")
    logger.info("user logged in", extra={"user_id": "abc123", "ip": "1.2.3.4"})
"""
from __future__ import annotations

import json
import logging
import sys
import time
import traceback
from typing import Any

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from app.config import settings


# Reserved LogRecord attributes that we never copy into the JSON payload.
_LOG_RECORD_RESERVED = {
    "name", "msg", "args", "levelname", "levelno", "pathname", "filename",
    "module", "exc_info", "exc_text", "stack_info", "lineno", "funcName",
    "created", "msecs", "relativeCreated", "thread", "threadName",
    "processName", "process", "message", "asctime", "taskName",
}


class JSONFormatter(logging.Formatter):
    """Format every record as a single-line JSON object."""

    def format(self, record: logging.LogRecord) -> str:
        # Build ISO-8601 UTC timestamp manually — strftime("%f") is unportable
        # on Windows, so we use datetime for sub-second precision.
        from datetime import datetime, timezone
        ts = datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(timespec="milliseconds")

        payload: dict[str, Any] = {
            "timestamp": ts,
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Pull through any custom fields passed via `extra={}`. Skip the
        # reserved LogRecord attributes set by the logging machinery.
        for key, value in record.__dict__.items():
            if key in _LOG_RECORD_RESERVED:
                continue
            try:
                json.dumps(value)  # only include JSON-serializable values
                payload[key] = value
            except (TypeError, ValueError):
                payload[key] = repr(value)

        if record.exc_info:
            exc_type, exc_value, exc_tb = record.exc_info
            payload["exception"] = {
                "type": exc_type.__name__ if exc_type else "Unknown",
                "message": str(exc_value) if exc_value else "",
                "traceback": "".join(traceback.format_exception(exc_type, exc_value, exc_tb)),
            }

        return json.dumps(payload, default=str)


class HumanFormatter(logging.Formatter):
    """Pretty single-line format for local dev — easy to scan in a terminal."""

    def __init__(self) -> None:
        super().__init__(
            fmt="%(asctime)s  %(levelname)-5s  %(name)-22s  %(message)s",
            datefmt="%H:%M:%S",
        )


def configure_logging() -> None:
    """Wire up the root logger. Idempotent — safe to call multiple times.

    Picks JSON formatter in production, human-readable in dev. Existing
    handlers are removed so re-runs don't duplicate output.
    """
    root = logging.getLogger()
    for h in list(root.handlers):
        root.removeHandler(h)

    handler = logging.StreamHandler(sys.stdout)
    if settings.is_production:
        handler.setFormatter(JSONFormatter())
    else:
        handler.setFormatter(HumanFormatter())

    root.setLevel(logging.INFO)
    root.addHandler(handler)

    # Tame noisy third-party loggers in production.
    if settings.is_production:
        for noisy in ("urllib3", "asyncio", "watchfiles", "pymongo"):
            logging.getLogger(noisy).setLevel(logging.WARNING)


# ── Request logging middleware ─────────────────────────────────────────


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Emit one structured log line per HTTP request with timing + status.

    Adds these fields:
      method, path, status, duration_ms, client_ip, user_agent
    """

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)
        self._logger = logging.getLogger("http")

    async def dispatch(self, request, call_next):
        start = time.perf_counter()
        response = None
        status_code = 500
        try:
            response = await call_next(request)
            status_code = response.status_code
            return response
        except Exception:
            self._logger.exception(
                "Unhandled exception in request",
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "client_ip": _safe_client_ip(request),
                },
            )
            raise
        finally:
            duration_ms = round((time.perf_counter() - start) * 1000, 1)
            level = logging.WARNING if status_code >= 500 else logging.INFO
            self._logger.log(
                level,
                f"{request.method} {request.url.path} -> {status_code}",
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "status": status_code,
                    "duration_ms": duration_ms,
                    "client_ip": _safe_client_ip(request),
                    "user_agent": request.headers.get("user-agent", "")[:200],
                },
            )


def _safe_client_ip(request) -> str:
    """Return the client IP, respecting common reverse-proxy headers."""
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else ""
