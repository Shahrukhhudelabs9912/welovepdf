"""
Application configuration settings.
"""
from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    """Application settings."""
    
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # CORS settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # Next.js frontend
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
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Create settings instance
settings = Settings()
print(f"[Settings] POPPLER_PATH = {settings.POPPLER_PATH}")
print(f"[Settings] Environment file loaded from: .env")