"""Routes module for WeLovePDF API."""
from app.routes.pdf_routes import router
from app.routes.auth_routes import router as auth_router
from app.routes.ai_routes import router as ai_router
from app.routes.dashboard_routes import router as dashboard_router
from app.routes.admin_routes import router as admin_router

__all__ = ["router", "auth_router", "ai_router", "dashboard_router", "admin_router"]