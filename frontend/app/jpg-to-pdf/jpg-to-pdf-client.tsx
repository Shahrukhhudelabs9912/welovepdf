"use client";

import { useState, useCallback } from "react";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { Image, Download, FileImage, Settings, X, Check } from "lucide-react";
import { toast } from "sonner";
import { processFiles } from "@/lib/api-client";

export function JPGToPDFClient() {
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
      toast.success(`Added ${uploadedFiles.length} image file(s)`);
    }
  }, []);

  const handleAddMoreFiles = useCallback(() => {
    // This will trigger the file input click via FileUpload component
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    toast.info("File removed");
  }, []);

  const handleConvertToPDF = async () => {
    if (files.length === 0) {
      toast.error("Please upload image files first");
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
      toast.error("Failed to convert images to PDF");
      setIsProcessing(false);
    }
  };

  const handleSampleOutput = () => {
    toast.info("Sample output feature would download a demo PDF file");
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
            <h3 className="text-lg font-semibold">Uploaded Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file, index) => (
                <div key={index} className="relative rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 rounded border border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-700 flex items-center justify-center">
                      <Image className="h-8 w-8 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Page {index + 1} in PDF
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
              <h3 className="font-medium">Multiple Formats</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Convert JPG, PNG, GIF, WebP, and other image formats to high-quality PDF files.
            </p>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileImage className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Combine Images</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Combine multiple images into a single PDF document with customizable page order.
            </p>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Download Instantly</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Download converted PDF files immediately after processing. All files are automatically deleted after 1 hour.
            </p>
          </div>
        </div>
      </div>

      {/* PDF Settings */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">PDF Settings</h3>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings className="h-4 w-4" />
            {showAdvanced ? "Hide Advanced" : "Advanced Settings"}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Page Size */}
          <div>
            <label className="block text-sm font-medium mb-3">Page Size</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant={pageSize === 'a4' ? 'default' : 'outline'}
                className="justify-center"
                onClick={() => setPageSize('a4')}
              >
                <Check className={`h-4 w-4 mr-2 ${pageSize === 'a4' ? 'opacity-100' : 'opacity-0'}`} />
                A4 (International)
              </Button>
              <Button
                variant={pageSize === 'letter' ? 'default' : 'outline'}
                className="justify-center"
                onClick={() => setPageSize('letter')}
              >
                <Check className={`h-4 w-4 mr-2 ${pageSize === 'letter' ? 'opacity-100' : 'opacity-0'}`} />
                Letter (US)
              </Button>
              <Button
                variant={pageSize === 'legal' ? 'default' : 'outline'}
                className="justify-center"
                onClick={() => setPageSize('legal')}
              >
                <Check className={`h-4 w-4 mr-2 ${pageSize === 'legal' ? 'opacity-100' : 'opacity-0'}`} />
                Legal
              </Button>
            </div>
          </div>

          {/* Orientation */}
          <div>
            <label className="block text-sm font-medium mb-3">Orientation</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant={orientation === 'portrait' ? 'default' : 'outline'}
                className="justify-center"
                onClick={() => setOrientation('portrait')}
              >
                <Check className={`h-4 w-4 mr-2 ${orientation === 'portrait' ? 'opacity-100' : 'opacity-0'}`} />
                Portrait
              </Button>
              <Button
                variant={orientation === 'landscape' ? 'default' : 'outline'}
                className="justify-center"
                onClick={() => setOrientation('landscape')}
              >
                <Check className={`h-4 w-4 mr-2 ${orientation === 'landscape' ? 'opacity-100' : 'opacity-0'}`} />
                Landscape
              </Button>
            </div>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-4">
              <h4 className="font-medium">Advanced Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Margin Size</label>
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
                      <label htmlFor="margin-small" className="text-sm">Small (5mm)</label>
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
                      <label htmlFor="margin-medium" className="text-sm">Medium (10mm) - Recommended</label>
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
                      <label htmlFor="margin-large" className="text-sm">Large (20mm)</label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Image Fit</label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
                    <option>Fit to page (maintain aspect ratio)</option>
                    <option>Stretch to fill page</option>
                    <option>Center on page</option>
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
              Converting...
            </>
          ) : (
            <>
              <Image className="h-4 w-4" />
              Convert to PDF Now
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
          Sample Output
        </Button>
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-lg font-semibold">Tips for Best Results</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <span>For best quality, use high-resolution images (at least 150 DPI)</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <span>Portrait orientation works best for photos taken vertically</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <span>Use drag and drop to rearrange images in the desired order</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <span>Converted PDF files are automatically deleted after 1 hour for security</span>
          </li>
        </ul>
      </div>
    </div>
  );
}