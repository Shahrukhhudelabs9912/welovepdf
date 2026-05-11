"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Lock, Zap, Brain, Shield } from "lucide-react";

const faqs = [
  {
    question: "Is WeLovePDF really free to use?",
    answer:
      "Yes, all our basic PDF tools are completely free with no registration required. We offer premium features for advanced needs, but the core functionality remains free forever.",
    icon: Zap,
  },
  {
    question: "How do you ensure my files are secure?",
    answer:
      "We use end-to-end encryption, automatic file deletion (within minutes of processing), and never store your documents on our servers. All processing happens in secure, isolated environments.",
    icon: Shield,
  },
  {
    question: "What file sizes do you support?",
    answer:
      "We support files up to 100MB per file for free users and up to 2GB for premium users. For larger files, we recommend using our desktop application.",
    icon: Zap,
  },
  {
    question: "Do you support Hindi and other languages?",
    answer:
      "Yes! We have full UI support for English and Hindi, with more languages coming soon. Our SEO is optimized for regional keywords in multiple languages.",
    icon: Brain,
  },
  {
    question: "Can I process files without uploading to your servers?",
    answer:
      "Yes, we offer browser-based processing for many tools. This means your files never leave your computer, providing maximum privacy for sensitive documents.",
    icon: Lock,
  },
  {
    question: "How fast is the processing?",
    answer:
      "Most operations complete in under 2 seconds for average-sized files. We use parallel processing, Web Workers, and optimized algorithms for maximum speed.",
    icon: Zap,
  },
  {
    question: "What PDF tools do you offer?",
    answer:
      "We offer 14+ tools including merge, split, compress, convert (PDF to Word, Excel, PPT, JPG), rotate, protect, unlock, watermark, page numbering, organize, and AI-powered summarization.",
    icon: Brain,
  },
  {
    question: "Do you have an API for developers?",
    answer:
      "Yes, we offer a comprehensive REST API for developers. You can integrate our PDF processing capabilities directly into your applications with detailed documentation and SDKs.",
    icon: Zap,
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
      <div className="container mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Get answers to common questions about WeLovePDF.
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
            Still have questions?{" "}
            <a href="/contact" className="font-semibold text-primary hover:underline">
              Contact our support team
            </a>{" "}
            — we're here to help!
          </p>
        </div>
      </div>
    </section>
  );
}