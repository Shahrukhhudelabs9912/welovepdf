"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Sparkles,
  Brain,
  FileText,
  Key,
  Copy,
  Download,
  CheckCircle,
  X,
  Upload,
  AlertCircle,
  Loader2,
  BarChart,
  Share2,
} from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { triggerDownload } from "@/lib/download-utils";
import { useTranslations } from "next-intl";

// ── Types ────────────────────────────────────────────────────────────

type AIProcessingStatus = "idle" | "uploading" | "processing" | "completed" | "error";

type AIResult = {
  summary: string;
  keyPoints: string[];
  title: string;
  wordCount: number;
  pageCount: number;
  readingTime: string;
  sentiment: "positive" | "neutral" | "negative";
  confidence: number;
};

// ── Component ────────────────────────────────────────────────────────

export function AIToolsSection() {
  const t = useTranslations("ai_tools");

  const [files, setFiles] = useState<File[]>([]);
  const [analysisFile, setAnalysisFile] = useState<File | null>(null);
  const [status, setStatus] = useState<AIProcessingStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AIResult | null>(null);
  const [selectedTab, setSelectedTab] = useState<"summary" | "keypoints" | "title">("summary");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────────

  /** Start a simulated progress bar that ticks up to `ceiling` while the real API works. */
  const startProgressSimulation = useCallback((startAt: number, ceiling: number, stepMs = 250) => {
    // Clear any existing interval
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    setProgress(startAt);
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= ceiling) {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          return ceiling;
        }
        return prev + Math.max(1, Math.floor((ceiling - prev) / 8));
      });
    }, stepMs);
  }, []);

  const stopProgressSimulation = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  /** Reset everything back to idle. */
  const resetState = useCallback(() => {
    stopProgressSimulation();
    setStatus("idle");
    setProgress(0);
    setResult(null);
    setErrorMessage(null);
    setDownloadBlob(null);
    setDownloadFilename(null);
    setFiles([]);
    setAnalysisFile(null);
  }, [stopProgressSimulation]);

  // ── File Upload ──────────────────────────────────────────────────────

  const handleFileUpload = useCallback((uploadedFiles: File[]) => {
    setFiles(uploadedFiles);
    if (uploadedFiles.length > 0) {
      setAnalysisFile(uploadedFiles[0]);
      startAnalysis(uploadedFiles[0]);
    }
  }, []);

  // ── AI Analysis ──────────────────────────────────────────────────────

  const startAnalysis = useCallback(async (file: File) => {
    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStatus("uploading");
    setErrorMessage(null);
    setResult(null);
    setDownloadBlob(null);
    setDownloadFilename(null);
    startProgressSimulation(5, 30, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setStatus("processing");
      startProgressSimulation(30, 90, 300);

      const response = await fetch("/api/ai-tools", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.detail || `Analysis failed (HTTP ${response.status})`
        );
      }

      const data = await response.json();

      // Map backend response to AIResult
      const analysisResult: AIResult = {
        summary: data.summary || "",
        keyPoints: data.keyPoints || data.key_points || [],
        title: data.title || "",
        wordCount: data.wordCount || data.word_count || 0,
        pageCount: data.pageCount || data.page_count || 0,
        readingTime: data.readingTime || data.reading_time || "Unknown",
        sentiment: (data.sentiment || "neutral") as AIResult["sentiment"],
        confidence: data.confidence || 0,
      };

      stopProgressSimulation();
      setProgress(100);
      setResult(analysisResult);
      setStatus("completed");
      toast.success(t("analysis_completed"));
    } catch (error: unknown) {
      stopProgressSimulation();

      if (error instanceof DOMException && error.name === "AbortError") {
        // Request was intentionally aborted (e.g. new file uploaded)
        return;
      }

      const message =
        error instanceof Error ? error.message : t("analysis_error");
      setErrorMessage(message);
      setStatus("error");
      toast.error(message);
    }
  }, [startProgressSimulation, stopProgressSimulation]);

  // ── Copy ─────────────────────────────────────────────────────────────

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("copied_to_clipboard"));
  }, []);

  // ── Download Report ──────────────────────────────────────────────────

  const handleDownload = useCallback(async () => {
    if (!analysisFile) {
      toast.error(t("no_file_for_report"));
      return;
    }

    setIsDownloading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", analysisFile);

      const response = await fetch("/api/ai-tools/report", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.detail || `Report generation failed (HTTP ${response.status})`
        );
      }

      const blob = await response.blob();

      // Resolve filename from Content-Disposition header or fallback
      const contentDisp = response.headers.get("Content-Disposition");
      let filename = "ai-analysis-report.docx";
      if (contentDisp) {
        const match = contentDisp.match(/filename="([^"]+)"/);
        if (match?.[1]) filename = match[1];
      }

      // Store for manual re-download fallback
      setDownloadBlob(blob);
      setDownloadFilename(filename);

      // Attempt auto-download
      triggerDownload(blob, filename);
      toast.success(t("report_downloaded"));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : t("report_generation_failed");
      setErrorMessage(message);

      // If we got a blob but auto-download failed, still allow manual download
      if (!downloadBlob) {
        toast.error(message);
      } else {
        toast.warning(t("auto_download_failed"));
      }
    } finally {
      setIsDownloading(false);
    }
  }, [analysisFile, downloadBlob]);

  // ── Clear ────────────────────────────────────────────────────────────

  const handleClear = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    resetState();
  }, [resetState]);

  // ── AI Tools metadata ────────────────────────────────────────────────

  const aiTools = [
    {
      name: t("tool_summarization_name"),
      description: t("tool_summarization_desc"),
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: t("tool_keypoints_name"),
      description: t("tool_keypoints_desc"),
      icon: Key,
      color: "from-purple-500 to-pink-500",
    },
    {
      name: t("tool_title_gen_name"),
      description: t("tool_title_gen_desc"),
      icon: Sparkles,
      color: "from-amber-500 to-orange-500",
    },
    {
      name: t("tool_sentiment_name"),
      description: t("tool_sentiment_desc"),
      icon: BarChart,
      color: "from-green-500 to-emerald-500",
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            {t("section_title")}
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t("section_subtitle")}
          </p>
        </motion.div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left side - Upload and Controls */}
        <div className="space-y-8">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("upload_pdf_title")}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t("upload_pdf_desc")}
                </p>
              </div>
            </div>

            <FileUpload
              onUpload={handleFileUpload}
              accept="application/pdf"
              multiple={false}
              maxSize={50 * 1024 * 1024} // 50MB
            />

            {files.length > 0 && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {files[0].name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(files[0].size)}
                      </p>
                    </div>
                  </div>
                  {status === "completed" && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {status === "error" && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>

                {/* Progress Indicator */}
                {status !== "idle" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {status === "uploading" && t("progress_uploading")}
                        {status === "processing" && t("progress_processing")}
                        {status === "completed" && t("progress_completed")}
                        {status === "error" && t("progress_error")}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full",
                          status === "error"
                            ? "bg-red-500"
                            : "bg-gradient-to-r from-blue-500 to-cyan-500"
                        )}
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                {/* Error message */}
                {status === "error" && errorMessage && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {errorMessage}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => {
                      if (analysisFile) startAnalysis(analysisFile);
                    }}
                    disabled={
                      status === "uploading" ||
                      status === "processing" ||
                      isDownloading
                    }
                  >
                    {(status === "uploading" || status === "processing") ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("analyzing")}
                      </>
                    ) : status === "idle" ? (
                      <>
                        <Sparkles className="h-4 w-4" />
                        {t("start_analysis_btn")}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        {t("re_analyze_btn")}
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleClear}>
                    <X className="h-4 w-4" />
                    {t("clear_btn")}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* AI Tools Grid */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              {t("ai_tools_grid_title")}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {aiTools.map((tool, index) => (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                >
                  <div
                    className={`h-12 w-12 rounded-lg bg-gradient-to-r ${tool.color} flex items-center justify-center mb-3`}
                  >
                    <tool.icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {tool.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {tool.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Results */}
        <div className="space-y-8">
          {/* Results Card */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("results_title")}
              </h3>
              {result && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    {t("results_ready")}
                  </span>
                </div>
              )}
              {status === "error" && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">
                    {t("results_error")}
                  </span>
                </div>
              )}
            </div>

            {!result ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  {status === "uploading" || status === "processing" ? (
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  ) : status === "error" ? (
                    <AlertCircle className="h-8 w-8 text-red-400" />
                  ) : (
                    <Brain className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {status === "uploading" || status === "processing"
                    ? t("results_analyzing")
                    : status === "error"
                    ? t("results_failed")
                    : t("results_no_analysis")}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {status === "uploading" || status === "processing"
                    ? t("results_analyzing_msg")
                    : status === "error"
                    ? t("results_failed_msg")
                    : t("results_no_analysis_msg")}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Document Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t("stats_pages")}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {result.pageCount}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t("stats_words")}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {result.wordCount.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t("stats_reading_time")}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {result.readingTime}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t("stats_confidence")}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {result.confidence}%
                    </p>
                  </div>
                </div>

                {/* Sentiment Badge */}
                {result.sentiment && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t("sentiment_label")}
                    </span>
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold capitalize",
                        result.sentiment === "positive" &&
                          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                        result.sentiment === "negative" &&
                          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                        result.sentiment === "neutral" &&
                          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      )}
                    >
                      {result.sentiment}
                    </span>
                  </div>
                )}

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-800">
                  <nav className="-mb-px flex space-x-8">
                    {(["summary", "keypoints", "title"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={cn(
                          "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                          selectedTab === tab
                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        )}
                      >
                        {tab === "summary" && t("tabs.summary")}
                        {tab === "keypoints" && t("tabs.keypoints")}
                        {tab === "title" && t("tabs.title")}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="min-h-[300px]">
                  {selectedTab === "summary" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {t("document_summary_title")}
                        </h3>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(result.summary)}
                        >
                          <Copy className="mr-2 h-3 w-3" />
                          {t("copy_summary")}
                        </Button>
                      </div>
                      <div className="prose prose-gray dark:prose-invert max-w-none">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {result.summary || t("no_summary")}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedTab === "keypoints" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {t("key_points_title")}
                        </h3>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(result.keyPoints.join("\n"))}
                        >
                          <Copy className="mr-2 h-3 w-3" />
                          {t("copy_all")}
                        </Button>
                      </div>
                      {result.keyPoints.length > 0 ? (
                        <ul className="space-y-3">
                          {result.keyPoints.map((point, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                    {index + 1}
                                  </span>
                                </div>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300">{point}</p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">
                          {t("no_key_points")}
                        </p>
                      )}
                    </div>
                  )}

                  {selectedTab === "title" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {t("generated_title_label")}
                        </h3>
                        <p className="mt-2 text-gray-700 dark:text-gray-300">
                          {result.title || t("no_title")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Download Actions */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 gap-2"
                      onClick={handleDownload}
                      disabled={isDownloading || status !== "completed"}
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t("generating_report")}
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          {t("download_report")}
                        </>
                      )}
                    </Button>
                    <Button variant="outline" className="gap-2" disabled>
                      <Share2 className="h-4 w-4" />
                      {t("share_btn")}
                    </Button>
                  </div>

                  {/* Manual download fallback if auto-download failed but blob exists */}
                  {downloadBlob && downloadFilename && (
                    <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                        {t("manual_download_hint")}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          triggerDownload(downloadBlob, downloadFilename);
                          toast.success(t("report_downloaded"));
                        }}
                      >
                        <Download className="h-3 w-3" />
                        {t("download_report_btn", { filename: downloadFilename })}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}