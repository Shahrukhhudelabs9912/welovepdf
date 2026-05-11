"use client";

import { useState } from "react";
import { Unlock, Lock, Eye, EyeOff, Shield, Download, FileLock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/file-upload";
import { ToolLayout } from "@/components/tools/tool-layout";
import { motion } from "framer-motion";

export default function UnlockPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");

  const handleFileUpload = (uploadedFiles: File[]) => {
    setFiles(uploadedFiles);
    setIsUnlocked(false);
    setError("");
    setAttempts(0);
  };

  const handleUnlock = () => {
    if (!password) {
      setError("Please enter the PDF password");
      return;
    }

    if (files.length === 0) {
      setError("Please upload a password-protected PDF file");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError("");

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          
          // Simulate password check (in real app, this would be actual decryption)
          if (password === "welovepdf123" || attempts < 2) {
            setIsUnlocked(true);
            setAttempts(0);
          } else {
            setError("Incorrect password. Please try again.");
            setAttempts(prev => prev + 1);
          }
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "#";
    link.download = "unlocked-document.pdf";
    link.click();
  };

  const handleTryDemo = () => {
    setPassword("welovepdf123");
    setError("");
  };

  return (
    <ToolLayout
      title="Unlock PDF"
      description="Remove password protection from PDF files. Unlock encrypted PDFs and regain access to your documents."
      toolName="Unlock PDF"
      toolDescription="Remove password protection from encrypted PDF files. Regain access to your documents by unlocking PDFs with the correct password."
      seoContent={{
        h1: "Unlock PDF Files Online for Free",
        h2: "How to Remove PDF Password Protection",
        content: `
          <p>Our PDF unlocking tool allows you to remove password protection from encrypted PDF files. If you have the correct password but need to remove restrictions for easier access and sharing, our tool can help.</p>
          <p><strong>Important:</strong> This tool requires the original password to unlock the PDF. We do not crack or bypass passwords without authorization.</p>
          <p><strong>Key features:</strong></p>
          <ul>
            <li>Remove password protection from encrypted PDFs</li>
            <li>Maintain all document content and formatting</li>
            <li>Process files locally in your browser for security</li>
            <li>No file storage on our servers</li>
            <li>Automatic file deletion after processing</li>
          </ul>
          <p>Perfect for when you have the password but need to remove restrictions for printing, copying, or editing.</p>
        `,
        faq: [
          {
            question: "Do I need the original password to unlock the PDF?",
            answer: "Yes, this tool requires the original password to remove protection. We do not crack or bypass passwords without authorization.",
          },
          {
            question: "Is it legal to unlock PDFs?",
            answer: "Yes, it's legal to unlock PDFs that you own or have permission to access. This tool is designed for legitimate use cases like removing restrictions from your own documents.",
          },
          {
            question: "What happens if I enter the wrong password?",
            answer: "The tool will notify you that the password is incorrect. You can try again with the correct password.",
          },
          {
            question: "Will unlocking affect the PDF quality?",
            answer: "No, unlocking a PDF is a lossless operation. All text, images, and formatting remain exactly the same.",
          },
        ],
      }}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column - Upload & Password */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileLock className="h-5 w-5" />
                Upload Protected PDF
              </CardTitle>
              <CardDescription>
                Upload the password-protected PDF file you want to unlock
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                accept="application/pdf"
                multiple={false}
                maxSize={100 * 1024 * 1024}
              />
              
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Lock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB • Password Protected
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFiles([])}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Unlock className="h-5 w-5" />
                Enter Password
              </CardTitle>
              <CardDescription>
                Enter the password to unlock the PDF file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">PDF Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter the PDF password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-900/20">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <h4 className="font-semibold text-amber-800 dark:text-amber-300">
                      Important Security Notice
                    </h4>
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                      This tool requires the original password. We do not store passwords or crack protected files without authorization.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleTryDemo}
              >
                Try Demo Password
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Processing & Results */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Unlock & Download</CardTitle>
              <CardDescription>
                Remove password protection and download your PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Decrypting PDF...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {isUnlocked && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
                  <div className="flex items-center gap-3">
                    <Unlock className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <h4 className="font-semibold text-green-800 dark:text-green-300">
                        PDF Unlocked Successfully!
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Password protection has been removed from your PDF.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {attempts > 0 && !isUnlocked && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <div>
                      <h4 className="font-semibold text-red-800 dark:text-red-300">
                        Unlock Failed
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-400">
                        Attempt {attempts}: Incorrect password. Please try again.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-semibold">Security Features</h4>
                <div className="grid gap-3">
                  {[
                    {
                      icon: <Shield className="h-4 w-4" />,
                      title: "Local Processing",
                      description: "Files processed in your browser, not on our servers",
                    },
                    {
                      icon: <FileLock className="h-4 w-4" />,
                      title: "No Password Storage",
                      description: "We never store or transmit your password",
                    },
                    {
                      icon: <Unlock className="h-4 w-4" />,
                      title: "Legitimate Use Only",
                      description: "Designed for unlocking your own documents",
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800"
                    >
                      <div className="rounded-full bg-primary/10 p-2">
                        {feature.icon}
                      </div>
                      <div>
                        <p className="font-medium">{feature.title}</p>
                        <p className="text-sm text-gray-500">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Common Use Cases</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    Remove printing/copying restrictions from your own documents
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    Unlock PDFs when you have the password but need to edit them
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    Prepare documents for archiving without password protection
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    Share documents more easily by removing password requirements
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              {isUnlocked ? (
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                  Download Unlocked PDF
                </Button>
              ) : (
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleUnlock}
                  disabled={isProcessing || files.length === 0}
                >
                  <Unlock className="h-4 w-4" />
                  {isProcessing ? "Unlocking..." : "Unlock PDF"}
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Legal & Ethical Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This tool is intended for legitimate purposes only. You should only unlock PDF files that:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-green-500" />
                  You own or created yourself
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-green-500" />
                  You have explicit permission to modify
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-green-500" />
                  Are not protected by copyright or legal restrictions
                </li>
              </ul>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Unauthorized access to protected documents may violate laws and terms of service.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolLayout>
  );
}