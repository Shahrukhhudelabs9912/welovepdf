"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ButtonLoader } from "@/components/brand-loader";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Password strength evaluation
// ---------------------------------------------------------------------------

interface StrengthResult {
  score: number;       // 0-4
  label: string;
  color: string;       // Tailwind background class
  textColor: string;   // Tailwind text class
}

function evaluatePasswordStrength(password: string, strengthLabels: Record<string, string>): StrengthResult {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Normalize to 0-4
  const normalized = Math.min(4, Math.floor(score / 1.5));

  const levels: StrengthResult[] = [
    { score: 0, label: strengthLabels.very_weak || "Very Weak", color: "bg-red-500", textColor: "text-red-500" },
    { score: 1, label: strengthLabels.weak || "Weak", color: "bg-orange-500", textColor: "text-orange-500" },
    { score: 2, label: strengthLabels.fair || "Fair", color: "bg-yellow-500", textColor: "text-yellow-500" },
    { score: 3, label: strengthLabels.good || "Good", color: "bg-blue-500", textColor: "text-blue-500" },
    { score: 4, label: strengthLabels.strong || "Strong", color: "bg-green-500", textColor: "text-green-500" },
  ];

  return levels[normalized];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const t = useTranslations("auth");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});

  const strengthLabels = {
    very_weak: t("password_strength.very_weak"),
    weak: t("password_strength.weak"),
    fair: t("password_strength.fair"),
    good: t("password_strength.good"),
    strong: t("password_strength.strong"),
  };

  const strength = password ? evaluatePasswordStrength(password, strengthLabels) : null;

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = t("validation.name_required");
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = t("validation.name_min_length");
    }

    if (!email.trim()) {
      newErrors.email = t("validation.email_required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t("validation.email_invalid");
    }

    if (!password) {
      newErrors.password = t("validation.password_required");
    } else if (password.length < 8) {
      newErrors.password = t("validation.password_min_length");
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = t("validation.password_uppercase");
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = t("validation.password_lowercase");
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = t("validation.password_number");
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t("validation.confirm_required");
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t("validation.passwords_match");
    }

    if (!agreeToTerms) {
      newErrors.terms = t("validation.terms_required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await signup(email.trim(), password, fullName.trim());
      router.push("/login");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("signup_failed");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl">{t("signup_title")}</CardTitle>
          <CardDescription>
            {t("signup_subtitle")}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium leading-none">
                {t("full_name")}
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder={t("full_name_placeholder")}
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                disabled={isSubmitting}
                autoComplete="name"
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? "fullName-error" : undefined}
              />
              {errors.fullName && (
                <p id="fullName-error" className="text-sm text-destructive">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                {t("password")}
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("password_placeholder")}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  className="pr-10"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? t("hide_password") : t("show_password")}
                >
                  {showPassword ? (
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

              {/* Password Strength Meter */}
              {password && strength && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          level <= strength.score ? strength.color : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strength.textColor}`}>
                    {strength.label}
                  </p>
                </div>
              )}

              {errors.password && (
                <p id="password-error" className="text-sm text-destructive">
                  {errors.password}
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                {t("password_hint")}
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
                {t("confirm_password")}
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

            {/* Terms Checkbox */}
            <div className="space-y-1">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => {
                    setAgreeToTerms(e.target.checked);
                    if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }));
                  }}
                  disabled={isSubmitting}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer select-none">
                  {t("terms_text")}{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    {t("terms_link")}
                  </Link>{" "}
                  {t("and")}{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    {t("privacy_link")}
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <p className="text-sm text-destructive ml-6">
                  {errors.terms}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <ButtonLoader />
                  {t("creating_account")}
                </span>
              ) : (
                t("sign_up")
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t("have_account")}{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                {t("sign_in_link")}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}