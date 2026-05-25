"use client";

import { useState, useCallback } from "react";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { Scissors, Download, Settings, File, X, Check } from "lucide-react";
import { toast } from "sonner";
import { processFiles } from "@/lib/api-client";

export function SplitPDFClient() {
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
      toast.success(`Added ${uploadedFiles.length} PDF file(s)`);
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    toast.info("File removed");
  }, []);

  const handleSplitPDF = async () => {
    if (files.length === 0) {
      toast.error("Please upload a PDF file first");
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
          toast.success("PDF split successfully!");
        },
        (error) => {
          // Error callback
          setIsProcessing(false);
          toast.error("Failed to split PDF");
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
      toast.error("Failed to split PDF");
      setIsProcessing(false);
    }
  };

  const handleSampleOutput = () => {
    toast.info("Sample output feature would download demo split PDF files");
    // In a real implementation, this would trigger a sample download
  };

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
            <h3 className="text-lg font-semibold">Uploaded Files</h3>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <File className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
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
            ))}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Split Options</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose how to split your PDF: by page ranges, extract pages, or split into equal parts.
            </p>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Scissors className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Fast Processing</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Split PDF files quickly with our optimized processing engine. No waiting in queues.
            </p>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Download Instantly</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Download split PDF files immediately after processing. All files are automatically deleted after 1 hour.
            </p>
          </div>
        </div>
      </div>

      {/* Split Options */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Split Options</h3>
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
          {/* Split Mode Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Split Method</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant={splitMode === 'range' ? 'default' : 'outline'}
                className="justify-center"
                onClick={() => setSplitMode('range')}
              >
                <Check className={`h-4 w-4 mr-2 ${splitMode === 'range' ? 'opacity-100' : 'opacity-0'}`} />
                Page Range
              </Button>
              <Button
                variant={splitMode === 'every' ? 'default' : 'outline'}
                className="justify-center"
                onClick={() => setSplitMode('every')}
              >
                <Check className={`h-4 w-4 mr-2 ${splitMode === 'every' ? 'opacity-100' : 'opacity-0'}`} />
                Every N Pages
              </Button>
              <Button
                variant={splitMode === 'pages' ? 'default' : 'outline'}
                className="justify-center"
                onClick={() => setSplitMode('pages')}
              >
                <Check className={`h-4 w-4 mr-2 ${splitMode === 'pages' ? 'opacity-100' : 'opacity-0'}`} />
                Specific Pages
              </Button>
            </div>
          </div>

          {/* Split Configuration */}
          <div className="space-y-4">
            {splitMode === 'range' && (
              <div>
                <label className="block text-sm font-medium mb-2">Page Range</label>
                <input
                  type="text"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="e.g., 1-5, 8-10, 15"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Enter page ranges like "1-5" or multiple ranges like "1-3, 5-7, 10"
                </p>
              </div>
            )}

            {splitMode === 'every' && (
              <div>
                <label className="block text-sm font-medium mb-2">Split Every N Pages</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={everyPages}
                    onChange={(e) => setEveryPages(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-lg font-semibold">{everyPages} pages</span>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Split the PDF into separate files every {everyPages} pages
                </p>
              </div>
            )}

            {splitMode === 'pages' && (
              <div>
                <label className="block text-sm font-medium mb-2">Specific Pages</label>
                <input
                  type="text"
                  value={specificPages}
                  onChange={(e) => setSpecificPages(e.target.value)}
                  placeholder="e.g., 1,3,5,7-9"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Enter specific page numbers separated by commas, or ranges like "1,3,5-7"
                </p>
              </div>
            )}
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-4">
              <h4 className="font-medium">Advanced Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Output Format</label>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value as 'individual' | 'single')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="individual">Individual PDF files (ZIP)</option>
                    <option value="single">Single PDF file</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Naming Pattern</label>
                  <input
                    type="text"
                    value={namingPattern}
                    onChange={(e) => setNamingPattern(e.target.value)}
                    placeholder="Use {n} for page number"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                  />
                  <p className="mt-1 text-xs text-gray-500">Use {'{n}'} for part number, e.g. "chapter_{'{n}'}.pdf"</p>
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
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Splitting...
            </>
          ) : (
            <>
              <Scissors className="h-4 w-4" />
              Split PDF Now
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
            <span>For large PDFs, consider splitting into smaller chunks for faster processing</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <span>Use page ranges like "1-10" to extract the first 10 pages</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <span>Split files will be automatically deleted after 1 hour for security</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <span>For multiple ranges, use commas: "1-5, 8, 10-12"</span>
          </li>
        </ul>
      </div>
    </div>
  );
}