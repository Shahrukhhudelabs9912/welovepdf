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
  { name: "Upload your PDF", text: "Click upload or drop your PDF into the tool area." },
  { name: "Choose compression level", text: "Pick Low, Medium, or High depending on quality vs. size trade-off." },
  { name: "Compress the file", text: "Press Compress and let our engine optimize images and remove unused data." },
  { name: "Download", text: "Save the smaller PDF to your device." },
];

const FAQ_ITEMS = [
          {
            question: "Is PDF compression safe?",
            answer: "Yes, our compression tool is completely safe. We process files securely and automatically delete them after 1 hour. No one can access your documents."
          },
          {
            question: "Will compression affect PDF quality?",
            answer: "Our intelligent compression algorithm optimizes images and removes unnecessary data while preserving text quality. You can choose between different compression levels to balance size and quality."
          },
          {
            question: "What is the maximum file size?",
            answer: "You can compress PDF files up to 200MB. For larger files, consider splitting them first or using our premium service."
          },
          {
            question: "How much can I reduce PDF file size?",
            answer: "Compression results vary depending on the content. Image-heavy PDFs can be reduced by up to 90%, while text-only documents may see 20-50% reduction."
          }
        ];

const CompressPDFTool = dynamic(
  () => import("@/components/tools/compress-pdf-tool").then((mod) => ({ default: mod.CompressPDFTool })),
  { loading: () => <ToolContentSkeleton />, ssr: false }
);

export const metadata: Metadata = {
  title: "Compress PDF Online Free - Reduce PDF File Size | WeLovePDF",
  description: "Compress PDF files to reduce file size without losing quality. Optimize PDFs for email, web, or storage. No registration required.",
  keywords: "compress pdf, reduce pdf size, pdf compressor, shrink pdf, optimize pdf, pdf size reducer, compress pdf online",
  openGraph: {
    title: "Compress PDF Online Free - Reduce PDF File Size | WeLovePDF",
    description: "Compress PDF files to reduce file size without losing quality.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compress PDF Online Free - Reduce PDF File Size | WeLovePDF",
    description: "Compress PDF files to reduce file size without losing quality.",
  },
  alternates: {
    canonical: `${SITE_URL}/compress-pdf`,
    languages: {
      en: `${SITE_URL}/compress-pdf`,
      hi: `${SITE_URL}/hi/compress-pdf`,
    },
  },
};

export default function CompressPDFPage() {
  const pageUrl = `${SITE_URL}/compress-pdf`;
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Compress PDF", url: pageUrl },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="PDF Compressor"
        description="Free online tool to reduce PDF file size while maintaining visual quality."
        url={pageUrl}
      />
      <HowToJsonLd
        name="How to Compress a PDF"
        description="Reduce a PDF's file size in 4 steps."
        steps={HOW_TO_STEPS}
      />
      <FAQPageJsonLd items={FAQ_ITEMS} />
    <ToolLayout
      title="Compress PDF"
      description="Reduce PDF file size while maintaining quality"
      toolName="PDF Compressor"
      toolDescription="Compress PDF files to reduce size for email, web, or storage with our intelligent compression algorithm."
      toolKey="compress_pdf"
      seoContent={{
        h1: "Compress PDF Files Online for Free",
        h2: "How to Compress PDF Files",
        content: `
          <p>Our free PDF compressor reduces the file size of your PDF documents while maintaining visual quality. Perfect for email attachments, web uploads, or saving storage space.</p>
          <p><strong>Key features:</strong></p>
          <ul>
            <li>Reduce PDF file size by up to 90%</li>
            <li>Three compression levels: Low, Medium, High</li>
            <li>Preserves text quality and readability</li>
            <li>Secure processing with automatic file deletion</li>
            <li>No registration or watermarks</li>
          </ul>
          <p>Ideal for students submitting assignments, professionals sharing reports, or anyone needing to optimize PDFs for faster sharing.</p>
        `,
        faq: FAQ_ITEMS,
      }}
    >
      <CompressPDFTool />
    </ToolLayout>
    </>
  );
}