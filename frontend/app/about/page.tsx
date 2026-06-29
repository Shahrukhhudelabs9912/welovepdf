"use client";

import { Target, Globe, Shield, Heart, Sparkles, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { useTranslations } from "next-intl";
import Link from "next/link";

/**
 * Founder-led "About" page. We deliberately keep the team section out —
 * showing fake team members on a one-person side-project would be dishonest,
 * which is exactly the kind of trust signal we want to avoid breaking.
 *
 * Everything visible here is sourced from the `about` namespace in the
 * messages/en.json + hi.json bundles. New keys added below are appended via
 * scripts; old "team_member_*" / "milestone_*" keys are no longer referenced.
 */
export default function AboutPage() {
  const t = useTranslations("about");

  const values = [
    {
      icon: <Shield className="h-5 w-5" />,
      title: t("value_privacy_title"),
      description: t("value_privacy_desc"),
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: t("value_free_title"),
      description: t("value_free_desc"),
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: t("value_local_title"),
      description: t("value_local_desc"),
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: t("value_ai_title"),
      description: t("value_ai_desc"),
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        {/* Hero */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4" variant="outline">
              {t("badge")}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              {t("hero_heading_part1")}{" "}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {t("hero_heading_part2")}
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              {t("hero_description")}
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-2xl">{t("mission_title")}</CardTitle>
                <CardDescription>{t("mission_subtitle")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>{t("mission_text")}</p>
                <p>{t("mission_text_2")}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Values */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <SectionHeader
              title={t("values_title")}
              subtitle={t("values_subtitle")}
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {values.map((v) => (
                <Card key={v.title}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {v.icon}
                      </div>
                      <CardTitle className="text-lg">{v.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">{v.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("story_title")}
            </h2>
            <div className="mt-6 space-y-4 text-gray-600 dark:text-gray-300">
              <p>{t("story_para_1")}</p>
              <p>{t("story_para_2")}</p>
              <p>{t("story_para_3")}</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-r from-primary to-purple-600 p-8 text-center text-white">
            <h2 className="text-3xl font-bold">{t("cta_heading")}</h2>
            <p className="mt-4 text-lg opacity-90">{t("cta_description")}</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/">
                <Button size="lg" variant="secondary" className="gap-2">
                  <Heart className="h-4 w-4" />
                  {t("cta_try_tools")}
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/60 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <Users className="h-4 w-4" />
                  {t("cta_contact_us")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
