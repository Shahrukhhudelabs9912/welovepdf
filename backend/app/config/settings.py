"""Application configuration settings."""
from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    """Application settings."""
    
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    APP_DEBUG: bool = True
    
    # CORS settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ]
    
    # File upload settings
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024  # 100MB
    ALLOWED_PDF_TYPES: List[str] = ["application/pdf"]
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
    
    # Temporary file settings
    TEMP_DIR: str = "temp"
    
    # PDF processing settings
    POPPLER_PATH: Optional[str] = None
    
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
    
    # User data storage (legacy — kept for backward compatibility)
    USERS_FILE: str = "data/users.json"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
print(f"[Settings] POPPLER_PATH = {settings.POPPLER_PATH}")
print(f"[Settings] Environment file loaded from: .env")