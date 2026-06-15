"use client";

import { cn } from "@/lib/utils";
import { FileUp, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: { iconContainer: "h-10 w-10", icon: "h-5 w-5", title: "text-base" },
  md: { iconContainer: "h-16 w-16", icon: "h-8 w-8", title: "text-lg" },
  lg: { iconContainer: "h-20 w-20", icon: "h-10 w-10", title: "text-xl" },
};

export function EmptyState({
  icon: Icon = FileUp,
  title,
  description,
  actionLabel,
  onAction,
  className,
  size = "md",
}: EmptyStateProps) {
  const cfg = sizeConfig[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 py-16 text-center",
        className,
      )}
    >
      <div
        className={cn(
          "mb-4 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800",
          cfg.iconContainer,
        )}
      >
        <Icon className={cn("text-gray-400 dark:text-gray-500", cfg.icon)} />
      </div>
      <h3 className={cn("font-semibold text-gray-900 dark:text-white", cfg.title)}>
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4 gap-2" variant="outline">
          <FileUp className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}