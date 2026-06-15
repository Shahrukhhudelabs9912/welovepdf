"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { ToolComponent } from "@/components/tools/tool-component";
import { Button } from "@/components/ui/button";
import { Settings, Grid, Image as ImageIcon, Download, FileArchive } from "lucide-react";

export function PDFToJPGClient() {
  const t = useTranslations("pdf_to_jpg");
  const tp = useTranslations("tool_pages");
  const [showSettings, setShowSettings] = useState(false);
  const [quality, setQuality] = useState(85);
  const [dpi, setDpi] = useState(150);
  const [pageNumber, setPageNumber] = useState(0);

  // Store conversion result for preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [hasResult, setHasResult] = useState(false);

  // Use ref for cleanup to avoid stale closure issues
  const previewUrlRef = useRef<string | null>(null);

  const handleSuccess = useCallback((result: { url: string; filename: string; blob: Blob }) => {
    // Revoke previous object URL to avoid memory leaks (using ref, never stale)
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    const url = URL.createObjectURL(result.blob);
    previewUrlRef.current = url;
    setPreviewUrl(url);
    setPreviewFilename(result.filename);
    setPreviewBlob(result.blob);
    setHasResult(true);
  }, []); // No deps needed — ref handles cleanup

  // Detect result type
  const isZipResult = hasResult && previewFilename
    ? previewFilename.endsWith('.zip')
    : false;
  const isImageResult = hasResult && !isZipResult;

  const additionalContent = showSettings && (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h4 className="font-medium mb-3">{t("settings_title")}</h4>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t("quality_label")}</label>
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
          <div className="flex gap-2">
            {[72, 150, 300].map((value) => (
              <Button
                key={value}
                type="button"
                variant={dpi === value ? "default" : "outline"}
                size="sm"
                onClick={() => setDpi(value)}
              >
                {t("dpi_value", { dpi: value })}
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">{t("dpi_hint")}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">{t("page_number_label")}</label>
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
        maxSize={100 * 1024 * 1024} // 100MB
        additionalContent={additionalContent}
        additionalData={{ quality, dpi, page_number: pageNumber }}
        autoClearFiles={true}
        onSuccess={handleSuccess}
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
                  <p className="font-semibold text-gray-900 dark:text-white truncate" title={previewFilename || undefined}>
                    {previewFilename}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {previewBlob ? (previewBlob.size / 1024).toFixed(1) + ' KB' : ''}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>{t("zip_check_item1")}</p>
                <p>{t("zip_check_item2", { dpi, quality })}</p>
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