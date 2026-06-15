"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
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

const POSITIONS_VALUES: Position[] = ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"];
const PAGE_RANGE_VALUES: PageRangeType[] = ["all", "odd", "even", "first", "custom"];

export function PageNumberingClient() {
  const t = useTranslations("page_numbering");
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
      }
    },
  });

  const handleFileUpload = useCallback(
    (_uploadedFiles: File[]) => {
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
      title={t("title")}
      description={t("description")}
      toolName="Page Numbering"
      toolDescription={t("description")}
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
            <li>Secure processing with automatic file deletion</li>
          </ul>
        `,
        faq: [],
      }}
    >
      <div className="space-y-6">
        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              {t("upload_title")}
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
        {hasFiles && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                {t("format_style_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">{t("number_format")}</label>
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

              <div>
                <label className="block text-sm font-medium mb-2">{t("start_number")}</label>
                <Input
                  type="number"
                  min={1}
                  value={startingNumber}
                  onChange={(e) => setStartingNumber(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t("start_number_hint")}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t("format_template")}</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder={t("prefix")}
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
                    placeholder={t("suffix")}
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {t("format_template_hint")}{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {prefix}{formatTemplate.replace("{n}", String(startingNumber)).replace("{total}", "12")}{suffix}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t("font_family")}</label>
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
                  <label className="block text-sm font-medium mb-2">{t("font_size_label")}</label>
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
                  <label className="block text-sm font-medium mb-2">{t("font_color")}</label>
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
        )}

        {/* Position & Layout */}
        {hasFiles && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                {t("position_layout_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">{t("position_label")}</label>
                <div className="grid grid-cols-3 gap-2">
                  {POSITIONS_VALUES.map((posValue) => (
                    <Button
                      key={posValue}
                      variant={position === posValue ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPosition(posValue)}
                      className="justify-center"
                    >
                      {t(`position_${posValue.replace(/-/g, "_")}` as any)}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t("alignment")}</label>
                <div className="flex gap-2">
                  <Button
                    variant={alignment === "left" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAlignment("left")}
                    className="flex-1 gap-2"
                  >
                    <AlignLeft className="h-4 w-4" />
                    {t("left")}
                  </Button>
                  <Button
                    variant={alignment === "center" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAlignment("center")}
                    className="flex-1 gap-2"
                  >
                    <AlignCenter className="h-4 w-4" />
                    {t("center_position")}
                  </Button>
                  <Button
                    variant={alignment === "right" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAlignment("right")}
                    className="flex-1 gap-2"
                  >
                    <AlignRight className="h-4 w-4" />
                    {t("right")}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t("page_range_label")}</label>
                <div className="space-y-2">
                  {PAGE_RANGE_VALUES.map((prValue) => (
                    <div key={prValue} className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`range-${prValue}`}
                        name="pageRange"
                        checked={pageRangeType === prValue}
                        onChange={() => setPageRangeType(prValue)}
                        className="rounded"
                      />
                      <label htmlFor={`range-${prValue}`} className="text-sm">
                        {t(`page_range_${prValue}` as any)}
                      </label>
                      {prValue === "custom" && pageRangeType === "custom" && (
                        <Input
                          type="text"
                          placeholder={t("custom_range_placeholder")}
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
        )}

        {/* Action Buttons */}
        <Card>
          <CardContent className="space-y-6 pt-6">
            {isLoading && (
              <div className="space-y-2">
                <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                  {t("adding_progress", { percent: Math.round(progress) })}
                </p>
              </div>
            )}

            {error && !isLoading && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                <XCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {isNumbered && !isLoading && !error && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{t("success_message")}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            {isNumbered ? (
              <>
                <Button size="lg" className="w-full gap-2" onClick={handleManualDownload}>
                  <Download className="h-4 w-4" />
                  {t("download_numbered")}
                </Button>
                <Button variant="outline" size="lg" className="w-full gap-2" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" />
                  {t("process_another")}
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
                      {t("adding")}
                    </>
                  ) : (
                    <>
                      <Hash className="h-4 w-4" />
                      {t("add_button")}
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
                  {t("reset_settings")}
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </ToolLayout>
  );
}
