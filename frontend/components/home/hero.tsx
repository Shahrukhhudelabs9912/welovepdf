"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Zap, Brain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const router = useRouter();
  const t = useTranslations();

  const handleStartProcessing = () => {
    router.push("/merge-pdf");
  };

  const handleExploreTools = () => {
    router.push("/features");
  };

  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900" />
      <div className="container mx-auto">
        <div className="flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              <Brain className="mr-2 h-4 w-4" />
              {t("hero.badge")}
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              Fast, Secure &{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI-Powered
              </span>{" "}
              PDF Tools
            </h1>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
              {t("hero.subtitle")}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" className="gap-2" onClick={handleStartProcessing}>
                {t("hero.cta_primary")}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={handleExploreTools}>
                {t("hero.cta_secondary")}
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{t("hero.trust_badges.secure")}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t("hero.trust_badges.secure_sub")}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{t("hero.trust_badges.fast")}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t("hero.trust_badges.fast_sub")}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{t("hero.trust_badges.ai")}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t("hero.trust_badges.ai_sub")}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}