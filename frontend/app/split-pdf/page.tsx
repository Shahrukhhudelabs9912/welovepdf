import type { Metadata } from "next";
import { ToolLayout } from "@/components/tools/tool-layout";
import { SplitPDFClient } from "./split-pdf-client";

export const metadata: Metadata = {
  title: "Split PDF Online Free - Divide PDF into Multiple Files | WeLovePDF",
  description: "Split PDF files into multiple documents online for free. Divide PDF by page ranges or extract specific pages. No registration required.",
  keywords: "split pdf, divide pdf, split pdf online, split pdf free, extract pdf pages, pdf splitter, separate pdf",
  openGraph: {
    title: "Split PDF Online Free - Divide PDF into Multiple Files | WeLovePDF",
    description: "Split PDF files into multiple documents online for free.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Split PDF Online Free - Divide PDF into Multiple Files | WeLovePDF",
    description: "Split PDF files into multiple documents online for free.",
  },
  alternates: {
    canonical: "https://welovepdf.com/split-pdf",
    languages: {
      en: "https://welovepdf.com/split-pdf",
      hi: "https://welovepdf.com/hi/split-pdf",
    },
  },
};

export default function SplitPDFPage() {
  return (
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
        faq: [
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
        ]
      }}
    >
      <SplitPDFClient />
    </ToolLayout>
  );
}