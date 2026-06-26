"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { ToolComponent } from "@/components/tools/tool-component";
import { Presentation, Download } from "lucide-react";

export function PowerPointToPDFClient() {
  const t = useTranslations("powerpoint_to_pdf");
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

  return (
    <>
      <ToolComponent
        toolName="powerpoint-to-pdf"
        endpoint="/api/powerpoint-to-pdf"
        title={t("title")}
        description={t("description")}
        accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        multiple={false}
        maxSize={100 * 1024 * 1024}
        autoClearFiles={true}
        onSuccess={handleSuccess}
      />

      {hasResult && previewUrl && (
        <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-4">
            <Presentation className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold">{t("result_title")}</h3>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{previewFilename}</p>
            <a
              href={previewUrl}
              download={previewFilename ?? undefined}
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700"
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
