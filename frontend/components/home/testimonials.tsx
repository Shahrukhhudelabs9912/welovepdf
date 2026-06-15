"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Testimonials() {
  const t = useTranslations();

  const userKeys = ["user1", "user2", "user3", "user4", "user5", "user6"];

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("testimonials.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            {t("testimonials.subtitle")}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userKeys.map((key, index) => {
            const name = t(`testimonials.${key}.name`);
            const role = t(`testimonials.${key}.role`);
            const company = t(`testimonials.${key}.company`);
            const text = t(`testimonials.${key}.text`);
            const rating = 5;
            const initials = getInitials(name);

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="absolute right-6 top-6 text-gray-200 dark:text-gray-800">
                  <Quote className="h-8 w-8" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                    {initials}
                  </div>
                  <div>
                    <h4 className="font-semibold">{name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {role}{company ? `, ${company}` : ""}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">{text}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-20 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-8 dark:from-gray-800 dark:to-gray-900">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {t("testimonials.stats.user_rating_value")}
              </div>
              <div className="mt-2 text-lg font-semibold">
                {t("testimonials.stats.user_rating")}
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {t("testimonials.stats.rating_desc")}
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {t("testimonials.stats.uptime_value")}
              </div>
              <div className="mt-2 text-lg font-semibold">
                {t("testimonials.stats.uptime")}
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {t("testimonials.stats.uptime_desc")}
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {t("testimonials.stats.ranking_value")}
              </div>
              <div className="mt-2 text-lg font-semibold">
                {t("testimonials.stats.google_ranking")}
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {t("testimonials.stats.ranking_desc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}