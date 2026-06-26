"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { ToolComponent } from "@/components/tools/tool-component";
import { RotateCw, Download } from "lucide-react";

const ANGLE_OPTIONS = [90, 180, 270] as const;

export function RotatePDFClient() {
  const t = useTranslations("rotate_pdf");
  const [angle, setAngle] = useState<number>(90);
  const [pageRange, setPageRange] = useState<string>("all");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = useState<string | null>(null);
  const [hasResult, setHasResult] = useState(false);
  const previewUrlRef = useRef<string | null>(null);

  const handleSuccess = useCallback(
    (result: { url: string; filename: string; blob: Blob }) => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      const url = URL.createObjectURL(result.blob);
      previewUrlRef.current = url;
      setPreviewUrl(url);
      setPreviewFilename(result.filename);
      setHasResult(true);
    },
    [],
  );

  const additionalContent = (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">{t("angle_label")}</label>
        <div className="grid grid-cols-3 gap-2">
          {ANGLE_OPTIONS.map((opt) => {
            const selected = angle === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setAngle(opt)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                }`}
              >
                {opt}°
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t("range_label")}</label>
        <input
          type="text"
          value={pageRange}
          onChange={(e) => setPageRange(e.target.value)}
          placeholder={t("range_placeholder")}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <p className="text-xs text-gray-500 mt-1">{t("range_hint")}</p>
      </div>
    </div>
  );

  return (
    <>
      <ToolComponent
        toolName="rotate-pdf"
        endpoint="/api/rotate-pdf"
        title={t("title")}
        description={t("description")}
        accept="application/pdf"
        multiple={false}
        maxSize={100 * 1024 * 1024}
        additionalContent={additionalContent}
        additionalData={{ angle, page_range: pageRange.trim() || "all" }}
        autoClearFiles={true}
        onSuccess={handleSuccess}
      />

      {hasResult && previewUrl && (
        <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-4">
            <RotateCw className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold">{t("result_title")}</h3>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{previewFilename}</p>
            <a
              href={previewUrl}
              download={previewFilename ?? undefined}
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
            >
              <Download className="h-4 w-4" />
              {t("download_again")}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
