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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://welovepdf.com";

const HOW_TO_STEPS = [
  { name: "Upload your PDF", text: "Click upload or drop the PDF you want to convert." },
  { name: "Pick pages and quality", text: "Select all pages or a specific range and choose image quality / DPI." },
  { name: "Convert to JPG", text: "Click Convert — each page becomes a separate JPG image." },
  { name: "Download", text: "Save the images as a zip or individually." },
];

const FAQ_ITEMS = [
          {
            question: "What's the maximum resolution for JPG conversion?",
            answer: "Our tool supports up to 300 DPI (dots per inch) for high-quality prints. For web use, 72-150 DPI is usually sufficient and results in smaller file sizes.",
          },
          {
            question: "Can I convert only specific pages to JPG?",
            answer: "Yes! You can select individual pages or page ranges to convert. For example, convert only pages 1-5, or select specific pages like 1, 3, and 7.",
          },
          {
            question: "Will the text in my PDF remain clear in the JPG?",
            answer: "Absolutely. Our conversion process maintains text clarity and sharpness. You can adjust the resolution to ensure text remains readable, even at smaller sizes.",
          },
          {
            question: "Can I convert PDF to other image formats?",
            answer: "Yes, in addition to JPG, you can convert to PNG (for transparency), WebP (for web optimization), and TIFF (for high-quality prints).",
          },
        ];

const PDFToJPGClient = dynamic(
  () => import("./pdf-to-jpg-client").then((mod) => ({ default: mod.PDFToJPGClient })),
  { loading: () => <ToolContentSkeleton />, ssr: false }
);

export const metadata: Metadata = {
  title: "Convert PDF to JPG Online Free | WeLovePDF",
  description: "Convert PDF pages to high-quality JPG images online for free. Extract images from PDF or convert entire pages to JPG format.",
  keywords: "convert pdf to jpg, pdf to image, pdf to jpg online, extract images from pdf, pdf to jpg converter",
  openGraph: {
    title: "Convert PDF to JPG Online Free | WeLovePDF",
    description: "Convert PDF pages to high-quality JPG images online for free.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Convert PDF to JPG Online Free | WeLovePDF",
    description: "Convert PDF pages to high-quality JPG images online for free.",
  },
  alternates: {
    canonical: `${SITE_URL}/pdf-to-jpg`,
    languages: {
      en: `${SITE_URL}/pdf-to-jpg`,
      hi: `${SITE_URL}/hi/pdf-to-jpg`,
    },
  },
};

export default function PDFToJPGPage() {
  const pageUrl = `${SITE_URL}/pdf-to-jpg`;
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "PDF to JPG", url: pageUrl },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="PDF to JPG Converter"
        description="Free online tool to convert PDF pages into high-quality JPG images."
        url={pageUrl}
      />
      <HowToJsonLd
        name="How to Convert PDF to JPG"
        description="Turn PDF pages into JPG images in 4 steps."
        steps={HOW_TO_STEPS}
      />
      <FAQPageJsonLd items={FAQ_ITEMS} />
    <ToolLayout
      title="Convert PDF to JPG"
      description="Convert PDF pages to high-quality JPG images with customizable settings."
      toolName="PDF to JPG"
      toolDescription="Transform your PDF documents into JPG images quickly and easily. Convert individual pages or entire documents, adjust image quality and resolution, and download your images ready for sharing, printing, or editing in image software."
      toolKey="pdf_to_jpg"
      seoContent={{
        h1: "Convert PDF to JPG Online for Free",
        h2: "How to Convert PDF to JPG",
        content: `
          <p>Our free PDF to JPG converter allows you to transform PDF pages into high-quality JPG images instantly. Whether you need to extract images from a PDF, convert pages for presentations, or create image files for web use, our tool delivers excellent results.</p>
          <p><strong>Key features:</strong></p>
          <ul>
            <li>Convert entire PDFs or select specific pages</li>
            <li>Adjust image quality (from 1% to 100%)</li>
            <li>Choose resolution: Standard, High, or Custom DPI</li>
            <li>Extract embedded images from PDFs</li>
            <li>Convert to JPG, PNG, or WebP formats</li>
            <li>Batch convert multiple PDFs simultaneously</li>
            <li>Secure processing with automatic file deletion</li>
            <li>No registration or watermarks</li>
          </ul>
          <p>Perfect for creating social media graphics, website images, presentation slides, or extracting visual content from documents.</p>
        `,
        faq: FAQ_ITEMS,
      }}
    >
      <PDFToJPGClient />
    </ToolLayout>
    </>
  );
}