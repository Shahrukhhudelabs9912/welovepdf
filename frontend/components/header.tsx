"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText, Menu, X, Moon, Sun, Globe, Shield,
  User, LogOut, Settings, Combine, Scissors,
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
  { name: "Tools", href: "#tools" },
  { name: "Features", href: "#features" },
  { name: "AI Tools", href: "/ai-tools" },
  { name: "Blog", href: "/blog" },
  { name: "Pricing", href: "/pricing" },
];

const toolCategories = [
  {
    name: "Merge & Split",
    icon: Combine,
    color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
    tools: [
      { name: "Merge PDF", href: "/merge-pdf", description: "Combine multiple PDFs into one", icon: Combine },
      { name: "Split PDF", href: "/split-pdf", description: "Split PDF into multiple files", icon: Scissors },
      { name: "Organize PDF", href: "/organize-pdf", description: "Reorder, delete pages", icon: ArrowRightLeft },
    ],
  },
  {
    name: "Convert",
    icon: ArrowRightLeft,
    color: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800",
    tools: [
      { name: "PDF to Word", href: "/pdf-to-word", description: "Convert PDF to editable Word", icon: FileText },
      { name: "Word to PDF", href: "/word-to-pdf", description: "Convert Word to PDF", icon: FileText },
      { name: "PDF to JPG", href: "/pdf-to-jpg", description: "Extract images from PDF", icon: FileText },
      { name: "JPG to PDF", href: "/jpg-to-pdf", description: "Convert images to PDF", icon: FileText },
    ],
  },
  {
    name: "Optimize",
    icon: Shrink,
    color: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
    borderColor: "border-green-200 dark:border-green-800",
    tools: [
      { name: "Compress PDF", href: "/compress-pdf", description: "Reduce PDF file size", icon: Shrink },
      { name: "Protect PDF", href: "/protect-pdf", description: "Add password protection", icon: Lock },
    ],
  },
  {
    name: "Edit & Enhance",
    icon: Pencil,
    color: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-800",
    tools: [
      { name: "Add Watermark", href: "/add-watermark", description: "Add text/image watermarks", icon: Paintbrush },
      { name: "Page Numbering", href: "/page-numbering", description: "Add page numbers", icon: Hash },
    ],
  },
];

export function Header() {
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                We<span className="text-blue-600">Love</span>PDF
              </span>
            </Link>

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
                    <div key={category.name} className="mb-1">
                      {/* Category header with icon */}
                      <div className={`flex items-center gap-2 px-2 py-2 rounded-md ${category.color}`}>
                        <category.icon className="h-4 w-4" />
                        <span className="text-sm font-bold">{category.name}</span>
                      </div>
                      {/* Tool items */}
                      <div className="ml-1 border-l-2 border-muted pl-3 py-0.5 space-y-0">
                        {category.tools.map((tool) => {
                          const ToolIcon = tool.icon;
                          return (
                            <DropdownMenuItem key={tool.name} asChild>
                              <Link
                                href={tool.href}
                                className="flex items-center gap-2.5 px-2 py-2 hover:bg-accent rounded-md transition-colors group"
                              >
                                <ToolIcon className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                  {tool.name}
                                </span>
                              </Link>
                            </DropdownMenuItem>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
                >
                  {item.name === "Tools" ? t("common.tools") : 
                   item.name === "Features" ? t("common.features") :
                   item.name === "AI Tools" ? t("header.nav.ai_tools") :
                   item.name === "Blog" ? t("common.blog") :
                   item.name === "Pricing" ? t("common.pricing") : item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                <Shield className="h-3 w-3" />
                <span>{t("footer.security")}</span>
              </div>

              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">{t("common.theme")}</span>
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
                        <p className="text-sm font-medium">{user?.full_name || "User"}</p>
                        <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
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
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                      {t("common.login")}
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="hidden sm:inline-flex">
                      {t("common.signup")}
                    </Button>
                  </Link>
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
                  <div key={category.name} className="space-y-1">
                    <h4 className="text-xs font-medium text-muted-foreground">{category.name}</h4>
                    <div className="space-y-1">
                      {category.tools.map((tool) => (
                        <Link
                          key={tool.name}
                          href={tool.href}
                          className="block text-sm py-1 hover:text-foreground text-foreground/60"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {tool.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-sm font-medium py-2 hover:text-foreground text-foreground/60"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name === "Tools" ? t("common.tools") : 
                   item.name === "Features" ? t("common.features") :
                   item.name === "AI Tools" ? t("header.nav.ai_tools") :
                   item.name === "Blog" ? t("common.blog") :
                   item.name === "Pricing" ? t("common.pricing") : item.name}
                </Link>
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
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? t("common.light") : t("common.dark")}
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
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="flex-1">
                        {t("common.login")}
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="flex-1">
                        {t("common.signup")}
                      </Button>
                    </Link>
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