"use client";

import {
  Copyright,
  FileText,
  Mail,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { PageContainer } from "@/components/ui/page-container";
import { PageHero } from "@/components/ui/page-hero";

const LAST_UPDATED = "June 16, 2026";
const DMCA_EMAIL = "dmca@pdforca.com";

export default function DMCAPage() {
  const t = useTranslations("dmca");

  return (
    <PageContainer>
      <PageHero
        icon={Copyright}
        iconColor="red"
        title={t("title")}
        subtitle={t("subtitle")}
        meta={
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
            <Clock className="h-4 w-4" />
            <span>{t("last_updated_label", { date: LAST_UPDATED })}</span>
          </div>
        }
      />

      {/* Important notice */}
      <div className="mb-12 rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-900/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-1 h-6 w-6 text-amber-600 dark:text-amber-400" />
          <div>
            <h2 className="font-semibold">{t("notice_title")}</h2>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              {t("notice_body")}
            </p>
          </div>
        </div>
      </div>

      <article className="prose prose-gray max-w-none dark:prose-invert">
        <h2>{t("s1_title")}</h2>
        <p>{t("s1_p1")}</p>
        <p>{t("s1_p2")}</p>

        <h2>{t("s2_title")}</h2>
      </article>

      <div className="mt-6 space-y-4">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="font-semibold">{t(`req_${n}_title` as any)}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {t(`req_${n}_desc` as any)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <article className="prose prose-gray mt-12 max-w-none dark:prose-invert">
        <h2>{t("s3_title")}</h2>
        <p>{t("s3_p1")}</p>
        <p className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span>
            <a href={`mailto:${DMCA_EMAIL}`}>{DMCA_EMAIL}</a>
          </span>
        </p>
        <p>{t("s3_p2")}</p>

        <h2>{t("s4_title")}</h2>
        <ul>
          <li>{t("s4_li1")}</li>
          <li>{t("s4_li2")}</li>
          <li>{t("s4_li3")}</li>
          <li>{t("s4_li4")}</li>
        </ul>

        <h2>{t("s5_title")}</h2>
        <p>{t("s5_p1")}</p>
        <ul>
          <li>{t("s5_li1")}</li>
          <li>{t("s5_li2")}</li>
          <li>{t("s5_li3")}</li>
          <li>{t("s5_li4")}</li>
        </ul>
        <p>{t("s5_p2")}</p>

        <h2>{t("s6_title")}</h2>
        <p>{t("s6_p1")}</p>

        <h2>{t("s7_title")}</h2>
        <p>{t("s7_p1")}</p>

        <h2>{t("s8_title")}</h2>
        <p>
          <strong>{t("s8_agent_label")}</strong>
          <br />
          {t("s8_email_label")} <a href={`mailto:${DMCA_EMAIL}`}>{DMCA_EMAIL}</a>
          <br />
          {t("s8_postal_label")}
        </p>
      </article>

      <div className="mt-12 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
        <p className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <FileText className="h-4 w-4" />
          {t("see_more_pre")}
          <a href="/terms" className="font-semibold text-primary hover:underline">
            {t("see_more_terms")}
          </a>
          {t("see_more_mid")}
          <a href="/privacy" className="font-semibold text-primary hover:underline">
            {t("see_more_privacy")}
          </a>
          {t("see_more_post")}
        </p>
      </div>

      <p className="mt-12 rounded-lg bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-400">
        {t("lang_disclaimer")}
      </p>
    </PageContainer>
  );
}
