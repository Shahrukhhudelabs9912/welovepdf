import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Align = "center" | "left";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: Align;
  /** Used for in-page anchor scrolling (e.g. #comparison) */
  id?: string;
  className?: string;
}

/**
 * Standard section header: <h2 + p subtitle> with consistent typography.
 * Replaces repeated `<h2 className="text-3xl font-bold">...` + sibling
 * `<p className="text-gray-600 dark:text-gray-400">...` combos found
 * across about, features, pricing, and content pages.
 */
export function SectionHeader({
  title,
  subtitle,
  align = "center",
  id,
  className,
}: SectionHeaderProps) {
  const alignClass = align === "center" ? "text-center" : "text-left";
  const subtitleClass =
    align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl";

  return (
    <div id={id} className={cn("mb-12 scroll-mt-24", alignClass, className)}>
      <h2 className="mb-4 text-3xl font-bold tracking-tight">{title}</h2>
      {subtitle && (
        <p className={cn("text-muted-foreground", subtitleClass)}>{subtitle}</p>
      )}
    </div>
  );
}
