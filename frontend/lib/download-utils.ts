"use client";

/**
 * Reusable download utilities for all file converters.
 *
 * Standardizes:
 * - MIME type to file extension mapping
 * - Download filename resolution (Content-Disposition → MIME → fallback)
 * - Blob download triggering
 * - Cleanup
 */

// ── MIME type → extension mapping ──────────────────────────────────
export const MIME_TO_EXTENSION: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xls',
  'application/zip': 'zip',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/tiff': 'tiff',
  'text/plain': 'txt',
};

// ── Fallback extension for unknown MIME types ──────────────────────
const DEFAULT_EXTENSION = 'bin';

/**
 * Resolve the download filename from a fetch Response.
 *
 * Priority:
 *   1. Content-Disposition header (backend-controlled, most reliable)
 *   2. Derive from response blob's MIME type
 *   3. Generic fallback with timestamp
 *
 * @param response  - The fetch Response object
 * @param toolName  - Human-readable tool name for fallback filename, e.g. "pdf-to-word"
 * @param blob      - Optional pre-computed blob; if omitted one will be created (consumes body!)
 */
export async function resolveDownloadFilename(
  response: Response,
  toolName: string,
  blob?: Blob,
): Promise<string> {
  // 1) Content-Disposition header
  const contentDisp = response.headers.get('Content-Disposition');
  if (contentDisp) {
    const match = contentDisp.match(/filename="([^"]+)"/);
    if (match?.[1]) {
      console.log(`[download-utils] Filename from Content-Disposition: ${match[1]}`);
      return match[1];
    }
  }

  // 2) Derive from MIME type
  const resolvedBlob = blob ?? (await response.clone().blob());
  const ext = MIME_TO_EXTENSION[resolvedBlob.type]
    ?? resolvedBlob.type.split('/')[1]
    ?? DEFAULT_EXTENSION;

  const filename = `${toolName}_${Date.now()}.${ext}`;
  console.log(`[download-utils] Filename derived from MIME (${resolvedBlob.type}): ${filename}`);
  return filename;
}

/**
 * Trigger a browser file download for a Blob.
 *
 * @param blob      - The Blob to download
 * @param filename  - Desired filename including extension
 */
export function triggerDownload(blob: Blob, filename: string): void {
  console.log(`[download-utils] Triggering download: ${filename} (${blob.size} bytes, ${blob.type})`);

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();

  // Cleanup after a short delay to allow the browser to start the download
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Full download pipeline: resolve filename + trigger download in one call.
 *
 * @param response - The fetch Response (must be OK)
 * @param toolName - Tool name for fallback filename
 */
export async function downloadFromResponse(
  response: Response,
  toolName: string,
): Promise<{ blob: Blob; url: string; filename: string }> {
  const blob = await response.blob();
  const filename = await resolveDownloadFilename(response, toolName, blob);

  // Re-create URL from the same blob (resolveDownloadFilename may have consumed a clone)
  const url = URL.createObjectURL(blob);

  triggerDownload(blob, filename);

  return { blob, url, filename };
}