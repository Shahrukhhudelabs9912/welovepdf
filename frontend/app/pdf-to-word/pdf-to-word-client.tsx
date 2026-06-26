"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ToolLayout } from "@/components/tools/tool-layout";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { FileText, Download, Sparkles, Loader2, Trash2, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useToolProcessing } from "@/hooks/use-tool-processing";
import { triggerDownload } from "@/lib/download-utils";
import { ButtonLoader } from "@/components/brand-loader";

interface ConversionResult {
  url: string;
  filename: string;
  blob: Blob;
}

export function PDFToWordClient() {
  const t = useTranslations("pdf_to_word");
  const tp = useTranslations("tool_pages");
  const [lastResult, setLastResult] = useState<ConversionResult | null>(null);

  const handleSuccess = useCallback((result: { url: string; filename: string; blob: Blob }) => {
    setLastResult({
      url: result.url,
      filename: result.filename,
      blob: result.blob,
    });
    toast.success(t("conversion_success"));
  }, [t]);

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
    toolName: "pdf-to-word",
    endpoint: '/api/pdf-to-word',
    autoClearFiles: true,
    onSuccess: handleSuccess,
  });

  const handleFileUpload = (uploadedFiles: File[]) => {
    console.log(`[PDFToWord] Files uploaded: ${uploadedFiles.length} files`);
    setLastResult(null);
    toast.success(`${uploadedFiles.length} ${tp("file_s")} ${tp("uploaded_toast")}`);
  };

  const handleConvert = async () => {
    console.log(`[PDFToWord] Starting conversion with ${files.length} files`);
    setLastResult(null);
    await processFiles();
  };

  const handleClearFiles = () => {
    console.log(`[PDFToWord] Manually clearing files`);
    clearAllFiles();
    setLastResult(null);
    toast.info(tp("files_cleared"));
  };

  const handleManualDownload = () => {
    if (!lastResult) return;
    console.log(`[PDFToWord] Manual download: filename="${lastResult.filename}", blob=${lastResult.blob.size} bytes, type=${lastResult.blob.type}`);

    let downloadName = lastResult.filename;
    if (!downloadName.toLowerCase().endsWith('.docx')) {
      downloadName = downloadName.replace(/\.\w+$/, '') + '.docx';
      console.log(`[PDFToWord] Fixed extension → "${downloadName}"`);
    }

    triggerDownload(lastResult.blob, downloadName);
    toast.success(t("downloading_file", { filename: downloadName }));
  };

  const removeFile = (index: number) => {
    toast.info(tp("file_removed"));
  };

  const formatErrorMessage = (rawError: string | null): string => {
    if (!rawError) return "";
    if (rawError.includes("Traceback") || rawError.includes("File \"") || rawError.includes("line ")) {
      return tp("server_error_retry");
    }
    if (rawError.length > 300) {
      return rawError.substring(0, 300) + "...";
    }
    return rawError;
  };

  return (
    <ToolLayout
      title={t("title")}
      description={t("description")}
      toolName={t("title")}
      toolDescription={t("description")}
      toolKey="pdf_to_word"
      seoContent={{
        h1: "Convert PDF to Word Online for Free",
        h2: "How to Convert PDF to Word",
        content: `
          <p>Our free PDF to Word converter allows you to transform any PDF document into an editable Microsoft Word file (.docx) while preserving the original formatting, fonts, tables, and images.</p>
          <p><strong>Key features:</strong></p>
          <ul>
            <li>Convert PDF to Word with high accuracy</li>
            <li>Preserve formatting, fonts, and layout</li>
            <li>Maintain tables, images, and hyperlinks</li>
            <li>Secure processing with automatic file deletion</li>
            <li>No registration or watermarks</li>
            <li>Support for scanned PDFs with OCR technology</li>
          </ul>
          <p>Perfect for editing contracts, resumes, reports, or any document that was originally created as a PDF but needs modifications.</p>
        `,
        faq: [
          {
            question: "Is PDF to Word conversion free?",
            answer: "Yes, our PDF to Word converter is completely free with no hidden charges. You can convert unlimited files without registration."
          },
          {
            question: "Does it preserve formatting?",
            answer: "Yes, our converter maintains original formatting, fonts, tables, images, and layout to the highest possible accuracy."
          },
          {
            question: "What Word format is supported?",
            answer: "We convert to Microsoft Word .docx format, which is compatible with Word 2007 and later versions, as well as Google Docs and other word processors."
          },
          {
            question: "Is my data secure?",
            answer: "Absolutely. All files are processed securely with end-to-end encryption and are automatically deleted from our servers after 1 hour."
          },
          {
            question: "Can I convert scanned PDFs?",
            answer: "Yes, our converter includes OCR technology that can extract text from scanned PDFs and convert them to editable Word documents."
          },
          {
            question: "Is there a file size limit?",
            answer: "You can convert PDFs up to 100MB for free. For larger files, consider using our premium plan."
          }
        ]
      }}
    >
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{t("upload_title")}</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t("upload_description")}
          </p>
        </div>

        <FileUpload
          onUpload={handleFileUpload}
          accept="application/pdf"
          multiple={false}
          maxSize={100 * 1024 * 1024}
        />

        {(isLoading || stage !== 'idle') && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {stage === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {stage === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                {isLoading && <ButtonLoader />}
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

        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2 text-red-700 dark:text-red-300">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium">{t("conversion_failed")}</span>
                <p className="text-sm mt-1">{formatErrorMessage(error)}</p>
              </div>
            </div>
          </div>
        )}

        {lastResult && stage === 'completed' && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="h-5 w-5" />
                <div>
                  <span className="font-medium">{t("conversion_success")}</span>
                  <p className="text-sm">{tp("download_ready")}</p>
                </div>
              </div>
              <Button
                onClick={handleManualDownload}
                size="sm"
                className="gap-2 shrink-0"
              >
                <Download className="h-4 w-4" />
                {t("download_word")}
              </Button>
            </div>
          </div>
        )}

        {hasFiles && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{tp("uploaded_files")}</h4>
              <span className="text-sm text-gray-500">{files.length} {tp("file_s")}</span>
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

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            onClick={handleConvert}
            disabled={!hasFiles || isLoading}
            className="flex-1 gap-2"
          >
            {isLoading ? (
              <>
                <ButtonLoader />
                {t("converting")}
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                {t("convert_button")}
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
              {tp("clear_button")}
            </Button>
          )}
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800">
              <FileText className="h-3 w-3 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <h4 className="font-medium mb-1">{t("feature_accurate")}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("feature_formatting_desc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}