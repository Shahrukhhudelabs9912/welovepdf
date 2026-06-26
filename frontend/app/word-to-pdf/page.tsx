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

const WordToPDFClient = dynamic(
  () => import("./word-to-pdf-client").then((mod) => ({ default: mod.WordToPDFClient })),
  { loading: () => <ToolPageSkeleton />, ssr: false },
);

export const metadata: Metadata = {
  title: "Convert Word to PDF Online Free | WeLovePDF",
  description: "Convert Word documents (.doc, .docx) to PDF online for free. Preserve formatting, fonts, and images. No registration required.",
  keywords: "word to pdf, convert word to pdf, doc to pdf, docx to pdf, word to pdf converter, free word to pdf",
  openGraph: {
    title: "Convert Word to PDF Online Free | WeLovePDF",
    description: "Convert Word documents (.doc, .docx) to PDF online for free. Preserve formatting, fonts, and images. No registration required.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Convert Word to PDF Online Free | WeLovePDF",
    description: "Convert Word documents (.doc, .docx) to PDF online for free. Preserve formatting, fonts, and images. No registration required.",
  },
  alternates: {
    canonical: `${SITE_URL}/word-to-pdf`,
    languages: {
      en: `${SITE_URL}/word-to-pdf`,
      hi: `${SITE_URL}/hi/word-to-pdf`,
    },
  },
};

const HOW_TO_STEPS = [
  { name: "Upload your Word file", text: "Drop a .doc or .docx file into the tool." },
  { name: "Convert", text: "Click Convert — our headless LibreOffice engine renders it to PDF." },
  { name: "Download", text: "Save the PDF — fonts and layout intact." },
];

const FAQ_ITEMS = [
  { question: "Will my fonts and formatting be preserved?", answer: "Yes. We use a headless office engine that preserves fonts, layout, and images faithfully." },
  { question: "Does the tool support .doc as well as .docx?", answer: "Yes. Both legacy .doc and modern .docx are supported." },
  { question: "Is my document safe?", answer: "Yes. Files are processed over HTTPS and deleted automatically after processing." },
  { question: "What's the maximum file size?", answer: "100 MB per file for free users." },
];

export default function WordToPDFPage() {
  const pageUrl = `${SITE_URL}/word-to-pdf`;
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Word to PDF", url: pageUrl },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="Word to PDF Converter"
        description="Free online tool to convert Word .doc and .docx files into PDF documents."
        url={pageUrl}
      />
      <HowToJsonLd
        name="How to Convert Word to PDF"
        description="Turn a Word document into a PDF in 3 steps."
        steps={HOW_TO_STEPS}
      />
      <FAQPageJsonLd items={FAQ_ITEMS} />
      <WordToPDFClient />
    </>
  );
}
