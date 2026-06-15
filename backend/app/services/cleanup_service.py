"""
Background file cleanup sweeper.

Scans configured directories every N minutes and deletes files / directories
older than the configured retention window. Runs as an asyncio task started
during FastAPI startup and cancelled on shutdown.

What it sweeps (by default):
  - System temp dir entries matching known prefixes left behind by crashed
    subprocesses (pdf2word_*, compress_pdf_*, word2pdf_*, organize_pdf_*, etc.)
  - Optional CUSTOM_CLEANUP_DIRS — extra directories you opt into via .env

Why prefix-based and not the whole temp dir:
  - The system temp dir is shared with other applications. Blanket-deleting
    every old file in it would be catastrophic. We only touch entries whose
    name matches a known prefix written by this app.

Concurrency model:
  - Single asyncio.Task, runs on the event loop.
  - All I/O is delegated to a thread executor so it cannot block the loop.
  - One sweep is in flight at a time (next tick is skipped if the previous
    one is still running).
"""
from __future__ import annotations

import asyncio
import logging
import shutil
import tempfile
import time
from pathlib import Path
from typing import Iterable

from app.config import settings

logger = logging.getLogger("welovepdf.cleanup")


# Filename prefixes this app writes into the system temp dir. Only entries
# matching one of these prefixes are eligible for deletion.
KNOWN_TEMP_PREFIXES: tuple[str, ...] = (
    "pdf2word_",
    "compress_pdf_",
    "word2pdf_",
    "organize_pdf_",
    "pdf_to_excel_",
    "excel_to_pdf_",
    "watermark_",
    "ai_tools_",
    "tmp",  # default NamedTemporaryFile prefix
)


def _iter_stale_entries(
    root: Path,
    cutoff_ts: float,
    prefixes: Iterable[str] | None,
) -> Iterable[Path]:
    """Yield direct children of ``root`` older than ``cutoff_ts``.

    If ``prefixes`` is non-empty, only entries whose name starts with one of
    the prefixes are yielded. Passing ``None`` disables the filter — only do
    that for directories the app fully owns.
    """
    if not root.is_dir():
        return
    prefix_tuple = tuple(prefixes) if prefixes else None
    for child in root.iterdir():
        if prefix_tuple and not child.name.startswith(prefix_tuple):
            continue
        try:
            mtime = child.stat().st_mtime
        except OSError:
            continue
        if mtime < cutoff_ts:
            yield child


def _delete_entry(path: Path) -> int:
    """Delete a file or directory tree. Returns bytes freed (best-effort)."""
    try:
        if path.is_symlink() or path.is_file():
            size = path.stat().st_size
            path.unlink(missing_ok=True)
            return size
        if path.is_dir():
            size = sum(f.stat().st_size for f in path.rglob("*") if f.is_file())
            shutil.rmtree(path, ignore_errors=True)
            return size
    except OSError as exc:
        logger.warning("cleanup: failed to delete %s: %s", path, exc)
    return 0


def _run_sweep_sync(
    targets: list[tuple[Path, tuple[str, ...] | None]],
    retention_seconds: int,
) -> dict:
    """Synchronous sweep. Run inside a thread executor."""
    cutoff = time.time() - retention_seconds
    deleted = 0
    bytes_freed = 0
    errors = 0
    for root, prefixes in targets:
        try:
            for entry in _iter_stale_entries(root, cutoff, prefixes):
                freed = _delete_entry(entry)
                if freed >= 0:
                    deleted += 1
                    bytes_freed += freed
        except Exception as exc:  # noqa: BLE001 — keep the loop alive
            errors += 1
            logger.exception("cleanup: sweep error under %s: %s", root, exc)
    return {
        "deleted": deleted,
        "bytes_freed": bytes_freed,
        "errors": errors,
        "cutoff_ts": cutoff,
    }


def _resolve_targets() -> list[tuple[Path, tuple[str, ...] | None]]:
    """Build the list of (root, prefix-filter) tuples to sweep."""
    targets: list[tuple[Path, tuple[str, ...] | None]] = [
        (Path(tempfile.gettempdir()), KNOWN_TEMP_PREFIXES),
    ]
    # Configured TEMP_DIR is owned by this app — no prefix filter.
    app_temp = Path(settings.TEMP_DIR)
    if app_temp.exists():
        targets.append((app_temp.resolve(), None))
    for extra in settings.CUSTOM_CLEANUP_DIRS:
        p = Path(extra).expanduser()
        if p.exists():
            targets.append((p.resolve(), None))
        else:
            logger.warning("cleanup: configured dir does not exist: %s", p)
    return targets


async def run_once() -> dict:
    """Run one sweep on the thread executor and return its summary."""
    targets = _resolve_targets()
    retention = settings.CLEANUP_RETENTION_SECONDS
    loop = asyncio.get_running_loop()
    summary = await loop.run_in_executor(
        None, _run_sweep_sync, targets, retention
    )
    if summary["deleted"] or summary["errors"]:
        logger.info(
            "cleanup: swept %d entries, freed %.2f MB, errors=%d",
            summary["deleted"],
            summary["bytes_freed"] / (1024 * 1024),
            summary["errors"],
        )
    return summary


async def _sweeper_loop() -> None:
    """Forever-loop that calls run_once() on the configured interval."""
    interval = settings.CLEANUP_INTERVAL_SECONDS
    logger.info(
        "cleanup: sweeper started — interval=%ds, retention=%ds",
        interval,
        settings.CLEANUP_RETENTION_SECONDS,
    )
    # Stagger first run so it doesn't compete with startup work.
    await asyncio.sleep(min(60, interval))
    while True:
        try:
            await run_once()
        except asyncio.CancelledError:
            raise
        except Exception:  # noqa: BLE001
            logger.exception("cleanup: unexpected error in sweeper loop")
        await asyncio.sleep(interval)


class CleanupScheduler:
    """Owns the sweeper task lifecycle. Mounted on the FastAPI app state."""

    def __init__(self) -> None:
        self._task: asyncio.Task | None = None

    def start(self) -> None:
        if not settings.CLEANUP_ENABLED:
            logger.info("cleanup: disabled via CLEANUP_ENABLED=false")
            return
        if self._task and not self._task.done():
            return
        self._task = asyncio.create_task(_sweeper_loop(), name="welovepdf-cleanup")

    async def stop(self) -> None:
        if self._task is None:
            return
        self._task.cancel()
        try:
            await self._task
        except asyncio.CancelledError:
            pass
        except Exception:  # noqa: BLE001
            logger.exception("cleanup: sweeper exited with error")
        self._task = None
