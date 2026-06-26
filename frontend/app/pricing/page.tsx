"use client";

import { Sparkles, Mail, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import Link from "next/link";

/**
 * Pricing page is currently in "coming soon" mode. The route still works
 * (so old links don't 404), but Pricing is intentionally hidden from the
 * primary nav / footer until a real Pro tier launches.
 *
 * When ready to ship Pro, replace this component with the real plans grid
 * and re-enable the nav links in components/header.tsx + footer.tsx.
 */
export default function PricingPage() {
  const t = useTranslations("pricing_page");

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4" variant="outline">
              {t("badge")}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              {t("hero_heading")}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              {t("hero_description")}
            </p>
          </div>

          {/* Free-now card */}
          <div className="mx-auto mt-12 max-w-2xl">
            <Card className="border-2 border-primary/30">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">{t("free_now_title")}</CardTitle>
                <CardDescription>{t("free_now_subtitle")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{t("free_now_point_1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{t("free_now_point_2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{t("free_now_point_3")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{t("free_now_point_4")}</span>
                  </li>
                </ul>
                <div className="pt-4">
                  <Link href="/">
                    <Button size="lg" className="w-full gap-2">
                      <Heart className="h-4 w-4" />
                      {t("free_now_cta")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pro coming-soon card */}
          <div className="mx-auto mt-8 max-w-2xl">
            <Card className="border-dashed">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <Sparkles className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle className="text-2xl">{t("pro_soon_title")}</CardTitle>
                <CardDescription>{t("pro_soon_subtitle")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  {t("pro_soon_intro")}
                </p>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>{t("pro_soon_feature_1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>{t("pro_soon_feature_2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>{t("pro_soon_feature_3")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>{t("pro_soon_feature_4")}</span>
                  </li>
                </ul>
                <div className="pt-4">
                  <Link href="/contact">
                    <Button variant="outline" size="lg" className="w-full gap-2">
                      <Mail className="h-4 w-4" />
                      {t("pro_soon_cta")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <p className="mx-auto mt-10 max-w-md text-center text-sm text-gray-500 dark:text-gray-500">
            {t("footnote")}
          </p>
        </section>
      </div>
    </>
  );
}
