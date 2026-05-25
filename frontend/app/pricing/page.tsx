"use client";

import { Check, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageMeta } from "@/components/seo-provider";
import { useTranslations } from "next-intl";

export default function PricingPage() {
  const t = useTranslations("pricing_page");

  const plans = [
    {
      name: t("free"),
      description: t("free_description"),
      price: t("free_price"),
      period: t("free_period"),
      features: [
        t("free_feature_1"),
        t("free_feature_2"),
        t("free_feature_3"),
        t("free_feature_4"),
        t("free_feature_5"),
        t("free_feature_6"),
      ],
      cta: t("free_cta"),
      popular: false,
    },
    {
      name: t("pro"),
      description: t("pro_description"),
      price: t("pro_price"),
      period: t("pro_period"),
      features: [
        t("pro_feature_1"),
        t("pro_feature_2"),
        t("pro_feature_3"),
        t("pro_feature_4"),
        t("pro_feature_5"),
        t("pro_feature_6"),
        t("pro_feature_7"),
        t("pro_feature_8"),
      ],
      cta: t("pro_cta"),
      popular: true,
    },
    {
      name: t("enterprise"),
      description: t("enterprise_description"),
      price: t("enterprise_price"),
      period: t("enterprise_period"),
      features: [
        t("enterprise_feature_1"),
        t("enterprise_feature_2"),
        t("enterprise_feature_3"),
        t("enterprise_feature_4"),
        t("enterprise_feature_5"),
        t("enterprise_feature_6"),
        t("enterprise_feature_7"),
        t("enterprise_feature_8"),
        t("enterprise_feature_9"),
      ],
      cta: t("enterprise_cta"),
      popular: false,
    },
  ];

  const faqs = [
    { question: t("faq_1_q"), answer: t("faq_1_a") },
    { question: t("faq_2_q"), answer: t("faq_2_a") },
    { question: t("faq_3_q"), answer: t("faq_3_a") },
    { question: t("faq_4_q"), answer: t("faq_4_a") },
    { question: t("faq_5_q"), answer: t("faq_5_a") },
    { question: t("faq_6_q"), answer: t("faq_6_a") },
  ];

  const comparisonRows = [
    [t("comparison_pdf_merging"), "3 files", "Unlimited", "Unlimited"],
    [t("comparison_file_size"), "50MB", "500MB", "2GB"],
    [t("comparison_conversions"), "5", "Unlimited", "Unlimited"],
    [t("comparison_watermarking"), "Basic", "Advanced", "Advanced"],
    [t("comparison_speed"), "Standard", "Priority", "Priority"],
    [t("comparison_retention"), "1 hour", "24 hours", "7 days"],
    [t("comparison_batch"), "❌", "✅", "✅"],
    [t("comparison_api"), "❌", "❌", "✅"],
    [t("comparison_branding"), "❌", "❌", "✅"],
    [t("comparison_support"), "❌", "✅", "✅"],
    [t("comparison_team"), "❌", "❌", "✅"],
    [t("comparison_sla"), "❌", "❌", "✅"],
  ];

  return (
    <>
      <PageMeta
        title={`${t("title")} - WeLovePDF`}
        description={t("description")}
        keywords="PDF pricing, PDF tools cost, free PDF tools, Pro PDF tools, Business PDF tools"
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        {/* Hero Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
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
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`relative flex flex-col ${
                    plan.popular
                      ? "border-2 border-primary shadow-xl dark:border-primary"
                      : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="gap-1 bg-primary px-4 py-1">
                        <Star className="h-3 w-3" />
                        {t("most_popular")}
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="ml-2 text-gray-500 dark:text-gray-400">
                        /{plan.period}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full gap-2"
                      size="lg"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                      {plan.popular && <Zap className="h-4 w-4" />}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t("comparison_title")}
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                {t("comparison_subtitle")}
              </p>
            </div>

            <div className="mt-12 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                    <th className="px-6 py-4 text-left font-semibold">{t("comparison_feature")}</th>
                    <th className="px-6 py-4 text-center font-semibold">{t("free")}</th>
                    <th className="px-6 py-4 text-center font-semibold">{t("pro")}</th>
                    <th className="px-6 py-4 text-center font-semibold">{t("enterprise")}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map(([feature, free, pro, business], idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-gray-100 dark:border-gray-800 ${
                        idx % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-900/50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-medium">{feature}</td>
                      <td className="px-6 py-4 text-center">{free}</td>
                      <td className="px-6 py-4 text-center">{pro}</td>
                      <td className="px-6 py-4 text-center">{business}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t("faq_title")}
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                {t("faq_subtitle")}
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-r from-primary to-purple-600 p-8 text-center text-white">
            <h2 className="text-3xl font-bold">{t("cta_heading")}</h2>
            <p className="mt-4 text-lg opacity-90">
              {t("cta_description")}
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" className="gap-2">
                {t("cta_trial")}
                <Zap className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                {t("contact_sales")}
              </Button>
            </div>
            <p className="mt-6 text-sm opacity-80">
              {t("cta_footer")}
            </p>
          </div>
        </section>
      </div>
    </>
  );
}