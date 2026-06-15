"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { User, Settings, Shield, Loader2, Eye, EyeOff } from "lucide-react";

// ---------------------------------------------------------------------------
// API helpers (mirror auth-context pattern)
// ---------------------------------------------------------------------------

const PYTHON_API_BASE = process.env.NEXT_PUBLIC_PYTHON_API_BASE || "http://localhost:8000/api";
const USE_PYTHON_BACKEND = process.env.NEXT_PUBLIC_USE_PYTHON_BACKEND === "true";
const TOKEN_KEY = "welovepdf_auth_tokens";

function getApiUrl(path: string): string {
  if (USE_PYTHON_BACKEND) {
    return `${PYTHON_API_BASE}${path}`;
  }
  return `/api${path}`;
}

function loadAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.access_token || null;
  } catch {
    return null;
  }
}

function saveUserToLocal(user: { id: string; email: string; full_name: string; is_active: boolean; is_verified: boolean; created_at: string | null }) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("welovepdf_auth_user", JSON.stringify(user));
  } catch {
    // localStorage may be unavailable
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = "profile" | "security";

// ---------------------------------------------------------------------------
// Settings Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const router = useRouter();
  const t = useTranslations();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Profile form state
  const [fullName, setFullName] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Security form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [securityErrors, setSecurityErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
  }>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error(t("settings_page.unauthorized"));
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router, t]);

  // Populate name when user loads
  useEffect(() => {
    if (user?.full_name) {
      setFullName(user.full_name);
    }
  }, [user]);

  // -----------------------------------------------------------------------
  // Profile update handler
  // -----------------------------------------------------------------------
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setIsUpdatingProfile(true);
    try {
      const token = loadAccessToken();
      if (!token) throw new Error(t("settings_page.unauthorized"));

      const response = await fetch(getApiUrl("/auth/profile"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ full_name: fullName.trim() }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || t("settings_page.loading_error"));
      }

      const data = await response.json();
      // Update local user info in auth context (via localStorage)
      if (data.user) {
        saveUserToLocal(data.user);
      }

      toast.success(t("settings_page.profile_updated"));
      // Force a page refresh to pick up the new user data in the header
      window.location.reload();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("settings_page.loading_error");
      toast.error(message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // -----------------------------------------------------------------------
  // Change password handler
  // -----------------------------------------------------------------------
  const validateSecurityForm = (): boolean => {
    const errors: typeof securityErrors = {};

    if (!currentPassword) {
      errors.currentPassword = t("settings_page.current_password_required");
    }
    if (!newPassword) {
      errors.newPassword = t("settings_page.new_password_required");
    } else if (newPassword.length < 8) {
      errors.newPassword = t("settings_page.password_min_length_error");
    }
    if (!confirmNewPassword) {
      errors.confirmNewPassword = t("settings_page.confirm_new_password_required");
    } else if (newPassword !== confirmNewPassword) {
      errors.confirmNewPassword = t("settings_page.passwords_dont_match");
    }

    setSecurityErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSecurityForm()) return;

    setIsChangingPassword(true);
    try {
      const token = loadAccessToken();
      if (!token) throw new Error(t("settings_page.unauthorized"));

      const response = await fetch(getApiUrl("/auth/change-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        if (error.detail === "Current password is incorrect.") {
          throw new Error(t("settings_page.wrong_password"));
        }
        throw new Error(error.detail || t("settings_page.loading_error"));
      }

      toast.success(t("settings_page.password_changed"));
      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setSecurityErrors({});
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("settings_page.loading_error");
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Format member since date
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="min-h-[80vh] px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t("settings_page.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("settings_page.description")}</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex border-b">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "profile"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" />
            {t("settings_page.profile_tab")}
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "security"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shield className="h-4 w-4" />
            {t("settings_page.security_tab")}
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <Card>
            <CardHeader>
              <CardTitle>{t("settings_page.profile_title")}</CardTitle>
              <CardDescription>{t("settings_page.profile_description")}</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-4">
                {/* Email (read-only) */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium leading-none">
                    {t("settings_page.email_label")}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">{t("settings_page.email_readonly_note")}</p>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium leading-none">
                    {t("settings_page.name_label")}
                  </label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder={t("settings_page.name_placeholder")}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isUpdatingProfile}
                    autoComplete="name"
                  />
                </div>

                {/* Member Since */}
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    {t("settings_page.member_since")}: {memberSince}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isUpdatingProfile || !fullName.trim()}>
                  {isUpdatingProfile ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("settings_page.updating_profile")}
                    </span>
                  ) : (
                    t("settings_page.update_profile")
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <Card>
            <CardHeader>
              <CardTitle>{t("settings_page.security_title")}</CardTitle>
              <CardDescription>{t("settings_page.security_description")}</CardDescription>
            </CardHeader>
            <form onSubmit={handleChangePassword}>
              <CardContent className="space-y-4">
                {/* Current Password */}
                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="text-sm font-medium leading-none">
                    {t("settings_page.current_password")}
                  </label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder={t("settings_page.current_password_placeholder")}
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        if (securityErrors.currentPassword)
                          setSecurityErrors((prev) => ({ ...prev, currentPassword: undefined }));
                      }}
                      disabled={isChangingPassword}
                      autoComplete="current-password"
                      className="pr-10"
                      aria-invalid={!!securityErrors.currentPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {securityErrors.currentPassword && (
                    <p className="text-sm text-destructive">{securityErrors.currentPassword}</p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium leading-none">
                    {t("settings_page.new_password")}
                  </label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder={t("settings_page.new_password_placeholder")}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (securityErrors.newPassword)
                          setSecurityErrors((prev) => ({ ...prev, newPassword: undefined }));
                      }}
                      disabled={isChangingPassword}
                      autoComplete="new-password"
                      className="pr-10"
                      aria-invalid={!!securityErrors.newPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {securityErrors.newPassword && (
                    <p className="text-sm text-destructive">{securityErrors.newPassword}</p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-2">
                  <label htmlFor="confirmNewPassword" className="text-sm font-medium leading-none">
                    {t("settings_page.confirm_new_password")}
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmNewPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("settings_page.confirm_new_password_placeholder")}
                      value={confirmNewPassword}
                      onChange={(e) => {
                        setConfirmNewPassword(e.target.value);
                        if (securityErrors.confirmNewPassword)
                          setSecurityErrors((prev) => ({ ...prev, confirmNewPassword: undefined }));
                      }}
                      disabled={isChangingPassword}
                      autoComplete="new-password"
                      className="pr-10"
                      aria-invalid={!!securityErrors.confirmNewPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {securityErrors.confirmNewPassword && (
                    <p className="text-sm text-destructive">{securityErrors.confirmNewPassword}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("settings_page.changing_password")}
                    </span>
                  ) : (
                    t("settings_page.change_password")
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}