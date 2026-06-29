# PDFOrca Backend API

A production-ready Python backend for the PDFOrca SaaS application, built with FastAPI. This backend provides PDF processing capabilities including merging, splitting, rotating, converting, and watermarking PDF files.

## Features

- **PDF Merging**: Combine multiple PDF files into a single document
- **PDF Splitting**: Split a PDF into individual pages
- **PDF Rotation**: Rotate all pages by 90°, 180°, or 270°
- **Image to PDF**: Convert JPG/PNG images to PDF
- **PDF to Image**: Convert PDF pages to JPEG images
- **Watermarking**: Add text watermarks to PDF documents
- **Placeholder Endpoints**: Ready for advanced features (PDF to Word, compression, etc.)
- **Production Ready**: Error handling, validation, CORS, async operations

## Technology Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **PyPDF2**: PDF manipulation library
- **ReportLab**: PDF generation and watermarking
- **Pillow (PIL)**: Image processing
- **pdf2image**: PDF to image conversion (optional)
- **Uvicorn**: ASGI server for running FastAPI

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── config/              # Configuration settings
│   │   ├── __init__.py
│   │   └── settings.py
│   ├── routes/              # API route definitions
│   │   ├── __init__.py
│   │   └── pdf_routes.py
│   ├── services/            # Business logic and PDF processing
│   │   ├── __init__.py
│   │   └── pdf_service.py
│   ├── utils/               # Utility functions
│   │   ├── __init__.py
│   │   ├── file_utils.py
│   │   └── error_handlers.py
│   └── schemas/             # Pydantic schemas for validation
│       └── __init__.py
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Setup

1. **Clone the repository** (if applicable) or navigate to the backend directory:

   ```bash
   cd backend
   ```

2. **Create a virtual environment** (recommended):

   ```bash
   python -m venv venv
   ```

   On Windows:
   ```bash
   venv\Scripts\activate
   ```

   On macOS/Linux:
   ```bash
   source venv/bin/activate
   ```

3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

   Note: On Windows, you might need to install additional dependencies for `pdf2image`:
   ```bash
   # Install Poppler for Windows (if using pdf2image)
   # Download from: https://github.com/oschwartz10612/poppler-windows/releases/
   # Add to PATH or set POPPLER_PATH environment variable
   ```

## Running the Server

### Development Mode

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Documentation

Once the server is running, you can access:

- **Interactive API Docs**: http://localhost:8000/api/docs
- **Alternative API Docs**: http://localhost:8000/api/redoc
- **Health Check**: http://localhost:8000/health
- **Root Endpoint**: http://localhost:8000/

## API Endpoints

### Core PDF Tools

| Method | Endpoint | Description | Request Format |
|--------|----------|-------------|----------------|
| POST | `/api/merge-pdf` | Merge multiple PDF files | `multipart/form-data` with `files[]` |
| POST | `/api/split-pdf` | Split PDF into individual pages | `multipart/form-data` with `file` |
| POST | `/api/rotate-pdf` | Rotate PDF pages | `multipart/form-data` with `file` and `angle` (90,180,270) |
| POST | `/api/jpg-to-pdf` | Convert images to PDF | `multipart/form-data` with `files[]` |
| POST | `/api/pdf-to-jpg` | Convert PDF page to image | `multipart/form-data` with `file` and optional `page_number` |
| POST | `/api/add-watermark` | Add text watermark to PDF | `multipart/form-data` with `file` and `text` |

### Placeholder Endpoints (Future Features)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pdf-to-word` | Convert PDF to Word (placeholder) |
| POST | `/api/word-to-pdf` | Convert Word to PDF (placeholder) |
| POST | `/api/compress-pdf` | Compress PDF (placeholder) |
| POST | `/api/protect-pdf` | Protect PDF with password (placeholder) |
| POST | `/api/unlock-pdf` | Unlock PDF (placeholder) |

## Request Examples

### Using cURL

**Merge PDFs:**
```bash
curl -X POST "http://localhost:8000/api/merge-pdf" \
  -H "accept: application/json" \
  -F "files=@document1.pdf" \
  -F "files=@document2.pdf" \
  --output merged.pdf
```

**Rotate PDF:**
```bash
curl -X POST "http://localhost:8000/api/rotate-pdf" \
  -H "accept: application/json" \
  -F "file=@document.pdf" \
  -F "angle=90" \
  --output rotated.pdf
```

**Add Watermark:**
```bash
curl -X POST "http://localhost:8000/api/add-watermark" \
  -H "accept: application/json" \
  -F "file=@document.pdf" \
  -F "text=CONFIDENTIAL" \
  --output watermarked.pdf
```

### Using JavaScript/Fetch

```javascript
const formData = new FormData();
formData.append('file', pdfFile);
formData.append('angle', '90');

const response = await fetch('http://localhost:8000/api/rotate-pdf', {
  method: 'POST',
  body: formData,
});

if (response.ok) {
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rotated.pdf';
  a.click();
}
```

## Frontend Integration

The backend is configured to work with the PDFOrca Next.js frontend running on `localhost:3000`. CORS is enabled for the following origins:

- `http://localhost:3000`
- `http://localhost:3001`
- `http://127.0.0.1:3000`

### Configuration

Update your frontend API client to point to the backend:

```javascript
// Example: Update api-client.ts in the frontend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
```

## File Handling

- **Memory Only**: Files are processed in memory using `BytesIO` streams
- **No Permanent Storage**: Files are not saved to disk after processing
- **Size Limits**: Maximum file size is 100MB (configurable in `settings.py`)
- **Validation**: File type and size validation before processing
- **Cleanup**: Automatic memory cleanup after response

## Error Handling

The API provides structured error responses:

```json
{
  "error": true,
  "message": "Error description",
  "details": {
    "error_type": "ValidationError",
    "additional_info": "..."
  }
}
```

Common HTTP status codes:
- `200`: Success with file download
- `400`: Bad request (invalid file, missing parameters)
- `413`: File too large
- `415`: Unsupported file type
- `500`: Internal server error

## Configuration

Edit `app/config/settings.py` to customize:

- **Server settings**: Host, port, debug mode
- **CORS origins**: Add additional frontend URLs
- **File limits**: Maximum upload size, allowed file types
- **Temporary directory**: For file processing (if needed)

## Development

### Adding New Features

1. **Add service logic** in `app/services/pdf_service.py`
2. **Create route** in `app/routes/pdf_routes.py`
3. **Add validation schemas** in `app/schemas/__init__.py`
4. **Update utility functions** if needed

### Testing

Run the server and test endpoints using:

1. The interactive API docs at `http://localhost:8000/api/docs`
2. cURL commands (examples above)
3. Postman or similar API testing tools

### Dependencies Management

Add new dependencies to `requirements.txt`:

```bash
pip install <package-name>
pip freeze > requirements.txt
```

## Deployment

### Docker (Recommended)

Create a `Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t pdforca-backend .
docker run -p 8000:8000 pdforca-backend
```

### Environment Variables

Create a `.env` file:

```env
HOST=0.0.0.0
PORT=8000
DEBUG=False
MAX_UPLOAD_SIZE=104857600  # 100MB in bytes
```

## Performance Considerations

- **Async Operations**: All endpoints use async/await for non-blocking I/O
- **Memory Efficiency**: Files processed in memory with streaming responses
- **Error Recovery**: Graceful error handling with appropriate status codes
- **Scalability**: Stateless design allows horizontal scaling

## Security

- **CORS Configuration**: Restrict origins to trusted frontend URLs
- **File Validation**: Validate file types and sizes before processing
- **Input Sanitization**: Validate all user inputs
- **Error Messages**: Generic error messages to avoid information leakage

## License

This project is part of the PDFOrca SaaS application.

## Support

For issues or questions:
1. Check the API documentation at `http://localhost:8000/api/docs`
2. Review error messages in the server logs
3. Ensure all dependencies are properly installed