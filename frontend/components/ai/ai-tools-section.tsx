"use client";

import { useState } from "react";
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
  Clock,
  Zap,
  BarChart,
  Share2,
  X,
  Upload
} from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";

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

export function AIToolsSection() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<AIProcessingStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AIResult | null>(null);
  const [selectedTab, setSelectedTab] = useState<"summary" | "keypoints" | "title">("summary");

  const handleFileUpload = (uploadedFiles: File[]) => {
    setFiles(uploadedFiles);
    if (uploadedFiles.length > 0) {
      startAIProcessing(uploadedFiles[0]);
    }
  };

  const startAIProcessing = async (file: File) => {
    setStatus("uploading");
    setProgress(10);

    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 800));
    setStatus("processing");
    setProgress(30);

    // Simulate AI processing
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2500));
    clearInterval(interval);
    setProgress(100);
    setStatus("completed");

    // Mock AI results
    setResult({
      summary: "This document discusses the importance of digital transformation in modern businesses, highlighting key strategies for implementing technology solutions that improve operational efficiency and customer engagement. The analysis suggests that companies adopting AI and automation see significant improvements in productivity.",
      keyPoints: [
        "Digital transformation is essential for business competitiveness",
        "AI and automation drive operational efficiency",
        "Customer engagement improves with personalized digital experiences",
        "Data analytics provides actionable insights for decision making",
        "Cloud infrastructure enables scalability and flexibility"
      ],
      title: "Digital Transformation Strategies for Modern Enterprises",
      wordCount: 2450,
      pageCount: 12,
      readingTime: "10-12 minutes",
      sentiment: "positive",
      confidence: 92
    });

    toast.success("AI analysis completed successfully!");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    toast.success("Download started!");
    // In a real app, this would trigger a file download
  };

  const aiTools = [
    {
      name: "PDF Summarization",
      description: "Get concise summaries of long PDF documents",
      icon: FileText,
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Key Points Extraction",
      description: "Extract main ideas and important sections",
      icon: Key,
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "Smart Title Generation",
      description: "Generate descriptive titles for your documents",
      icon: Sparkles,
      color: "from-amber-500 to-orange-500"
    },
    {
      name: "Sentiment Analysis",
      description: "Analyze the tone and sentiment of the content",
      icon: BarChart,
      color: "from-green-500 to-emerald-500"
    }
  ];

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
            AI-Powered PDF Analysis
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Upload your PDF and let our AI extract key insights, generate summaries, and analyze content in seconds.
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upload PDF</h3>
                <p className="text-gray-600 dark:text-gray-400">Upload your PDF document to get AI-powered insights</p>
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
                      <p className="font-medium text-gray-900 dark:text-white">{files[0].name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(files[0].size)}</p>
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>

                {/* Progress Indicator */}
                {status !== "idle" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {status === "uploading" && "Uploading..."}
                        {status === "processing" && "AI Processing..."}
                        {status === "completed" && "Completed!"}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => startAIProcessing(files[0])}
                    disabled={status !== "idle" && status !== "completed"}
                  >
                    <Sparkles className="h-4 w-4" />
                    {status === "idle" ? "Start AI Analysis" : "Re-analyze"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setFiles([])}
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* AI Tools Grid */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">AI Tools</h3>
            <div className="grid grid-cols-2 gap-4">
              {aiTools.map((tool, index) => (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                >
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-r ${tool.color} flex items-center justify-center mb-3`}>
                    <tool.icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{tool.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{tool.description}</p>
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Analysis Results</h3>
              {result && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Ready</span>
                </div>
              )}
            </div>

            {!result ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <Brain className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Analysis Yet</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Upload a PDF and start AI analysis to see results here.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Document Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pages</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.pageCount}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Words</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.wordCount.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Reading Time</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.readingTime}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.confidence}%</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-800">
                  <nav className="-mb-px flex space-x-8">
                    {["summary", "keypoints", "title"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setSelectedTab(tab as any)}
                        className={cn(
                          "py-2 px-1 border-b-2 font-medium text-sm",
                          selectedTab === tab
                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        )}
                      >
                        {tab === "summary" && "Summary"}
                        {tab === "keypoints" && "Key Points"}
                        {tab === "title" && "Title"}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="min-h-[300px]">
                  {selectedTab === "summary" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Document Summary</h3>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(result.summary)}
                        >
                          <Copy className="mr-2 h-3 w-3" />
                          Copy Summary
                        </Button>
                      </div>
                      <div className="prose prose-gray dark:prose-invert max-w-none">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {result.summary}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedTab === "keypoints" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Key Points</h3>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(result.keyPoints.join('\n'))}
                        >
                          <Copy className="mr-2 h-3 w-3" />
                          Copy All
                        </Button>
                      </div>
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
                    </div>
                  )}

                  {selectedTab === "title" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generated Title</h3>
                        <p className="mt-2 text-gray-700 dark:text-gray-300">
                          {result.title || "AI-generated title will appear here"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Download Actions */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex gap-3">
                    <Button className="flex-1 gap-2" onClick={handleDownload}>
                      <Download className="h-4 w-4" />
                      Download Report
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}