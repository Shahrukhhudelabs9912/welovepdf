"""Main FastAPI application for WeLovePDF backend."""
from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import uvicorn

from app.routes import pdf_routes, auth_routes, ai_routes, dashboard_routes, admin_routes
from app.config import settings
from app.utils.db_utils import connect_to_mongo, close_mongo_connection
from app.services.cleanup_service import CleanupScheduler
from app.middleware import UploadSizeLimitMiddleware
from app.utils.rate_limit import limiter, rate_limit_handler
from app.utils.logging_config import configure_logging, RequestLoggingMiddleware
from app.utils.sentry_init import init_sentry

# Configure structured logging FIRST so subsequent imports inherit it.
configure_logging()
# Initialize Sentry early so any startup errors are captured.
init_sentry()

# Create FastAPI app
app = FastAPI(
    title="WeLovePDF API",
    description="Backend API for PDF processing, AI tools, and user dashboard",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Rate limiter — slowapi attaches itself to app.state.limiter so its decorator
# can find it on each request. Custom handler returns a friendly 429 + Retry-After.
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_handler)

# Order matters: CORS must be the OUTERMOST middleware so its headers are
# applied even on early responses (e.g. 413 from UploadSizeLimitMiddleware,
# 429 from rate limiter). Inner-to-outer:
#   RequestLogging → SlowAPI → UploadSize → CORS
# RequestLoggingMiddleware is innermost so it sees the final status code.
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(UploadSizeLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "Content-Type", "Content-Length"],
)

# Include routers
app.include_router(pdf_routes.router, prefix="/api", tags=["PDF Tools"])
app.include_router(auth_routes.router, prefix="/api", tags=["Authentication"])
app.include_router(ai_routes.router, prefix="/api", tags=["AI Tools"])
app.include_router(dashboard_routes.router, prefix="/api", tags=["Dashboard"])
app.include_router(admin_routes.router, prefix="/api/admin", tags=["Admin"])

# Background file cleanup scheduler. Lifecycle is bound to app startup/shutdown.
cleanup_scheduler = CleanupScheduler()
app.state.cleanup_scheduler = cleanup_scheduler


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": "WeLovePDF API is running",
        "version": "1.0.0",
        "docs": "/api/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/api/limits")
async def get_user_limits(authorization: str | None = Header(default=None)):
    """Return the current user's upload limit (so the frontend can match it).

    Anonymous and free users get FREE_MAX_UPLOAD_SIZE; pro users get PRO_MAX.
    """
    from app.utils.upload_limits import get_upload_limit

    limit = await get_upload_limit(authorization)
    return {
        "max_upload_bytes": limit,
        "max_upload_mb": round(limit / (1024 * 1024)),
        "free_tier_mb": round(settings.FREE_MAX_UPLOAD_SIZE / (1024 * 1024)),
        "pro_tier_mb": round(settings.PRO_MAX_UPLOAD_SIZE / (1024 * 1024)),
        "tier": "pro" if limit == settings.PRO_MAX_UPLOAD_SIZE else "free",
    }


# ---------------------------------------------------------------------------
# MongoDB lifecycle events
# ---------------------------------------------------------------------------

@app.on_event("startup")
async def startup_db_client():
    """Connect to MongoDB and start the background cleanup sweeper."""
    await connect_to_mongo()
    cleanup_scheduler.start()


@app.on_event("shutdown")
async def shutdown_db_client():
    """Stop background tasks and close DB connection."""
    await cleanup_scheduler.stop()
    await close_mongo_connection()


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.APP_DEBUG,
    )  
