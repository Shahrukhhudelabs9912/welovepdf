import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pdforca.com";
const LOCALES = ["en", "hi"] as const;

type Route = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const TOOL_ROUTES: Route[] = [
  { path: "/merge-pdf", changeFrequency: "monthly", priority: 0.9 },
  { path: "/split-pdf", changeFrequency: "monthly", priority: 0.9 },
  { path: "/compress-pdf", changeFrequency: "monthly", priority: 0.9 },
  { path: "/pdf-to-word", changeFrequency: "monthly", priority: 0.9 },
  { path: "/word-to-pdf", changeFrequency: "monthly", priority: 0.9 },
  { path: "/pdf-to-jpg", changeFrequency: "monthly", priority: 0.9 },
  { path: "/jpg-to-pdf", changeFrequency: "monthly", priority: 0.9 },
  { path: "/pdf-to-excel", changeFrequency: "monthly", priority: 0.8 },
  { path: "/excel-to-pdf", changeFrequency: "monthly", priority: 0.8 },
  { path: "/pdf-to-powerpoint", changeFrequency: "monthly", priority: 0.8 },
  { path: "/powerpoint-to-pdf", changeFrequency: "monthly", priority: 0.8 },
  { path: "/protect-pdf", changeFrequency: "monthly", priority: 0.8 },
  { path: "/unlock-pdf", changeFrequency: "monthly", priority: 0.8 },
  { path: "/organize-pdf", changeFrequency: "monthly", priority: 0.7 },
  { path: "/extract-pages", changeFrequency: "monthly", priority: 0.7 },
  { path: "/rotate-pdf", changeFrequency: "monthly", priority: 0.7 },
  { path: "/add-watermark", changeFrequency: "monthly", priority: 0.7 },
  { path: "/page-numbering", changeFrequency: "monthly", priority: 0.7 },
  { path: "/sign-pdf", changeFrequency: "monthly", priority: 0.8 },
  { path: "/ocr-pdf", changeFrequency: "monthly", priority: 0.8 },
  { path: "/ai-tools", changeFrequency: "weekly", priority: 0.9 },
];

const STATIC_ROUTES: Route[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/features", changeFrequency: "monthly", priority: 0.7 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/careers", changeFrequency: "monthly", priority: 0.4 },
  { path: "/login", changeFrequency: "yearly", priority: 0.3 },
  { path: "/signup", changeFrequency: "yearly", priority: 0.4 },
];

const LEGAL_ROUTES: Route[] = [
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.2 },
  { path: "/gdpr", changeFrequency: "yearly", priority: 0.2 },
  { path: "/dmca", changeFrequency: "yearly", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const allRoutes = [...STATIC_ROUTES, ...TOOL_ROUTES, ...LEGAL_ROUTES];

  const staticEntries = allRoutes.map((route) => {
    const url =
      route.path === "/" ? SITE_URL : `${SITE_URL}${route.path}`;

    const languages = LOCALES.reduce<Record<string, string>>((acc, locale) => {
      const localeUrl =
        locale === "en"
          ? url
          : `${SITE_URL}/${locale}${route.path === "/" ? "" : route.path}`;
      acc[locale] = localeUrl;
      return acc;
    }, {});

    return {
      url,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: { languages },
    };
  });

  // Blog posts — each one becomes its own sitemap entry so search
  // engines discover new articles without us editing this file.
  const blogEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => {
    const postDate = new Date(post.date);
    return {
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: Number.isNaN(postDate.getTime()) ? lastModified : postDate,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    };
  });

  return [...staticEntries, ...blogEntries];
}
