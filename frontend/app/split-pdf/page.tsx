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

const HOW_TO_STEPS = [
  { name: "Upload your PDF", text: "Click upload or drag the PDF you want to split into the tool." },
  { name: "Choose split mode", text: "Pick page ranges (e.g. 1-10, 11-20), specific pages, or split-every-N." },
  { name: "Split the file", text: "Click Split and we'll produce one output PDF per range." },
  { name: "Download", text: "Save the resulting PDFs as a zip or individually." },
];

const FAQ_ITEMS = [
          {
            question: "Is splitting PDF files free?",
            answer: "Yes, our PDF splitter is completely free with no limits on the number of files or splits."
          },
          {
            question: "How many pages can I split at once?",
            answer: "You can split PDFs with up to 1000 pages. There's no limit on the number of resulting files."
          },
          {
            question: "Will the split PDFs lose quality?",
            answer: "No, we maintain the original quality of all PDFs during the splitting process."
          },
          {
            question: "Can I split multiple PDFs at once?",
            answer: "Currently, you can split one PDF at a time, but you can process multiple PDFs sequentially."
          }
        ];

const SplitPDFClient = dynamic(
  () => import("./split-pdf-client").then((mod) => ({ default: mod.SplitPDFClient })),
  { loading: () => <ToolContentSkeleton />, ssr: false }
);

export const metadata: Metadata = {
  title: "Split PDF Online Free - Divide PDF into Multiple Files | PDFOrca",
  description: "Split PDF files into multiple documents online for free. Divide PDF by page ranges or extract specific pages. No registration required.",
  keywords: "split pdf, divide pdf, split pdf online, split pdf free, extract pdf pages, pdf splitter, separate pdf",
  openGraph: {
    title: "Split PDF Online Free - Divide PDF into Multiple Files | PDFOrca",
    description: "Split PDF files into multiple documents online for free.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Split PDF Online Free - Divide PDF into Multiple Files | PDFOrca",
    description: "Split PDF files into multiple documents online for free.",
  },
  alternates: {
    canonical: `${SITE_URL}/split-pdf`,
    languages: {
      en: `${SITE_URL}/split-pdf`,
      hi: `${SITE_URL}/hi/split-pdf`,
    },
  },
};

export default function SplitPDFPage() {
  const pageUrl = `${SITE_URL}/split-pdf`;
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Split PDF", url: pageUrl },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="PDF Splitter"
        description="Free online tool to split a PDF into multiple files by page ranges or specific pages."
        url={pageUrl}
      />
      <HowToJsonLd
        name="How to Split a PDF"
        description="Divide one PDF into several output files in 4 steps."
        steps={HOW_TO_STEPS}
      />
      <FAQPageJsonLd items={FAQ_ITEMS} />
    <ToolLayout
      title="Split PDF"
      description="Divide a PDF file into multiple documents or extract specific pages"
      toolName="PDF Splitter"
      toolDescription="Split PDF files by page ranges, extract specific pages, or divide into equal parts with our fast and secure online tool."
      toolKey="split_pdf"
      seoContent={{
        h1: "Split PDF Files Online for Free",
        h2: "How to Split PDF Files",
        content: `
          <p>Our free PDF splitter allows you to divide large PDF documents into smaller files or extract specific pages quickly and easily. Whether you need to separate chapters, extract important pages, or split a large document for email attachments, our tool handles it seamlessly.</p>
          <p><strong>Key features:</strong></p>
          <ul>
            <li>Split PDF by page ranges (e.g., 1-10, 11-20)</li>
            <li>Extract specific pages (e.g., 1, 3, 5, 7-9)</li>
            <li>Split every N pages automatically</li>
            <li>Maintains original quality of all documents</li>
            <li>Secure processing with automatic file deletion</li>
            <li>No registration or watermarks</li>
          </ul>
          <p>Perfect for students extracting chapters from textbooks, professionals separating reports, or anyone needing to organize large PDFs into manageable files.</p>
        `,
        faq: FAQ_ITEMS,
      }}
    >
      <SplitPDFClient />
    </ToolLayout>
    </>
  );
}