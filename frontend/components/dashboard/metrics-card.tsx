"use client";

import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/skeleton-loader";
import { useTranslations } from "next-intl";

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  loading?: boolean;
}

export function MetricsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  loading = false,
}: MetricsCardProps) {
  const t = useTranslations();

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              trend.positive
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-muted-foreground">{t("dashboard.vs_last_month")}</span>
        </div>
      )}
    </Card>
  );
}