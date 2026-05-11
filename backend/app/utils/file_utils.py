"""
File utility functions for validation and processing.
"""
import io
import zipfile
from typing import List, Tuple, Optional
from fastapi import UploadFile, HTTPException
from fastapi.responses import StreamingResponse

from app.config import settings


def validate_file_type(file: UploadFile, allowed_types: List[str]) -> bool:
    """
    Validate if a file's content type is allowed.
    
    Args:
        file: UploadFile object
        allowed_types: List of allowed MIME types
        
    Returns:
        bool: True if file type is allowed
    """
    if not file.content_type:
        return False
    
    return file.content_type in allowed_types


def validate_file_size(file: UploadFile, max_size: int = None) -> bool:
    """
    Validate if a file's size is within limits.
    
    Args:
        file: UploadFile object
        max_size: Maximum file size in bytes
        
    Returns:
        bool: True if file size is within limits
    """
    if max_size is None:
        max_size = settings.MAX_UPLOAD_SIZE
    
    # Move to end of file to get size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    return file_size <= max_size


async def read_upload_file(file: UploadFile) -> bytes:
    """
    Read an uploaded file into memory as bytes.
    
    Args:
        file: UploadFile object
        
    Returns:
        bytes: File content as bytes
    """
    content = await file.read()
    return content


def create_file_response(
    file_bytes: bytes,
    filename: str,
    media_type: str = "application/pdf"
) -> StreamingResponse:
    """
    Create a StreamingResponse for file download.
    
    Args:
        file_bytes: File content as bytes
        filename: Name for the downloaded file
        media_type: MIME type for the response
        
    Returns:
        StreamingResponse: FastAPI response for file download
    """
    return StreamingResponse(
        io.BytesIO(file_bytes),
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(len(file_bytes)),
        }
    )


def create_zip_response(files: List[Tuple[str, bytes]], zip_filename: str = "output.zip") -> StreamingResponse:
    """
    Create a ZIP file response from multiple files.
    
    Args:
        files: List of (filename, content) tuples
        zip_filename: Name for the downloaded ZIP file
        
    Returns:
        StreamingResponse: FastAPI response for ZIP download
    """
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for filename, content in files:
            zip_file.writestr(filename, content)
    
    zip_buffer.seek(0)
    zip_bytes = zip_buffer.getvalue()
    
    return StreamingResponse(
        io.BytesIO(zip_bytes),
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="{zip_filename}"',
            "Content-Length": str(len(zip_bytes)),
        }
    )


def format_bytes(size: int) -> str:
    """
    Format bytes to human readable string.
    
    Args:
        size: Size in bytes
        
    Returns:
        str: Formatted size string
    """
    for unit in ["B", "KB", "MB", "GB"]:
        if size < 1024.0:
            return f"{size:.2f} {unit}"
        size /= 1024.0
    return f"{size:.2f} TB"