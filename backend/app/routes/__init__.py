"""Routes module for WeLovePDF API."""
from app.routes.pdf_routes import router
from app.routes.auth_routes import router as auth_router

__all__ = ["router", "auth_router"]