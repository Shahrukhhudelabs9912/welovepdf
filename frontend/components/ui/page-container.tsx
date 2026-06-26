import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Size = "narrow" | "default" | "wide";

const sizeClass: Record<Size, string> = {
  narrow: "max-w-3xl",
  default: "max-w-4xl",
  wide: "max-w-6xl",
};

interface PageContainerProps {
  children: ReactNode;
  /**
   * narrow = max-w-3xl (text-heavy pages: blog, careers, pricing)
   * default = max-w-4xl (legal docs, single-column content)
   * wide = max-w-6xl (grids, dashboards, comparison tables)
   */
  size?: Size;
  className?: string;
}

/**
 * Page-level wrapper that standardizes outer padding and max-width across
 * marketing, legal, and content pages. Replaces the repeated boilerplate:
 *   <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
 *     <div className="mx-auto max-w-Xxl">...</div>
 *   </div>
 */
export function PageContainer({ children, size = "default", className }: PageContainerProps) {
  return (
    <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
      <div className={cn("mx-auto", sizeClass[size], className)}>{children}</div>
    </div>
  );
}
