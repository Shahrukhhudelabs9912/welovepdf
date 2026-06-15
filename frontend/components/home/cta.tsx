"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/routing";

export function CTASection() {
  const t = useTranslations();

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
          <div className="px-8 py-16 sm:px-12 sm:py-20 lg:px-16">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                    {t("cta.title")}
                  </h2>
                  <p className="mt-6 text-lg text-blue-100">
                    {t("cta.subtitle")}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link
                      href="/merge-pdf"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-blue-700 hover:bg-gray-100 gap-2 h-11 rounded-md px-8"
                    >
                      {t("cta.button1")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground border-white text-white hover:bg-white/10 h-11 rounded-md px-8"
                    >
                      {t("cta.button2")}
                    </Link>
                  </div>

                  <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-white">{t("hero.trust_badges.secure")}</div>
                        <div className="text-sm text-blue-200">{t("hero.trust_badges.secure_sub")}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-white">{t("hero.trust_badges.fast")}</div>
                        <div className="text-sm text-blue-200">{t("hero.trust_badges.fast_sub")}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                        <Globe className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-white">{t("hero.trust_badges.ai")}</div>
                        <div className="text-sm text-blue-200">{t("hero.trust_badges.ai_sub")}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative rounded-2xl bg-white/10 backdrop-blur-sm p-8 border border-white/20"
                >
                  <h3 className="text-2xl font-bold text-white">{t("cta.button1")}</h3>
                  <p className="mt-2 text-blue-100">
                    Drag & drop your first PDF to experience the power of WeLovePDF.
                  </p>

                  <div className="mt-8 space-y-4">
                    {[
                      "No credit card required",
                      "Process up to 10 files simultaneously",
                      "100% privacy guaranteed",
                      "Hindi & English support",
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span className="text-white">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 rounded-xl bg-white/5 p-6">
                    <h4 className="font-semibold text-white">Popular Use Cases</h4>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {[
                        "Merge invoices",
                        "Compress reports",
                        "Convert resumes",
                        "Protect contracts",
                      ].map((useCase, index) => (
                        <div
                          key={index}
                          className="rounded-lg bg-white/10 px-4 py-3 text-center text-sm font-medium text-white"
                        >
                          {useCase}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <p className="text-sm text-blue-200">
                      Trusted by 50,000+ businesses worldwide
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Need help getting started?{" "}
            <a href="/contact" className="font-semibold text-primary hover:underline">
              Contact our team
            </a>{" "}
            or{" "}
            <a href="/blog" className="font-semibold text-primary hover:underline">
              read our tutorials
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}