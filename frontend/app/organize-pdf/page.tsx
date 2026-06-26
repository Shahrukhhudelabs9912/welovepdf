import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ToolPageSkeleton } from "@/components/skeleton-loader";
import {
  SoftwareApplicationJsonLd,
  HowToJsonLd,
  FAQPageJsonLd,
  BreadcrumbJsonLd,
} from "@/components/seo/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://welovepdf.com";

const OrganizePDFClient = dynamic(
  () => import("./organize-pdf-client").then((mod) => ({ default: mod.OrganizePDFClient })),
  { loading: () => <ToolPageSkeleton />, ssr: false },
);

export const metadata: Metadata = {
  title: "Organize PDF Pages Online Free - Reorder, Rotate, Delete | WeLovePDF",
  description: "Reorder, rotate, and delete pages in a PDF online for free. Drag-and-drop interface, no registration required.",
  keywords: "organize pdf, reorder pdf pages, rearrange pdf, delete pdf pages, rotate pdf pages, pdf organizer",
  openGraph: {
    title: "Organize PDF Pages Online Free - Reorder, Rotate, Delete | WeLovePDF",
    description: "Reorder, rotate, and delete pages in a PDF online for free. Drag-and-drop interface, no registration required.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Organize PDF Pages Online Free - Reorder, Rotate, Delete | WeLovePDF",
    description: "Reorder, rotate, and delete pages in a PDF online for free. Drag-and-drop interface, no registration required.",
  },
  alternates: {
    canonical: `${SITE_URL}/organize-pdf`,
    languages: {
      en: `${SITE_URL}/organize-pdf`,
      hi: `${SITE_URL}/hi/organize-pdf`,
    },
  },
};

const HOW_TO_STEPS = [
  { name: "Upload your PDF", text: "Drop your PDF into the tool to see thumbnails of every page." },
  { name: "Reorder pages", text: "Drag thumbnails to rearrange the page order." },
  { name: "Rotate or delete", text: "Use the per-page controls to rotate or remove pages you don't need." },
  { name: "Download", text: "Click Apply and save the reorganized PDF." },
];

const FAQ_ITEMS = [
  { question: "Can I reorder, rotate, and delete in one pass?", answer: "Yes. Apply any combination of changes and they're written into the output PDF in a single step." },
  { question: "Will the PDF lose quality?", answer: "No. Pages are copied as-is — text, images, and links remain unchanged." },
  { question: "Is my PDF safe?", answer: "Yes. Files are processed over HTTPS and deleted automatically after processing." },
  { question: "What's the maximum file size?", answer: "100 MB per PDF for free users." },
];

export default function OrganizePDFPage() {
  const pageUrl = `${SITE_URL}/organize-pdf`;
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Organize PDF", url: pageUrl },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="PDF Organizer"
        description="Free online tool to reorder, rotate, and delete pages within a PDF using a drag-and-drop interface."
        url={pageUrl}
      />
      <HowToJsonLd
        name="How to Organize a PDF"
        description="Reorder, rotate, and delete pages in a PDF in 4 steps."
        steps={HOW_TO_STEPS}
      />
      <FAQPageJsonLd items={FAQ_ITEMS} />
      <OrganizePDFClient />
    </>
  );
}
