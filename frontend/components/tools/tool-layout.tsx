"use client";

import { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { FileText, Shield, Zap, Globe, Check } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://welovepdf.com";

interface ToolLayoutProps {
  title: string;
  description: string;
  toolName: string;
  toolDescription: string;
  children: ReactNode;
  /** Translation namespace key, e.g. "merge_pdf", "compress_pdf". When provided, title/description fall back to translated values from that namespace. */
  toolKey?: string;
  seoContent?: {
    h1: string;
    h2: string;
    content: string;
    faq?: Array<{ question: string; answer: string }>;
  };
}

export function ToolLayout({
  title,
  description,
  toolName,
  toolDescription,
  children,
  toolKey,
  seoContent,
}: ToolLayoutProps) {
  const t = useTranslations("tool_pages");
  const pathname = usePathname();
  // Read tool-specific translations when toolKey is provided
  const tt = toolKey ? useTranslations(toolKey as any) : null;
  const displayTitle = tt?.("title" as any) || title;
  const displayDescription = tt?.("description" as any) || description;

  // Prefer translated SEO content when toolKey is available
  const seoH1 = (toolKey && tt?.("seo_h1" as any)) ? tt!("seo_h1" as any) : seoContent?.h1;
  const seoH2 = (toolKey && tt?.("seo_h2" as any)) ? tt!("seo_h2" as any) : seoContent?.h2;
  const seoFaq: Array<{ question: string; answer: string }> | undefined =
    toolKey
      ? (() => {
          try {
            return tt?.raw("seo_faq" as any) as any;
          } catch {
            return seoContent?.faq;
          }
        })()
      : seoContent?.faq;

  const howToSteps: string[] = [
    t("how_to_step1"),
    t("how_to_step2"),
    t("how_to_step3"),
    t("how_to_step4"),
  ];

  const keyFeatures: { icon: typeof Shield; text: string }[] = [
    { icon: Shield, text: t("feature_secure") },
    { icon: Zap, text: t("feature_fast") },
    { icon: Globe, text: t("feature_multilingual") },
    { icon: FileText, text: t("feature_quality") },
  ];

  const popularTools: { name: string; href: string }[] = [
    { name: t("popular_split_pdf"), href: "/split-pdf" },
    { name: t("popular_compress_pdf"), href: "/compress-pdf" },
    { name: t("popular_pdf_to_word"), href: "/pdf-to-word" },
    { name: t("popular_protect_pdf"), href: "/protect-pdf" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            {seoH1 || `${displayTitle} ${t("tool_suffix")}`}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            {displayDescription}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{displayTitle}</h2>
                    <p className="text-gray-600 dark:text-gray-300">{displayDescription}</p>
                  </div>
                  <div className="hidden rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300 sm:flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>{t("secure_private")}</span>
                  </div>
                </div>
              </div>

              {children}
            </div>

            {seoContent && (
              <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <h2>{seoH2 || seoContent.h2}</h2>
                  {!toolKey && <div dangerouslySetInnerHTML={{ __html: seoContent.content }} />}

                  {(seoFaq && seoFaq.length > 0) && (
                    <div className="mt-8">
                      <h3>{t("faq_title")}</h3>
                      <div className="space-y-4">
                        {seoFaq.map((item, index) => (
                          <div key={index} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            <h4 className="font-semibold">{item.question}</h4>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold">{t("how_to_use")}</h3>
              <ol className="mt-4 space-y-3">
                {howToSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {index + 1}
                    </div>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold">{t("key_features")}</h3>
              <div className="mt-4 space-y-3">
                {keyFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                      <feature.icon className="h-4 w-4" />
                    </div>
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 p-6 dark:from-gray-800 dark:to-gray-900">
              <h3 className="text-lg font-semibold">{t("popular_tools")}</h3>
              <div className="mt-4 space-y-2">
                {popularTools.map((tool) => (
                  <a
                    key={tool.name}
                    href={tool.href}
                    className="block rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    {tool.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}