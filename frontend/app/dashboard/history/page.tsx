"use client";

import { useState, useEffect, useCallback } from "react";
import { HistoryTable, HistoryItem } from "@/components/dashboard/history-table";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useAuth } from "@/lib/auth-context";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Search } from "lucide-react";

const LIMIT = 10;

export default function DashboardHistoryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (newOffset: number) => {
    try {
      setLoading(true);
      setError(null);
      const tokensStr = localStorage.getItem("pdforca_auth_tokens");
      if (!tokensStr) throw new Error("Not authenticated");
      const tokens = JSON.parse(tokensStr);
      const res = await fetch(
        `/api/dashboard/history?limit=${LIMIT}&offset=${newOffset}`,
        {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to load history");
      const json = await res.json();
      setItems(json.items ?? []);
      setTotal(json.total ?? 0);
      setOffset(newOffset);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load history";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const tokensStr = localStorage.getItem("pdforca_auth_tokens");
        if (!tokensStr) return;
        const tokens = JSON.parse(tokensStr);
        const res = await fetch(`/api/dashboard/history/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        if (!res.ok) throw new Error("Failed to delete");
        setItems((prev) => prev.filter((item) => item._id !== id));
        setTotal((prev) => prev - 1);
      } catch {
        // silently fail — user can retry
      }
    },
    []
  );

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchHistory(0);
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, fetchHistory]);

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
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
          <h2 className="text-xl font-semibold mb-2">Sign in to view your history</h2>
          <p className="text-muted-foreground mb-6">Access your AI analysis history and past reports.</p>
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
          <h1 className="text-2xl font-bold tracking-tight">AI Analysis History</h1>
          <p className="text-muted-foreground mt-1">
            Browse and manage your past PDF analysis results.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => fetchHistory(offset)}
            >
              Try Again
            </Button>
          </div>
        )}

        <HistoryTable
          items={items}
          total={total}
          limit={LIMIT}
          offset={offset}
          loading={loading}
          onPageChange={fetchHistory}
          onDelete={handleDelete}
        />
      </div>
    </DashboardLayout>
  );
}