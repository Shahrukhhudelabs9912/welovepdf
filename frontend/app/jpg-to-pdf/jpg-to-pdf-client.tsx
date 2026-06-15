"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { Image, Download, FileImage, Settings, X, Check } from "lucide-react";
import { toast } from "sonner";
import { processFiles } from "@/lib/api-client";
import { useFileContext } from "@/lib/file-context";

export function JPGToPDFClient() {
  const t = useTranslations("jpg_to_pdf");
  const tp = useTranslations("tool_pages");
  const { clearFiles: clearGlobalFiles } = useFileContext();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'legal'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<'small' | 'medium' | 'large'>('medium');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFileUpload = useCallback((uploadedFiles: File[]) => {
    if (uploadedFiles.length > 0) {
      setFiles(uploadedFiles);
      toast.success(t("added_files_toast", { count: uploadedFiles.length }));
    }
  }, [t]);

  const handleAddMoreFiles = useCallback(() => {
    // This will trigger the file input click via FileUpload component
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    toast.info(tp("file_removed"));
  }, [tp]);

  const handleConvertToPDF = async () => {
    if (files.length === 0) {
      toast.error(t("upload_images_first"));
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Prepare additional data
      const additionalData: Record<string, string | number> = {
        page_size: pageSize,
        orientation: orientation,
        margin: margin
      };

      // Process the files with progress callbacks
      const success = await processFiles(
        'jpg-to-pdf',
        files,
        additionalData,
        (filename) => {
          // Success callback
          setProgress(100);
          setIsProcessing(false);
          // Clear uploaded files after successful processing
          setFiles([]);
          clearGlobalFiles();
        },
        (error) => {
          // Error callback
          setIsProcessing(false);
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
      console.error("Error converting images to PDF:", error);
      toast.error(t("conversion_failed"));
      setIsProcessing(false);
    }
  };

  const handleSampleOutput = () => {
    toast.info(t("sample_output_toast"));
    // In a real implementation, this would trigger a sample download
  };

  return (
    <div className="space-y-8">
      {/* File Upload Section */}
      <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 dark:border-gray-700">
        <FileUpload
          onUpload={handleFileUpload}
          onAddMore={handleAddMoreFiles}
          accept="image/jpeg,image/png,image/gif,image/webp"
          maxSize={50 * 1024 * 1024} // 50MB
          showProcessButton={false} // We have our own Convert to PDF button
        />

        {files.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">{t("uploaded_images_title")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file, index) => (
                <div key={index} className="relative rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800 overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 shrink-0 rounded border border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-700 flex items-center justify-center">
                      <Image className="h-8 w-8 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate" title={file.name}>{file.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB
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
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {t("page_in_pdf", { n: index + 1 })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Image className="h-4 w-4 text-primary" />
              <h3 className="font-medium">{t("feature_formats_title")}</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("feature_formats_desc")}
            </p>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileImage className="h-4 w-4 text-primary" />
              <h3 className="font-medium">{t("feature_combine_title")}</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("feature_combine_desc")}
            </p>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-4 w-4 text-primary" />
              <h3 className="font-medium">{t("feature_instant_title")}</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("feature_instant_desc")}
            </p>
          </div>
        </div>
      </div>

      {/* PDF Settings */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">{t("pdf_settings")}</h3>
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
          {/* Page Size */}
          <div>
            <label className="block text-sm font-medium mb-3">{t("page_size")}</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant={pageSize === 'a4' ? 'default' : 'outline'}
                className="justify-center"
                onClick={() => setPageSize('a4')}
              >
                <Check className={`h-4 w-4 mr-2 ${pageSize === 'a4' ? 'opacity-100' : 'opacity-0'}`} />
                {t("a4_international")}
              </Button>
              <Button
                variant={pageSize === 'letter' ? 'default' : 'outline'}
                className="justify-center"
                onClick={() => setPageSize('letter')}
              >
                <Check className={`h-4 w-4 mr-2 ${pageSize === 'letter' ? 'opacity-100' : 'opacity-0'}`} />
                {t("letter_us")}
              </Button>
              <Button
                variant={pageSize === 'legal' ? 'default' : 'outline'}
                className="justify-center"
                onClick={() => setPageSize('legal')}
              >
                <Check className={`h-4 w-4 mr-2 ${pageSize === 'legal' ? 'opacity-100' : 'opacity-0'}`} />
                {t("legal")}
              </Button>
            </div>
          </div>

          {/* Orientation */}
          <div>
            <label className="block text-sm font-medium mb-3">{t("orientation")}</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant={orientation === 'portrait' ? 'default' : 'outline'}
                className="justify-center"
                onClick={() => setOrientation('portrait')}
              >
                <Check className={`h-4 w-4 mr-2 ${orientation === 'portrait' ? 'opacity-100' : 'opacity-0'}`} />
                {t("portrait")}
              </Button>
              <Button
                variant={orientation === 'landscape' ? 'default' : 'outline'}
                className="justify-center"
                onClick={() => setOrientation('landscape')}
              >
                <Check className={`h-4 w-4 mr-2 ${orientation === 'landscape' ? 'opacity-100' : 'opacity-0'}`} />
                {t("landscape")}
              </Button>
            </div>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-4">
              <h4 className="font-medium">{t("advanced_settings")}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t("margin_size")}</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="margin-small"
                        name="margin"
                        checked={margin === 'small'}
                        onChange={() => setMargin('small')}
                        className="rounded"
                      />
                      <label htmlFor="margin-small" className="text-sm">{t("small_5mm")}</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="margin-medium"
                        name="margin"
                        checked={margin === 'medium'}
                        onChange={() => setMargin('medium')}
                        className="rounded"
                      />
                      <label htmlFor="margin-medium" className="text-sm">{t("medium_10mm_recommended")}</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="margin-large"
                        name="margin"
                        checked={margin === 'large'}
                        onChange={() => setMargin('large')}
                        className="rounded"
                      />
                      <label htmlFor="margin-large" className="text-sm">{t("large_20mm")}</label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("image_fit")}</label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
                    <option>{t("fit_to_page")}</option>
                    <option>{t("stretch_to_fill")}</option>
                    <option>{t("center_on_page")}</option>
                  </select>
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
          onClick={handleConvertToPDF}
          disabled={files.length === 0 || isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {t("converting")}
            </>
          ) : (
            <>
              <Image className="h-4 w-4" />
              {t("convert_to_pdf_now")}
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
            <span>{t("tips_high_res")}</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <span>{t("tips_portrait")}</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <span>{t("tips_drag_drop")}</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <span>{t("tips_auto_delete")}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}