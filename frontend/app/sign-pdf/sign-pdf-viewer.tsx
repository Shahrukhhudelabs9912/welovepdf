"use client";

import { useEffect, useRef, useState } from "react";

// Load pdf.js from CDN at runtime via a script tag — completely
// bypasses webpack/Next bundling (which has known ESM interop bugs
// with pdfjs-dist@5+).
const PDFJS_VERSION = "4.8.69";
const PDFJS_SCRIPT = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.mjs`;
const PDFJS_WORKER = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;

declare global {
  interface Window {
    pdfjsLib?: any;
    __pdfjsLoadingPromise?: Promise<any>;
  }
}

interface SignPdfViewerProps {
  fileUrl: string;
  pageNumber: number;
  width: number;
  onNumPages: (n: number) => void;
  onPageSize: (size: { width: number; height: number }) => void;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  overlay?: React.ReactNode;
  children?: React.ReactNode;
}

function loadPdfJs(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window not available"));
  }
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (window.__pdfjsLoadingPromise) return window.__pdfjsLoadingPromise;

  window.__pdfjsLoadingPromise = new Promise((resolve, reject) => {
    // Use an ESM script tag — pdfjs-dist@4 ships as ESM.
    const existing = document.querySelector(`script[src="${PDFJS_SCRIPT}"]`);
    if (existing) {
      const check = setInterval(() => {
        if (window.pdfjsLib) {
          clearInterval(check);
          resolve(window.pdfjsLib);
        }
      }, 50);
      return;
    }

    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
      import * as pdfjs from "${PDFJS_SCRIPT}";
      pdfjs.GlobalWorkerOptions.workerSrc = "${PDFJS_WORKER}";
      window.pdfjsLib = pdfjs;
      window.dispatchEvent(new CustomEvent("pdfjs-loaded"));
    `;
    script.onerror = () => reject(new Error("Failed to load pdf.js from CDN"));
    document.head.appendChild(script);

    const onLoaded = () => {
      window.removeEventListener("pdfjs-loaded", onLoaded);
      resolve(window.pdfjsLib);
    };
    window.addEventListener("pdfjs-loaded", onLoaded);

    // Timeout fallback
    setTimeout(() => {
      if (!window.pdfjsLib) {
        window.removeEventListener("pdfjs-loaded", onLoaded);
        reject(new Error("pdf.js load timed out"));
      }
    }, 15000);
  });

  return window.__pdfjsLoadingPromise;
}

export default function SignPdfViewer({
  fileUrl,
  pageNumber,
  width,
  onNumPages,
  onPageSize,
  onClick,
  containerRef,
  overlay,
  children,
}: SignPdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pdfDocRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const pdfjs = await loadPdfJs();
        if (cancelled) return;
        const loadingTask = pdfjs.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        pdfDocRef.current = pdf;
        onNumPages(pdf.numPages);
      } catch (e: any) {
        console.error("[sign-pdf-viewer] PDF load error:", e);
        if (!cancelled) setError(e?.message || "Failed to load PDF");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fileUrl, onNumPages]);

  useEffect(() => {
    let cancelled = false;
    let renderTask: any = null;
    (async () => {
      const pdf = pdfDocRef.current;
      if (!pdf || !canvasRef.current) return;
      try {
        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;
        const viewport = page.getViewport({ scale: 1 });
        const scale = width / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        renderTask = page.render({ canvasContext: ctx, viewport: scaledViewport });
        await renderTask.promise;
        if (!cancelled) {
          onPageSize({ width: viewport.width, height: viewport.height });
          setLoading(false);
        }
      } catch (e: any) {
        if (e?.name === "RenderingCancelledException") return;
        console.error("[sign-pdf-viewer] Page render error:", e);
        if (!cancelled) setError(e?.message || "Failed to render page");
      }
    })();
    return () => {
      cancelled = true;
      if (renderTask) {
        try { renderTask.cancel(); } catch {}
      }
    };
  }, [pageNumber, width, onPageSize]);

  if (error) {
    return (
      <div className="border border-red-200 bg-red-50 rounded-lg p-6 text-center text-red-700">
        Failed to load PDF: {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className="relative inline-block border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-crosshair shadow-md bg-white"
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10 min-w-[400px] min-h-[300px]">
          <span className="text-sm text-gray-500">Loading PDF...</span>
        </div>
      )}
      <canvas ref={canvasRef} />
      {overlay}
      {children}
    </div>
  );
}
