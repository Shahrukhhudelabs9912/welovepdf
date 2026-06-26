import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://welovepdf.com";

export const metadata: Metadata = {
  title: "Contact WeLovePDF - Support & Feedback | WeLovePDF",
  description: "Get in touch with the WeLovePDF team. Email support for bug reports, feature requests, privacy inquiries, and general feedback.",
  keywords: "contact welovepdf, pdf support, customer support, feedback, help",
  openGraph: {
    title: "Contact WeLovePDF - Support & Feedback",
    description: "Get in touch with the WeLovePDF team.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact WeLovePDF - Support & Feedback",
    description: "Get in touch with the WeLovePDF team.",
  },
  alternates: {
    canonical: `${SITE_URL}/contact`,
    languages: {
      en: `${SITE_URL}/contact`,
      hi: `${SITE_URL}/hi/contact`,
    },
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
