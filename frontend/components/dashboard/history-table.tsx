"use client";

import { useState } from "react";
import { FileText, Trash2, ChevronLeft, ChevronRight, ExternalLink, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/skeleton-loader";
import { EmptyState } from "@/components/empty-state";
import { useTranslations } from "next-intl";
import { Link } from "@/routing";

export interface HistoryItem {
  _id: string;
  original_filename: string;
  title: string;
  summary: string;
  word_count: number;
  page_count: number;
  reading_time: string;
  sentiment: string;
  confidence: number;
  created_at: string;
}

interface HistoryTableProps {
  items: HistoryItem[];
  total: number;
  limit: number;
  offset: number;
  loading?: boolean;
  onPageChange: (offset: number) => void;
  onDelete: (id: string) => void;
}

function formatDate(ts: string): string {
  try {
    const date = new Date(ts);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return ts;
  }
}

export function HistoryTable({
  items,
  total,
  limit,
  offset,
  loading = false,
  onPageChange,
  onDelete,
}: HistoryTableProps) {
  const t = useTranslations();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        icon={FileText}
        title={t("dashboard.no_history")}
        description={t("dashboard.no_history_desc")}
        actionLabel={t("dashboard.try_ai_analysis")}
        onAction={() => window.location.href = "/ai-tools"}
      />
    );
  }

  return (
    <div>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.title || item.original_filename}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDate(item.created_at)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.word_count} {t("dashboard.words_label")} · {item.page_count} {t("dashboard.pages_label")}
                </span>
                <span className="text-xs capitalize text-muted-foreground">
                  {item.sentiment}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Link href={`/ai-tools?history=${item._id}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8" title={t("dashboard.view_details")}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                onClick={() => handleDelete(item._id)}
                disabled={deletingId === item._id}
                title={t("dashboard.delete")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {t("dashboard.showing", { start: offset + 1, end: Math.min(offset + limit, total), total })}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(offset - limit)}
              disabled={offset === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageOffset = i * limit;
              const isActive = offset === pageOffset;
              return (
                <Button
                  key={i}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className="min-w-[2rem]"
                  onClick={() => onPageChange(pageOffset)}
                >
                  {i + 1}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(offset + limit)}
              disabled={offset + limit >= total}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}