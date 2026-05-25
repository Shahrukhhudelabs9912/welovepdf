"use client";

import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageMeta } from "@/components/seo-provider";
import { useTranslations } from "next-intl";

export default function ContactPage() {
  const t = useTranslations("contact_page");

  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: t("email_support_title"),
      description: t("email_support_desc"),
      details: t("email_support_details"),
      action: t("email_support_action"),
      href: "mailto:support@welovepdf.com",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: t("live_chat_title"),
      description: t("live_chat_desc"),
      details: t("live_chat_details"),
      action: t("live_chat_action"),
      href: "#",
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: t("phone_support_title"),
      description: t("phone_support_desc"),
      details: t("phone_support_details"),
      action: t("phone_support_action"),
      href: "tel:+15551234567",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: t("office_title"),
      description: t("office_desc"),
      details: t("office_details"),
      action: t("office_action"),
      href: "https://maps.google.com",
    },
  ];

  const faqs = [
    {
      question: t("faq_1_q"),
      answer: t("faq_1_a"),
    },
    {
      question: t("faq_2_q"),
      answer: t("faq_2_a"),
    },
    {
      question: t("faq_3_q"),
      answer: t("faq_3_a"),
    },
    {
      question: t("faq_4_q"),
      answer: t("faq_4_a"),
    },
  ];

  return (
    <>
      <PageMeta
        title={`${t("title")} | WeLovePDF`}
        description={t("description")}
        keywords="contact welovepdf, pdf support, help center, feedback, partnership"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        {/* Hero Section */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              {t("hero_heading_part1")}{" "}
              <span className="text-primary">{t("hero_heading_part2")}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              {t("hero_description")}
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {contactMethods.map((method, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center shadow-sm hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {method.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {method.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {method.description}
                  </p>
                  <p className="mt-4 font-medium text-gray-900 dark:text-white">
                    {method.details}
                  </p>
                  <a href={method.href}>
                    <Button
                      variant="outline"
                      className="mt-6 w-full"
                    >
                      {method.action}
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              {/* Contact Form */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t("form_title")}
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {t("form_subtitle")}
                </p>

                <form className="mt-8 space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("first_name")}
                      </label>
                      <Input placeholder={t("first_name_placeholder")} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("last_name")}
                      </label>
                      <Input placeholder={t("last_name_placeholder")} required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("email_label")}
                    </label>
                    <Input type="email" placeholder={t("email_placeholder")} required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("subject_label")}
                    </label>
                    <Input placeholder={t("subject_placeholder")} required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("message_label")}
                    </label>
                    <Textarea
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

              {/* Company Info & FAQ */}
              <div className="space-y-8">
                {/* Company Info */}
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t("about_title")}
                  </h2>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    {t("about_text")}
                  </p>
                  
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{t("business_hours_label")}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("business_hours_value")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{t("response_time_label")}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("response_time_value")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ */}
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t("faq_title")}
                  </h2>
                  <div className="mt-6 space-y-6">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border-b border-gray-200 dark:border-gray-800 pb-6 last:border-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {faq.question}
                        </h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 text-center text-white">
            <h2 className="text-3xl font-bold">{t("cta_heading")}</h2>
            <p className="mt-4 text-lg opacity-90">
              {t("cta_description")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" className="gap-2">
                <Phone className="h-4 w-4" />
                {t("cta_call_now")}
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 text-white hover:bg-white/20">
                {t("cta_schedule")}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}