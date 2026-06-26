"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { ToolComponent } from "@/components/tools/tool-component";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Grid,
  Image as ImageIcon,
  Download,
  FileArchive,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

// Files larger than this trigger the heavy-render confirmation when the
// user picks 300 DPI. Picked empirically: a 7 MB PDF at 300 DPI takes
// 5-7 min on a single backend worker — definitely worth a warning.
const HEAVY_FILE_SIZE_BYTES = 3 * 1024 * 1024;
const HEAVY_DPI_THRESHOLD = 300;

type DpiOption = {
  value: number;
  speedKey:
    | "dpi_speed_fast"
    | "dpi_speed_balanced"
    | "dpi_speed_slow";
  recommended?: boolean;
};

const DPI_OPTIONS: DpiOption[] = [
  { value: 72, speedKey: "dpi_speed_fast" },
  { value: 150, speedKey: "dpi_speed_balanced", recommended: true },
  { value: 300, speedKey: "dpi_speed_slow" },
];

export function PDFToJPGClient() {
  const t = useTranslations("pdf_to_jpg");
  const [showSettings, setShowSettings] = useState(false);
  const [quality, setQuality] = useState(85);
  const [dpi, setDpi] = useState(150);
  const [pageNumber, setPageNumber] = useState(0);

  // Conversion result for preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [hasResult, setHasResult] = useState(false);
  // When the backend auto-caps DPI, expose what it actually rendered at so
  // the user knows their setting was honored only partially.
  const [actualDpi, setActualDpi] = useState<number | null>(null);

  const previewUrlRef = useRef<string | null>(null);

  const handleSuccess = useCallback(
    (result: {
      url: string;
      filename: string;
      blob: Blob;
      headers?: Record<string, string>;
    }) => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      const url = URL.createObjectURL(result.blob);
      previewUrlRef.current = url;
      setPreviewUrl(url);
      setPreviewFilename(result.filename);
      setPreviewBlob(result.blob);
      setHasResult(true);

      // Surface the backend safety cap (Layer 3) — toast + persistent
      // inline notice in the result card.
      const adjusted = result.headers?.["x-dpi-adjusted"] === "true";
      const usedDpi = Number(result.headers?.["x-dpi-used"]);
      if (adjusted && Number.isFinite(usedDpi)) {
        setActualDpi(usedDpi);
        toast.message(t("dpi_capped_toast", { used: usedDpi, requested: dpi }));
      } else {
        setActualDpi(null);
      }
    },
    [dpi, t],
  );

  // Pre-flight confirm for heavy renders. Wired into ToolComponent via
  // onBeforeProcess — returning false aborts the upload.
  const handleBeforeProcess = useCallback(
    async (files: File[]): Promise<boolean> => {
      if (files.length === 0) return true;
      const file = files[0];
      const isHeavy =
        dpi >= HEAVY_DPI_THRESHOLD && file.size > HEAVY_FILE_SIZE_BYTES;
      if (!isHeavy) return true;
      // Native confirm keeps the dependency surface tiny. If the design
      // calls for a richer dialog later, swap for a Radix AlertDialog.
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const msg = t("heavy_render_confirm", { sizeMb });
      return window.confirm(msg);
    },
    [dpi, t],
  );

  // Detect result type
  const isZipResult = hasResult && previewFilename
    ? previewFilename.endsWith(".zip")
    : false;
  const isImageResult = hasResult && !isZipResult;

  const additionalContent = showSettings && (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h4 className="font-medium mb-3">{t("settings_title")}</h4>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("quality_label")}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="100"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-medium w-12">{quality}%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{t("quality_hint")}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("dpi_label")}</label>
          <div className="grid grid-cols-3 gap-2">
            {DPI_OPTIONS.map((opt) => {
              const selected = dpi === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDpi(opt.value)}
                  className={`relative rounded-lg border px-3 py-2 text-left transition-colors ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm">
                      {t("dpi_value", { dpi: opt.value })}
                    </span>
                    {opt.recommended && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300 px-1.5 py-0.5 rounded">
                        {t("dpi_recommended")}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {t(opt.speedKey)}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">{t("dpi_hint")}</p>
          {dpi >= HEAVY_DPI_THRESHOLD && (
            <div className="mt-2 flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-2 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{t("dpi_slow_warning")}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t("page_number_label")}
          </label>
          <input
            type="number"
            min="0"
            value={pageNumber}
            onChange={(e) => setPageNumber(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <p className="text-xs text-gray-500 mt-1">{t("page_number_hint")}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <ToolComponent
        toolName="pdf-to-jpg"
        endpoint="/api/pdf-to-jpg"
        title={t("title")}
        description={t("description")}
        accept="application/pdf"
        multiple={false}
        maxSize={100 * 1024 * 1024}
        additionalContent={additionalContent}
        additionalData={{ quality, dpi, page_number: pageNumber }}
        autoClearFiles={true}
        onSuccess={handleSuccess}
        onBeforeProcess={handleBeforeProcess}
      />

      {/* Settings Toggle Button */}
      <div className="mt-4 flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          {showSettings ? t("hide_settings") : t("show_settings")}
        </Button>
      </div>

      {/* ── DPI Auto-Adjusted Notice (Layer 3 surfacing) ── */}
      {hasResult && actualDpi !== null && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800 dark:text-amber-200">
                {t("dpi_capped_title")}
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                {t("dpi_capped_body", { used: actualDpi, requested: dpi })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── ZIP Result Preview (all-pages mode) ── */}
      {isZipResult && previewUrl && (
        <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-4">
            <FileArchive className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("zip_result_title")}
            </h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t("zip_result_desc")}
          </p>
          <div className="flex flex-col items-center">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                  <FileArchive className="h-7 w-7 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="font-semibold text-gray-900 dark:text-white truncate"
                    title={previewFilename || undefined}
                  >
                    {previewFilename}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {previewBlob
                      ? (previewBlob.size / 1024).toFixed(1) + " KB"
                      : ""}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>{t("zip_check_item1")}</p>
                <p>
                  {t("zip_check_item2", {
                    dpi: actualDpi ?? dpi,
                    quality,
                  })}
                </p>
                <p>{t("zip_check_item3")}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={previewUrl}
                  download={previewFilename}
                  className="inline-flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  {t("download_zip_again")}
                </a>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              {t("zip_extract_hint")}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {t("auto_downloaded_hint")}
            </p>
          </div>
        </div>
      )}

      {/* ── Single Image Result Preview (single-page mode) ── */}
      {isImageResult && previewUrl && (
        <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("single_result_title")}
            </h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t("single_result_desc")}
          </p>
          <div className="flex flex-col items-center">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md">
              <img
                src={previewUrl}
                alt={t("single_result_title")}
                className="w-full h-auto object-contain max-h-96"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 font-mono">
              {previewFilename}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {t("auto_downloaded_hint")}
            </p>
          </div>
        </div>
      )}

      {/* ── Sample Output Preview (shown before any conversion) ── */}
      {!hasResult && (
        <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Grid className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("sample_output_title")}
            </h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t("sample_output_desc")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((page) => (
              <div
                key={page}
                className="aspect-square bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-center p-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 mb-3">
                    <ImageIcon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {t("jpg_label")}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {t("page_label_with_number", { page })}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            {t("sample_output_footer")}
          </p>
        </div>
      )}
    </>
  );
}
