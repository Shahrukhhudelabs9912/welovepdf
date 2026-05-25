"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { FileText, Shield, Zap, Globe, Heart, Share2 } from "lucide-react";

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  const footerLinks = {
    [t("footer.tools")]: [
      { name: t("footer.footer_links.merge_pdf"), href: "/merge-pdf" },
      { name: t("footer.footer_links.split_pdf"), href: "/split-pdf" },
      { name: t("footer.footer_links.compress_pdf"), href: "/compress-pdf" },
      { name: t("footer.footer_links.pdf_to_word"), href: "/pdf-to-word" },
      { name: t("footer.footer_links.word_to_pdf"), href: "/word-to-pdf" },
      { name: t("footer.footer_links.pdf_to_jpg"), href: "/pdf-to-jpg" },
    ],
    [t("footer.features")]: [
      { name: t("footer.footer_links.ai_summarization"), href: "/ai-tools" },
      { name: t("footer.footer_links.privacy_security"), href: "/privacy" },
      { name: t("footer.footer_links.fast_processing"), href: "/features#speed" },
      { name: t("footer.footer_links.multi_language"), href: "/features#languages" },
      { name: t("footer.footer_links.browser_processing"), href: "/features#browser" },
    ],
    [t("footer.company")]: [
      { name: t("footer.footer_links.about_us"), href: "/about" },
      { name: t("footer.blog"), href: "/blog" },
      { name: t("common.pricing"), href: "/pricing" },
      { name: t("footer.contact"), href: "/contact" },
      { name: t("footer.footer_links.careers"), href: "/careers" },
    ],
    [t("footer.legal")]: [
      { name: t("footer.privacy"), href: "/privacy-policy" },
      { name: t("footer.terms"), href: "/terms" },
      { name: t("footer.cookies"), href: "/cookies" },
      { name: "GDPR", href: "/gdpr" },
      { name: "DMCA", href: "/dmca" },
    ],
  };

  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">WeLovePDF</h2>
                <p className="text-sm text-muted-foreground">
                  {t("footer.tagline")}
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm">
              {t("footer.description")}
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                <Shield className="h-3 w-3" />
                <span>{t("footer.secure_badge")}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                <Zap className="h-3 w-3" />
                <span>{t("footer.fast_badge")}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                <Globe className="h-3 w-3" />
                <span>{t("footer.multi_lang_badge")}</span>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold">{category}</h3>
              <ul className="mt-4 space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center text-sm text-muted-foreground md:text-left">
              <p>
                {t("footer.copyright", { year })}
              </p>
              <p className="mt-1">
                {t("footer.auto_delete")}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Heart className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Share2 className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>
              {t("footer.supported_formats")}
            </p>
            <p className="mt-1">
              {t("footer.https_notice")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}