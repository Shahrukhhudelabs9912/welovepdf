"""Custom middleware for the WeLovePDF backend."""
from app.middleware.upload_size_middleware import UploadSizeLimitMiddleware

__all__ = ["UploadSizeLimitMiddleware"]
