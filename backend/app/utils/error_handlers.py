"""
Error handling utilities for the PDF processing API.
"""
from typing import Any, Dict
from fastapi import HTTPException, status
from fastapi.responses import JSONResponse


class PDFProcessingError(Exception):
    """Custom exception for PDF processing errors."""
    
    def __init__(self, message: str, details: Dict[str, Any] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


def handle_pdf_error(error: Exception) -> JSONResponse:
    """
    Handle PDF processing errors and return appropriate HTTP response.
    
    Args:
        error: Exception that occurred
        
    Returns:
        JSONResponse: Error response
    """
    if isinstance(error, PDFProcessingError):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": "PDF processing error",
                "message": error.message,
                "details": error.details,
            }
        )
    elif isinstance(error, HTTPException):
        raise error  # Re-raise HTTP exceptions
    else:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Internal server error",
                "message": str(error),
            }
        )


def validate_uploaded_files(files: list, max_files: int = 10) -> None:
    """
    Validate uploaded files.
    
    Args:
        files: List of uploaded files
        max_files: Maximum number of files allowed
        
    Raises:
        HTTPException: If validation fails
    """
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files uploaded"
        )
    
    if len(files) > max_files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Too many files. Maximum allowed: {max_files}"
        )


def create_error_response(message: str, status_code: int = 400) -> JSONResponse:
    """
    Create a standardized error response.
    
    Args:
        message: Error message
        status_code: HTTP status code
        
    Returns:
        JSONResponse: Error response
    """
    return JSONResponse(
        status_code=status_code,
        content={
            "error": True,
            "message": message,
        }
    )