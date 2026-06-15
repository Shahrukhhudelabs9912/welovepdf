"""
Sentry error tracking — initializes the SDK if SENTRY_DSN is configured.

In dev / when DSN is not set, this is a no-op so feature work is unaffected.
Free tier supports 5k errors/month and 1 user — plenty for early launch.
"""
from __future__ import annotations

import logging

from app.config import settings

logger = logging.getLogger("sentry")

_INITIALIZED = False


def init_sentry() -> bool:
    """Initialize Sentry if a DSN is configured. Idempotent.

    Returns True if Sentry was activated, False otherwise. The actual
    integration set is FastAPI + Starlette + asyncio + logging by default.
    """
    global _INITIALIZED
    if _INITIALIZED:
        return True
    if not settings.SENTRY_DSN:
        logger.info("sentry: disabled (no SENTRY_DSN configured)")
        return False
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        from sentry_sdk.integrations.starlette import StarletteIntegration
        from sentry_sdk.integrations.logging import LoggingIntegration

        sentry_sdk.init(
            dsn=settings.SENTRY_DSN,
            environment=settings.SENTRY_ENVIRONMENT or settings.ENVIRONMENT,
            traces_sample_rate=settings.SENTRY_TRACES_SAMPLE_RATE,
            send_default_pii=False,  # GDPR-friendly default
            integrations=[
                FastApiIntegration(transaction_style="endpoint"),
                StarletteIntegration(transaction_style="endpoint"),
                LoggingIntegration(level=logging.INFO, event_level=logging.ERROR),
            ],
        )
        _INITIALIZED = True
        logger.info("sentry: initialized for environment=%s", settings.SENTRY_ENVIRONMENT or settings.ENVIRONMENT)
        return True
    except Exception as exc:  # noqa: BLE001
        # Don't take the whole app down if Sentry init fails (network, bad DSN).
        logger.warning("sentry: init failed: %s", exc)
        return False
