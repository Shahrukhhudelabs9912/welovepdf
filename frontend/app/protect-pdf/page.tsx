"use client";

import { useState, useCallback } from "react";
import { Lock, Eye, EyeOff, Shield, Download, FileLock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/file-upload";
import { ToolLayout } from "@/components/tools/tool-layout";
import { motion } from "framer-motion";
import { useToolProcessing } from "@/hooks/use-tool-processing";
import { downloadBlob } from "@/lib/api-client";
import { toast } from "sonner";

const PROTECT_PDF_ENDPOINT = process.env.NEXT_PUBLIC_USE_PYTHON_BACKEND === "true"
  ? `${process.env.NEXT_PUBLIC_PYTHON_API_BASE || "http://localhost:8000/api"}/protect-pdf`
  : "/api/protect-pdf";

export default function ProtectPDFPage() {
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
  const [protectedBlob, setProtectedBlob] = useState<Blob | null>(null);
  const [protectedFilename, setProtectedFilename] = useState<string>("");

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
    toolName: "Protect PDF",
    endpoint: PROTECT_PDF_ENDPOINT,
    autoClearFiles: false,
    onSuccess: (result) => {
      if (result?.blob) {
        setProtectedBlob(result.blob);
        setProtectedFilename(result.filename || "protected.pdf");
        // Auto-download
        const downloadSuccess = downloadBlob(result.blob, result.filename || "protected.pdf");
        if (!downloadSuccess) {
          toast.info("Download started. If it doesn't begin automatically, use the manual download button.");
        }
      }
    },
  });

  const handleFileUpload = useCallback((uploadedFiles: File[]) => {
    // Files are managed by useToolProcessing; this just resets local state
    setProtectedBlob(null);
    setProtectedFilename("");
    reset();
  }, [reset]);

  // Validate button state: needs PDF + password >= 4 chars + passwords match
  const isValid =
    hasFiles &&
    password.length >= 4 &&
    password === confirmPassword;

  const handleProtect = async () => {
    if (!password || password !== confirmPassword) {
      toast.error("Please enter matching passwords");
      return;
    }

    if (!hasFiles) {
      toast.error("Please upload a PDF file");
      return;
    }

    if (password.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }

    console.log("[ProtectPDF] Protecting PDF with permissions:", permissions);

    setProtectedBlob(null);
    setProtectedFilename("");

    // Send password + permissions as additional data
    await processFiles({
      password,
      allow_printing: permissions.printing,
      allow_copying: permissions.copying,
      allow_editing: permissions.modifying,
      allow_annotating: permissions.annotating,
    });
  };

  const handleManualDownload = () => {
    if (protectedBlob) {
      downloadBlob(protectedBlob, protectedFilename || "protected.pdf");
    }
  };

  const togglePermission = (permission: keyof typeof permissions) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: !prev[permission],
    }));
  };

  const isProtected = !isLoading && protectedBlob !== null;
  const isProcessing = isLoading;

  return (
    <ToolLayout
      title="Protect PDF"
      description="Add password protection and encryption to your PDF files. Control permissions for printing, copying, and editing."
      toolName="Protect PDF"
      toolDescription="Secure your PDF files with password protection and 256-bit AES encryption. Control document permissions for printing, copying, and editing."
      toolKey="protect_pdf"
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
            answer: "Yes, you can use an unlock PDF tool to remove password protection if you have the original password.",
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

              {hasFiles && (
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
                        onClick={clearAllFiles}
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
                    placeholder="Enter password (min 4 characters)"
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
                {password.length > 0 && password.length < 4 && (
                  <p className="text-xs text-red-500">Password must be at least 4 characters</p>
                )}
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
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
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
                    <span>{stageMessage || "Encrypting PDF..."}</span>
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

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <div>
                      <h4 className="font-semibold text-red-800 dark:text-red-300">
                        Protection Failed
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-400">
                        {error}
                      </p>
                    </div>
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
                        Your PDF is now encrypted with AES-256 password protection.
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
                      description: isProtected
                        ? "PDF encrypted with military-grade encryption"
                        : "Military-grade encryption standard",
                    },
                    {
                      icon: <Shield className="h-4 w-4" />,
                      title: "Permission Control",
                      description: isProtected
                        ? `Permissions applied: ${Object.entries(permissions).filter(([, v]) => v).map(([k]) => k).join(", ") || "all restricted"}`
                        : "Fine-grained access controls",
                    },
                    {
                      icon: <FileLock className="h-4 w-4" />,
                      title: "Auto Cleanup",
                      description: isProtected
                        ? "Temporary files securely deleted"
                        : "Files automatically deleted after processing",
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
            <CardFooter className="flex flex-col gap-3">
              {isProtected ? (
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleManualDownload}
                >
                  <Download className="h-4 w-4" />
                  Download Protected PDF
                </Button>
              ) : (
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleProtect}
                  disabled={!isValid || isProcessing}
                >
                  <Lock className="h-4 w-4" />
                  {isProcessing ? "Protecting..." : "Protect PDF"}
                </Button>
              )}
              {isProtected && (
                <p className="text-xs text-center text-gray-500">
                  If download doesn't start automatically, click the button above.
                </p>
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