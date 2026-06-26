"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { ButtonLoader } from "@/components/brand-loader";

type Step = "email" | "reset";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { forgotPassword, resetPassword } = useAuth();
  const t = useTranslations("auth");

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [devResetToken, setDevResetToken] = useState(""); // Automatically filled in dev mode
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    token?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // ---------------------------------------------------------------------------
  // Step 1: Submit email to receive reset token
  // ---------------------------------------------------------------------------

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: t("validation.email_invalid") });
      return;
    }

    setIsSubmitting(true);
    try {
      const devToken = await forgotPassword(email.trim());
      if (devToken) {
        // Dev mode: back to the reset token automatically
        setDevResetToken(devToken);
        setResetToken(devToken);
        toast.info(t("dev_token_autofill"));
      }
      setStep("reset");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("something_went_wrong");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Step 2: Submit new password
  // ---------------------------------------------------------------------------

  const validateReset = (): boolean => {
    const newErrors: typeof errors = {};

    if (!resetToken.trim() && !devResetToken) {
      newErrors.token = t("validation.token_required");
    }

    if (!newPassword) {
      newErrors.newPassword = t("validation.new_password_required");
    } else if (newPassword.length < 8) {
      newErrors.newPassword = t("validation.password_min_length");
    } else if (!/[A-Z]/.test(newPassword)) {
      newErrors.newPassword = t("validation.password_uppercase");
    } else if (!/[a-z]/.test(newPassword)) {
      newErrors.newPassword = t("validation.password_lowercase");
    } else if (!/[0-9]/.test(newPassword)) {
      newErrors.newPassword = t("validation.password_number");
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t("validation.confirm_new_password_required");
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t("validation.passwords_match");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateReset()) return;

    const token = devResetToken || resetToken.trim();

    setIsSubmitting(true);
    try {
      await resetPassword(token, newPassword);
      toast.success(t("password_reset_success"));
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("reset_failed");
      toast.error(message);
      // If token is invalid, go back to step 1
      if (message.includes("expired") || message.includes("invalid")) {
        setStep("email");
        setDevResetToken("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        {step === "email" ? (
          <>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl">{t("reset_title")}</CardTitle>
              <CardDescription>
                {t("reset_subtitle")}
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleEmailSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium leading-none">
                    {t("email")}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("email_placeholder")}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    disabled={isSubmitting}
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-sm text-destructive">
                      {errors.email}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <ButtonLoader />
                      {t("sending")}
                    </span>
                  ) : (
                    t("send_reset_link")
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  {t("remember_password")}{" "}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    {t("sign_in_link")}
                  </Link>
                </p>
              </CardFooter>
            </form>
          </>
        ) : (
          <>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl">{t("set_new_password_title")}</CardTitle>
              <CardDescription>
                {t("set_new_password_subtitle")}
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleResetSubmit}>
              <CardContent className="space-y-4">
                {/* Reset Token (hidden in dev mode, shown otherwise) */}
                {!devResetToken && (
                  <div className="space-y-2">
                    <label htmlFor="token" className="text-sm font-medium leading-none">
                      {t("reset_token")}
                    </label>
                    <Input
                      id="token"
                      type="text"
                      placeholder={t("reset_token_placeholder")}
                      value={resetToken}
                      onChange={(e) => {
                        setResetToken(e.target.value);
                        if (errors.token) setErrors((prev) => ({ ...prev, token: undefined }));
                      }}
                      disabled={isSubmitting}
                      aria-invalid={!!errors.token}
                      aria-describedby={errors.token ? "token-error" : undefined}
                    />
                    {errors.token && (
                      <p id="token-error" className="text-sm text-destructive">
                        {errors.token}
                      </p>
                    )}
                  </div>
                )}

                {/* New Password */}
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium leading-none">
                    {t("new_password")}
                  </label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder={t("new_password_placeholder")}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }));
                      }}
                      disabled={isSubmitting}
                      autoComplete="new-password"
                      className="pr-10"
                      aria-invalid={!!errors.newPassword}
                      aria-describedby={errors.newPassword ? "newPassword-error" : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={showNewPassword ? t("hide_password") : t("show_password")}
                    >
                      {showNewPassword ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243 3 3 0 01-4.243-4.243z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p id="newPassword-error" className="text-sm text-destructive">
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
                    {t("confirm_new_password_label")}
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("confirm_password_placeholder")}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                      }}
                      disabled={isSubmitting}
                      autoComplete="new-password"
                      className="pr-10"
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? t("hide_password") : t("show_password")}
                    >
                      {showConfirmPassword ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243 3 3 0 01-4.243-4.243z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p id="confirmPassword-error" className="text-sm text-destructive">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <ButtonLoader />
                      {t("resetting_password")}
                    </span>
                  ) : (
                    t("reset_button")
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setDevResetToken("");
                    setResetToken("");
                    setErrors({});
                  }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("back_to_email")}
                </button>
              </CardFooter>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}