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

export const metadata: Metadata = {
  title: "Rotate PDF Online Free - Rotate PDF Pages 90/180/270° | WeLovePDF",
  description: "Rotate PDF pages clockwise or counter-clockwise online for free. Fix sideways or upside-down pages by 90, 180, or 270 degrees. No registration.",
  keywords: "rotate pdf, rotate pdf pages, pdf rotator, rotate pdf online, rotate pdf 90 degrees, fix pdf orientation",
  openGraph: {
    title: "Rotate PDF Online Free - Rotate PDF Pages 90/180/270° | WeLovePDF",
    description: "Rotate PDF pages clockwise or counter-clockwise online for free.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rotate PDF Online Free - Rotate PDF Pages 90/180/270° | WeLovePDF",
    description: "Rotate PDF pages clockwise or counter-clockwise online for free.",
  },
  alternates: {
    canonical: `${SITE_URL}/rotate-pdf`,
    languages: {
      en: `${SITE_URL}/rotate-pdf`,
      hi: `${SITE_URL}/hi/rotate-pdf`,
    },
  },
};

const HOW_TO_STEPS = [
  { name: "Upload your PDF", text: "Drop the PDF you want to rotate into the tool." },
  { name: "Pick rotation angle and pages", text: "Choose 90°, 180°, or 270° and either all pages or a custom range like 1,3,5-7." },
  { name: "Download", text: "Click Rotate and save the corrected PDF." },
];

const FAQ_ITEMS = [
          {
            question: "Will rotating affect the PDF quality?",
            answer: "No. Rotation is applied as page metadata, so text, images, and links stay pixel-identical to the source.",
          },
          {
            question: "Can I rotate only specific pages?",
            answer: "Yes. Leave the range as 'all' to rotate everything, or enter pages like '1,3,5-7' to rotate only those.",
          },
          {
            question: "Which angles can I rotate by?",
            answer: "90° (clockwise), 180° (upside down), or 270° (counter-clockwise / 90° anticlockwise).",
          },
        ];

const RotatePDFClient = dynamic(
  () => import("./rotate-pdf-client").then((mod) => ({ default: mod.RotatePDFClient })),
  { loading: () => <ToolContentSkeleton />, ssr: false }
);

export default function RotatePDFPage() {
  const pageUrl = `${SITE_URL}/rotate-pdf`;
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Rotate PDF", url: pageUrl },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="PDF Rotator"
        description="Free online tool to rotate PDF pages by 90, 180, or 270 degrees."
        url={pageUrl}
      />
      <HowToJsonLd
        name="How to Rotate a PDF"
        description="Fix sideways or upside-down PDF pages in 3 steps."
        steps={HOW_TO_STEPS}
      />
      <FAQPageJsonLd items={FAQ_ITEMS} />
    <ToolLayout
      title="Rotate PDF"
      description="Rotate all or selected pages of a PDF by 90, 180, or 270 degrees."
      toolName="Rotate PDF"
      toolDescription="Fix sideways or upside-down PDF pages in one click. Choose the rotation angle, pick which pages to rotate, and download the corrected file."
      toolKey="rotate_pdf"
      seoContent={{
        h1: "Rotate PDF Pages Online for Free",
        h2: "How to Rotate a PDF",
        content: `
          <p>Our free Rotate PDF tool turns pages clockwise or counter-clockwise so every page faces the right way up. Rotate the whole document or just the pages that need fixing.</p>
          <p><strong>Key features:</strong></p>
          <ul>
            <li>Rotate by 90°, 180°, or 270°</li>
            <li>Apply to all pages or a custom range like <code>1,3,5-7</code></li>
            <li>Original quality preserved — no re-rendering</li>
            <li>Files deleted automatically after processing</li>
          </ul>
        `,
        faq: FAQ_ITEMS,
      }}
    >
      <RotatePDFClient />
    </ToolLayout>
    </>
  );
}
