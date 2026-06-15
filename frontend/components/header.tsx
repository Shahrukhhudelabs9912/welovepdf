"use client";

import { useState, useEffect } from "react";
import { Link as LocaleLink } from "@/routing";
import { motion } from "framer-motion";
import {
  FileText, Menu, X, Moon, Sun, Globe, Shield,
  User, LogOut, Settings, LayoutDashboard, Combine, Scissors,
  ArrowRightLeft, Shrink, Lock, Pencil,
  Paintbrush, Hash
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { LocaleSwitcher } from "@/components/locale-switcher";

const navigation = [
  { nameKey: "common.tools", href: "#tools" },
  { nameKey: "common.features", href: "#features" },
  { nameKey: "header.nav.ai_tools", href: "/ai-tools" },
  { nameKey: "common.blog", href: "/blog" },
  { nameKey: "common.pricing", href: "/pricing" },
];

const toolCategories = [
  {
    nameKey: "header.tool_categories.merge_split",
    icon: Combine,
    color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
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
    borderColor: "border-purple-200 dark:border-purple-800",
    tools: [
      { nameKey: "tools.pdf_to_word", href: "/pdf-to-word", icon: FileText },
      { nameKey: "tools.word_to_pdf", href: "/word-to-pdf", icon: FileText },
      { nameKey: "tools.pdf_to_jpg", href: "/pdf-to-jpg", icon: FileText },
      { nameKey: "tools.jpg_to_pdf", href: "/jpg-to-pdf", icon: FileText },
    ],
  },
  {
    nameKey: "header.tool_categories.optimize",
    icon: Shrink,
    color: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
    borderColor: "border-green-200 dark:border-green-800",
    tools: [
      { nameKey: "tools.compress_pdf", href: "/compress-pdf", icon: Shrink },
      { nameKey: "tools.protect_pdf", href: "/protect-pdf", icon: Lock },
    ],
  },
  {
    nameKey: "header.tool_categories.edit_enhance",
    icon: Pencil,
    color: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-800",
    tools: [
      { nameKey: "tools.add_watermark", href: "/add-watermark", icon: Paintbrush },
      { nameKey: "tools.page_numbering", href: "/page-numbering", icon: Hash },
    ],
  },
];

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const t = useTranslations();
  const locale = useLocale();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  // Helper to get user initials for avatar fallback
  const getUserInitials = (): string => {
    if (!user?.full_name) return "?";
    return user.full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <LocaleLink href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                We<span className="text-blue-600">Love</span>PDF
              </span>
            </LocaleLink>

            <div className="hidden lg:ml-10 lg:flex lg:items-center lg:gap-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-sm font-medium">
                    {t("header.nav.all_tools")}
                    <svg
                      className="ml-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-80 max-h-[80vh] overflow-y-auto p-3" sideOffset={8}>
                  {toolCategories.map((category) => (
                    <div key={category.nameKey} className="mb-1">
                      {/* Category header with icon */}
                      <div className={`flex items-center gap-2 px-2 py-2 rounded-md ${category.color}`}>
                        <category.icon className="h-4 w-4" />
                        <span className="text-sm font-bold">{t(category.nameKey + ".title")}</span>
                      </div>
                      {/* Tool items */}
                      <div className="ml-1 border-l-2 border-muted pl-3 py-0.5 space-y-0">
                        {category.tools.map((tool) => {
                          const ToolIcon = tool.icon;
                          return (
                            <DropdownMenuItem key={tool.nameKey} asChild>
                              <LocaleLink
                                href={tool.href}
                                className="flex items-center gap-2.5 px-2 py-2 hover:bg-accent rounded-md transition-colors group"
                              >
                                <ToolIcon className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                  {t(tool.nameKey + ".title")}
                                </span>
                              </LocaleLink>
                            </DropdownMenuItem>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {navigation.map((item) => (
                <LocaleLink
                  key={item.nameKey}
                  href={item.href}
                  className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
                >
                  {t(item.nameKey)}
                </LocaleLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                <Shield className="h-3 w-3" />
                <span>{t("footer.security")}</span>
              </div>

              <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => {
                const next = theme === "dark" ? "light" : "dark";
                setTheme(next);
                document.cookie = `theme=${next}; path=/; max-age=31536000; SameSite=Lax`;
              }}>
                <span className="relative inline-flex h-4 w-4 shrink-0">
                  <Sun className="absolute inset-0 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute inset-0 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </span>
                <span className="text-xs">{mounted ? (theme === "dark" ? t("common.light") : t("common.dark")) : t("common.dark")}</span>
              </Button>

              <LocaleSwitcher />

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
                    <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                      {t("common.login")}
                    </Button>
                  </LocaleLink>
                  <LocaleLink href="/signup">
                    <Button size="sm" className="hidden sm:inline-flex">
                      {t("common.signup")}
                    </Button>
                  </LocaleLink>
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
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
          <div className="container mx-auto px-4 py-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">{t("header.nav.all_tools")}</h3>
              <div className="grid grid-cols-2 gap-2">
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

            <div className="space-y-2">
              {navigation.map((item) => (
                <LocaleLink
                  key={item.nameKey}
                  href={item.href}
                  className="block text-sm font-medium py-2 hover:text-foreground text-foreground/60"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t(item.nameKey)}
                </LocaleLink>
              ))}
            </div>

            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("common.language")}</span>
                <LocaleSwitcher />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("common.theme")}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const next = theme === "dark" ? "light" : "dark";
                    setTheme(next);
                    document.cookie = `theme=${next}; path=/; max-age=31536000; SameSite=Lax`;
                  }}
                >
                  {mounted ? (theme === "dark" ? t("common.light") : t("common.dark")) : t("common.dark")}
                </Button>
              </div>

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
                    <LocaleLink href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="flex-1">
                        {t("common.login")}
                      </Button>
                    </LocaleLink>
                    <LocaleLink href="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="flex-1">
                        {t("common.signup")}
                      </Button>
                    </LocaleLink>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}