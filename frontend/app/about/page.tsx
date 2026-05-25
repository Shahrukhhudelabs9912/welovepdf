"use client";

import { Users, Target, Globe, Shield, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageMeta } from "@/components/seo-provider";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function AboutPage() {
  const t = useTranslations("about");

  const team = [
    {
      name: t("team_member_1_name"),
      role: t("team_member_1_role"),
      bio: t("team_member_1_bio"),
      avatar: "AC",
    },
    {
      name: t("team_member_2_name"),
      role: t("team_member_2_role"),
      bio: t("team_member_2_bio"),
      avatar: "MR",
    },
    {
      name: t("team_member_3_name"),
      role: t("team_member_3_role"),
      bio: t("team_member_3_bio"),
      avatar: "DK",
    },
    {
      name: t("team_member_4_name"),
      role: t("team_member_4_role"),
      bio: t("team_member_4_bio"),
      avatar: "SJ",
    },
  ];

  const milestones = [
    { year: "2020", event: t("milestone_2020") },
    { year: "2021", event: t("milestone_2021") },
    { year: "2022", event: t("milestone_2022") },
    { year: "2023", event: t("milestone_2023") },
    { year: "2024", event: t("milestone_2024") },
  ];

  return (
    <>
      <PageMeta
        title={`${t("title")} - ${t("badge")}`}
        description={t("description")}
        keywords="about welovepdf, pdf tools company, our mission, our team, pdf processing"
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

        {/* Mission & Values */}
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="mb-4 rounded-full bg-blue-100 p-3 dark:bg-blue-900/30 w-fit">
                    <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>{t("mission_title")}</CardTitle>
                  <CardDescription>
                    {t("mission_subtitle")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t("mission_text")}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-4 rounded-full bg-green-100 p-3 dark:bg-green-900/30 w-fit">
                    <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle>{t("values_title")}</CardTitle>
                  <CardDescription>
                    {t("values_subtitle")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span><strong>{t("values_privacy")}</strong> {t("values_privacy_text")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span><strong>{t("values_accessibility")}</strong> {t("values_accessibility_text")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span><strong>{t("values_innovation")}</strong> {t("values_innovation_text")}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-4 rounded-full bg-purple-100 p-3 dark:bg-purple-900/30 w-fit">
                    <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>{t("impact_title")}</CardTitle>
                  <CardDescription>
                    {t("impact_subtitle")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">5M+</div>
                      <div className="text-sm text-gray-500">{t("impact_users")}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">14+</div>
                      <div className="text-sm text-gray-500">{t("impact_tools")}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">50+</div>
                      <div className="text-sm text-gray-500">{t("impact_countries")}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">99.9%</div>
                      <div className="text-sm text-gray-500">{t("impact_uptime")}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t("team_title")}
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                {t("team_subtitle")}
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((member) => (
                <Card key={member.name} className="text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-2xl font-bold text-white">
                      {member.avatar}
                    </div>
                    <CardTitle>{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t("journey_title")}
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                {t("journey_subtitle")}
              </p>
            </div>

            <div className="mt-12">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className="relative flex items-start gap-8 pb-12">
                  {index < milestones.length - 1 && (
                    <div className="absolute left-6 top-12 h-full w-0.5 bg-gray-200 dark:bg-gray-800" />
                  )}
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold">
                    {milestone.year}
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-semibold">{milestone.event}</h3>
                  </div>
                </div>
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
                <Heart className="h-4 w-4" />
                {t("cta_try_tools")}
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Users className="h-4 w-4" />
                {t("cta_join_team")}
              </Button>
            </div>
            <p className="mt-6 text-sm opacity-80">
              <Link href="/careers" className="underline hover:no-underline">
                {t("cta_view_positions")}
              </Link>{" "}
              •{" "}
              <Link href="/contact" className="underline hover:no-underline">
                {t("cta_contact_us")}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}