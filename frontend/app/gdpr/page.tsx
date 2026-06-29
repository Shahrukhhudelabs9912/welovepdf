"use client";

import {
  Shield,
  Globe,
  Mail,
  Eye,
  FileText,
  Trash2,
  Download,
  CheckCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { PageContainer } from "@/components/ui/page-container";
import { PageHero } from "@/components/ui/page-hero";

const LAST_UPDATED = "June 16, 2026";
const PRIVACY_EMAIL = "privacy@pdforca.com";

const RIGHT_ICONS = [
  <Eye key="1" className="h-5 w-5" />,
  <FileText key="2" className="h-5 w-5" />,
  <Trash2 key="3" className="h-5 w-5" />,
  <Download key="4" className="h-5 w-5" />,
  <CheckCircle key="5" className="h-5 w-5" />,
  <Shield key="6" className="h-5 w-5" />,
];

export default function GDPRPage() {
  const t = useTranslations("gdpr");

  return (
    <PageContainer>
      <PageHero
        icon={Globe}
        iconColor="blue"
        title={t("title")}
        subtitle={t("subtitle")}
        meta={
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
            <Shield className="h-4 w-4" />
            <span>{t("last_updated_label", { date: LAST_UPDATED })}</span>
          </div>
        }
      />

        {/* Rights grid */}
        <div className="mb-16 grid gap-6 sm:grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                {RIGHT_ICONS[n - 1]}
              </div>
              <h3 className="mt-4 font-semibold">{t(`right_${n}_title` as any)}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {t(`right_${n}_desc` as any)}
              </p>
            </div>
          ))}
        </div>

        <article className="prose prose-gray max-w-none dark:prose-invert">
          <h2>{t("s1_title")}</h2>
          <p>{t("s1_p1")}</p>
          <ul>
            <li>
              <strong>{t("s1_li1_label")}</strong>
              {t("s1_li1")}
            </li>
            <li>
              <strong>{t("s1_li2_label")}</strong>
              {t("s1_li2")}
            </li>
          </ul>
          <p>{t("s1_p2")}</p>

          <h2>{t("s2_title")}</h2>
          <p>
            {t("s2_p1_pre")}
            <strong>{t("s2_p1_gdpr")}</strong>
            {t("s2_p1_mid")}
            <em>{t("s2_p1_controller")}</em>
            {t("s2_p1_mid2")}
            <em>{t("s2_p1_processor")}</em>
            {t("s2_p1_post")}
          </p>
          <p>
            {t("s2_p2_pre")}
            <strong>{t("s2_p2_dpdp")}</strong>
            {t("s2_p2_mid")}
            <em>{t("s2_p2_fiduciary")}</em>
            {t("s2_p2_post")}
          </p>

          <h2>{t("s3_title")}</h2>
          <p>{t("s3_p1")}</p>
          <ul>
            <li>
              <strong>{t("s3_li1_label")}</strong>
              {t("s3_li1")}
            </li>
            <li>
              <strong>{t("s3_li2_label")}</strong>
              {t("s3_li2")}
            </li>
            <li>
              <strong>{t("s3_li3_label")}</strong>
              {t("s3_li3")}
            </li>
            <li>
              <strong>{t("s3_li4_label")}</strong>
              {t("s3_li4")}
            </li>
          </ul>

          <h2>{t("s4_title")}</h2>
          <p>{t("s4_p1")}</p>
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>
              <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>
            </span>
          </p>
          <p>
            {t("s4_p2_pre")}
            <strong>{t("s4_p2_emph")}</strong>
            {t("s4_p2_post")}
          </p>

          <h2>{t("s5_title")}</h2>
          <p>{t("s5_p1")}</p>

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
          </ul>

          <h2>{t("s7_title")}</h2>
          <p>{t("s7_p1")}</p>

          <h2>{t("s8_title")}</h2>
          <p>{t("s8_p1")}</p>
          <ul>
            <li>
              <strong>{t("s8_li1_label")}</strong>
              {t("s8_li1")}
            </li>
            <li>
              <strong>{t("s8_li2_label")}</strong>
              {t("s8_li2_mid")}
              <a
                href="https://edpb.europa.eu/about-edpb/about-edpb/members_en"
                target="_blank"
                rel="noopener"
              >
                edpb.europa.eu
              </a>
              {t("s8_li2_post")}
            </li>
          </ul>

          <h2>{t("s9_title")}</h2>
          <p>{t("s9_p1")}</p>

          <p className="mt-12 rounded-lg bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-400">
            {t("lang_disclaimer")}
          </p>
        </article>
    </PageContainer>
  );
}
