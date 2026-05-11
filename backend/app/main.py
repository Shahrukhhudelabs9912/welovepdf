"""
Main FastAPI application for WeLovePDF backend.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.routes import pdf_routes
from app.config import settings

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
)

# Include routers
app.include_router(pdf_routes.router, prefix="/api", tags=["PDF Tools"])

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

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )