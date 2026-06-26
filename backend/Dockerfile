# WeLovePDF backend image.
# Python 3.12 matches the project interpreter (fastapi 0.104.1).
FROM python:3.12-slim

# ── System dependencies for the PDF/Office/OCR toolchain ───────────────
#   libreoffice-*  : Word/PowerPoint/Excel -> PDF (headless). The -core +
#                    -writer/-calc/-impress split is far smaller than the
#                    full `libreoffice` metapackage (~1.5GB saved).
#   tesseract-ocr  : OCR engine (+ Hindi language pack for `hin`).
#   ghostscript    : required by ocrmypdf.
#   poppler-utils  : pdf2image (PDF -> JPG) backend.
#   libmagic1      : python-magic file-type sniffing (replaces magic-bin).
#   fonts-dejavu   : baseline fonts so LibreOffice/reportlab render text.
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
        libreoffice-core libreoffice-writer libreoffice-calc libreoffice-impress \
        tesseract-ocr tesseract-ocr-hin \
        ghostscript \
        poppler-utils \
        libmagic1 \
        fonts-dejavu fonts-dejavu-extra \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first for layer caching.
COPY requirements-linux.txt .
RUN pip install --no-cache-dir -r requirements-linux.txt

# App code.
COPY . .

# Resolver auto-detects /usr/bin/soffice, but set it explicitly to be safe.
ENV LIBREOFFICE_PATH=/usr/bin/soffice \
    PYTHONUNBUFFERED=1 \
    PORT=8000

EXPOSE 8000

# Gunicorn manages UvicornWorkers (config in gunicorn_conf.py).
CMD ["gunicorn", "app.main:app", "-k", "uvicorn.workers.UvicornWorker", "-c", "gunicorn_conf.py"]
