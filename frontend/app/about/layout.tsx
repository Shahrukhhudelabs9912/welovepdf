import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://welovepdf.com";

export const metadata: Metadata = {
  title: "About WeLovePDF - Our Mission & Story | WeLovePDF",
  description: "Learn about WeLovePDF — a privacy-first, free online PDF toolkit built to make document workflows fast and accessible for everyone.",
  keywords: "about welovepdf, free pdf tools, pdf tools mission, founder story, privacy-first pdf",
  openGraph: {
    title: "About WeLovePDF - Our Mission & Story",
    description: "Privacy-first, free online PDF tools built for everyone.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About WeLovePDF - Our Mission & Story",
    description: "Privacy-first, free online PDF tools built for everyone.",
  },
  alternates: {
    canonical: `${SITE_URL}/about`,
    languages: {
      en: `${SITE_URL}/about`,
      hi: `${SITE_URL}/hi/about`,
    },
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
