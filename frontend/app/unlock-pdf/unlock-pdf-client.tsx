"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { ToolComponent } from "@/components/tools/tool-component";
import { Eye, EyeOff, Unlock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UnlockPDFClient() {
  const t = useTranslations("unlock_pdf");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = useState<string | null>(null);
  const [hasResult, setHasResult] = useState(false);
  const previewUrlRef = useRef<string | null>(null);

  const handleSuccess = useCallback(
    (result: { url: string; filename: string; blob: Blob }) => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      const url = URL.createObjectURL(result.blob);
      previewUrlRef.current = url;
      setPreviewUrl(url);
      setPreviewFilename(result.filename);
      setHasResult(true);
    },
    [],
  );

  const handleBeforeProcess = useCallback(async () => {
    if (password.length < 1) {
      return false;
    }
    return true;
  }, [password]);

  const additionalContent = (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <label className="block text-sm font-medium mb-2">{t("password_label")}</label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("password_placeholder")}
          className="w-full px-3 py-2 pr-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2"
          onClick={() => setShowPassword((s) => !s)}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-2">{t("password_hint")}</p>
    </div>
  );

  return (
    <>
      <ToolComponent
        toolName="unlock-pdf"
        endpoint="/api/unlock-pdf"
        title={t("title")}
        description={t("description")}
        accept="application/pdf"
        multiple={false}
        maxSize={100 * 1024 * 1024}
        additionalContent={additionalContent}
        additionalData={{ password }}
        autoClearFiles={true}
        onSuccess={handleSuccess}
        onBeforeProcess={handleBeforeProcess}
      />

      {hasResult && previewUrl && (
        <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-4">
            <Unlock className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("result_title")}
            </h3>
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
