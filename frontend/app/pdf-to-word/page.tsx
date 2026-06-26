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

const PDFToWordClient = dynamic(
  () => import("./pdf-to-word-client").then((mod) => ({ default: mod.PDFToWordClient })),
  { loading: () => <ToolPageSkeleton />, ssr: false },
);

export const metadata: Metadata = {
  title: "Convert PDF to Word Online Free | WeLovePDF",
  description: "Convert PDF documents to editable Word (.docx) files online for free. Preserve layout, text, and images. No registration required.",
  keywords: "pdf to word, convert pdf to word, pdf to docx, pdf to word converter, pdf to word online, free pdf to word",
  openGraph: {
    title: "Convert PDF to Word Online Free | WeLovePDF",
    description: "Convert PDF documents to editable Word (.docx) files online for free. Preserve layout, text, and images. No registration required.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Convert PDF to Word Online Free | WeLovePDF",
    description: "Convert PDF documents to editable Word (.docx) files online for free. Preserve layout, text, and images. No registration required.",
  },
  alternates: {
    canonical: `${SITE_URL}/pdf-to-word`,
    languages: {
      en: `${SITE_URL}/pdf-to-word`,
      hi: `${SITE_URL}/hi/pdf-to-word`,
    },
  },
};

const HOW_TO_STEPS = [
  { name: "Upload your PDF", text: "Drop the PDF you want to convert into the tool." },
  { name: "Convert", text: "Click Convert — text, layout, and images are extracted into a .docx file." },
  { name: "Download", text: "Save the Word document and edit it in Microsoft Word, Google Docs, or LibreOffice." },
];

const FAQ_ITEMS = [
  { question: "Is the converted Word file editable?", answer: "Yes. Text, paragraphs, and most layout elements are reconstructed as native Word content you can edit." },
  { question: "Will my PDF formatting be preserved?", answer: "Layout, fonts, and images are preserved as closely as possible. Highly designed PDFs may need minor cleanup." },
  { question: "Is my PDF safe?", answer: "Yes. Files are processed over HTTPS and deleted automatically after processing." },
  { question: "What's the maximum file size?", answer: "100 MB per PDF for free users." },
];

export default function PDFToWordPage() {
  const pageUrl = `${SITE_URL}/pdf-to-word`;
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "PDF to Word", url: pageUrl },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="PDF to Word Converter"
        description="Free online tool to convert PDF documents into editable Word .docx files."
        url={pageUrl}
      />
      <HowToJsonLd
        name="How to Convert PDF to Word"
        description="Turn a PDF into an editable Word document in 3 steps."
        steps={HOW_TO_STEPS}
      />
      <FAQPageJsonLd items={FAQ_ITEMS} />
      <PDFToWordClient />
    </>
  );
}
