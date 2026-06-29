"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useAuth } from "@/lib/auth-context";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileText, Brain } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

interface ReportItem {
  _id: string;
  title: string;
  original_filename: string;
  summary: string;
  word_count: number;
  page_count: number;
  sentiment: string;
  created_at: string;
}

export default function DashboardReportsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const tokensStr = localStorage.getItem("pdforca_auth_tokens");
      if (!tokensStr) return;
      const tokens = JSON.parse(tokensStr);
      const res = await fetch("/api/dashboard/history?limit=50&offset=0", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      setItems(json.items ?? []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchReports();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, fetchReports]);

  const handleDownload = async (item: ReportItem) => {
    setDownloading(item._id);
    try {
      const tokensStr = localStorage.getItem("pdforca_auth_tokens");
      if (!tokensStr) return;
      const tokens = JSON.parse(tokensStr);

      const formData = new FormData();
      formData.append("summary", item.summary);
      formData.append("title", item.title);
      formData.append("wordCount", String(item.word_count));
      formData.append("pageCount", String(item.page_count));

      const res = await fetch("/api/ai-tools/report", {
        method: "POST",
        headers: { Authorization: `Bearer ${tokens.access_token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.title || "ai_report"}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // silently fail
    } finally {
      setDownloading(null);
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Sign in to view your reports</h2>
          <p className="text-muted-foreground mb-6">Download your generated AI analysis reports.</p>
          <Link href="/login">
            <Button variant="default">Sign In</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saved Reports</h1>
          <p className="text-muted-foreground mt-1">
            Re-download your generated AI analysis reports.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Download}
            title="No reports yet"
            description="Analyze a PDF with AI tools to generate your first report."
            actionLabel="Analyze a PDF"
            onAction={() => window.location.href = "/ai-tools"}
          />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item._id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="h-4 w-4 text-primary shrink-0" />
                      <p className="text-sm font-medium truncate">
                        {item.title || item.original_filename}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {item.summary}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{item.word_count} words</span>
                      <span>{item.page_count} pages</span>
                      <span className="capitalize">{item.sentiment}</span>
                      <span>
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => handleDownload(item)}
                    disabled={downloading === item._id}
                  >
                    <Download className="mr-1.5 h-4 w-4" />
                    {downloading === item._id ? "..." : "Download"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}