"""Main FastAPI application for WeLovePDF backend."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.routes import pdf_routes, auth_routes
from app.config import settings
from app.utils.db_utils import connect_to_mongo, close_mongo_connection

# Create FastAPI app
app = FastAPI(
    title="WeLovePDF API",
    description="Backend API for PDF processing tools",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Configure CORS
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


# ---------------------------------------------------------------------------
# MongoDB lifecycle events
# ---------------------------------------------------------------------------

@app.on_event("startup")
async def startup_db_client():
    """Connect to MongoDB on application startup."""
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_db_client():
    """Close MongoDB connection on application shutdown."""
    await close_mongo_connection()


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.APP_DEBUG,
    )  
