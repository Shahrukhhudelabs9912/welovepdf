"""Application configuration settings."""
import logging
from pydantic_settings import BaseSettings
from pydantic_settings.sources import (
    DotEnvSettingsSource,
    EnvSettingsSource,
    PydanticBaseSettingsSource,
)
from typing import Any, List, Optional, Tuple, Type


def _csv_decode(value: Any) -> Any:
    """Split comma-separated env strings into lists; pass through everything else."""
    if isinstance(value, str):
        v = value.strip()
        if v and not v.startswith(("[", "{")):
            return [s.strip() for s in v.split(",") if s.strip()]
    return value


class _CsvAwareEnvSource(EnvSettingsSource):
    def decode_complex_value(self, field_name: str, field, value: Any) -> Any:
        decoded = _csv_decode(value)
        if isinstance(decoded, list):
            return decoded
        return super().decode_complex_value(field_name, field, value)


class _CsvAwareDotEnvSource(DotEnvSettingsSource):
    def decode_complex_value(self, field_name: str, field, value: Any) -> Any:
        decoded = _csv_decode(value)
        if isinstance(decoded, list):
            return decoded
        return super().decode_complex_value(field_name, field, value)


class Settings(BaseSettings):
    """Application settings."""

    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    APP_DEBUG: bool = True

    # ENVIRONMENT controls security defaults. Allowed: "development" | "production".
    # In production we refuse to boot with insecure defaults — see
    # _validate_production_safety below.
    ENVIRONMENT: str = "development"

    # CORS settings — comma-separated in .env, e.g.
    #   CORS_ORIGINS=https://welovepdf.com,https://www.welovepdf.com
    # Defaults are dev-only; production .env MUST override with real origins.
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ]

    # Tier-based file upload limits (bytes).
    # Anonymous + free authenticated users get FREE_MAX_UPLOAD_SIZE.
    # Pro users get PRO_MAX_UPLOAD_SIZE. Enforced in routes via dependency.
    FREE_MAX_UPLOAD_SIZE: int = 25 * 1024 * 1024
    PRO_MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024
    # Legacy single-knob, used as the absolute hard ceiling at the API layer.
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024

    ALLOWED_PDF_TYPES: List[str] = ["application/pdf"]
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/jpg", "image/png", "image/gif"]

    # Temporary file settings
    TEMP_DIR: str = "temp"

    # Background file cleanup sweeper.
    CLEANUP_ENABLED: bool = True
    CLEANUP_INTERVAL_SECONDS: int = 15 * 60
    CLEANUP_RETENTION_SECONDS: int = 60 * 60
    CUSTOM_CLEANUP_DIRS: List[str] = []

    # Admin token gates manual cleanup/admin endpoints. Required in production.
    ADMIN_TOKEN: str = ""

    # ── Rate limiting ─────────────────────────────────────────────────
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_FREE_HOURLY: str = "100/hour"
    RATE_LIMIT_PRO_HOURLY: str = "1000/hour"
    RATE_LIMIT_AUTH: str = "20/minute"
    RATE_LIMIT_AI: str = "30/hour"
    RATE_LIMIT_PROCESSING: str = "60/hour"

    # ── Sentry error tracking ─────────────────────────────────────────
    SENTRY_DSN: str = ""
    SENTRY_ENVIRONMENT: str = ""
    SENTRY_TRACES_SAMPLE_RATE: float = 0.1

    # ── Cloud AI (Groq) ───────────────────────────────────────────────
    USE_CLOUD_LLM: bool = True
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_TIMEOUT_SECONDS: int = 30

    # PDF processing settings
    POPPLER_PATH: Optional[str] = None

    # LibreOffice headless binary (Word/PowerPoint/Excel -> PDF). When unset,
    # the resolver auto-detects `soffice`/`libreoffice` on PATH (Linux/macOS)
    # or the Windows default install dir. Set explicitly on a VPS if the
    # binary lives somewhere non-standard, e.g.
    #   LIBREOFFICE_PATH=/usr/bin/soffice
    LIBREOFFICE_PATH: Optional[str] = None

    # Max heavy jobs (AI / OCR / LibreOffice) running at once per worker.
    # Bounds RAM/CPU so a burst of expensive requests can't exhaust the box.
    # Stop-gap until a real task queue (Celery/RQ) is added.
    HEAVY_JOB_CONCURRENCY: int = 4

    # MongoDB settings
    MONGO_URL: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "welovepdf"

    # JWT Authentication settings
    JWT_SECRET: str = "welovepdf-dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Email settings (for password reset)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@welovepdf.com"
    RESEND_API_KEY: str = ""

    # Contact form destination — where the website contact form delivers messages.
    # Leave blank to skip email delivery (submissions still land in MongoDB).
    CONTACT_TO_EMAIL: str = ""
    CONTACT_FROM_EMAIL: str = "noreply@welovepdf.app"

    # User data storage (legacy)
    USERS_FILE: str = "data/users.json"

    # Force dnspython to use Google DNS (8.8.8.8) for mongodb+srv:// SRV
    # lookups when the host's default DNS doesn't return SRV records (common
    # on Windows + ISP DNS). Off by default — when on, every dnspython lookup
    # in the process uses Google DNS, which can break Sentry/SMTP on corporate
    # networks that block public DNS egress.
    FORCE_PUBLIC_DNS: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = False

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls: Type[BaseSettings],
        init_settings: PydanticBaseSettingsSource,
        env_settings: PydanticBaseSettingsSource,
        dotenv_settings: PydanticBaseSettingsSource,
        file_secret_settings: PydanticBaseSettingsSource,
    ) -> Tuple[PydanticBaseSettingsSource, ...]:
        # Replace env-driven sources with CSV-aware variants so .env values
        # like CORS_ORIGINS=https://a.com,https://b.com parse into a real list.
        return (
            init_settings,
            _CsvAwareEnvSource(settings_cls),
            _CsvAwareDotEnvSource(settings_cls),
            file_secret_settings,
        )

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"


def _validate_production_safety(s: Settings) -> None:
    """Refuse to boot in production with insecure defaults."""
    if not s.is_production:
        return
    errors = []
    if s.JWT_SECRET == "welovepdf-dev-secret-change-in-production" or len(s.JWT_SECRET) < 32:
        errors.append("JWT_SECRET must be set to a strong (>=32 char) value in production.")
    if not s.ADMIN_TOKEN or len(s.ADMIN_TOKEN) < 24:
        errors.append("ADMIN_TOKEN must be set to a strong (>=24 char) value in production.")
    bad_origins = [o for o in s.CORS_ORIGINS if "localhost" in o or "127.0.0.1" in o or o == "*"]
    if bad_origins:
        errors.append(f"CORS_ORIGINS must not contain localhost/wildcard in production: {bad_origins}")
    if s.APP_DEBUG:
        errors.append("APP_DEBUG must be False in production.")
    if errors:
        raise RuntimeError("Production configuration is unsafe:\n  - " + "\n  - ".join(errors))


settings = Settings()
_validate_production_safety(settings)
logger = logging.getLogger(__name__)
logger.info(f"[Settings] ENVIRONMENT = {settings.ENVIRONMENT}")
logger.info(f"[Settings] POPPLER_PATH = {settings.POPPLER_PATH}")
logger.info("[Settings] Environment file loaded from: .env")
