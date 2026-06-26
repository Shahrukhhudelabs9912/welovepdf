import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type IconColor = "blue" | "amber" | "red" | "green" | "purple";

// Tailwind needs full class names at build time so we map color → both bg + text.
// JIT can't pick `bg-${color}-100` strings.
const iconColorMap: Record<IconColor, { bg: string; fg: string }> = {
  blue:   { bg: "bg-blue-100 dark:bg-blue-900/30",     fg: "text-blue-600 dark:text-blue-400" },
  amber:  { bg: "bg-amber-100 dark:bg-amber-900/30",   fg: "text-amber-600 dark:text-amber-400" },
  red:    { bg: "bg-red-100 dark:bg-red-900/30",       fg: "text-red-600 dark:text-red-400" },
  green:  { bg: "bg-green-100 dark:bg-green-900/30",   fg: "text-green-600 dark:text-green-400" },
  purple: { bg: "bg-purple-100 dark:bg-purple-900/30", fg: "text-purple-600 dark:text-purple-400" },
};

interface PageHeroProps {
  /** Lucide icon component (e.g. Shield, FileText, Cookie) */
  icon?: LucideIcon;
  /** Tinted background circle color around the icon. Default: blue */
  iconColor?: IconColor;
  /** Optional pill text above the title */
  badge?: string;
  /** Title text. Use a string OR ReactNode for gradients/spans. */
  title: ReactNode;
  /** One-line subtitle under the title */
  subtitle?: string;
  /** Optional pill rendered below subtitle (e.g. "Last updated: …") */
  meta?: ReactNode;
  /** Optional CTA buttons row below meta */
  actions?: ReactNode;
  className?: string;
}

/**
 * Centered page hero used by legal docs, marketing pages, and content pages.
 * Render order (top → bottom): icon → badge → title → subtitle → meta → actions.
 */
export function PageHero({
  icon: Icon,
  iconColor = "blue",
  badge,
  title,
  subtitle,
  meta,
  actions,
  className,
}: PageHeroProps) {
  const colors = iconColorMap[iconColor];

  return (
    <div className={cn("mb-12 text-center", className)}>
      {Icon && (
        <div
          className={cn(
            "inline-flex h-16 w-16 items-center justify-center rounded-full",
            colors.bg,
          )}
        >
          <Icon className={cn("h-8 w-8", colors.fg)} />
        </div>
      )}

      {badge && (
        <div className="mt-4 inline-block rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-muted-foreground dark:border-gray-800">
          {badge}
        </div>
      )}

      <h1 className={cn("text-4xl font-bold tracking-tight sm:text-5xl", (Icon || badge) ? "mt-6" : "")}>
        {title}
      </h1>

      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {subtitle}
        </p>
      )}

      {meta && <div className="mt-8">{meta}</div>}

      {actions && <div className="mt-8 flex flex-wrap justify-center gap-4">{actions}</div>}
    </div>
  );
}
