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
import { useTranslations } from "next-intl";

const PROTECT_PDF_ENDPOINT = process.env.NEXT_PUBLIC_USE_PYTHON_BACKEND === "true"
  ? `${process.env.NEXT_PUBLIC_PYTHON_API_BASE || "http://localhost:8000/api"}/protect-pdf`
  : "/api/protect-pdf";

export function ProtectPDFClient() {
  const t = useTranslations("protect_pdf");
  const tp = useTranslations("tool_pages");
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
      toast.error(t("enter_matching"));
      return;
    }

    if (!hasFiles) {
      toast.error(t("upload_pdf_first"));
      return;
    }

    if (password.length < 4) {
      toast.error(t("password_min_length"));
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
      title={t("title")}
      description={t("description")}
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
                {t("upload_title")}
              </CardTitle>
              <CardDescription>
                {t("upload_description")}
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
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-800 overflow-hidden"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FileLock className="h-5 w-5 shrink-0 text-gray-500" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate" title={file.name}>{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFiles}
                        className="shrink-0"
                      >
                        {tp("clear_button")}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {hasFiles && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {t("security_settings")}
                </CardTitle>
                <CardDescription>
                  {t("security_settings_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("password_label")}</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("password_placeholder")}
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
                    <p className="text-xs text-red-500">{t("password_min_length")}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("confirm_password_label")}</label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("confirm_password_placeholder")}
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
                    <p className="text-xs text-red-500">{t("passwords_mismatch")}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">{t("permissions")}</label>
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
                        {value ? t("allowed") : t("restricted")}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Preview & Processing */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("protect_download")}</CardTitle>
              <CardDescription>
                {t("protect_download_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{stageMessage || t("protecting")}</span>
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
                        {t("protection_failed")}
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
                        {t("protection_success")}
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        {t("protection_success_desc")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-semibold">{t("security_features")}</h4>
                <div className="grid gap-3">
                  {[
                    {
                      icon: <Lock className="h-4 w-4" />,
                      title: t("feature_aes256"),
                      description: isProtected
                        ? t("feature_aes256_desc_active")
                        : t("feature_aes256_desc"),
                    },
                    {
                      icon: <Shield className="h-4 w-4" />,
                      title: t("feature_permission"),
                      description: isProtected
                        ? `${t("feature_permission_desc_active")}: ${Object.entries(permissions).filter(([, v]) => v).map(([k]) => k).join(", ") || "all restricted"}`
                        : t("feature_permission_desc"),
                    },
                    {
                      icon: <FileLock className="h-4 w-4" />,
                      title: t("feature_autoclean"),
                      description: isProtected
                        ? t("feature_autoclean_desc_active")
                        : t("feature_autoclean_desc"),
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
                  {t("download_protected")}
                </Button>
              ) : (
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleProtect}
                  disabled={!isValid || isProcessing}
                >
                  <Lock className="h-4 w-4" />
                  {isProcessing ? t("protecting") : t("protect_button")}
                </Button>
              )}
              {isProtected && (
                <p className="text-xs text-center text-gray-500">
                  {t("download_hint")}
                </p>
              )}
            </CardFooter>
          </Card>

          {hasFiles && (
            <Card>
              <CardHeader>
                <CardTitle>{t("tips_title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    {t("tips_use_long")}
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    {t("tips_avoid_common")}
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    {t("tips_special_chars")}
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="font-semibold">{t("remember_warning")}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}