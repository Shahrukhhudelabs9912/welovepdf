import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://welovepdf.com";

export const metadata: Metadata = {
  title: "Pricing - Free PDF Tools | WeLovePDF",
  description: "All WeLovePDF tools are free. A Pro plan with larger files, batch processing, and priority support is coming soon.",
  keywords: "welovepdf pricing, free pdf tools, pdf pro plan, pdf tools cost",
  openGraph: {
    title: "Pricing - Free PDF Tools | WeLovePDF",
    description: "All WeLovePDF tools are free. Pro plan coming soon.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing - Free PDF Tools | WeLovePDF",
    description: "All WeLovePDF tools are free. Pro plan coming soon.",
  },
  alternates: {
    canonical: `${SITE_URL}/pricing`,
    languages: {
      en: `${SITE_URL}/pricing`,
      hi: `${SITE_URL}/hi/pricing`,
    },
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
