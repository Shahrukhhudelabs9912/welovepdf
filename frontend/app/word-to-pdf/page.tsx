"use client";

import { ToolLayout } from "@/components/tools/tool-layout";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { FileText, Download, Sparkles, Loader2, Trash2, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useToolProcessing } from "@/hooks/use-tool-processing";
import { useState, useEffect } from "react";
export default function WordToPDFPage() {
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
    toolName: "word-to-pdf",
    endpoint: `${process.env.NEXT_PUBLIC_PYTHON_API_BASE || 'http://localhost:8000/api'}/word-to-pdf`,
    autoClearFiles: true,
  });

  const [conversionStatus, setConversionStatus] = useState<'idle' | 'converting' | 'success' | 'error'>('idle');

  const handleFileUpload = (uploadedFiles: File[]) => {
    console.log(`[WordToPDF] Files uploaded: ${uploadedFiles.length} files`);
    toast.success(`Uploaded ${uploadedFiles.length} Word document(s)`);
  };

  const handleConvert = async () => {
    console.log(`[WordToPDF] Starting conversion with ${files.length} files`);
    setConversionStatus('converting');
    
    try {
      await processFiles();
      setConversionStatus('success');
      toast.success("Word document converted to PDF successfully!");
    } catch (err) {
      setConversionStatus('error');
      console.error("[WordToPDF] Conversion failed:", err);
      toast.error("Failed to convert Word to PDF. Please try again.");
    }
  };

  const handleClearFiles = () => {
    console.log(`[WordToPDF] Manually clearing files`);
    clearAllFiles();
    setConversionStatus('idle');
    toast.info("All files cleared");
  };

  const removeFile = (index: number) => {
    // Note: File removal is handled by the FileUpload component via useFileContext
    toast.info("File removed");
  };

  // Reset conversion status when files change
  useEffect(() => {
    if (files.length === 0) {
      setConversionStatus('idle');
    }
  }, [files]);

  return (
    <ToolLayout
      title="Word to PDF"
      description="Convert Word documents to PDF format while preserving all formatting."
      toolName="Word to PDF"
      toolDescription="Transform your Word documents into professional PDF files. Our converter maintains original formatting, fonts, and layout for perfect conversion every time."
      toolKey="word_to_pdf"
      seoContent={{
        h1: "Convert Word to PDF Online for Free",
        h2: "How to Convert Word to PDF",
        content: `
          <p>Our free Word to PDF converter allows you to transform any Microsoft Word document (.doc, .docx) into a professional PDF file while preserving the original formatting, fonts, and layout.</p>
          <p><strong>Key features:</strong></p>
          <ul>
            <li>Convert Word to PDF with perfect formatting</li>
            <li>Preserve fonts, images, tables, and hyperlinks</li>
            <li>Maintain page layout and margins</li>
            <li>Secure processing with automatic file deletion</li>
            <li>No registration or watermarks</li>
            <li>Support for multiple Word formats (.doc, .docx, .rtf)</li>
          </ul>
          <p>Perfect for creating professional documents, sharing resumes, submitting assignments, or archiving important files in a universal format.</p>
        `,
        faq: [
          {
            question: "Is Word to PDF conversion free?",
            answer: "Yes, our Word to PDF converter is completely free with no hidden charges. You can convert unlimited files without registration."
          },
          {
            question: "What Word formats are supported?",
            answer: "We support .doc, .docx, and .rtf formats. Both older Word 97-2003 documents and modern .docx files work perfectly."
          },
          {
            question: "Does it preserve formatting?",
            answer: "Yes, our converter maintains all original formatting including fonts, images, tables, page layout, and hyperlinks."
          },
          {
            question: "Is my data secure?",
            answer: "Absolutely. All files are processed securely with end-to-end encryption and are automatically deleted from our servers after 1 hour."
          }
        ]
      }}
    >
      <div className="space-y-8">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Upload Word Files</h3>
              <p className="text-gray-600 dark:text-gray-400">Upload one or more Word documents to convert to PDF</p>
            </div>
          </div>

          <FileUpload
            accept=".doc,.docx,.rtf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            maxSize={50 * 1024 * 1024} // 50MB
            onUpload={handleFileUpload}
          />

          {/* File list display */}
          {hasFiles && (
            <div className="mt-6 space-y-3">
              <h4 className="font-medium">Uploaded Files:</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Status indicators */}
          {isLoading && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                <div>
                  <p className="font-medium">Converting to PDF...</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stageMessage || "Processing your Word document"}</p>
                  {progress > 0 && (
                    <div className="mt-2">
                      <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{progress.toFixed(0)}% complete</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {conversionStatus === 'success' && !isLoading && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Conversion Successful!</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your PDF has been downloaded automatically.</p>
                </div>
              </div>
            </div>
          )}

          {conversionStatus === 'error' && !isLoading && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium">Conversion Failed</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{error || "Please try again with a valid Word document."}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-green-500" />
                <span className="font-medium">Perfect Formatting</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Preserves all fonts, images, and layout</p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Multiple Formats</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Supports .doc, .docx, and .rtf files</p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Batch Convert</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Convert multiple Word files at once</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="flex-1 gap-2"
              onClick={handleConvert}
              disabled={!hasFiles || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Convert to PDF
                </>
              )}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="flex-1"
              onClick={handleClearFiles}
              disabled={!hasFiles}
            >
              Clear All Files
            </Button>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-3">💡 Why Convert Word to PDF?</h3>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              <span><strong>Universal Compatibility:</strong> PDFs look the same on all devices and operating systems</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              <span><strong>Professional Appearance:</strong> PDFs maintain formatting and prevent unauthorized editing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              <span><strong>File Size Optimization:</strong> PDFs are often smaller than Word documents with embedded fonts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              <span><strong>Security:</strong> PDFs can be password-protected and have restricted editing permissions</span>
            </li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}