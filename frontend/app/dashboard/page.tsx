"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  ScrollText,
  Download,
  BarChart3,
  Clock,
  TrendingUp,
  Brain,
} from "lucide-react";
import { MetricsCard } from "@/components/dashboard/metrics-card";
import { ActivityFeed, ActivityItem } from "@/components/dashboard/activity-feed";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useAuth } from "@/lib/auth-context";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardOverviewData {
  user: {
    full_name: string;
    email: string;
  };
  usageStats: Record<string, number>;
  recentActivity: ActivityItem[];
  historyCount: number;
}

export default function DashboardOverviewPage() {
  const t = useTranslations();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const tokensStr = localStorage.getItem("pdforca_auth_tokens");
      if (!tokensStr) {
        setLoading(false);
        return;
      }
      const tokens = JSON.parse(tokensStr);
      const res = await fetch("/api/dashboard/overview", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to load dashboard data");
      }
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchOverview();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, fetchOverview]);

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
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
          <h2 className="text-xl font-semibold mb-2">{t("dashboard.sign_in_to_view")}</h2>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            {t("dashboard.sign_in_desc")}
          </p>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="default">{t("auth.sign_in")}</Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline">{t("auth.sign_up")}</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchOverview} variant="outline">
            {t("common.try_again")}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const totalAnalyses = data?.usageStats?.ai_analysis ?? 0;
  const totalReports = data?.usageStats?.report_export ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {data?.user?.full_name
              ? t("dashboard.welcome_back", { name: `, ${data.user.full_name}` })
              : t("dashboard.welcome_back", { name: "" })}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("dashboard.overview_subtitle")}
          </p>
        </div>

        {/* Metrics grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricsCard
            title={t("dashboard.ai_analyses")}
            value={totalAnalyses}
            icon={Brain}
            description={t("dashboard.analyses_desc")}
            loading={loading}
          />
          <MetricsCard
            title={t("dashboard.reports_generated")}
            value={totalReports}
            icon={Download}
            description={t("dashboard.reports_desc")}
            loading={loading}
          />
          <MetricsCard
            title={t("dashboard.history_entries")}
            value={data?.historyCount ?? 0}
            icon={ScrollText}
            description={t("dashboard.history_desc")}
            loading={loading}
          />
        </div>

        {/* Quick actions */}
        <div className="rounded-lg border bg-card p-5">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            {t("dashboard.quick_actions")}
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/ai-tools">
              <Button variant="default" size="sm">
                <Brain className="mr-1.5 h-4 w-4" />
                {t("dashboard.analyze_pdf")}
              </Button>
            </Link>
            <Link href="/dashboard/history">
              <Button variant="outline" size="sm">
                <Clock className="mr-1.5 h-4 w-4" />
                {t("dashboard.view_history")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-lg border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            {t("dashboard.recent_activity")}
          </h2>
          <ActivityFeed
            activities={data?.recentActivity ?? []}
            loading={loading}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}