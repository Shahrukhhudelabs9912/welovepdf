import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://welovepdf.com";

export const metadata: Metadata = {
  title: "Features - Fast, Secure PDF Tools | WeLovePDF",
  description: "Discover WeLovePDF features: lightning-fast PDF processing, end-to-end privacy, 20+ tools, AI-powered summarization, and multi-language support.",
  keywords: "welovepdf features, pdf tools features, fast pdf, secure pdf tools, ai pdf tools",
  openGraph: {
    title: "Features - Fast, Secure PDF Tools | WeLovePDF",
    description: "Lightning-fast PDF processing, end-to-end privacy, 20+ tools, AI-powered.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Features - Fast, Secure PDF Tools | WeLovePDF",
    description: "Lightning-fast PDF processing, end-to-end privacy, 20+ tools, AI-powered.",
  },
  alternates: {
    canonical: `${SITE_URL}/features`,
    languages: {
      en: `${SITE_URL}/features`,
      hi: `${SITE_URL}/hi/features`,
    },
  },
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
