"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional, List


class ErrorResponse(BaseModel):
    """Error response schema."""
    error: bool = True
    message: str
    details: Optional[dict] = None


class SuccessResponse(BaseModel):
    """Success response schema."""
    success: bool = True
    message: str
    filename: Optional[str] = None


class RotatePDFRequest(BaseModel):
    """Request schema for PDF rotation."""
    angle: int = Field(..., ge=0, le=360, description="Rotation angle in degrees (90, 180, 270)")


class WatermarkRequest(BaseModel):
    """Request schema for adding watermark."""
    watermark_type: str = Field("text", description="Type of watermark: 'text' or 'image'")
    watermark_text: Optional[str] = Field("", description="Watermark text (required for text watermarks)")
    position: str = Field("center", description="Watermark position")
    opacity: int = Field(30, ge=0, le=100, description="Watermark opacity (0-100)")
    rotation: int = Field(45, ge=0, le=360, description="Watermark rotation angle (0-360)")
    pages: str = Field("all", description="Pages to apply watermark: 'all', 'first', 'last', 'custom'")
    custom_page_range: Optional[str] = Field(None, description="Custom page range when pages='custom'")


class PlaceholderResponse(BaseModel):
    """Response schema for placeholder endpoints."""
    message: str
    status: str = "pending"
    estimated_availability: Optional[str] = "Q2 2024"


__all__ = [
    "ErrorResponse",
    "SuccessResponse",
    "RotatePDFRequest",
    "WatermarkRequest",
    "PlaceholderResponse",
]