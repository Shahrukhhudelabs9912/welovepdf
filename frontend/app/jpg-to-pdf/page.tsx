import type { Metadata } from "next";
import { ToolLayout } from "@/components/tools/tool-layout";
import { JPGToPDFClient } from "./jpg-to-pdf-client";

export const metadata: Metadata = {
  title: "JPG to PDF Converter Online Free - Convert Images to PDF | WeLovePDF",
  description: "Convert JPG images to PDF files online for free. Combine multiple images into a single PDF document. No registration required.",
  keywords: "jpg to pdf, image to pdf, convert jpg to pdf, jpg to pdf converter, images to pdf, photo to pdf",
  openGraph: {
    title: "JPG to PDF Converter Online Free - Convert Images to PDF | WeLovePDF",
    description: "Convert JPG images to PDF files online for free.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JPG to PDF Converter Online Free - Convert Images to PDF | WeLovePDF",
    description: "Convert JPG images to PDF files online for free.",
  },
  alternates: {
    canonical: "https://welovepdf.com/jpg-to-pdf",
    languages: {
      en: "https://welovepdf.com/jpg-to-pdf",
      hi: "https://welovepdf.com/hi/jpg-to-pdf",
    },
  },
};

export default function JPGToPDFPage() {
  return (
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
        faq: [
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
        ]
      }}
    >
      <JPGToPDFClient />
    </ToolLayout>
  );
}