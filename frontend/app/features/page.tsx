"use client";

import {
  Zap,
  Shield,
  Globe,
  Lock,
  Cpu,
  Users,
  Clock,
  FileText,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function FeaturesPage() {
  const t = useTranslations("features_page");

  const coreFeatures = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: t("core_speed_title"),
      description: t("core_speed_desc"),
      details: [t("core_speed_d1"), t("core_speed_d2"), t("core_speed_d3")],
      id: "speed",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: t("core_security_title"),
      description: t("core_security_desc"),
      details: [t("core_security_d1"), t("core_security_d2"), t("core_security_d3")],
      id: "security",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: t("core_global_title"),
      description: t("core_global_desc"),
      details: [t("core_global_d1"), t("core_global_d2"), t("core_global_d3")],
      id: "languages",
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: t("core_privacy_title"),
      description: t("core_privacy_desc"),
      details: [t("core_privacy_d1"), t("core_privacy_d2"), t("core_privacy_d3")],
      id: "privacy",
    },
    {
      icon: <Cpu className="h-6 w-6" />,
      title: t("core_ai_title"),
      description: t("core_ai_desc"),
      details: [t("core_ai_d1"), t("core_ai_d2"), t("core_ai_d3")],
      id: "ai",
    },
  ];

  const technicalFeatures = [
    {
      title: t("tech_browser_title"),
      description: t("tech_browser_desc"),
      icon: <FileText className="h-5 w-5" />,
      id: "browser",
    },
    {
      title: t("tech_batch_title"),
      description: t("tech_batch_desc"),
      icon: <Clock className="h-5 w-5" />,
      id: "batch",
    },
    {
      title: t("tech_formats_title"),
      description: t("tech_formats_desc"),
      icon: <CheckCircle className="h-5 w-5" />,
      id: "formats",
    },
  ];

  const comparisons = [
    { feature: t("compare_size"), pdforca: "100 MB", competitor: "50 MB" },
    { feature: t("compare_speed"), pdforca: t("compare_speed_us"), competitor: t("compare_speed_them") },
    { feature: t("compare_privacy"), pdforca: t("compare_privacy_us"), competitor: t("compare_privacy_them") },
    { feature: t("compare_free"), pdforca: t("compare_free_us"), competitor: t("compare_free_them") },
    { feature: t("compare_ai"), pdforca: t("compare_ai_us"), competitor: t("compare_ai_them") },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        {/* Hero Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center">
              <Badge className="mb-4 gap-1 bg-primary/10 px-4 py-1 text-primary">
                <Sparkles className="h-3 w-3" />
                {t("hero_badge")}
              </Badge>
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                {t("hero_heading_part1")}
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t("hero_heading_part2")}
                </span>
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                {t("hero_description")}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/">
                  <Button size="lg" className="gap-2">
                    {t("hero_cta_try")}
                    <Zap className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#comparison">
                  <Button size="lg" variant="outline" className="gap-2">
                    {t("hero_cta_compare")}
                    <Users className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <SectionHeader
              title={t("core_section_title")}
              subtitle={t("core_section_subtitle")}
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {coreFeatures.map((feature) => (
                <Card
                  key={feature.id}
                  id={feature.id}
                  className="border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.details.map((detail) => (
                        <li key={detail} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Features */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto max-w-6xl">
            <SectionHeader
              title={t("tech_section_title")}
              subtitle={t("tech_section_subtitle")}
            />
            <div className="grid gap-8 md:grid-cols-2">
              {technicalFeatures.map((feature) => (
                <div key={feature.id} id={feature.id} className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section id="comparison" className="px-4 py-16 sm:px-6 lg:px-8 scroll-mt-24">
          <div className="container mx-auto max-w-6xl">
            <SectionHeader
              title={t("compare_section_title")}
              subtitle={t("compare_section_subtitle")}
            />
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                    <th className="px-6 py-4 text-left font-semibold">{t("compare_th_feature")}</th>
                    <th className="px-6 py-4 text-left font-semibold">{t("compare_th_us")}</th>
                    <th className="px-6 py-4 text-left font-semibold">{t("compare_th_them")}</th>
                    <th className="px-6 py-4 text-left font-semibold">{t("compare_th_advantage")}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((item, index) => (
                    <tr
                      key={item.feature}
                      className={index % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-gray-50 dark:bg-gray-900"}
                    >
                      <td className="px-6 py-4 font-medium">{item.feature}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-primary">{item.pdforca}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{item.competitor}</td>
                      <td className="px-6 py-4">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {t("compare_advantage_label")}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl text-center">
            <Card className="border-gray-200 dark:border-gray-800 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-12">
                <h2 className="mb-4 text-3xl font-bold">{t("cta_heading")}</h2>
                <p className="mb-8 text-gray-600 dark:text-gray-400">{t("cta_description")}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/">
                    <Button size="lg" className="gap-2">
                      {t("cta_start")}
                      <Zap className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/#tools">
                    <Button size="lg" variant="outline" className="gap-2">
                      {t("cta_view_all")}
                      <FileText className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
