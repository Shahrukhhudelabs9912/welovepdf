"use client";

import { Cookie, Shield, Settings, EyeOff, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { PageContainer } from "@/components/ui/page-container";
import { PageHero } from "@/components/ui/page-hero";

const LAST_UPDATED = "June 16, 2026";
const PRIVACY_EMAIL = "privacy@pdforca.com";

const cookieRows = [
  { name: "pdforca_access_token", row: 1 },
  { name: "pdforca_refresh_token", row: 2 },
  { name: "NEXT_LOCALE", row: 3 },
  { name: "theme", row: 4 },
  { name: "__cf_bm", row: 5 },
];

export default function CookiesPage() {
  const t = useTranslations("cookies");

  return (
    <PageContainer>
      <PageHero
        icon={Cookie}
        iconColor="amber"
        title={t("title")}
        subtitle={t("subtitle")}
        meta={
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <Shield className="h-4 w-4" />
            <span>{t("last_updated_label", { date: LAST_UPDATED })}</span>
          </div>
        }
      />

      {/* What we DON'T use */}
      <div className="mb-12 rounded-2xl border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-900/20">
        <div className="flex items-start gap-3">
          <EyeOff className="mt-1 h-6 w-6 text-green-600 dark:text-green-400" />
          <div>
            <h2 className="text-lg font-semibold">{t("dont_use_title")}</h2>
            <ul className="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>❌ {t("dont_use_li1")}</li>
              <li>❌ {t("dont_use_li2")}</li>
              <li>❌ {t("dont_use_li3")}</li>
              <li>❌ {t("dont_use_li4")}</li>
            </ul>
          </div>
        </div>
      </div>

      <article className="prose prose-gray max-w-none dark:prose-invert">
        <h2>{t("s1_title")}</h2>
        <p>{t("s1_p1")}</p>

        <h2>{t("s2_title")}</h2>
      </article>

      {/* Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border border-gray-200 dark:border-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">{t("th_name")}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">{t("th_category")}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">{t("th_purpose")}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">{t("th_duration")}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">{t("th_set_by")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {cookieRows.map(({ name, row }) => (
              <tr key={name}>
                <td className="px-4 py-3 font-mono text-sm">{name}</td>
                <td className="px-4 py-3 text-sm">{t(`row${row}_category` as any)}</td>
                <td className="px-4 py-3 text-sm">{t(`row${row}_purpose` as any)}</td>
                <td className="px-4 py-3 text-sm">{t(`row${row}_duration` as any)}</td>
                <td className="px-4 py-3 text-sm">{t(`row${row}_set_by` as any)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <article className="prose prose-gray mt-10 max-w-none dark:prose-invert">
        <h2>{t("s3_title")}</h2>
        <p>{t("s3_p1")}</p>
        <p>{t("s3_p2")}</p>
        <ul>
          <li>
            <a
              href="https://support.google.com/chrome/answer/95647"
              target="_blank"
              rel="noopener"
            >
              Chrome
            </a>
          </li>
          <li>
            <a
              href="https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer"
              target="_blank"
              rel="noopener"
            >
              Firefox
            </a>
          </li>
          <li>
            <a
              href="https://support.apple.com/guide/safari/manage-cookies-sfri11471"
              target="_blank"
              rel="noopener"
            >
              Safari
            </a>
          </li>
          <li>
            <a
              href="https://support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
              target="_blank"
              rel="noopener"
            >
              Edge
            </a>
          </li>
        </ul>

        <h2>{t("s4_title")}</h2>
        <p>{t("s4_p1")}</p>

        <h2>{t("s5_title")}</h2>
        <p className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span>
            {t("s5_email_pre")}
            <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>
          </span>
        </p>
      </article>

      <div className="mt-10 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
        <p className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <Settings className="h-4 w-4" />
          {t("see_privacy_pre")}
          <a href="/privacy" className="font-semibold text-primary hover:underline">
            {t("see_privacy_link")}
          </a>
          {t("see_privacy_post")}
        </p>
      </div>

      <p className="mt-12 rounded-lg bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-400">
        {t("lang_disclaimer")}
      </p>
    </PageContainer>
  );
}
