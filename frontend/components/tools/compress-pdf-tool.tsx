"use client";

import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Download, Zap, File, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { toast } from "sonner";
import { formatFileSize } from "@/lib/utils";
import { uploadFile, downloadBlob, handleApiError } from "@/lib/api-client";
import { useFileContext } from "@/lib/file-context";
import { ButtonLoader } from "@/components/brand-loader";

interface PDFFile {
  id: string;
  name: string;
  size: number;
  file: File | null;
}

export function CompressPDFTool() {
  const t = useTranslations("compress_pdf");
  const tp = useTranslations("tool_pages");
  const { files: globalFiles, addFiles, removeFile, clearFiles, isLoading } = useFileContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressedReady, setCompressedReady] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<"low" | "medium" | "high">("medium");
  const [processingTime, setProcessingTime] = useState<number>(0);

  // Store the compressed blob and filename for manual download fallback
  const compressedBlobRef = useRef<Blob | null>(null);
  const compressedFilenameRef = useRef<string>("");

  // Get the first file from global context (single file tool)
  const file: PDFFile | null = useMemo(() => {
    if (globalFiles.length === 0) return null;
    const firstFile = globalFiles[0];
    return {
      id: `global-${firstFile.name}`,
      name: firstFile.name,
      size: firstFile.size,
      file: firstFile,
    };
  }, [globalFiles]);

  const handleFileUpload = (uploadedFiles: File[]) => {
    if (uploadedFiles.length === 0) return;
    
    // Clear existing files first (single file tool)
    clearFiles();
    // Add new file to global context
    addFiles(uploadedFiles);
    setCompressedReady(false);
    toast.success(t("file_uploaded_toast", { name: uploadedFiles[0].name }));
  };

  const handleAddMoreFiles = () => {
    // Not needed for single file upload, but we'll keep it for consistency
  };

  const handleRemoveFile = () => {
    clearFiles();
    setCompressedReady(false);
    compressedBlobRef.current = null;
    compressedFilenameRef.current = "";
    toast.info(tp("file_removed"));
  };

  const handleManualDownload = () => {
    const blob = compressedBlobRef.current;
    const filename = compressedFilenameRef.current;
    if (!blob) {
      toast.error(t("no_compressed_file"));
      return;
    }
    const success = downloadBlob(blob, filename);
    if (success) {
      toast.success(t("downloading_toast", { filename }));
    } else {
      toast.error(t("download_failed_msg"));
    }
  };

  const processCompress = async () => {
    if (globalFiles.length === 0) {
      toast.error(t("upload_pdf_first"));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setCompressedReady(false);
    setProcessingTime(0);
    compressedBlobRef.current = null;
    compressedFilenameRef.current = "";

    try {
      setProgress(10);
      const startTime = Date.now();
      const result = await uploadFile('compress-pdf', globalFiles, {
        additionalData: { compressionLevel },
        onProgress: (uploadProgress) => {
          setProgress(10 + uploadProgress * 0.7); // 10-80 range for upload
        },
      });

      if (!result.success) {
        setIsProcessing(false);
        handleApiError(result.error || t("compress_failed"));
        return;
      }

      setProgress(95);

      // Calculate actual processing time
      const elapsedMs = Date.now() - startTime;
      setProcessingTime(elapsedMs);

      if (result.blob && result.filename) {
        // Store blob reference for manual download
        compressedBlobRef.current = result.blob;
        compressedFilenameRef.current = result.filename;

        // Auto-download
        try {
          downloadBlob(result.blob, result.filename);
        } catch (downloadErr) {
          console.warn("Auto-download failed, manual button available:", downloadErr);
        }
      }

      setProgress(100);
      setIsProcessing(false);
      setCompressedReady(true);
      toast.success(t("compress_success"));
      // Clear uploaded files after successful processing
      clearFiles();
    } catch (error) {
      console.error("Error compressing PDF:", error);
      handleApiError(t("compress_failed"));
      setIsProcessing(false);
    }
  };

  const compressionLevelKey = compressionLevel === "high"
    ? "high_compression_desc"
    : compressionLevel === "medium"
    ? "medium_compression_desc"
    : "low_compression_desc";

  const compressionStatusKey = compressionLevel === "high"
    ? "max_compression_desc"
    : compressionLevel === "medium"
    ? "balanced_compression_desc"
    : "light_compression_desc";

  const compressionOptions = [
    { value: "low", labelKey: "low_compression", descKey: "low_compression_desc" },
    { value: "medium", labelKey: "medium_compression", descKey: "medium_compression_desc" },
    { value: "high", labelKey: "high_compression", descKey: "high_compression_desc" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 dark:border-gray-700">
        <FileUpload
          onUpload={handleFileUpload}
          onAddMore={handleAddMoreFiles}
          accept="application/pdf"
          multiple={false}
          maxSize={200 * 1024 * 1024}
          showProcessButton={false} // We have our own Compress PDF button
          showAddMoreButton={false} // Single file upload, no need for Add More
        />
      </div>

      {file && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t("file_to_compress")}</h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t("size_label")}: {formatFileSize(file.size)}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <File className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate" title={file.name}>{file.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)} • {t("pdf_document_label")}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                className="h-8 w-8 shrink-0"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
            <h4 className="mb-4 text-lg font-semibold">{t("compression_settings")}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {compressionOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCompressionLevel(option.value as any)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    compressionLevel === option.value
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="font-medium">{t(option.labelKey)}</div>
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t(option.descKey)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800">
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-semibold">{t("ready_to_compress")}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {t(compressionStatusKey)}
                </div>
              </div>
            </div>
            <Button
              onClick={processCompress}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <>
                  <ButtonLoader />
                  {t("compressing")}
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  {t("compress_button")}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 text-lg font-semibold">{t("compressing_pdf_title")}</h3>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>{t("optimizing_pdf")}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">
                  {file ? formatFileSize(file.size) : "0 KB"}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{t("original_size")}</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {progress > 30 ? t("estimating") : "0 KB"}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{t("compressed_size")}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {compressedReady && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{t("compress_success")}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t("compression_success_desc", { level: compressionLevel })}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg bg-white p-4 dark:bg-gray-800">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t("file_name_label")}</div>
              <div className="font-medium">pdforca-compressfile.pdf</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t("original_size")}</div>
              <div className="font-medium">{file ? formatFileSize(file.size) : "0 KB"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t("compression_level")}</div>
              <div className="font-medium capitalize">{compressionLevel}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t("processing_time_label")}</div>
              <div className="font-medium">
                {processingTime >= 1000
                  ? `${(processingTime / 1000).toFixed(1)} ${t("seconds_label")}`
                  : `${processingTime} ms`}
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setCompressedReady(false);
                clearFiles();
              }}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {t("compress_another")}
            </Button>
            <Button
              onClick={handleManualDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {t("download_button")}
            </Button>
          </div>
        </motion.div>
      )}

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-lg font-semibold">{t("about_compression")}</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <span>{t("about_optimize")}</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <span>{t("about_quality_impact")}</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <span>{t("about_text_sharp")}</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <span>{t("about_perfect_for")}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}