import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organize PDF Pages Online Free | WeLovePDF",
  description: "Rearrange, sort, and organize PDF pages online for free. Reorder pages, delete unwanted pages, and create custom page sequences.",
  keywords: "organize pdf, rearrange pdf pages, sort pdf pages, reorder pdf, pdf organizer, pdf page manager",
  openGraph: {
    title: "Organize PDF Pages Online Free | WeLovePDF",
    description: "Rearrange, sort, and organize PDF pages online for free.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Organize PDF Pages Online Free | WeLovePDF",
    description: "Rearrange, sort, and organize PDF pages online for free.",
  },
  alternates: {
    canonical: "https://welovepdf.com/organize-pdf",
    languages: {
      en: "https://welovepdf.com/organize-pdf",
      hi: "https://welovepdf.com/hi/organize-pdf",
    },
  },
};

export default function OrganizePDFLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}