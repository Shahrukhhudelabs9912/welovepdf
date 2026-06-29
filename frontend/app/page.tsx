import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { PageLoader } from "@/components/loading-spinner";
import { AdBanner } from "@/components/ad-banner";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pdforca.com";

export const metadata: Metadata = {
  title: "PDFOrca - Free Online PDF Tools | Merge, Split, Compress, Convert",
  description: "Free online PDF tools to merge, split, compress, convert PDF to Word, Excel, JPG, and more. AI-powered, privacy-first, no registration required.",
  keywords: "pdf tools, merge pdf, split pdf, compress pdf, pdf to word, pdf converter, free pdf tools, online pdf editor",
  openGraph: {
    title: "PDFOrca - Free Online PDF Tools",
    description: "Free online PDF tools to merge, split, compress, and convert PDFs. AI-powered, privacy-first.",
    url: SITE_URL,
    type: "website",
    siteName: "PDFOrca",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFOrca - Free Online PDF Tools",
    description: "Free online PDF tools to merge, split, compress, and convert PDFs.",
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      en: SITE_URL,
      hi: `${SITE_URL}/hi`,
    },
  },
};

const HeroSection = dynamic(
  () => import("@/components/home/hero").then((mod) => ({ default: mod.HeroSection })),
  { ssr: true },
);

const ToolsGrid = dynamic(
  () => import("@/components/home/tools-grid").then((mod) => ({ default: mod.ToolsGrid })),
  { ssr: true },
);

const FeaturesSection = dynamic(
  () => import("@/components/home/features").then((mod) => ({ default: mod.FeaturesSection })),
  { ssr: true },
);

const FAQ = dynamic(
  () => import("@/components/home/faq").then((mod) => ({ default: mod.FAQ })),
  { ssr: true },
);

const CTASection = dynamic(
  () => import("@/components/home/cta").then((mod) => ({ default: mod.CTASection })),
  { ssr: true },
);

export default function Home() {
  return (
    <Suspense fallback={<PageLoader />}>
      <div className="flex min-h-screen flex-col">
        <HeroSection />
        <ToolsGrid />
        <AdBanner slot="HOMEPAGE_MID" format="horizontal" className="my-4 px-4" />
        <FeaturesSection />
        <FAQ />
        <AdBanner slot="HOMEPAGE_BOTTOM" format="horizontal" className="my-4 px-4" />
        <CTASection />
      </div>
    </Suspense>
  );
}
