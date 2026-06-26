"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { Scissors, Download, Settings, File, X, Check } from "lucide-react";
import { toast } from "sonner";
import { processFiles } from "@/lib/api-client";
import { useFileContext } from "@/lib/file-context";
import { ButtonLoader } from "@/components/brand-loader";

export function SplitPDFClient() {
  const t = useTranslations("split_pdf");
  const tp = useTranslations("tool_pages");
  const { clearFiles: clearGlobalFiles } = useFileContext();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [splitMode, setSplitMode] = useState<'range' | 'every' | 'pages'>('range');
  const [pageRange, setPageRange] = useState("1-5");
  const [everyPages, setEveryPages] = useState(2);
  const [specificPages, setSpecificPages] = useState("1,3,5");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'individual' | 'single'>('individual');
  const [namingPattern, setNamingPattern] = useState("page_{n}.pdf");

  const handleFileUpload = useCallback((uploadedFiles: File[]) => {
    if (uploadedFiles.length > 0) {
      setFiles(uploadedFiles);
      toast.success(t("added_files_toast", { count: uploadedFiles.length }));
    }
  }, [t]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    toast.info(tp("file_removed"));
  }, [tp]);

  const handleSplitPDF = async () => {
    if (files.length === 0) {
      toast.error(t("upload_pdf_first"));
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Prepare additional data based on split mode
      const additionalData: Record<string, string | number> = {};
      additionalData.split_method = splitMode;
      additionalData.output_format = outputFormat;
      additionalData.naming_pattern = namingPattern;
      
      if (splitMode === 'range') {
        additionalData.page_range = pageRange;
      } else if (splitMode === 'every') {
        additionalData.pages_per_split = everyPages;
      } else if (splitMode === 'pages') {
        additionalData.specific_pages = specificPages;
      }

      // Process the file with progress callbacks
      const success = await processFiles(
        'split-pdf',
        files,
        additionalData,
        (filename) => {
          // Success callback
          setProgress(100);
          setIsProcessing(false);
          toast.success(t("split_success"));
          // Clear uploaded files after successful processing
          setFiles([]);
          clearGlobalFiles();
        },
        (error) => {
          // Error callback
          setIsProcessing(false);
          toast.error(t("split_failed"));
        },
        (progress) => {
          // Progress callback
          setProgress(progress);
        }
      );
      
      if (!success) {
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error splitting PDF:", error);
      toast.error(t("split_failed"));
      setIsProcessing(false);
    }
  };

  const handleSampleOutput = () => {
    toast.info(t("sample_output"));
    // In a real implementation, this would trigger a sample download
  };

  const rangeHelp = t("page_range_help");
  const pagesHelp = t("specific_pages_help");
  const everyDesc = t("split_every_n_desc", { pages: everyPages });
  const namingHelp = t("naming_help");

  return (
    <div className="space-y-8">
      {/* File Upload Section */}
      <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 dark:border-gray-700">
        <FileUpload
          onUpload={handleFileUpload}
          accept="application/pdf"
          maxSize={100 * 1024 * 1024} // 100MB
        />

        {files.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">{tp("uploaded_files")}</h3>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800 overflow-hidden">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <File className="h-5 w-5 shrink-0 text-gray-500" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate" title={file.name}>{file.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  className="h-8 w-8 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-primary" />
              <h3 className="font-medium">{t("features_split_title")}</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("features_split_desc")}
            </p>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Scissors className="h-4 w-4 text-primary" />
              <h3 className="font-medium">{t("features_fast_title")}</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("features_fast_desc")}
            </p>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-4 w-4 text-primary" />
              <h3 className="font-medium">{t("features_download_title")}</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("features_download_desc")}
            </p>
          </div>
        </div>
      </div>

      {/* Split Options */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">{t("split_options_title")}</h3>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings className="h-4 w-4" />
            {showAdvanced ? t("hide_advanced") : t("advanced_settings")}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Split Mode Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">{t("split_method")}</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant={splitMode === 'range' ? 'default' : 'outline'}
                className="justify-center"
                onClick={() => setSplitMode('range')}
              >
                <Check className={`h-4 w-4 mr-2 ${splitMode === 'range' ? 'opacity-100' : 'opacity-0'}`} />
                {t("page_range")}
              </Button>
              <Button
                variant={splitMode === 'every' ? 'default' : 'outline'}
                className="justify-center"
                onClick={() => setSplitMode('every')}
              >
                <Check className={`h-4 w-4 mr-2 ${splitMode === 'every' ? 'opacity-100' : 'opacity-0'}`} />
                {t("every_n_pages")}
              </Button>
              <Button
                variant={splitMode === 'pages' ? 'default' : 'outline'}
                className="justify-center"
                onClick={() => setSplitMode('pages')}
              >
                <Check className={`h-4 w-4 mr-2 ${splitMode === 'pages' ? 'opacity-100' : 'opacity-0'}`} />
                {t("specific_pages")}
              </Button>
            </div>
          </div>

          {/* Split Configuration */}
          <div className="space-y-4">
            {splitMode === 'range' && (
              <div>
                <label className="block text-sm font-medium mb-2">{t("page_range")}</label>
                <input
                  type="text"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder={t("page_range_placeholder")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {rangeHelp}
                </p>
              </div>
            )}

            {splitMode === 'every' && (
              <div>
                <label className="block text-sm font-medium mb-2">{t("split_every_n_label")}</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={everyPages}
                    onChange={(e) => setEveryPages(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-lg font-semibold">{everyPages} {t("pages_unit")}</span>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {everyDesc}
                </p>
              </div>
            )}

            {splitMode === 'pages' && (
              <div>
                <label className="block text-sm font-medium mb-2">{t("specific_pages")}</label>
                <input
                  type="text"
                  value={specificPages}
                  onChange={(e) => setSpecificPages(e.target.value)}
                  placeholder={t("specific_pages_placeholder")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {pagesHelp}
                </p>
              </div>
            )}
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-4">
              <h4 className="font-medium">{t("advanced_settings")}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t("output_format")}</label>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value as 'individual' | 'single')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="individual">{t("output_individual_zip")}</option>
                    <option value="single">{t("output_single")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("naming_pattern")}</label>
                  <input
                    type="text"
                    value={namingPattern}
                    onChange={(e) => setNamingPattern(e.target.value)}
                    placeholder={t("naming_placeholder")}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                  />
                  <p className="mt-1 text-xs text-gray-500">{namingHelp}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button 
          size="lg" 
          className="gap-2 flex-1"
          onClick={handleSplitPDF}
          disabled={files.length === 0 || isProcessing}
        >
          {isProcessing ? (
            <>
              <ButtonLoader />
              {t("splitting")}
            </>
          ) : (
            <>
              <Scissors className="h-4 w-4" />
              {t("split_now")}
            </>
          )}
        </Button>
        <Button 
          size="lg" 
          variant="outline" 
          className="gap-2 flex-1"
          onClick={handleSampleOutput}
        >
          <Download className="h-4 w-4" />
          {t("sample_output")}
        </Button>
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-lg font-semibold">{t("tips_title")}</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <span>{t("tips_chunks")}</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <span>{t("tips_ranges")}</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <span>{t("tips_auto_delete")}</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <span>{t("tips_commas")}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}