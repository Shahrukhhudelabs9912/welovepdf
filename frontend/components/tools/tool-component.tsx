"use client";

import { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { FileText, Download, Sparkles, Loader2, Trash2, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useToolProcessing } from "@/hooks/use-tool-processing";

interface ToolComponentProps {
  toolName: string;
  endpoint: string;
  title: string;
  description: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  additionalContent?: ReactNode;
  additionalData?: Record<string, any>;
  onFileUpload?: (files: File[]) => void;
  autoClearFiles?: boolean;
  onSuccess?: (result: { url: string; filename: string; blob: Blob }) => void;
}

export function ToolComponent({
  toolName,
  endpoint,
  title,
  description,
  accept = "application/pdf",
  multiple = false,
  maxSize = 100 * 1024 * 1024, // 100MB default
  additionalContent,
  additionalData,
  onFileUpload,
  autoClearFiles = true,
  onSuccess,
}: ToolComponentProps) {
  const t = useTranslations("tool_pages");
  const {
    files,
    isLoading,
    progress,
    stage,
    stageMessage,
    error,
    processFiles,
    clearAllFiles,
    hasFiles,
  } = useToolProcessing({
    toolName,
    endpoint,
    autoClearFiles,
    onSuccess,
  });

  const handleFileUpload = (uploadedFiles: File[]) => {
    console.log(`[ToolComponent:${toolName}] Files uploaded: ${uploadedFiles.length} files`);
    toast.success(`${uploadedFiles.length} file(s) ${t("uploaded_toast")}`);
    if (onFileUpload) {
      onFileUpload(uploadedFiles);
    }
  };

  const handleProcess = async () => {
    console.log(`[ToolComponent:${toolName}] Starting processing with ${files.length} files`);
    if (additionalData) {
      console.log(`[ToolComponent:${toolName}] Additional data:`, additionalData);
    }
    await processFiles(additionalData);
  };

  const handleClearFiles = () => {
    console.log(`[ToolComponent:${toolName}] Manually clearing files`);
    clearAllFiles();
    toast.info(t("files_cleared"));
  };

  const removeFile = (index: number) => {
    // Note: File removal is handled by the FileUpload component via useFileContext
    toast.info(t("file_removed"));
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>

      <FileUpload
        onUpload={handleFileUpload}
        accept={accept}
        multiple={multiple}
        maxSize={maxSize}
      />

      {/* Progress Indicator */}
      {(isLoading || stage !== 'idle') && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {stage === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {stage === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
              {isLoading && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
              <span className="font-medium">{stageMessage}</span>
            </div>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">{t("error_label")}: {error}</span>
          </div>
        </div>
      )}

      {/* File List */}
      {hasFiles && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{t("uploaded_files")}</h4>
            <span className="text-sm text-gray-500">{files.length} {t("file_s")}</span>
          </div>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate" title={file.name}>{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Additional Content */}
      {additionalContent}

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Button
          size="lg"
          onClick={handleProcess}
          disabled={!hasFiles || isLoading}
          className="flex-1 gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t("processing_progress")}
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              {t("process_button")}
            </>
          )}
        </Button>

        {hasFiles && (
          <Button
            variant="outline"
            size="lg"
            onClick={handleClearFiles}
            disabled={isLoading}
            className="flex-1 gap-2"
          >
            <Trash2 className="h-5 w-5" />
            {t("clear_button")}
          </Button>
        )}
      </div>

      {/* Tool Info */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800">
            <FileText className="h-3 w-3 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <h4 className="font-medium mb-1">{t("secure_processing_title")}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("secure_processing_desc")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}