"use client";

import Link from "next/link";
import { FileSearch, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("errors");

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-20">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <FileSearch className="h-10 w-10 text-gray-400 dark:text-gray-500" />
        </div>
        <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700">
          404
        </h1>
        <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
          {t("not_found")}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t("not_found_desc")}
        </p>
        <div className="mt-6">
          <Button asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              {t("go_home")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}