"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string | null;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string | null;
  expires_in: number;
}

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<string>; // returns message
  resetPassword: (token: string, newPassword: string) => Promise<string>;
  refreshAuthToken: () => Promise<boolean>;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

// All auth requests go through the Next.js server-side proxy at /api/auth/*
// (see app/api/auth/[...path]/route.ts). The Python backend URL is never
// exposed to the browser bundle.
function getApiUrl(path: string): string {
  return `/api${path}`;
}

// ---------------------------------------------------------------------------
// Token storage helpers
// ---------------------------------------------------------------------------

const TOKEN_KEY = "pdforca_auth_tokens";
const USER_KEY = "pdforca_auth_user";

function saveTokens(tokens: AuthTokens): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  } catch {
    // localStorage may be unavailable
  }
}

function loadTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.access_token) return parsed as AuthTokens;
  } catch {
    // Invalid JSON
  }
  return null;
}

function clearTokens(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // localStorage may be unavailable
  }
}

function saveUser(user: User): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // localStorage may be unavailable
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTimer, setRefreshTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // Clear refresh timer helper
  const clearRefreshTimer = useCallback(() => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      setRefreshTimer(null);
    }
  }, [refreshTimer]);

  // Schedule token refresh before expiry
  const scheduleRefresh = useCallback(
    (expiresIn: number) => {
      clearRefreshTimer();
      // Refresh 2 minutes before expiry
      const refreshMs = Math.max(0, (expiresIn - 120) * 1000);
      if (refreshMs > 0) {
        const timer = setTimeout(() => {
          refreshAuthToken().catch(() => {
            // Silent fail — user will be prompted to re-login when token expires
          });
        }, refreshMs);
        setRefreshTimer(timer);
      }
    },
    [clearRefreshTimer]
  );

  // Refresh the access token using the refresh token
  const refreshAuthToken = useCallback(async (): Promise<boolean> => {
    const storedTokens = loadTokens();
    if (!storedTokens?.refresh_token) return false;

    try {
      const response = await fetch(getApiUrl("/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: storedTokens.refresh_token }),
      });

      if (!response.ok) {
        // Refresh failed — clear everything
        setUser(null);
        setTokens(null);
        clearTokens();
        clearRefreshTimer();
        return false;
      }

      const data = await response.json();
      const newTokens: AuthTokens = {
        access_token: data.access_token,
        refresh_token: data.refresh_token || storedTokens.refresh_token,
        expires_in: data.expires_in || 1800,
      };
      setTokens(newTokens);
      saveTokens(newTokens);
      scheduleRefresh(newTokens.expires_in);
      return true;
    } catch {
      return false;
    }
  }, [clearRefreshTimer, scheduleRefresh]);

  // On mount: restore session from localStorage
  useEffect(() => {
    const init = async () => {
      const storedTokens = loadTokens();
      if (!storedTokens?.access_token) {
        setIsLoading(false);
        return;
      }

      setTokens(storedTokens);

      // Validate token by fetching user profile
      try {
        const response = await fetch(getApiUrl("/auth/me"), {
          headers: {
            Authorization: `Bearer ${storedTokens.access_token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          saveUser(userData);
          scheduleRefresh(storedTokens.expires_in);
        } else if (response.status === 401) {
          // Token expired — try refresh
          const refreshed = await refreshAuthToken();
          if (refreshed) {
            // Retry /me with new token
            const newTokens = loadTokens();
            if (newTokens) {
              const retryResponse = await fetch(getApiUrl("/auth/me"), {
                headers: { Authorization: `Bearer ${newTokens.access_token}` },
              });
              if (retryResponse.ok) {
                const userData = await retryResponse.json();
                setUser(userData);
                saveUser(userData);
              }
            }
          } else {
            clearTokens();
            setTokens(null);
          }
        } else {
          clearTokens();
          setTokens(null);
        }
      } catch {
        // Network error — keep tokens for retry
      } finally {
        setIsLoading(false);
      }
    };

    init();

    return () => {
      clearRefreshTimer();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Login
  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      const response = await fetch(getApiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember_me: rememberMe }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Login failed. Please check your credentials.");
      }

      const data = await response.json();
      const newTokens: AuthTokens = {
        access_token: data.access_token,
        refresh_token: data.refresh_token || null,
        expires_in: data.expires_in || 1800,
      };

      setUser(data.user);
      setTokens(newTokens);
      saveTokens(newTokens);
      saveUser(data.user);
      scheduleRefresh(newTokens.expires_in);
      toast.success(`Welcome back, ${data.user.full_name}!`);
    },
    [scheduleRefresh]
  );

  // Signup — creates account only; does NOT auto-login
  const signup = useCallback(
    async (email: string, password: string, fullName: string) => {
      const response = await fetch(getApiUrl("/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Signup failed. Please try again.");
      }

      // Account created — do NOT save tokens or auto-login
      toast.success("Account created successfully! Please log in.");
    },
    []
  );

  // Logout
  const logout = useCallback(() => {
    // Fire-and-forget logout call
    const storedTokens = loadTokens();
    if (storedTokens?.access_token) {
      fetch(getApiUrl("/auth/logout"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedTokens.access_token}`,
        },
      }).catch(() => {
        // Ignore errors — client-side cleanup is what matters
      });
    }

    setUser(null);
    setTokens(null);
    clearTokens();
    clearRefreshTimer();
    router.push("/");
    toast.info("You have been logged out.");
  }, [clearRefreshTimer, router]);

  // Forgot Password
  const forgotPassword = useCallback(async (email: string): Promise<string> => {
    const response = await fetch(getApiUrl("/auth/forgot-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json().catch(() => ({}));

    // Always return a generic message (backend also uses generic messages)
    if (response.ok) {
      toast.success("If an account exists, a reset link has been sent.");
      // In dev mode, the backend returns a _dev_reset_token
      if (data._dev_reset_token) {
        return data._dev_reset_token;
      }
      return data.message || "Check your email for the reset link.";
    }

    // Even on error, show generic message for security
    toast.success("If an account exists, a reset link has been sent.");
    return "";
  }, []);

  // Reset Password
  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<string> => {
    const response = await fetch(getApiUrl("/auth/reset-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, new_password: newPassword }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Password reset failed. The link may have expired.");
    }

    const data = await response.json();
    toast.success(data.message || "Password has been reset successfully.");
    return data.message || "Password reset successful.";
  }, []);

  const value: AuthContextType = {
    user,
    tokens,
    isAuthenticated: !!user && !!tokens?.access_token,
    isLoading,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    refreshAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { type User, type AuthTokens };