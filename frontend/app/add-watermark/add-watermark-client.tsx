"use client";

import { useState, useCallback, useEffect } from "react";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { Stamp, Text, Settings, Download, RotateCw, Eye, EyeOff, X, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import { processFiles } from "@/lib/api-client";

// We'll use a simple iframe for PDF preview instead of react-pdf to avoid SSR issues

type WatermarkPosition = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "diagonal";

export function AddWatermarkClient() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [watermarkText, setWatermarkText] = useState("We Love PDF");
  const [position, setPosition] = useState<WatermarkPosition>("diagonal");
  const [opacity, setOpacity] = useState(50);
  const [rotation, setRotation] = useState(0);
  const [pages, setPages] = useState<"all" | "first" | "custom">("all");
  const [customPageRange, setCustomPageRange] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(36); // Default: Large (36pt)
  const [color, setColor] = useState<string>("#808080"); // Default: Gray (#808080)

  // Clean up object URLs on component unmount
  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  const handleFileUpload = useCallback((uploadedFiles: File[]) => {
    // Clean up previous preview URL
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
    }
    
    setFiles(uploadedFiles);
    setPdfError(null);
    setNumPages(null);
    setPageNumber(1);
    
    if (uploadedFiles.length > 0) {
      toast.success(`Uploaded ${uploadedFiles.length} PDF file(s)`);
      
      // Create object URL for preview (use first file)
      const file = uploadedFiles[0];
      if (file.type === 'application/pdf') {
        const url = URL.createObjectURL(file);
        setPdfPreviewUrl(url);
      } else {
        setPdfError('Please upload a PDF file');
        setPdfPreviewUrl(null);
      }
    } else {
      setPdfPreviewUrl(null);
    }
  }, [pdfPreviewUrl]);

  // Simple PDF preview using iframe - we can't get page count without react-pdf
  // For now, we'll assume single page preview
  const handleIframeLoad = () => {
    setPdfError(null);
  };

  const handleIframeError = () => {
    setPdfError('Failed to load PDF preview');
  };

  const handleClearAll = () => {
    setFiles([]);
    setWatermarkText("We Love PDF");
    setPosition("center");
    setOpacity(50);
    setRotation(0);
    setFontSize(36);
    setColor("#808080");
    setPages("all");
    setCustomPageRange("");
    setShowAdvanced(false);
    setLoading(false);
    setProgress(0);
    
    // Clean up preview URL
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
    }
    setPdfPreviewUrl(null);
    setNumPages(null);
    setPageNumber(1);
    setPdfError(null);
    
    toast.info("All fields cleared");
  };

  const handleAddWatermark = async () => {
    if (files.length === 0) {
      toast.error("Please upload a PDF file first");
      return;
    }

    if (!watermarkText.trim()) {
      toast.error("Please enter watermark text");
      return;
    }

    console.log("PDF uploaded, starting watermark process");
    console.log("Watermark settings:", {
      text: watermarkText,
      position,
      opacity,
      rotation,
      pages,
      customPageRange
    });

    setLoading(true);
    setProgress(0);
    try {
      // Prepare additional data for the API
      const additionalData: Record<string, string | number> = {
        watermark_type: "text",
        watermark_text: watermarkText,
        position: position,
        opacity: opacity,
        rotation: rotation,
        pages: pages,
        font_size: fontSize,
        color: color,
      };

      if (pages === "custom" && customPageRange) {
        additionalData.custom_page_range = customPageRange;
      }

      console.log("Watermark settings with advanced options:", {
        text: watermarkText,
        position,
        opacity,
        rotation,
        pages,
        customPageRange,
        fontSize,
        color
      });

      // Use standard processFiles for text watermark
      const success = await processFiles(
        'add-watermark',
        files,
        additionalData,
        (filename) => {
          // Success callback
          setProgress(100);
          setLoading(false);
          toast.success("Watermark added successfully!");
        },
        (error) => {
          // Error callback
          setLoading(false);
          toast.error("Failed to add watermark. Please try again.");
        },
        (progress) => {
          // Progress callback
          setProgress(progress);
        }
      );
      
      if (!success) {
        setLoading(false);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
      setLoading(false);
    }
  };

  const positions: { value: WatermarkPosition; label: string }[] = [
    { value: "diagonal", label: "Diagonal (Repeated)" },
    { value: "center", label: "Center" },
    { value: "top-left", label: "Top Left" },
    { value: "top-right", label: "Top Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-right", label: "Bottom Right" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Upload PDF</h3>
          <FileUpload
            accept="application/pdf"
            multiple={true}
            maxSize={100 * 1024 * 1024}
            onUpload={handleFileUpload}
          />
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-6">Watermark Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Text Watermark</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="Enter watermark text (e.g., We Love PDF)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Position</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as WatermarkPosition)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {positions.map((pos) => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Opacity: {opacity}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(parseInt(e.target.value))}
                  className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Faint</span>
                  <span>Normal</span>
                  <span>Bold</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Rotation: {rotation}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0°</span>
                  <span>45°</span>
                  <span>90°</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Pages</label>
                <div className="flex gap-2">
                  <Button
                    variant={pages === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPages("all")}
                    disabled={loading}
                  >
                    All Pages
                  </Button>
                  <Button
                    variant={pages === "first" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPages("first")}
                    disabled={loading}
                  >
                    First Page
                  </Button>
                  <Button
                    variant={pages === "custom" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPages("custom")}
                    disabled={loading}
                  >
                    Custom Range
                  </Button>
                </div>
                {pages === "custom" && (
                  <input
                    type="text"
                    value={customPageRange}
                    onChange={(e) => setCustomPageRange(e.target.value)}
                    placeholder="e.g., 1-5, 7, 10-12"
                    disabled={loading}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setShowAdvanced(!showAdvanced)}
              disabled={loading}
            >
              {showAdvanced ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showAdvanced ? "Hide Advanced Settings" : "Show Advanced Settings"}
            </Button>

            {showAdvanced && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Font Size: {fontSize}pt</label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value={12}>Small (12pt)</option>
                    <option value={24}>Medium (24pt)</option>
                    <option value={36}>Large (36pt)</option>
                    <option value={48}>Extra Large (48pt)</option>
                    <option value={60}>Huge (60pt)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Color: {color}</label>
                  <div className="flex gap-2">
                    <div
                      className={`w-8 h-8 rounded-full bg-red-500 cursor-pointer border-2 ${color === "#FF0000" ? "border-blue-500" : "border-gray-300"} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={loading ? undefined : () => setColor("#FF0000")}
                      title="Red"
                    />
                    <div
                      className={`w-8 h-8 rounded-full bg-blue-500 cursor-pointer border-2 ${color === "#0000FF" ? "border-blue-500" : "border-gray-300"} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={loading ? undefined : () => setColor("#0000FF")}
                      title="Blue"
                    />
                    <div
                      className={`w-8 h-8 rounded-full bg-gray-500 cursor-pointer border-2 ${color === "#808080" ? "border-blue-500" : "border-gray-300"} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={loading ? undefined : () => setColor("#808080")}
                      title="Gray"
                    />
                    <div
                      className={`w-8 h-8 rounded-full bg-black cursor-pointer border-2 ${color === "#000000" ? "border-blue-500" : "border-gray-300"} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={loading ? undefined : () => setColor("#000000")}
                      title="Black"
                    />
                    <div
                      className={`w-8 h-8 rounded-full bg-green-500 cursor-pointer border-2 ${color === "#00FF00" ? "border-blue-500" : "border-gray-300"} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={loading ? undefined : () => setColor("#00FF00")}
                      title="Green"
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Click to select color
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Preview</h3>
            {pdfPreviewUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={loading ? undefined : () => setShowPreviewModal(true)}
                disabled={loading}
              >
                <ZoomIn className="h-4 w-4" />
                Zoom
              </Button>
            )}
          </div>
          
          <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
            {pdfPreviewUrl ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                {pdfError ? (
                  <div className="text-center">
                    <Stamp className="h-12 w-12 mx-auto text-red-400 mb-2" />
                    <p className="text-sm text-red-500">{pdfError}</p>
                  </div>
                ) : (
                  <>
                    <div className="relative w-full h-full border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden bg-white">
                      {loading ? (
                        <div className="flex items-center justify-center h-full">
                          <RotateCw className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                      ) : (
                        <iframe
                          src={pdfPreviewUrl || undefined}
                          className="w-full h-full"
                          title="PDF Preview"
                          onLoad={handleIframeLoad}
                          onError={handleIframeError}
                        />
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center">
                <Stamp className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  {files.length > 0
                    ? `Ready to add text watermark to ${files.length} PDF(s)`
                    : "Upload a PDF to preview"}
                </p>
                {watermarkText && (
                  <div className="mt-4 p-4 bg-white/80 dark:bg-gray-900/80 rounded-lg">
                    <p className="text-lg font-semibold opacity-70 rotate-6">{watermarkText}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {watermarkText && pdfPreviewUrl && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Preview will show "{watermarkText}" watermark at {position} position with {opacity}% opacity
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {loading && (
        <div className="mt-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Processing...</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Adding watermark to your PDF file...
          </p>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-4 lg:col-span-3">
        <Button
          size="lg"
          className="flex-1 gap-2"
          onClick={handleAddWatermark}
          disabled={loading || files.length === 0}
        >
          {loading ? (
            <>
              <RotateCw className="h-4 w-4 animate-spin" />
              Adding Watermark...
            </>
          ) : (
            "Add Watermark to PDF"
          )}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="gap-2"
          onClick={handleClearAll}
          disabled={loading}
        >
          Clear All
        </Button>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && pdfPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-semibold">PDF Preview - Zoom View</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={loading ? undefined : () => setShowPreviewModal(false)}
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 overflow-auto max-h-[70vh]">
              <div className="flex flex-col items-center">
                {pdfError ? (
                  <div className="text-center py-8">
                    <Stamp className="h-16 w-16 mx-auto text-red-400 mb-4" />
                    <p className="text-lg text-red-500">{pdfError}</p>
                  </div>
                ) : (
                  <>
                    <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white p-2">
                      {loading ? (
                        <div className="flex items-center justify-center h-64">
                          <RotateCw className="h-12 w-12 animate-spin text-gray-400" />
                        </div>
                      ) : (
                        <iframe
                          src={pdfPreviewUrl || undefined}
                          className="w-full h-96"
                          title="PDF Preview"
                          onLoad={handleIframeLoad}
                          onError={handleIframeError}
                        />
                      )}
                    </div>
                    
                    
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg w-full">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Watermark Preview:</strong> "{watermarkText}" will be added at <strong>{position}</strong> position with <strong>{opacity}%</strong> opacity and <strong>{rotation}°</strong> rotation.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <Button
                onClick={loading ? undefined : () => setShowPreviewModal(false)}
                disabled={loading}
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}