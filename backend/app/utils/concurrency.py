"""Concurrency and external-tool helpers for the WeLovePDF backend.

The FastAPI app runs on a single asyncio event loop. CPU-bound or
blocking work (PDF rendering, LibreOffice subprocesses, AI models) must
NOT run directly inside an `async def` handler — doing so freezes the
event loop and stalls every other in-flight request on that worker.

- `run_blocking()` offloads such work to the default thread pool.
- `heavy_job_slot()` bounds how many heavy jobs run at once so a burst of
  AI/OCR/LibreOffice requests can't exhaust RAM/CPU.
- `resolve_libreoffice_path()` finds the LibreOffice binary across OSes.
"""
import asyncio
import os
import shutil
from functools import partial
from typing import Optional

from app.config import settings

# Windows default install location, used as a last-resort fallback when the
# binary isn't on PATH and LIBREOFFICE_PATH isn't configured.
_WIN_DEFAULT_LIBREOFFICE = r"C:\Program Files\LibreOffice\program\soffice.exe"


async def run_blocking(func, *args, **kwargs):
    """Run a blocking/CPU-bound function in the default thread pool.

    Keeps the event loop responsive for other requests while this single
    call is processing. Use for any synchronous PDF/Office/AI work invoked
    from an async route handler.

    Example:
        merged = await run_blocking(PDFService.merge_pdfs, pdf_files)
    """
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, partial(func, *args, **kwargs))


# Bounds concurrent heavy jobs (AI, OCR, LibreOffice) per worker process.
# A stop-gap until a real task queue (Celery/RQ) is introduced. Built lazily
# so it binds to the running loop rather than import-time.
_heavy_semaphore: Optional[asyncio.Semaphore] = None


def _get_heavy_semaphore() -> asyncio.Semaphore:
    global _heavy_semaphore
    if _heavy_semaphore is None:
        _heavy_semaphore = asyncio.Semaphore(settings.HEAVY_JOB_CONCURRENCY)
    return _heavy_semaphore


def heavy_job_slot() -> asyncio.Semaphore:
    """Async context manager guarding heavy jobs.

    Example:
        async with heavy_job_slot():
            result = await run_blocking(expensive_fn, data)
    """
    return _get_heavy_semaphore()


def resolve_libreoffice_path() -> Optional[str]:
    """Locate the LibreOffice headless binary.

    Order: explicit LIBREOFFICE_PATH setting → `soffice`/`libreoffice` on
    PATH (Linux/macOS) → Windows default install dir. Returns None if not
    found, so callers can raise a clear "not installed" error.
    """
    if settings.LIBREOFFICE_PATH:
        return settings.LIBREOFFICE_PATH
    found = shutil.which("soffice") or shutil.which("libreoffice")
    if found:
        return found
    if os.path.exists(_WIN_DEFAULT_LIBREOFFICE):
        return _WIN_DEFAULT_LIBREOFFICE
    return None
