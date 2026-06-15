"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        className,
      )}
      aria-hidden="true"
    />
  );
}

// ── Pre-built skeleton patterns ──────────────────────────────────────

/** Full-page skeleton used as dynamic() loading fallback — mimics ToolLayout shell */
export function ToolPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Title skeleton */}
        <div className="mb-8 space-y-3 text-center">
          <Skeleton className="mx-auto h-8 w-64" />
          <Skeleton className="mx-auto h-5 w-96" />
        </div>

        {/* 3-column grid matching ToolLayout */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content column (2/3) */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
              {/* Tool header area */}
              <div className="mb-6 flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-8 w-32 rounded-full" />
              </div>
              {/* Upload area */}
              <Skeleton className="mb-6 h-40 w-full rounded-xl" />
              {/* Settings row */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              {/* Action buttons */}
              <div className="mt-6 flex justify-center gap-4">
                <Skeleton className="h-11 w-40" />
                <Skeleton className="h-11 w-40" />
              </div>
            </div>
          </div>

          {/* Sidebar column (1/3) */}
          <div className="space-y-6">
            {/* How to use card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <Skeleton className="mb-4 h-5 w-28" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
            {/* Features card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <Skeleton className="mb-4 h-5 w-28" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </div>
            {/* Popular tools card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <Skeleton className="mb-4 h-5 w-28" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Lighter skeleton for the tool content area inside ToolLayout's white card */
export function ToolContentSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {/* Upload area */}
      <Skeleton className="h-36 w-full rounded-xl" />
      {/* File list */}
      <div className="space-y-2">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
      {/* Settings / options row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      {/* Action buttons */}
      <div className="flex justify-center gap-4 pt-2">
        <Skeleton className="h-11 w-40" />
        <Skeleton className="h-11 w-40" />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 p-6 dark:border-gray-800">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

export function FileListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-800"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      ))}
    </div>
  );
}