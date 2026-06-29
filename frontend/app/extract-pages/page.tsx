import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ToolLayout } from "@/components/tools/tool-layout";
import { ToolContentSkeleton } from "@/components/skeleton-loader";

import {
  SoftwareApplicationJsonLd,
  HowToJsonLd,
  FAQPageJsonLd,
  BreadcrumbJsonLd,
} from "@/components/seo/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pdforca.com";

export const metadata: Metadata = {
  title: "Extract Pages from PDF Online Free | PDFOrca",
  description: "Extract specific pages from a PDF into a new document. Pick single pages or ranges (e.g. 1,3,5-7) and download the new PDF instantly. Free, no signup.",
  keywords: "extract pdf pages, pdf page extractor, extract pages from pdf, pdf page picker, select pdf pages, get pages from pdf",
  openGraph: {
    title: "Extract Pages from PDF Online Free | PDFOrca",
    description: "Extract specific pages from a PDF into a new document.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Extract Pages from PDF Online Free | PDFOrca",
    description: "Extract specific pages from a PDF into a new document.",
  },
  alternates: {
    canonical: `${SITE_URL}/extract-pages`,
    languages: {
      en: `${SITE_URL}/extract-pages`,
      hi: `${SITE_URL}/hi/extract-pages`,
    },
  },
};

const HOW_TO_STEPS = [
  { name: "Upload your PDF", text: "Drop your source PDF into the tool." },
  { name: "Type the pages", text: "Enter page numbers and ranges separated by commas (e.g. 1,3,5-7)." },
  { name: "Download", text: "Click Extract and save the new PDF containing only those pages." },
];

const FAQ_ITEMS = [
          {
            question: "How do I pick the pages?",
            answer: "Type page numbers separated by commas. Ranges are written with a hyphen — for example, 1,3,5-7 extracts pages 1, 3, 5, 6, and 7.",
          },
          {
            question: "Is this different from Split PDF?",
            answer: "Split PDF breaks the file into several output PDFs. Extract Pages produces a single new PDF containing only the pages you selected.",
          },
          {
            question: "Will the extracted PDF lose quality?",
            answer: "No. Pages are copied as-is from the source PDF — text, images, and links remain unchanged.",
          },
        ];

const ExtractPagesClient = dynamic(
  () => import("./extract-pages-client").then((mod) => ({ default: mod.ExtractPagesClient })),
  { loading: () => <ToolContentSkeleton />, ssr: false }
);

export default function ExtractPagesPage() {
  const pageUrl = `${SITE_URL}/extract-pages`;
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Extract Pages", url: pageUrl },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="PDF Page Extractor"
        description="Free online tool to pull selected pages from a PDF into a new document."
        url={pageUrl}
      />
      <HowToJsonLd
        name="How to Extract Pages from a PDF"
        description="Build a new PDF from selected pages in 3 steps."
        steps={HOW_TO_STEPS}
      />
      <FAQPageJsonLd items={FAQ_ITEMS} />
    <ToolLayout
      title="Extract Pages"
      description="Pull selected pages from a PDF into a brand-new document."
      toolName="Extract Pages"
      toolDescription="Need only a few pages out of a long PDF? Enter the page numbers you want and we'll build a fresh PDF with just those pages — in the exact order you listed them."
      toolKey="extract_pages"
      seoContent={{
        h1: "Extract Pages from PDF Online for Free",
        h2: "How to Extract Pages from a PDF",
        content: `
          <p>Our free Extract Pages tool lets you pick any combination of pages from a PDF and download them as a new file. Use single page numbers, ranges, or both at the same time.</p>
          <p><strong>Key features:</strong></p>
          <ul>
            <li>Mix single pages and ranges (e.g. <code>1,3,5-7</code>)</li>
            <li>Output keeps the original page order you typed</li>
            <li>No quality loss — pages are copied, not re-rendered</li>
            <li>Files auto-deleted after download</li>
          </ul>
        `,
        faq: FAQ_ITEMS,
      }}
    >
      <ExtractPagesClient />
    </ToolLayout>
    </>
  );
}
