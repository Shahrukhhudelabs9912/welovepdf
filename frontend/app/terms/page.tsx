"use client";

import { FileText, AlertCircle, Scale, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { PageContainer } from "@/components/ui/page-container";
import { PageHero } from "@/components/ui/page-hero";

const EFFECTIVE_DATE = "June 16, 2026";
const LEGAL_EMAIL = "legal@pdforca.com";

export default function TermsPage() {
  const t = useTranslations("terms");

  return (
    <PageContainer>
      <PageHero
        icon={FileText}
        iconColor="blue"
        title={t("title")}
        subtitle={t("subtitle")}
        meta={
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
            <AlertCircle className="h-4 w-4" />
            <span>{t("effective_label", { date: EFFECTIVE_DATE })}</span>
          </div>
        }
      />

      <article className="prose prose-gray max-w-none dark:prose-invert">
        <h2>{t("s1_title")}</h2>
        <p>
          {t("s1_p1_pre")}
          <a href="/privacy">{t("s1_p1_link")}</a>
          {t("s1_p1_post")}
        </p>

        <h2>{t("s2_title")}</h2>
        <p>{t("s2_p1")}</p>

        <h2>{t("s3_title")}</h2>
        <p>{t("s3_p1")}</p>

        <h2>{t("s4_title")}</h2>
        <p>{t("s4_p1")}</p>

        <h2>{t("s5_title")}</h2>
        <p>{t("s5_p1")}</p>
        <ul>
          <li>{t("s5_li1")}</li>
          <li>{t("s5_li2")}</li>
          <li>{t("s5_li3")}</li>
          <li>{t("s5_li4")}</li>
          <li>{t("s5_li5")}</li>
          <li>{t("s5_li6")}</li>
        </ul>
        <p>{t("s5_p2")}</p>

        <h2>{t("s6_title")}</h2>
        <p>{t("s6_p1")}</p>
        <ul>
          <li>
            <strong>{t("s6_li1_label")}</strong>
            {t("s6_li1")}
          </li>
          <li>
            <strong>{t("s6_li2_label")}</strong>
            {t("s6_li2")}
          </li>
          <li>{t("s6_li3")}</li>
        </ul>

        <h2>{t("s7_title")}</h2>
        <p>{t("s7_p1")}</p>

        <h2>{t("s8_title")}</h2>
        <p>{t("s8_p1")}</p>

        <h2>{t("s9_title")}</h2>
        <p>{t("s9_p1")}</p>

        <h2>{t("s10_title")}</h2>
        <p>{t("s10_p1")}</p>

        <h2>{t("s11_title")}</h2>
        <p>{t("s11_p1")}</p>

        <h2>{t("s12_title")}</h2>
        <p>{t("s12_p1")}</p>

        <h2>{t("s13_title")}</h2>
        <p>{t("s13_p1")}</p>

        <h2>{t("s14_title")}</h2>
        <p className="flex items-start gap-2">
          <Scale className="mt-1 h-4 w-4 shrink-0" />
          <span>{t("s14_p1")}</span>
        </p>

        <h2>{t("s15_title")}</h2>
        <p>{t("s15_p1")}</p>

        <h2>{t("s16_title")}</h2>
        <p className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span>
            {t("s16_email_pre")}
            <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>
          </span>
        </p>

        <p className="mt-12 rounded-lg bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-400">
          {t("lang_disclaimer")}
        </p>
      </article>
    </PageContainer>
  );
}
