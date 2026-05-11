import type { Metadata } from "next";
import { ToolLayout } from "@/components/tools/tool-layout";
import { AddWatermarkClient } from "./add-watermark-client";

export const metadata: Metadata = {
  title: "Add Watermark to PDF Online Free | WeLovePDF",
  description: "Add text or image watermarks to your PDF documents online for free. Customize position, opacity, and size of watermarks. No registration required.",
  keywords: "add watermark to pdf, pdf watermark, watermark pdf, text watermark, image watermark, protect pdf, pdf security",
  openGraph: {
    title: "Add Watermark to PDF Online Free | WeLovePDF",
    description: "Add text or image watermarks to your PDF documents online for free.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Add Watermark to PDF Online Free | WeLovePDF",
    description: "Add text or image watermarks to your PDF documents online for free.",
  },
  alternates: {
    canonical: "https://welovepdf.com/add-watermark",
    languages: {
      en: "https://welovepdf.com/add-watermark",
      hi: "https://welovepdf.com/hi/add-watermark",
    },
  },
};

export default function AddWatermarkPage() {
  return (
    <ToolLayout
      title="Add Watermark to PDF"
      description="Add text or image watermarks to protect and brand your PDF documents."
      toolName="Add Watermark"
      toolDescription="Easily add custom text or image watermarks to your PDF files. Control position, opacity, rotation, and size to create professional-looking watermarks for branding or protection."
      seoContent={{
        h1: "Add Watermark to PDF Online for Free",
        h2: "How to Add Watermark to PDF",
        content: `
          <p>Our free PDF watermark tool allows you to add text or image watermarks to your PDF documents quickly and easily. Whether you need to add a "Confidential" stamp, company logo, or copyright notice, our tool handles it seamlessly.</p>
          <p><strong>Key features:</strong></p>
          <ul>
            <li>Add text watermarks with custom font, size, and color</li>
            <li>Upload image watermarks (PNG, JPG, SVG)</li>
            <li>Control position (center, corners, repeated)</li>
            <li>Adjust opacity and rotation angle</li>
            <li>Apply to all pages or specific pages</li>
            <li>Secure processing with automatic file deletion</li>
            <li>No registration or watermarks on our side</li>
          </ul>
          <p>Perfect for businesses adding logos to documents, authors protecting their work, or organizations marking confidential materials.</p>
        `,
        faq: [
          {
            question: "What types of watermarks can I add?",
            answer: "You can add both text watermarks (with customizable font, size, color, and rotation) and image watermarks (PNG, JPG, SVG formats)."
          },
          {
            question: "Can I control where the watermark appears?",
            answer: "Yes, you can choose from preset positions (center, top-left, bottom-right, etc.) or set custom coordinates. You can also choose to repeat the watermark across the entire page."
          },
          {
            question: "Will the watermark affect my PDF quality?",
            answer: "No, the watermark is added as a separate layer and doesn't affect the original content quality. You can adjust opacity to make it more or less visible."
          },
          {
            question: "Is there a file size limit?",
            answer: "The maximum file size is 100MB per PDF. For larger files, consider compressing them first using our PDF compression tool."
          }
        ]
      }}
    >
      <AddWatermarkClient />
    </ToolLayout>
  );
}