"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Menu, X, Moon, Sun, Globe, Shield } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/components/language-provider";

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
    tools: [
      { name: "Merge PDF", href: "/merge-pdf", description: "Combine multiple PDFs into one" },
      { name: "Split PDF", href: "/split-pdf", description: "Split PDF into multiple files" },
      { name: "Organize PDF", href: "/organize-pdf", description: "Reorder, delete pages" },
    ],
  },
  {
    name: "Convert",
    tools: [
      { name: "PDF to Word", href: "/pdf-to-word", description: "Convert PDF to editable Word" },
      { name: "Word to PDF", href: "/word-to-pdf", description: "Convert Word to PDF" },
      { name: "PDF to JPG", href: "/pdf-to-jpg", description: "Extract images from PDF" },
      { name: "JPG to PDF", href: "/jpg-to-pdf", description: "Convert images to PDF" },
    ],
  },
  {
    name: "Optimize",
    tools: [
      { name: "Compress PDF", href: "/compress-pdf", description: "Reduce PDF file size" },
      { name: "Rotate PDF", href: "/rotate-pdf", description: "Rotate PDF pages" },
      { name: "Protect PDF", href: "/protect-pdf", description: "Add password protection" },
      { name: "Unlock PDF", href: "/unlock-pdf", description: "Remove password protection" },
    ],
  },
  {
    name: "Edit & Enhance",
    tools: [
      { name: "Add Watermark", href: "/add-watermark", description: "Add text/image watermarks" },
      { name: "Page Numbering", href: "/page-numbering", description: "Add page numbers" },
      { name: "Rotate PDF", href: "/rotate-pdf", description: "Rotate PDF pages" },
    ],
  },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (lang: "en" | "hi") => {
    setLanguage(lang);
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
                <DropdownMenuContent align="start" className="w-96 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {toolCategories.map((category) => (
                      <div key={category.name} className="space-y-2">
                        <h3 className="text-sm font-semibold text-foreground">{category.name}</h3>
                        <div className="space-y-1">
                          {category.tools.map((tool) => (
                            <DropdownMenuItem key={tool.name} asChild>
                              <Link
                                href={tool.href}
                                className="flex flex-col items-start p-2 hover:bg-accent rounded"
                              >
                                <span className="text-sm font-medium">{tool.name}</span>
                                <span className="text-xs text-muted-foreground">{tool.description}</span>
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Globe className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => handleLanguageChange("en")}
                    className={language === "en" ? "bg-accent" : ""}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">🇺🇸</span>
                      {t("common.english")}
                      {language === "en" && <span className="ml-2 text-xs text-blue-600">✓</span>}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleLanguageChange("hi")}
                    className={language === "hi" ? "bg-accent" : ""}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">🇮🇳</span>
                      {t("common.hindi")}
                      {language === "hi" && <span className="ml-2 text-xs text-blue-600">✓</span>}
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                {t("common.login")}
              </Button>
              <Button size="sm" className="hidden sm:inline-flex">
                {t("common.signup")}
              </Button>
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
                <div className="flex gap-2">
                  <Button
                    variant={language === "en" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLanguageChange("en")}
                  >
                    {t("common.english")}
                  </Button>
                  <Button
                    variant={language === "hi" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLanguageChange("hi")}
                  >
                    {t("common.hindi")}
                  </Button>
                </div>
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
                <Button variant="outline" className="flex-1">
                  {t("common.login")}
                </Button>
                <Button className="flex-1">
                  {t("common.signup")}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}