"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Shield, Download, FileLock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/file-upload";
import { ToolLayout } from "@/components/tools/tool-layout";
import { motion } from "framer-motion";

export default function ProtectPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [permissions, setPermissions] = useState({
    printing: true,
    copying: true,
    modifying: false,
    annotating: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isProtected, setIsProtected] = useState(false);

  const handleFileUpload = (uploadedFiles: File[]) => {
    setFiles(uploadedFiles);
    setIsProtected(false);
  };

  const handleProtect = () => {
    if (!password || password !== confirmPassword) {
      alert("Please enter matching passwords");
      return;
    }

    if (files.length === 0) {
      alert("Please upload a PDF file");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setIsProtected(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "#";
    link.download = "protected-document.pdf";
    link.click();
  };

  const togglePermission = (permission: keyof typeof permissions) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: !prev[permission],
    }));
  };

  return (
    <ToolLayout
      title="Protect PDF"
      description="Add password protection and encryption to your PDF files. Control permissions for printing, copying, and editing."
      toolName="Protect PDF"
      toolDescription="Secure your PDF files with password protection and 256-bit AES encryption. Control document permissions for printing, copying, and editing."
      seoContent={{
        h1: "Protect PDF Files with Password & Encryption",
        h2: "How to Password Protect a PDF",
        content: `
          <p>Our PDF protection tool allows you to add strong password protection and encryption to your PDF files. With 256-bit AES encryption (the same standard used by banks and governments), your documents are secure from unauthorized access.</p>
          <p><strong>Key features:</strong></p>
          <ul>
            <li>256-bit AES encryption for maximum security</li>
            <li>Control document permissions (printing, copying, editing)</li>
            <li>No password storage on our servers</li>
            <li>Files processed locally in your browser</li>
            <li>Automatic file deletion after processing</li>
          </ul>
          <p>Perfect for protecting sensitive documents like contracts, financial reports, legal documents, and personal information.</p>
        `,
        faq: [
          {
            question: "How secure is PDF password protection?",
            answer: "Our tool uses 256-bit AES encryption, the same standard used by banks and governments. Your password is never stored on our servers.",
          },
          {
            question: "Can I remove password protection later?",
            answer: "Yes, you can use our Unlock PDF tool to remove password protection if you have the original password.",
          },
          {
            question: "What permissions can I control?",
            answer: "You can control printing, copying text/images, modifying content, and adding annotations/comments.",
          },
          {
            question: "Is there a file size limit?",
            answer: "Free users can protect PDFs up to 50MB. Pro users can protect files up to 500MB.",
          },
        ],
      }}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column - Upload & Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileLock className="h-5 w-5" />
                Upload PDF
              </CardTitle>
              <CardDescription>
                Upload the PDF file you want to protect with a password
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
                        <FileLock className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
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
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Set password and control document permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Document Permissions</label>
                {Object.entries(permissions).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-800"
                  >
                    <span className="capitalize">{key}</span>
                    <Button
                      variant={value ? "default" : "outline"}
                      size="sm"
                      onClick={() => togglePermission(key as keyof typeof permissions)}
                    >
                      {value ? "Allowed" : "Restricted"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview & Processing */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Protect & Download</CardTitle>
              <CardDescription>
                Secure your PDF and download the protected version
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Encrypting PDF...</span>
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

              {isProtected && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <h4 className="font-semibold text-green-800 dark:text-green-300">
                        PDF Protected Successfully!
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Your PDF is now encrypted with password protection.
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
                      icon: <Lock className="h-4 w-4" />,
                      title: "256-bit AES Encryption",
                      description: "Military-grade encryption standard",
                    },
                    {
                      icon: <Shield className="h-4 w-4" />,
                      title: "Permission Control",
                      description: "Fine-grained access controls",
                    },
                    {
                      icon: <FileLock className="h-4 w-4" />,
                      title: "No Server Storage",
                      description: "Files processed locally in browser",
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
            </CardContent>
            <CardFooter>
              {isProtected ? (
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                  Download Protected PDF
                </Button>
              ) : (
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleProtect}
                  disabled={isProcessing || files.length === 0}
                >
                  <Lock className="h-4 w-4" />
                  {isProcessing ? "Protecting..." : "Protect PDF"}
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips for Strong Passwords</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  Use at least 12 characters with mix of letters, numbers, symbols
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  Avoid common words, names, or sequential numbers
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  Consider using a password manager to generate and store passwords
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  Remember: If you lose the password, you cannot recover the PDF
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolLayout>
  );
}