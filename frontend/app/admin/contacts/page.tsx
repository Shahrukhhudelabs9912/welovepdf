"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Inbox,
  Eye,
  Reply,
  RefreshCw,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Send,
  Clock,
  User,
  MessageSquare,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Submission {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
  submitted_at: string;
  ip?: string;
  user_agent?: string;
  email_sent?: boolean;
}

interface SubmissionsResponse {
  submissions: Submission[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const STATUS_CONFIG = {
  new: { label: "New", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  read: { label: "Read", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  replied: { label: "Replied", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
};

export default function AdminContactsPage() {
  const [token, setToken] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [data, setData] = useState<SubmissionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [selected, setSelected] = useState<Submission | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_token");
    if (saved) {
      setToken(saved);
      setAuthenticated(true);
    }
  }, []);

  const authHeader = `Bearer ${token}`;

  const fetchSubmissions = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/contacts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        setAuthenticated(false);
        sessionStorage.removeItem("admin_token");
        setLoginError("Session expired. Please log in again.");
        return;
      }
      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter]);

  useEffect(() => {
    if (authenticated) fetchSubmissions();
  }, [authenticated, fetchSubmissions]);

  const handleLogin = async () => {
    const pwd = passwordInput.trim();
    if (!pwd) {
      setLoginError("Please enter your password.");
      return;
    }
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoginError(data?.detail || "Login failed.");
        return;
      }
      const adminToken = data.token;
      setToken(adminToken);
      sessionStorage.setItem("admin_token", adminToken);
      setAuthenticated(true);
    } catch {
      setLoginError("Could not reach the server.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    setToken("");
    setAuthenticated(false);
    setData(null);
    setSelected(null);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: { Authorization: authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.detail || "Failed to update status.");
        return;
      }
      toast.success(`Status updated to "${newStatus}".`);
      if (selected && selected._id === id) {
        setSelected({ ...selected, status: newStatus as Submission["status"] });
      }
      fetchSubmissions();
    } catch {
      toast.error("Network error.");
    }
  };

  const handleReply = async () => {
    if (!selected || !replyText.trim()) return;
    setReplying(true);
    try {
      const res = await fetch(`/api/admin/contacts/${selected._id}/reply`, {
        method: "POST",
        headers: { Authorization: authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json?.detail || "Failed to send reply.");
        return;
      }
      toast.success("Reply sent successfully!");
      setReplyText("");
      setSelected({ ...selected, status: "replied" });
      fetchSubmissions();
    } catch {
      toast.error("Network error.");
    } finally {
      setReplying(false);
    }
  };

  const openSubmission = (sub: Submission) => {
    setSelected(sub);
    setReplyText("");
    if (sub.status === "new") {
      updateStatus(sub._id, "read");
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  // --- Token Gate ---
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter your admin password to continue</p>
          </div>
          <div className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setLoginError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className={loginError ? "border-red-500" : ""}
                disabled={loggingIn}
              />
              {loginError && <p className="mt-1 text-xs text-red-500">{loginError}</p>}
            </div>
            <Button className="w-full" onClick={handleLogin} disabled={loggingIn}>
              {loggingIn ? "Signing in..." : "Sign In"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const counts = {
    total: data?.total ?? 0,
    new: 0,
    read: 0,
    replied: 0,
  };
  data?.submissions.forEach((s) => {
    if (s.status in counts) counts[s.status as keyof typeof counts]++;
  });

  // --- Dashboard ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-900 sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">Contact Submissions</h1>
            <Badge variant="secondary" className="ml-2">{data?.total ?? 0} total</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchSubmissions} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { value: "", label: "All", icon: Inbox },
            { value: "new", label: "New", icon: Mail },
            { value: "read", label: "Read", icon: Eye },
            { value: "replied", label: "Replied", icon: Reply },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <Button
                key={f.value}
                variant={statusFilter === f.value ? "default" : "outline"}
                size="sm"
                onClick={() => { setStatusFilter(f.value); setPage(1); }}
              >
                <Icon className="h-3.5 w-3.5 mr-1.5" />
                {f.label}
              </Button>
            );
          })}
        </div>

        <div className="flex gap-6">
          {/* Table */}
          <div className={`flex-1 min-w-0 ${selected ? "hidden lg:block" : ""}`}>
            {loading && !data ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !data?.submissions.length ? (
              <Card className="p-12 text-center">
                <Inbox className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No submissions found.</p>
              </Card>
            ) : (
              <>
                <div className="space-y-2">
                  {data.submissions.map((sub) => (
                    <Card
                      key={sub._id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        selected?._id === sub._id ? "ring-2 ring-primary" : ""
                      } ${sub.status === "new" ? "border-l-4 border-l-green-500" : ""}`}
                      onClick={() => openSubmission(sub)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm truncate">
                              {sub.first_name} {sub.last_name}
                            </span>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CONFIG[sub.status].className}`}>
                              {STATUS_CONFIG[sub.status].label}
                            </span>
                          </div>
                          <p className="text-sm font-medium truncate">{sub.subject}</p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{sub.email}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(sub.submitted_at)}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {data.pages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {data.page} of {data.pages}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Detail Panel */}
          {selected && (
            <div className="w-full lg:w-[480px] shrink-0">
              <Card className="p-6 sticky top-24">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-lg font-bold pr-2">{selected.subject}</h2>
                  <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{selected.first_name} {selected.last_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(selected.submitted_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>Status: </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CONFIG[selected.status].className}`}>
                      {STATUS_CONFIG[selected.status].label}
                    </span>
                  </div>
                </div>

                {/* Message */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                  <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
                </div>

                {/* Status actions */}
                <div className="flex gap-2 mb-6">
                  {selected.status !== "new" && (
                    <Button variant="outline" size="sm" onClick={() => updateStatus(selected._id, "new")}>
                      Mark as New
                    </Button>
                  )}
                  {selected.status !== "read" && (
                    <Button variant="outline" size="sm" onClick={() => updateStatus(selected._id, "read")}>
                      Mark as Read
                    </Button>
                  )}
                </div>

                {/* Reply */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-2">Reply to {selected.first_name}</h3>
                  <Textarea
                    placeholder="Type your reply..."
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={replying}
                  />
                  <Button
                    className="w-full mt-3 gap-2"
                    onClick={handleReply}
                    disabled={replying || !replyText.trim()}
                  >
                    <Send className="h-4 w-4" />
                    {replying ? "Sending..." : "Send Reply"}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
