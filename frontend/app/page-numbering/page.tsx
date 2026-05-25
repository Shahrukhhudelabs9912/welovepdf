"use client";

import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/tools/tool-layout";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToolProcessing } from "@/hooks/use-tool-processing";
import { downloadBlob } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Hash,
  Type,
  Layout,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileText,
} from "lucide-react";

type NumberFormat = "1,2,3" | "I,II,III" | "i,ii,iii" | "A,B,C" | "Page 1" | "1 of 10" | "PAGE-001";
type Position = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
type AlignmentValue = "left" | "center" | "right";
type PageRangeType = "all" | "odd" | "even" | "first" | "custom";
type FontFamilyValue = "Helvetica" | "Courier" | "Times-Roman";

const PAGE_NUMBERING_ENDPOINT = "/api/page-numbering";

const NUMBER_FORMATS: { value: NumberFormat; label: string }[] = [
  { value: "1,2,3", label: "1, 2, 3" },
  { value: "I,II,III", label: "I, II, III" },
  { value: "i,ii,iii", label: "i, ii, iii" },
  { value: "A,B,C", label: "A, B, C" },
  { value: "Page 1", label: "Page 1" },
  { value: "1 of 10", label: "1 of 10" },
  { value: "PAGE-001", label: "PAGE-001" },
];

const POSITIONS: { value: Position; label: string }[] = [
  { value: "top-left", label: "Top Left" },
  { value: "top-center", label: "Top Center" },
  { value: "top-right", label: "Top Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-center", label: "Bottom Center" },
  { value: "bottom-right", label: "Bottom Right" },
];

const PAGE_RANGES: { value: PageRangeType; label: string }[] = [
  { value: "all", label: "All Pages" },
  { value: "odd", label: "Odd Pages Only" },
  { value: "even", label: "Even Pages Only" },
  { value: "first", label: "First Page Only" },
  { value: "custom", label: "Custom Range" },
];

