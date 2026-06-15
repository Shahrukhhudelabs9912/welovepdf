"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Upload, File, X, Check } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useFileContext } from "@/lib/file-context";
import { useUploadLimit } from "@/hooks/use-upload-limit";
import { toast } from "sonner";

interface FileUploadProps {
  onUpload?: (files: File[]) => void;
  onProcess?: (files: File[]) => void;
  onAddMore?: () => void;
  accept?: string;
  multiple?: boolean;
  /**
   * Per-file max size in bytes. If omitted the limit is fetched from the
   * backend tier API (free=25MB, pro=100MB). An explicit value always wins,
   * so existing callers that pass a tighter cap (e.g. 50MB for images)
   * continue to work unchanged.
   */
  maxSize?: number;
  className?: string;
  showProcessButton?: boolean;
  showAddMoreButton?: boolean;
}

export function FileUpload({
  onUpload,
  onProcess,
  onAddMore,
  accept = "application/pdf",
  multiple = true,
  maxSize,
  className,
  showProcessButton,
  showAddMoreButton,
}: FileUploadProps) {
  const t = useTranslations("file_upload");
  const tierLimit = useUploadLimit();
  // Explicit prop wins; otherwise use the backend-resolved tier limit; final
  // fallback is the hook's own client-side default (25MB).
  const effectiveMaxSize = maxSize ?? tierLimit.maxBytes;
  // Smart defaults: show buttons only if their callbacks are provided
  const shouldShowProcessButton = showProcessButton ?? (onProcess !== undefined);
  const shouldShowAddMoreButton = showAddMoreButton ?? (onAddMore !== undefined || multiple);
  const { files, addFiles, removeFile, clearFiles } = useFileContext();
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Pre-validate against the effective limit so we surface a clear
      // toast (with upgrade hint for free users) instead of silently
      // sending a request the backend will reject with 413.
      const oversize = acceptedFiles.find((f) => f.size > effectiveMaxSize);
      if (oversize) {
        const limitMb = (effectiveMaxSize / (1024 * 1024)).toFixed(0);
        const upgradeHint =
          tierLimit.tier === "pro"
            ? ""
            : ` Upgrade to Pro for ${tierLimit.proTierMb} MB uploads.`;
        toast.error(
          `"${oversize.name}" exceeds your ${limitMb} MB limit.${upgradeHint}`
        );
        return;
      }
      addFiles(acceptedFiles);
      setIsDragging(false);
      if (onUpload) {
        onUpload(acceptedFiles);
      }
    },
    [onUpload, addFiles, effectiveMaxSize, tierLimit.tier, tierLimit.proTierMb]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    multiple,
    maxSize: effectiveMaxSize,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  const handleRemoveFile = (index: number) => {
    removeFile(index);
  };

  const clearAll = () => {
    clearFiles();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all",
          isDragActive || isDragging
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-primary hover:bg-gray-50 dark:border-gray-700 dark:hover:border-primary"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
            <Upload className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">
              {isDragActive ? t("drop_here") : t("drag_drop")}
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {t("click_to_browse")} {formatFileSize(effectiveMaxSize)}
            </p>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
              {t("supported_formats")}: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG
            </p>
          </div>
          <Button variant="outline" className="mt-4">
            {t("select_files")}
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">{t("selected_files", { count: files.length })}</h4>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              {t("clear_all")}
            </Button>
          </div>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 overflow-hidden"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <File className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate" title={file.name}>{file.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <Check className="h-3 w-3" />
                    {t("ready")}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            {shouldShowProcessButton && (
              <Button
                className="flex-1 gap-2"
                onClick={() => onProcess && onProcess(files)}
                disabled={files.length === 0}
              >
                <Upload className="h-4 w-4" />
                {t("process_files")}
              </Button>
            )}
            {shouldShowAddMoreButton && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  if (onAddMore) {
                    onAddMore();
                  } else {
                    // Trigger file input click
                    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                    if (fileInput) {
                      fileInput.click();
                    }
                  }
                }}
              >
                {t("add_more_files")}
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}