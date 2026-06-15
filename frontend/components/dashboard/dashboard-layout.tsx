"use client";

import { ReactNode } from "react";
import { Link } from "@/routing";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { LayoutDashboard, ScrollText, FileText, Download, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  {
    href: "/dashboard",
    labelKey: "overview",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/dashboard/history",
    labelKey: "history",
    icon: ScrollText,
    exact: false,
  },
  {
    href: "/dashboard/reports",
    labelKey: "reports",
    icon: Download,
    exact: false,
  },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const t = useTranslations();

  const isActive = (link: (typeof sidebarLinks)[0]) => {
    if (link.exact) {
      return pathname === link.href;
    }
    return pathname.startsWith(link.href);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <nav className="space-y-1 sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-3">
                {t("dashboard.sidebar_section")}
              </p>
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive(link)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {t(`dashboard.${link.labelKey}`)}
                  </Link>
                );
              })}

              <div className="pt-6 mt-6 border-t">
                <Link
                  href="/settings"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname === "/settings"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  {t("dashboard.settings")}
                </Link>
              </div>
            </nav>
          </aside>

          {/* Mobile sub-nav */}
          <div className="lg:hidden w-full mb-6">
            <div className="flex gap-1 overflow-x-auto pb-2 -mx-4 px-4">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                      isActive(link)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {t(`dashboard.${link.labelKey}`)}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}