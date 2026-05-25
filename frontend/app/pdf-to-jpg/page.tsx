import type { Metadata } from "next";
import { ToolLayout } from "@/components/tools/tool-layout";
import { PDFToJPGClient } from "./pdf-to-jpg-client";

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
    canonical: "https://welovepdf.com/pdf-to-jpg",
    languages: {
      en: "https://welovepdf.com/pdf-to-jpg",
      hi: "https://welovepdf.com/hi/pdf-to-jpg",
    },
  },
};

export default function PDFToJPGPage() {
  return (
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
        faq: [
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
        ],
      }}
    >
      <PDFToJPGClient />
    </ToolLayout>
  );
}