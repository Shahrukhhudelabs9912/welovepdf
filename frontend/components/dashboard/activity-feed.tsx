"use client";

import { useTranslations } from "next-intl";
import { ScrollText, FileText, Download, LogIn, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/skeleton-loader";
import { EmptyState } from "@/components/empty-state";

export interface ActivityItem {
  _id: string;
  action: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
}

function formatTimestamp(ts: string, t: (key: string, params?: Record<string, string | number>) => string): string {
  try {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t("dashboard.activity_just_now");
    if (diffMins < 60) return t("dashboard.activity_mins_ago", { minutes: diffMins });
    if (diffHours < 24) return t("dashboard.activity_hours_ago", { hours: diffHours });
    if (diffDays < 7) return t("dashboard.activity_days_ago", { days: diffDays });
    return date.toLocaleDateString();
  } catch {
    return ts;
  }
}

const activityIconMap: Record<string, { icon: typeof FileText; color: string; labelKey: string }> = {
  ai_analysis: {
    icon: ScrollText,
    color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    labelKey: "activity_ai_analysis",
  },
  report_export: {
    icon: Download,
    color: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
    labelKey: "activity_report_exported",
  },
  login: {
    icon: LogIn,
    color: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
    labelKey: "activity_login",
  },
};

export function ActivityFeed({ activities, loading = false }: ActivityFeedProps) {
  const t = useTranslations();

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities.length) {
    return (
      <EmptyState
        icon={ScrollText}
        title={t("dashboard.no_activity")}
        description={t("dashboard.no_activity_desc")}
      />
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((item) => {
        const iconCfg = activityIconMap[item.action] || {
          icon: AlertCircle,
          color: "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
        };
        const Icon = iconCfg.icon;
        const label = iconCfg.labelKey ? t(`dashboard.${iconCfg.labelKey}`) : item.action;
        return (
          <div
            key={item._id}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent/50"
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconCfg.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{label}</p>
              {!!(item.metadata as Record<string, unknown>)?.filename && (
                <p className="text-xs text-muted-foreground truncate">
                  {String((item.metadata as Record<string, unknown>)?.filename)}
                </p>
              )}
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatTimestamp(item.timestamp, t)}
            </span>
          </div>
        );
      })}
    </div>
  );
}