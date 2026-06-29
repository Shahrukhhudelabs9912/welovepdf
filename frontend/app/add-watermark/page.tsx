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
  { name: "Upload your PDF", text: "Drop the PDF you want to watermark into the tool." },
  { name: "Choose watermark type", text: "Pick a text watermark (with font, size, color) or upload a PNG/JPG/SVG image." },
  { name: "Position and style", text: "Set position, opacity, rotation, and which pages to apply it to." },
  { name: "Download", text: "Click Apply Watermark and save the watermarked PDF." },
];

const FAQ_ITEMS = [
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
        ];

const AddWatermarkClient = dynamic(
  () => import("./add-watermark-client").then((mod) => ({ default: mod.AddWatermarkClient })),
  { loading: () => <ToolContentSkeleton />, ssr: false }
);

export const metadata: Metadata = {
  title: "Add Watermark to PDF Online Free | PDFOrca",
  description: "Add text or image watermarks to your PDF documents online for free. Customize position, opacity, and size of watermarks. No registration required.",
  keywords: "add watermark to pdf, pdf watermark, watermark pdf, text watermark, image watermark, protect pdf, pdf security",
  openGraph: {
    title: "Add Watermark to PDF Online Free | PDFOrca",
    description: "Add text or image watermarks to your PDF documents online for free.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Add Watermark to PDF Online Free | PDFOrca",
    description: "Add text or image watermarks to your PDF documents online for free.",
  },
  alternates: {
    canonical: `${SITE_URL}/add-watermark`,
    languages: {
      en: `${SITE_URL}/add-watermark`,
      hi: `${SITE_URL}/hi/add-watermark`,
    },
  },
};

export default function AddWatermarkPage() {
  const pageUrl = `${SITE_URL}/add-watermark`;
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Add Watermark", url: pageUrl },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="PDF Watermark Tool"
        description="Free online tool to add text or image watermarks to a PDF document."
        url={pageUrl}
      />
      <HowToJsonLd
        name="How to Add a Watermark to a PDF"
        description="Stamp a text or image watermark onto a PDF in 4 steps."
        steps={HOW_TO_STEPS}
      />
      <FAQPageJsonLd items={FAQ_ITEMS} />
    <ToolLayout
      title="Add Watermark to PDF"
      description="Add text or image watermarks to protect and brand your PDF documents."
      toolName="Add Watermark"
      toolDescription="Easily add custom text or image watermarks to your PDF files. Control position, opacity, rotation, and size to create professional-looking watermarks for branding or protection."
      toolKey="add_watermark"
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
        faq: FAQ_ITEMS,
      }}
    >
      <AddWatermarkClient />
    </ToolLayout>
    </>
  );
}