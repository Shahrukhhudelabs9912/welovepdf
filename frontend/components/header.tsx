"use client";

import { useState, useEffect, useRef } from "react";
import { Link as LocaleLink } from "@/routing";
import { motion } from "framer-motion";
import {
  FileText, Menu, X, Moon, Sun, ChevronDown,
  // [Phase 3] Restore: LogOut, Settings, LayoutDashboard,
  Combine, Scissors,
  ArrowRightLeft, Shrink, Lock, Pencil,
  Paintbrush, Hash, Image as ImageIcon
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
// [Phase 3] Restore dropdown imports when freemium is enabled
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
// [Phase 3] Restore: import { useAuth } from "@/lib/auth-context";
import { LocaleSwitcher } from "@/components/locale-switcher";

const toolCategories = [
  {
    nameKey: "header.tool_categories.merge_split",
    icon: Combine,
    color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    tools: [
      { nameKey: "tools.merge_pdf", href: "/merge-pdf", icon: Combine },
      { nameKey: "tools.split_pdf", href: "/split-pdf", icon: Scissors },
      { nameKey: "tools.organize_pdf", href: "/organize-pdf", icon: ArrowRightLeft },
    ],
  },
  {
    nameKey: "header.tool_categories.convert",
    icon: ArrowRightLeft,
    color: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
    tools: [
      { nameKey: "tools.pdf_to_word", href: "/pdf-to-word", icon: FileText },
      { nameKey: "tools.word_to_pdf", href: "/word-to-pdf", icon: FileText },
      { nameKey: "tools.pdf_to_jpg", href: "/pdf-to-jpg", icon: ImageIcon },
      { nameKey: "tools.jpg_to_pdf", href: "/jpg-to-pdf", icon: ImageIcon },
    ],
  },
  {
    nameKey: "header.tool_categories.optimize",
    icon: Shrink,
    color: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
    tools: [
      { nameKey: "tools.compress_pdf", href: "/compress-pdf", icon: Shrink },
      { nameKey: "tools.protect_pdf", href: "/protect-pdf", icon: Lock },
    ],
  },
  {
    nameKey: "header.tool_categories.edit_enhance",
    icon: Pencil,
    color: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    tools: [
      { nameKey: "tools.add_watermark", href: "/add-watermark", icon: Paintbrush },
      { nameKey: "tools.page_numbering", href: "/page-numbering", icon: Hash },
    ],
  },
];

const popularTools = [
  { nameKey: "tools.merge_pdf", href: "/merge-pdf", icon: Combine, color: "text-blue-600 dark:text-blue-400" },
  { nameKey: "tools.split_pdf", href: "/split-pdf", icon: Scissors, color: "text-blue-600 dark:text-blue-400" },
  { nameKey: "tools.compress_pdf", href: "/compress-pdf", icon: Shrink, color: "text-green-600 dark:text-green-400" },
  { nameKey: "tools.pdf_to_word", href: "/pdf-to-word", icon: FileText, color: "text-purple-600 dark:text-purple-400" },
  { nameKey: "tools.word_to_pdf", href: "/word-to-pdf", icon: FileText, color: "text-purple-600 dark:text-purple-400" },
  { nameKey: "tools.jpg_to_pdf", href: "/jpg-to-pdf", icon: ImageIcon, color: "text-purple-600 dark:text-purple-400" },
];

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [allToolsOpen, setAllToolsOpen] = useState(false);
  const [popularOpen, setPopularOpen] = useState(false);
  const allToolsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popularTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { theme, setTheme } = useTheme();
  const t = useTranslations();
  // [Phase 3] Restore: const { user, isAuthenticated, logout } = useAuth();

  const hoverHandlers = (
    timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
    setOpen: (v: boolean) => void,
  ) => ({
    onMouseEnter: () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setOpen(true);
    },
    onMouseLeave: () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setOpen(false), 120);
    },
  });

  // [Phase 3] Restore getUserInitials when freemium is enabled
  // const getUserInitials = (): string => {
  //   if (!user?.full_name) return "?";
  //   return user.full_name
  //     .split(" ")
  //     .map((n) => n[0])
  //     .join("")
  //     .toUpperCase()
  //     .slice(0, 2);
  // };

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.cookie = `theme=${next}; path=/; max-age=31536000; SameSite=Lax`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: Logo + primary dropdowns */}
          <div className="flex items-center gap-6">
            <LocaleLink href="/" className="flex items-center gap-2 shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                PDF<span className="text-blue-600">Orca</span>
              </span>
            </LocaleLink>

            <nav className="hidden lg:flex lg:items-center lg:gap-1">
              {/* All Tools dropdown */}
              <div
                className="relative"
                {...hoverHandlers(allToolsTimer, setAllToolsOpen)}
              >
                <Button
                  variant="ghost"
                  className="text-sm font-medium gap-1"
                  onClick={() => setAllToolsOpen((v) => !v)}
                >
                  {t("header.nav.all_tools")}
                  <ChevronDown className="h-4 w-4" />
                </Button>
                {allToolsOpen && (
                  <div className="absolute left-0 top-full z-50 w-80 max-h-[80vh] overflow-y-auto rounded-md border bg-popover p-3 text-popover-foreground shadow-md">
                    {toolCategories.map((category) => (
                      <div key={category.nameKey} className="mb-1">
                        <div className={`flex items-center gap-2 px-2 py-2 rounded-md ${category.color}`}>
                          <category.icon className="h-4 w-4" />
                          <span className="text-sm font-bold">{t(category.nameKey + ".title")}</span>
                        </div>
                        <div className="ml-1 border-l-2 border-muted pl-3 py-0.5">
                          {category.tools.map((tool) => {
                            const ToolIcon = tool.icon;
                            return (
                              <LocaleLink
                                key={tool.nameKey}
                                href={tool.href}
                                onClick={() => setAllToolsOpen(false)}
                                className="flex items-center gap-2.5 px-2 py-2 hover:bg-accent rounded-md transition-colors group"
                              >
                                <ToolIcon className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                  {t(tool.nameKey + ".title")}
                                </span>
                              </LocaleLink>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Popular Tools dropdown */}
              <div
                className="relative"
                {...hoverHandlers(popularTimer, setPopularOpen)}
              >
                <Button
                  variant="ghost"
                  className="text-sm font-medium gap-1"
                  onClick={() => setPopularOpen((v) => !v)}
                >
                  {t("header.nav.popular_tools")}
                  <ChevronDown className="h-4 w-4" />
                </Button>
                {popularOpen && (
                  <div className="absolute left-0 top-full z-50 w-72 rounded-md border bg-popover p-2 text-popover-foreground shadow-md">
                    {popularTools.map((tool) => {
                      const ToolIcon = tool.icon;
                      return (
                        <LocaleLink
                          key={tool.nameKey}
                          href={tool.href}
                          onClick={() => setPopularOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-md transition-colors group"
                        >
                          <ToolIcon className={`h-5 w-5 shrink-0 ${tool.color}`} />
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">
                            {t(tool.nameKey + ".title")}
                          </span>
                        </LocaleLink>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right: utilities + auth */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5"
                onClick={toggleTheme}
                aria-label={t("common.theme")}
              >
                <span className="relative inline-flex h-4 w-4">
                  <Sun className="absolute inset-0 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute inset-0 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </span>
                <span className="text-xs">
                  {mounted ? (theme === "dark" ? t("common.dark") : t("common.light")) : t("common.light")}
                </span>
              </Button>

              <LocaleSwitcher />

              {/* [Phase 3] Restore login/signup buttons when freemium is enabled
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                      <span className="text-xs font-bold">{getUserInitials()}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center gap-3 px-3 py-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                        <span className="text-sm font-bold">{getUserInitials()}</span>
                      </div>
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-medium">{user?.full_name || t("common.my_account")}</p>
                        <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <LocaleLink href="/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        {t("dashboard.title")}
                      </LocaleLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <LocaleLink href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        {t("common.settings")}
                      </LocaleLink>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("common.sign_out")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <LocaleLink href="/login">
                    <Button variant="outline" size="sm">
                      {t("common.login")}
                    </Button>
                  </LocaleLink>
                  <LocaleLink href="/signup">
                    <Button size="sm">
                      {t("common.signup")}
                    </Button>
                  </LocaleLink>
                </>
              )}
              */}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden border-t"
        >
          <div className="container mx-auto px-4 py-4 space-y-5">
            {/* Popular Tools section */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">{t("header.nav.popular_tools")}</h3>
              <div className="grid grid-cols-2 gap-2">
                {popularTools.map((tool) => {
                  const ToolIcon = tool.icon;
                  return (
                    <LocaleLink
                      key={tool.nameKey}
                      href={tool.href}
                      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ToolIcon className={`h-4 w-4 shrink-0 ${tool.color}`} />
                      <span className="text-sm font-medium">{t(tool.nameKey + ".title")}</span>
                    </LocaleLink>
                  );
                })}
              </div>
            </div>

            {/* All Tools section */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">{t("header.nav.all_tools")}</h3>
              <div className="grid grid-cols-2 gap-3">
                {toolCategories.map((category) => (
                  <div key={category.nameKey} className="space-y-1">
                    <h4 className="text-xs font-medium text-muted-foreground">{t(category.nameKey + ".title")}</h4>
                    <div className="space-y-1">
                      {category.tools.map((tool) => (
                        <LocaleLink
                          key={tool.nameKey}
                          href={tool.href}
                          className="block text-sm py-1 hover:text-foreground text-foreground/60"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {t(tool.nameKey + ".title")}
                        </LocaleLink>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer: language, theme, auth */}
            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("common.language")}</span>
                <LocaleSwitcher />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("common.theme")}</span>
                <Button variant="outline" size="sm" onClick={toggleTheme}>
                  {mounted ? (theme === "dark" ? t("common.light") : t("common.dark")) : t("common.dark")}
                </Button>
              </div>

              {/* [Phase 3] Restore login/signup buttons when freemium is enabled
              <div className="flex gap-2 pt-2">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 w-full px-2 py-1">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                        <span className="text-xs font-bold">{getUserInitials()}</span>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{user?.full_name || "User"}</p>
                        <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("common.sign_out")}
                    </Button>
                  </>
                ) : (
                  <>
                    <LocaleLink href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                      <Button variant="outline" className="w-full">
                        {t("common.login")}
                      </Button>
                    </LocaleLink>
                    <LocaleLink href="/signup" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                      <Button className="w-full">
                        {t("common.signup")}
                      </Button>
                    </LocaleLink>
                  </>
                )}
              </div>
              */}
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
