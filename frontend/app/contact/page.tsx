"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, Clock, MessageSquare, Send, ShieldCheck, CheckCircle2, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface CaptchaChallenge {
  id: string;
  target: string;
  images: string[];
}

/**
 * Contact page intentionally omits a fake phone number and physical
 * address. Showing fabricated contact details is the fastest way to
 * lose trust (and break Google's misrepresentation policy). When real
 * details are available, fill the constants below.
 */
const SUPPORT_EMAIL = "support@pdforca.com";
const PRIVACY_EMAIL = "privacy@pdforca.com";

export default function ContactPage() {
  const t = useTranslations("contact_page");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [captcha, setCaptcha] = useState<CaptchaChallenge | null>(null);
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    setSelectedIndices(new Set());
    try {
      const res = await fetch("/api/contact");
      const data = await res.json();
      if (data?.id) {
        setCaptcha(data);
      }
    } catch {
      // silent — captcha area will show loading state
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  const toggleIndex = (idx: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      first_name: String(fd.get("first_name") || "").trim(),
      last_name: String(fd.get("last_name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      subject: String(fd.get("subject") || "").trim(),
      message: String(fd.get("message") || "").trim(),
      website: String(fd.get("fax_number") || ""), // honeypot — must stay empty
      captcha_id: captcha?.id || "",
      captcha_selected: Array.from(selectedIndices),
    };

    // Client-side validation
    const newErrors: Record<string, string> = {};
    if (!payload.first_name) {
      newErrors.first_name = "First name is required.";
    }
    if (!payload.last_name) {
      newErrors.last_name = "Last name is required.";
    }
    if (!payload.email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!payload.subject) {
      newErrors.subject = "Subject is required.";
    }
    if (!payload.message) {
      newErrors.message = "Message is required.";
    } else if (payload.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters.";
    }
    if (selectedIndices.size === 0) {
      newErrors.captcha = "Please select the correct images.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.detail || data?.error || "Could not send your message. Please try again.");
        return;
      }
      setSubmitted(true);
      form.reset();
      setSelectedIndices(new Set());
      fetchCaptcha();
      toast.success(data?.message || "Thanks! We received your message.");
    } catch {
      toast.error("Network error. Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

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

                {submitted ? (
                  <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-900/50 dark:bg-green-900/20">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                      <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-200">
                      Message sent
                    </h3>
                    <p className="mt-2 text-sm text-green-800 dark:text-green-300">
                      Thanks! We received your message and will reply within 1-2 business days.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={() => setSubmitted(false)}
                    >
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
                    {/* Honeypot — invisible to humans, irresistible to bots. */}
                    <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                      <label>
                        Fax
                        <input
                          type="text"
                          name="fax_number"
                          tabIndex={-1}
                          autoComplete="nope"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          {t("first_name")}
                        </label>
                        <Input
                          name="first_name"
                          placeholder={t("first_name_placeholder")}
                          required
                          maxLength={100}
                          disabled={submitting}
                          className={errors.first_name ? "border-red-500" : ""}
                          onChange={() => setErrors((prev) => { const { first_name, ...rest } = prev; return rest; })}
                        />
                        {errors.first_name && <p className="mt-1 text-xs text-red-500">{errors.first_name}</p>}
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          {t("last_name")}
                        </label>
                        <Input
                          name="last_name"
                          placeholder={t("last_name_placeholder")}
                          required
                          maxLength={100}
                          disabled={submitting}
                          className={errors.last_name ? "border-red-500" : ""}
                          onChange={() => setErrors((prev) => { const { last_name, ...rest } = prev; return rest; })}
                        />
                        {errors.last_name && <p className="mt-1 text-xs text-red-500">{errors.last_name}</p>}
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
                        disabled={submitting}
                        className={errors.email ? "border-red-500" : ""}
                        onChange={() => setErrors((prev) => { const { email, ...rest } = prev; return rest; })}
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        {t("subject_label")}
                      </label>
                      <Input
                        name="subject"
                        placeholder={t("subject_placeholder")}
                        required
                        maxLength={200}
                        disabled={submitting}
                        className={errors.subject ? "border-red-500" : ""}
                        onChange={() => setErrors((prev) => { const { subject, ...rest } = prev; return rest; })}
                      />
                      {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject}</p>}
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
                        minLength={10}
                        maxLength={5000}
                        disabled={submitting}
                        className={errors.message ? "border-red-500" : ""}
                        onChange={() => setErrors((prev) => { const { message, ...rest } = prev; return rest; })}
                      />
                      {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
                    </div>

                    {/* Image grid captcha */}
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {captcha ? `Select all ${captcha.target}` : "Loading captcha..."}
                        </label>
                        <button
                          type="button"
                          onClick={fetchCaptcha}
                          disabled={captchaLoading}
                          className="text-gray-500 hover:text-primary transition-colors disabled:opacity-50"
                          title="New challenge"
                        >
                          <RefreshCw className={`h-4 w-4 ${captchaLoading ? "animate-spin" : ""}`} />
                        </button>
                      </div>
                      {captchaLoading ? (
                        <div className="flex items-center justify-center h-[280px]">
                          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                      ) : captcha ? (
                        <div className="grid grid-cols-3 gap-2">
                          {captcha.images.map((img, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => toggleIndex(idx)}
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                selectedIndices.has(idx)
                                  ? "border-primary ring-2 ring-primary/30 scale-95"
                                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                              }`}
                            >
                              <img
                                src={img}
                                alt={`Captcha image ${idx + 1}`}
                                className="w-full h-full object-cover"
                                draggable={false}
                              />
                              {selectedIndices.has(idx) && (
                                <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-red-500">Failed to load captcha. Click refresh.</p>
                      )}
                      {errors.captcha && <p className="mt-2 text-xs text-red-500">{errors.captcha}</p>}
                    </div>

                    <Button type="submit" className="w-full gap-2" disabled={submitting || selectedIndices.size === 0 || !captcha}>
                      <Send className="h-4 w-4" />
                      {submitting ? "Sending..." : t("send")}
                    </Button>
                  </form>
                )}
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
