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
  { name: "Upload images", text: "Drop or select JPG, PNG, GIF, WebP, BMP or TIFF files." },
  { name: "Arrange the order", text: "Drag images into the order they should appear in the PDF." },
  { name: "Choose page settings", text: "Pick page size (A4, Letter, Legal), orientation, and margins." },
  { name: "Download the PDF", text: "Click Convert and download the combined PDF." },
];

const FAQ_ITEMS = [
          {
            question: "What image formats can I convert to PDF?",
            answer: "Our tool supports JPG, PNG, GIF, WebP, BMP, TIFF, and most common image formats. You can convert single images or combine multiple images of different formats into one PDF."
          },
          {
            question: "Can I rearrange the order of images in the PDF?",
            answer: "Yes, you can drag and drop images to rearrange them in any order before converting to PDF. The images will appear in the PDF in the order you specify."
          },
          {
            question: "Will the image quality be preserved in the PDF?",
            answer: "Yes, we maintain the original quality of your images. The PDF will contain your images at their original resolution, unless you choose to compress them."
          },
          {
            question: "Is there a limit to the number of images I can convert?",
            answer: "Free users can convert up to 50 images at once (maximum 100MB total). Pro users have higher limits and can process larger batches."
          }
        ];

const JPGToPDFClient = dynamic(
  () => import("./jpg-to-pdf-client").then((mod) => ({ default: mod.JPGToPDFClient })),
  { loading: () => <ToolContentSkeleton />, ssr: false }
);

export const metadata: Metadata = {
  title: "JPG to PDF Converter Online Free - Convert Images to PDF | PDFOrca",
  description: "Convert JPG images to PDF files online for free. Combine multiple images into a single PDF document. No registration required.",
  keywords: "jpg to pdf, image to pdf, convert jpg to pdf, jpg to pdf converter, images to pdf, photo to pdf",
  openGraph: {
    title: "JPG to PDF Converter Online Free - Convert Images to PDF | PDFOrca",
    description: "Convert JPG images to PDF files online for free.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JPG to PDF Converter Online Free - Convert Images to PDF | PDFOrca",
    description: "Convert JPG images to PDF files online for free.",
  },
  alternates: {
    canonical: `${SITE_URL}/jpg-to-pdf`,
    languages: {
      en: `${SITE_URL}/jpg-to-pdf`,
      hi: `${SITE_URL}/hi/jpg-to-pdf`,
    },
  },
};

export default function JPGToPDFPage() {
  const pageUrl = `${SITE_URL}/jpg-to-pdf`;
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "JPG to PDF", url: pageUrl },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="JPG to PDF Converter"
        description="Free online tool to convert JPG and other images into a single PDF document."
        url={pageUrl}
      />
      <HowToJsonLd
        name="How to Convert JPG to PDF"
        description="Combine images into one PDF in 4 steps."
        steps={HOW_TO_STEPS}
      />
      <FAQPageJsonLd items={FAQ_ITEMS} />
    <ToolLayout
      title="JPG to PDF"
      description="Convert JPG images to PDF files or combine multiple images into one PDF"
      toolName="JPG to PDF Converter"
      toolDescription="Convert JPG, PNG, and other image formats to PDF files with our fast and secure online tool."
      toolKey="jpg_to_pdf"
      seoContent={{
        h1: "Convert JPG to PDF Online for Free",
        h2: "How to Convert Images to PDF",
        content: `
          <p>Our free JPG to PDF converter allows you to transform image files into professional PDF documents quickly and easily. Whether you need to convert photos, screenshots, or scanned documents to PDF format, our tool delivers excellent results.</p>
          <p><strong>Key features:</strong></p>
          <ul>
            <li>Convert JPG, PNG, GIF, WebP, BMP, and TIFF to PDF</li>
            <li>Combine multiple images into a single PDF document</li>
            <li>Adjust page size (A4, Letter, Legal, Custom)</li>
            <li>Choose portrait or landscape orientation</li>
            <li>Customize margins and image placement</li>
            <li>Maintain original image quality</li>
            <li>Secure processing with automatic file deletion</li>
            <li>No registration or watermarks</li>
          </ul>
          <p>Perfect for creating digital photo albums, converting scanned documents to PDF, preparing images for printing, or archiving photos in a standardized format.</p>
        `,
        faq: FAQ_ITEMS,
      }}
    >
      <JPGToPDFClient />
    </ToolLayout>
    </>
  );
}