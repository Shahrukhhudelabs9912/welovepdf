"use client";

import { Shield, Lock, Trash2, EyeOff, Server, Clock, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { PageContainer } from "@/components/ui/page-container";
import { PageHero } from "@/components/ui/page-hero";

const LAST_UPDATED = "June 16, 2026";
const PRIVACY_EMAIL = "privacy@pdforca.com";

export default function PrivacyPage() {
  const t = useTranslations("privacy");

  const trustItems = [
    { icon: Trash2, title: t("trust_1_title"), desc: t("trust_1_desc") },
    { icon: EyeOff, title: t("trust_2_title"), desc: t("trust_2_desc") },
    { icon: Server, title: t("trust_3_title"), desc: t("trust_3_desc") },
  ];

  return (
    <PageContainer>
      <PageHero
        icon={Shield}
        iconColor="blue"
        title={t("title")}
        subtitle={t("subtitle")}
        meta={
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <Lock className="h-4 w-4" />
            <span>{t("last_updated_label", { date: LAST_UPDATED })}</span>
          </div>
        }
      />

        {/* Trust strip */}
        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          {trustItems.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900"
            >
              <f.icon className="mx-auto h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h3 className="mt-2 font-semibold">{f.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>

        <article className="prose prose-gray max-w-none dark:prose-invert">
          <h2>{t("s1_title")}</h2>
          <p>{t("s1_p1")}</p>

          <h2>{t("s2_title")}</h2>
          <p>
            <strong>{t("s2_p1_label")}</strong>
            {t("s2_p1")}
          </p>
          <p>
            <strong>{t("s2_p2_label")}</strong>
            {t("s2_p2")}
          </p>
          <p>
            <strong>{t("s2_p3_label")}</strong>
            {t("s2_p3")}
          </p>

          <h2>{t("s3_title")}</h2>
          <p>{t("s3_p1")}</p>
          <ul>
            <li>{t("s3_li1")}</li>
            <li>{t("s3_li2")}</li>
            <li>{t("s3_li3")}</li>
            <li>{t("s3_li4")}</li>
          </ul>
          <p>{t("s3_p2")}</p>

          <h2>{t("s4_title")}</h2>
          <p>{t("s4_p1")}</p>

          <h2>{t("s5_title")}</h2>
          <p>
            {t("s5_p1_pre")}
            <strong>{t("s5_p1_emph")}</strong>
            {t("s5_p1_post")}
            <a href="/cookies">{t("s5_p1_link_text")}</a>
            {t("s5_p1_after_link")}
          </p>

          <h2>{t("s6_title")}</h2>
          <ul>
            <li>
              <strong>{t("s6_li1_label")}</strong>
              {t("s6_li1")}
            </li>
            <li>
              <strong>{t("s6_li2_label")}</strong>
              {t("s6_li2")}
            </li>
            <li>
              <strong>{t("s6_li3_label")}</strong>
              {t("s6_li3")}
            </li>
            <li>
              <strong>{t("s6_li4_label")}</strong>
              {t("s6_li4")}
            </li>
            <li>
              <strong>{t("s6_li5_label")}</strong>
              {t("s6_li5")}
            </li>
            <li>
              <strong>{t("s6_li6_label")}</strong>
              {t("s6_li6")}
            </li>
            <li>
              <strong>{t("s6_li7_label")}</strong>
              {t("s6_li7")}
            </li>
          </ul>
          <p>{t("s6_p2")}</p>

          <h2>{t("s7_title")}</h2>
          <p>{t("s7_p1")}</p>

          <h2>{t("s8_title")}</h2>
          <p>{t("s8_p1")}</p>
          <ul>
            <li>{t("s8_li1")}</li>
            <li>{t("s8_li2")}</li>
            <li>{t("s8_li3")}</li>
            <li>{t("s8_li4")}</li>
            <li>{t("s8_li5")}</li>
          </ul>
          <p>
            {t("s8_p2_pre")}
            <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>
            {t("s8_p2_post")}
          </p>

          <h2>{t("s9_title")}</h2>
          <p>{t("s9_p1")}</p>

          <h2>{t("s10_title")}</h2>
          <p>{t("s10_p1")}</p>

          <h2>{t("s11_title")}</h2>
          <p>{t("s11_p1")}</p>

          <h2>{t("s12_title")}</h2>
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>
              {t("s12_email_pre")}
              <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>
            </span>
          </p>
          <p className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{t("s12_response_label")}</span>
          </p>

          {/* Translation disclaimer — important for legal clarity */}
          <p className="mt-12 rounded-lg bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-400">
            {t("lang_disclaimer")}
          </p>
        </article>
    </PageContainer>
  );
}
