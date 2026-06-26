"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ToolLayout } from "@/components/tools/tool-layout";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { FileText, Download, Sparkles, Trash2, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useToolProcessing } from "@/hooks/use-tool-processing";
import { triggerDownload } from "@/lib/download-utils";
import { ButtonLoader } from "@/components/brand-loader";

interface ConversionResult {
  url: string;
  filename: string;
  blob: Blob;
}

export function ExcelToPDFClient() {
  const t = useTranslations("excel_to_pdf");
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
    toolName: "excel-to-pdf",
    endpoint: '/api/excel-to-pdf',
    autoClearFiles: true,
    onSuccess: handleSuccess,
  });

  const handleFileUpload = (uploadedFiles: File[]) => {
    console.log(`[ExcelToPDF] Files uploaded: ${uploadedFiles.length} files`);
    setLastResult(null);
    toast.success(`${uploadedFiles.length} ${tp("file_s")} ${tp("uploaded_toast")}`);
  };

  const handleConvert = async () => {
    console.log(`[ExcelToPDF] Starting conversion with ${files.length} files`);
    setLastResult(null);
    await processFiles();
  };

  const handleClearFiles = () => {
    console.log(`[ExcelToPDF] Manually clearing files`);
    clearAllFiles();
    setLastResult(null);
    toast.info(tp("files_cleared"));
  };

  const handleManualDownload = () => {
    if (!lastResult) return;
    console.log(`[ExcelToPDF] Manual download: filename="${lastResult.filename}", blob=${lastResult.blob.size} bytes`);

    let downloadName = lastResult.filename;
    if (!downloadName.toLowerCase().endsWith('.pdf')) {
      downloadName = downloadName.replace(/\.\w+$/, '') + '.pdf';
      console.log(`[ExcelToPDF] Fixed extension → "${downloadName}"`);
    }

    triggerDownload(lastResult.blob, downloadName);
    toast.success(t("downloading_file", { filename: downloadName }));
  };

  const removeFile = (index: number) => {
    toast.info(tp("file_removed"));
  };

  const formatErrorMessage = (rawError: string | null): string => {
    if (!rawError) return "";
    if (rawError.includes("Traceback") || rawError.includes('File "') || rawError.includes("line ")) {
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
      toolKey="excel_to_pdf"
      seoContent={{
        h1: "Convert Excel to PDF Online Free",
        h2: "How to Convert Excel to PDF",
        content: `
          <p>Our free Excel to PDF converter allows you to transform any Microsoft Excel spreadsheet (.xlsx, .xls) into a professional PDF file while preserving tables, formatting, and sheet structure.</p>
          <p><strong>Key features:</strong></p>
          <ul>
            <li>Convert Excel to PDF with perfect table rendering</li>
            <li>Preserve table structure, formatting, and data</li>
            <li>Support for multi-sheet Excel workbooks</li>
            <li>Professional PDF layout with headers and styling</li>
            <li>Automatic page orientation (portrait/landscape)</li>
            <li>Secure processing with automatic file deletion</li>
            <li>No registration or watermarks</li>
            <li>100% free to use</li>
          </ul>
          <p>Perfect for sharing reports, financial statements, invoices, or any spreadsheet data in a universal, print-ready PDF format.</p>
        `,
        faq: [
          {
            question: "Is Excel to PDF conversion free?",
            answer: "Yes, our Excel to PDF converter is completely free with no hidden charges. You can convert unlimited files without registration."
          },
          {
            question: "Does it support multiple sheets?",
            answer: "Yes! Our converter processes all sheets in your Excel workbook. Each sheet is rendered on separate pages in the PDF with clear sheet titles."
          },
          {
            question: "What Excel formats are supported?",
            answer: "We support both .xlsx (Excel 2007+) and .xls (Excel 97-2003) formats. Both work perfectly with our converter."
          },
          {
            question: "Does it preserve formatting?",
            answer: "Yes, our converter maintains table structure, column widths, and applies professional styling with colored headers and alternating row colors for readability."
          },
          {
            question: "What about large spreadsheets?",
            answer: "The converter automatically adjusts the page orientation to landscape for spreadsheets with many columns, ensuring your data fits properly on the page."
          },
          {
            question: "Is my data secure?",
            answer: "Absolutely. All files are processed securely and are automatically deleted from our servers after processing. Your data is never stored or shared."
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
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
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
                {t("download_pdf")}
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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                    <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
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

        <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
              <FileText className="h-3 w-3 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <h4 className="font-medium mb-1">{t("feature_formatting")}</h4>
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