export default function PageNumberingPage() {
  const [numberFormat, setNumberFormat] = useState<NumberFormat>("1,2,3");
  const [startingNumber, setStartingNumber] = useState(1);
  const [formatTemplate, setFormatTemplate] = useState("{n}");
  const [position, setPosition] = useState<Position>("bottom-center");
  const [alignment, setAlignment] = useState<AlignmentValue>("center");
  const [pageRangeType, setPageRangeType] = useState<PageRangeType>("all");
  const [customRangeValue, setCustomRangeValue] = useState("");
  const [fontSize, setFontSize] = useState(12);
  const [fontColor, setFontColor] = useState("#000000");
  const [fontFamily, setFontFamily] = useState<FontFamilyValue>("Helvetica");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [numberedBlob, setNumberedBlob] = useState<Blob | null>(null);
  const [numberedFilename, setNumberedFilename] = useState<string>("");

  const {
    files,
    isLoading,
    progress,
    stage,
    stageMessage,
    error,
    processFiles,
    reset,
    clearAllFiles,
    hasFiles,
  } = useToolProcessing({
    toolName: "Page Numbering",
    endpoint: PAGE_NUMBERING_ENDPOINT,
    autoClearFiles: false,
    onSuccess: (result) => {
      if (result?.blob) {
        setNumberedBlob(result.blob);
        setNumberedFilename(result.filename || "numbered.pdf");
        // Auto-download
        const downloadSuccess = downloadBlob(result.blob, result.filename || "numbered.pdf");
        if (!downloadSuccess) {
          toast.error("Download failed. Please use the manual download button.");
        }
      }
    },
  });

  const handleFileUpload = useCallback(
    (_uploadedFiles: File[]) => {
      // Files are managed by useToolProcessing via FileContext; reset local state only
      setNumberedBlob(null);
      setNumberedFilename("");
      reset();
    },
    [reset]
  );

  const isNumbered = !isLoading && numberedBlob !== null;
  const isValid = hasFiles && !isLoading;

  const getPageRange = (): string => {
    if (pageRangeType === "custom") {
      return customRangeValue.trim() || "all";
    }
    return pageRangeType;
  };

  const handleAddPageNumbers = async () => {
    if (!isValid) return;
    setNumberedBlob(null);
    setNumberedFilename("");

    await processFiles({
      number_format: numberFormat,
      starting_number: startingNumber,
      format_template: formatTemplate,
      position: position,
      alignment: alignment,
      page_range: getPageRange(),
      font_size: fontSize,
      font_color: fontColor,
      font_family: fontFamily,
      prefix: prefix,
      suffix: suffix,
    });
  };

  const handleManualDownload = () => {
    if (numberedBlob) {
      downloadBlob(numberedBlob, numberedFilename || "numbered.pdf");
    }
  };

  const handleReset = () => {
    reset();
    setNumberedBlob(null);
    setNumberedFilename("");
  };

  return (
    <ToolLayout
      title="Add Page Numbers to PDF"
      description="Add professional page numbers to your PDF documents with full customization options."
      toolName="Page Numbering"
      toolDescription="Easily add page numbers to your PDF files with complete control over appearance and placement. Choose from various formats, fonts, sizes, and positions to create perfectly numbered documents for reports, theses, manuals, or presentations."
      toolKey="page_numbering"
      seoContent={{
        h1: "Add Page Numbers to PDF Online for Free",
        h2: "How to Add Page Numbers to PDF",
        content: `
          <p>Our free PDF page numbering tool allows you to add professional page numbers to your documents quickly and easily. Whether you need simple numeric pagination, Roman numerals, or custom formats like "Page X of Y", our tool handles it all.</p>
          <p><strong>Key features:</strong></p>
          <ul>
            <li>Multiple number formats: 1, 2, 3... or i, ii, iii... or A, B, C...</li>
            <li>Custom starting page number</li>
            <li>Control which pages get numbered (all, odd, even, specific ranges)</li>
            <li>Choose position: top/bottom, left/center/right</li>
            <li>Customize font, size, color, and style</li>
            <li>Add prefixes/suffixes (e.g., "Page 1 of 10")</li>
            <li>Preview changes before applying</li>
            <li>Secure processing with automatic file deletion</li>
          </ul>
          <p>Perfect for academic papers, business reports, legal documents, manuals, and any document requiring professional pagination.</p>
        `,
        faq: [
          {
            question: "Can I skip the first page or title page?",
            answer: "Yes! You can specify which pages should be numbered. Common setups include skipping the cover page, starting numbering from page 2 or 3, or using Roman numerals for front matter.",
          },
          {
            question: "What number formats are available?",
            answer: "We support Arabic numerals (1, 2, 3), Roman numerals (I, II, III, i, ii, iii), alphabetic (A, B, C), and custom formats. You can also add prefixes like 'Page' or suffixes like 'of 50'.",
          },
          {
            question: "Can I add page numbers to multiple PDFs at once?",
            answer: "Yes, you can upload multiple PDF files and apply the same page numbering settings to all of them simultaneously, saving you time on batch processing.",
          },
          {
            question: "Will adding page numbers affect my document's layout?",
            answer: "No, page numbers are added as a separate layer and don't interfere with your existing content. The tool automatically adjusts spacing to ensure your content remains intact.",
          },
        ],
      }}
    >
      <div className="space-y-6">
        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Upload PDF for Page Numbering
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              accept="application/pdf"
              multiple={false}
              maxSize={100 * 1024 * 1024}
              onUpload={handleFileUpload}
            />
          </CardContent>
        </Card>

        {/* Format & Style */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Format & Style
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Number Format */}
            <div>
              <label className="block text-sm font-medium mb-2">Number Format</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {NUMBER_FORMATS.map((fmt) => (
                  <Button
                    key={fmt.value}
                    variant={numberFormat === fmt.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNumberFormat(fmt.value)}
                    className="justify-start gap-2"
                  >
                    <Hash className="h-4 w-4" />
                    {fmt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Starting Number */}
            <div>
              <label className="block text-sm font-medium mb-2">Starting Number</label>
              <Input
                type="number"
                min={1}
                value={startingNumber}
                onChange={(e) => setStartingNumber(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Page 1 will be numbered as this value
              </p>
            </div>

            {/* Format Template */}
            <div>
              <label className="block text-sm font-medium mb-2">Format Template</label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Prefix"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="text"
                  placeholder="{n}"
                  value={formatTemplate}
                  onChange={(e) => setFormatTemplate(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="text"
                  placeholder="Suffix"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  className="flex-1"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Use {"{n}"} for page number and {"{total}"} for total pages. Preview:{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {prefix}{formatTemplate.replace("{n}", String(startingNumber)).replace("{total}", "12")}{suffix}
                </span>
              </p>
            </div>

            {/* Font Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Font Family</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value as FontFamilyValue)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="Helvetica">Helvetica</option>
                  <option value="Courier">Courier</option>
                  <option value="Times-Roman">Times Roman</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Font Size</label>
                <Input
                  type="number"
                  min={6}
                  max={72}
                  value={fontSize}
                  onChange={(e) => setFontSize(Math.max(6, Math.min(72, parseInt(e.target.value) || 12)))}
                  className="w-24"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Font Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fontColor}
                    onChange={(e) => setFontColor(e.target.value)}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={fontColor}
                    onChange={(e) => setFontColor(e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Position & Layout */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Position & Layout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Position */}
            <div>
              <label className="block text-sm font-medium mb-2">Position</label>
              <div className="grid grid-cols-3 gap-2">
                {POSITIONS.map((pos) => (
                  <Button
                    key={pos.value}
                    variant={position === pos.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPosition(pos.value)}
                    className="justify-center"
                  >
                    {pos.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Alignment */}
            <div>
              <label className="block text-sm font-medium mb-2">Alignment</label>
              <div className="flex gap-2">
                <Button
                  variant={alignment === "left" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAlignment("left")}
                  className="flex-1 gap-2"
                >
                  <AlignLeft className="h-4 w-4" />
                  Left
                </Button>
                <Button
                  variant={alignment === "center" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAlignment("center")}
                  className="flex-1 gap-2"
                >
                  <AlignCenter className="h-4 w-4" />
                  Center
                </Button>
                <Button
                  variant={alignment === "right" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAlignment("right")}
                  className="flex-1 gap-2"
                >
                  <AlignRight className="h-4 w-4" />
                  Right
                </Button>
              </div>
            </div>

            {/* Page Range */}
            <div>
              <label className="block text-sm font-medium mb-2">Page Range</label>
              <div className="space-y-2">
                {PAGE_RANGES.map((pr) => (
                  <div key={pr.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      id={`range-${pr.value}`}
                      name="pageRange"
                      checked={pageRangeType === pr.value}
                      onChange={() => setPageRangeType(pr.value)}
                      className="rounded"
                    />
                    <label htmlFor={`range-${pr.value}`} className="text-sm">
                      {pr.label}
                    </label>
                    {pr.value === "custom" && pageRangeType === "custom" && (
                      <Input
                        type="text"
                        placeholder="e.g., 2-10 or 1,3,5"
                        value={customRangeValue}
                        onChange={(e) => setCustomRangeValue(e.target.value)}
                        className="flex-1 ml-2 text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="space-y-6 pt-6">
            {/* Progress Bar */}
            {isLoading && (
              <div className="space-y-2">
                <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                  Adding page numbers... {Math.round(progress)}%
                </p>
              </div>
            )}

            {/* Error Display */}
            {error && !isLoading && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                <XCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Success Display */}
            {isNumbered && !isLoading && !error && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">Page numbers have been added successfully!</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            {isNumbered ? (
              <>
                <Button size="lg" className="w-full gap-2" onClick={handleManualDownload}>
                  <Download className="h-4 w-4" />
                  Download Numbered PDF
                </Button>
                <Button variant="outline" size="lg" className="w-full gap-2" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" />
                  Process Another PDF
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleAddPageNumbers}
                  disabled={!isValid || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding Page Numbers...
                    </>
                  ) : (
                    <>
                      <Hash className="h-4 w-4" />
                      Add Page Numbers
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Settings
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </ToolLayout>
  );
}