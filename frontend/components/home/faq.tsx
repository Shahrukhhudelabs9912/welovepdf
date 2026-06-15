"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Lock, Zap, Brain, Shield } from "lucide-react";

export function FAQ() {
  const t = useTranslations();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: t("faq.q1.question"),
      answer: t("faq.q1.answer"),
      icon: Zap,
    },
    {
      question: t("faq.q2.question"),
      answer: t("faq.q2.answer"),
      icon: Shield,
    },
    {
      question: t("faq.q3.question"),
      answer: t("faq.q3.answer"),
      icon: Zap,
    },
    {
      question: t("faq.q4.question"),
      answer: t("faq.q4.answer"),
      icon: Brain,
    },
    {
      question: t("faq.q5.question"),
      answer: t("faq.q5.answer"),
      icon: Lock,
    },
    {
      question: t("faq.q6.question"),
      answer: t("faq.q6.answer"),
      icon: Zap,
    },
    {
      question: t("faq.q7.question"),
      answer: t("faq.q7.answer"),
      icon: Brain,
    },
    {
      question: t("faq.q8.question"),
      answer: t("faq.q8.answer"),
      icon: Zap,
    },
  ];

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
      <div className="container mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("faq.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            {t("faq.subtitle")}
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-4">
              <button
                onClick={() => toggleFAQ(index)}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-6 text-left hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <faq.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-lg font-semibold">{faq.question}</span>
                </div>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-b-xl border border-t-0 border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                      <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            {t("faq.contact_text")}{" "}
            <a href="/contact" className="font-semibold text-primary hover:underline">
              {t("faq.contact_link")}
            </a>{" "}
            {t("faq.contact_suffix")}
          </p>
        </div>
      </div>
    </section>
  );
}