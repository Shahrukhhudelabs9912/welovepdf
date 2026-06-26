"use client";

import { Mail, Clock, MessageSquare, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";

/**
 * Contact page intentionally omits a fake phone number and physical
 * address. Showing fabricated contact details is the fastest way to
 * lose trust (and break Google's misrepresentation policy). When real
 * details are available, fill the constants below.
 */
const SUPPORT_EMAIL = "support@welovepdf.app";
const PRIVACY_EMAIL = "privacy@welovepdf.app";

export default function ContactPage() {
  const t = useTranslations("contact_page");

  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: t("email_support_title"),
      description: t("email_support_desc"),
      details: SUPPORT_EMAIL,
      action: t("email_support_action"),
      href: `mailto:${SUPPORT_EMAIL}`,
    },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: t("privacy_inquiries_title"),
      description: t("privacy_inquiries_desc"),
      details: PRIVACY_EMAIL,
      action: t("email_support_action"),
      href: `mailto:${PRIVACY_EMAIL}`,
    },
  ];

  const faqs = [
    { question: t("faq_1_q"), answer: t("faq_1_a") },
    { question: t("faq_2_q"), answer: t("faq_2_a") },
    { question: t("faq_3_q"), answer: t("faq_3_a") },
    { question: t("faq_4_q"), answer: t("faq_4_a") },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        {/* Hero */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              {t("hero_heading_part1")}{" "}
              <span className="text-primary">{t("hero_heading_part2")}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              {t("hero_description")}
            </p>
          </div>
        </section>

        {/* Contact channels */}
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {contactMethods.map((m) => (
              <div
                key={m.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {m.icon}
                </div>
                <h3 className="text-lg font-semibold">{m.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {m.description}
                </p>
                <p className="mt-4 font-mono text-sm text-gray-900 dark:text-white">
                  {m.details}
                </p>
                <a href={m.href}>
                  <Button variant="outline" className="mt-6 w-full">
                    {m.action}
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Form + sidebar */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Form */}
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                <h2 className="text-2xl font-bold">{t("form_title")}</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {t("form_subtitle")}
                </p>

                <form
                  className="mt-8 space-y-6"
                  onSubmit={(e) => {
                    // Until the backend endpoint exists, gracefully redirect
                    // to a prefilled mailto so the user's message isn't lost.
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const params = new URLSearchParams({
                      subject: String(fd.get("subject") || "WeLovePDF inquiry"),
                      body: `From: ${fd.get("first_name") || ""} ${
                        fd.get("last_name") || ""
                      } <${fd.get("email") || ""}>\n\n${fd.get("message") || ""}`,
                    });
                    window.location.href = `mailto:${SUPPORT_EMAIL}?${params.toString()}`;
                  }}
                >
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        {t("first_name")}
                      </label>
                      <Input
                        name="first_name"
                        placeholder={t("first_name_placeholder")}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        {t("last_name")}
                      </label>
                      <Input
                        name="last_name"
                        placeholder={t("last_name_placeholder")}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      {t("email_label")}
                    </label>
                    <Input
                      type="email"
                      name="email"
                      placeholder={t("email_placeholder")}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      {t("subject_label")}
                    </label>
                    <Input
                      name="subject"
                      placeholder={t("subject_placeholder")}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      {t("message_label")}
                    </label>
                    <Textarea
                      name="message"
                      placeholder={t("message_placeholder")}
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full gap-2">
                    <Send className="h-4 w-4" />
                    {t("send")}
                  </Button>
                </form>
              </div>

              {/* Sidebar: about + FAQ */}
              <div className="space-y-8">
                <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
                  <h2 className="text-2xl font-bold">{t("about_title")}</h2>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    {t("about_text")}
                  </p>

                  <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{t("response_time_label")}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("response_time_value")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{t("language_label")}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("language_value")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ */}
                <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
                  <h2 className="text-2xl font-bold">{t("faq_title")}</h2>
                  <div className="mt-6 space-y-6">
                    {faqs.map((f) => (
                      <div
                        key={f.question}
                        className="border-b border-gray-200 pb-6 last:border-0 dark:border-gray-800"
                      >
                        <h3 className="text-lg font-semibold">{f.question}</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                          {f.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
