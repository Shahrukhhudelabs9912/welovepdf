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
  title: "OCR PDF Online Free - Make Scanned PDFs Searchable | PDFOrca",
  description: "Convert scanned PDFs into searchable, selectable text with OCR. Free online tool — supports English and Hindi. Adds an invisible text layer, original look preserved.",
  keywords: "ocr pdf, pdf ocr online, scanned pdf to text, searchable pdf, ocr scanned pdf, hindi ocr pdf, pdf text recognition",
  openGraph: {
    title: "OCR PDF Online Free - Make Scanned PDFs Searchable | PDFOrca",
    description: "Convert scanned PDFs into searchable, selectable text with OCR.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OCR PDF Online Free - Make Scanned PDFs Searchable | PDFOrca",
    description: "Convert scanned PDFs into searchable, selectable text with OCR.",
  },
  alternates: {
    canonical: `${SITE_URL}/ocr-pdf`,
    languages: {
      en: `${SITE_URL}/ocr-pdf`,
      hi: `${SITE_URL}/hi/ocr-pdf`,
    },
  },
};

const HOW_TO_STEPS = [
  { name: "Upload the scanned PDF", text: "Drop your scanned or image-only PDF into the tool." },
  { name: "Run OCR", text: "Click OCR — every page is processed and an invisible text layer is added." },
  { name: "Download", text: "Save the searchable PDF — the visible content is unchanged." },
];

const FAQ_ITEMS = [
          { question: "Will the visible look of the PDF change?", answer: "No. OCR adds an invisible text layer behind the existing pages — the original images are kept pixel-perfect." },
          { question: "How long does OCR take?", answer: "Roughly 2-5 seconds per page on a typical scan. Multi-page documents may take a minute or two." },
          { question: "What languages are supported?", answer: "English (eng) and Hindi (hin). More languages can be added on request." },
        ];

const OcrPDFClient = dynamic(
  () => import("./ocr-pdf-client").then((mod) => ({ default: mod.OcrPDFClient })),
  { loading: () => <ToolContentSkeleton />, ssr: false },
);

export default function OcrPDFPage() {
  const pageUrl = `${SITE_URL}/ocr-pdf`;
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "OCR PDF", url: pageUrl },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="OCR PDF Tool"
        description="Free online tool to make scanned PDFs searchable by adding an invisible text layer."
        url={pageUrl}
      />
      <HowToJsonLd
        name="How to OCR a Scanned PDF"
        description="Make a scanned PDF searchable in 3 steps."
        steps={HOW_TO_STEPS}
      />
      <FAQPageJsonLd items={FAQ_ITEMS} />
    <ToolLayout
      title="OCR PDF"
      description="Make a scanned PDF searchable by adding an invisible text layer."
      toolName="OCR PDF"
      toolDescription="Upload a scanned PDF and we'll OCR every page, then return the same document with selectable, searchable text."
      toolKey="ocr_pdf"
      seoContent={{
        h1: "Make Scanned PDFs Searchable",
        h2: "How OCR PDF Works",
        content: `
          <p>Upload a scanned PDF. We run OCR on every page and return the same document with an invisible text layer mapped to the visible glyphs — so you can search, select, and copy text in any PDF reader.</p>
          <p><strong>Key features:</strong></p>
          <ul>
            <li>Adds a true text layer — pages look identical to the original</li>
            <li>Already-searchable pages are left untouched (no double-OCR)</li>
            <li>Supports English and Hindi</li>
            <li>Files auto-deleted after processing</li>
          </ul>
        `,
        faq: FAQ_ITEMS,
      }}
    >
      <OcrPDFClient />
    </ToolLayout>
    </>
  );
}
