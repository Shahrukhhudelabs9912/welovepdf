"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { PageLoader } from "@/components/loading-spinner";

// Lazy-load all home page sections for code splitting
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
        <FeaturesSection />
        <FAQ />
        <CTASection />
      </div>
    </Suspense>
  );
}
