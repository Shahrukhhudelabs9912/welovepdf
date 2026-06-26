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
  title: "Convert PDF to PowerPoint Online Free | WeLovePDF",
  description: "Convert PDF documents into PowerPoint (.pptx) presentations online for free. Each PDF page becomes a 16:9 widescreen slide. No registration required.",
  keywords: "pdf to powerpoint, pdf to pptx, convert pdf to ppt, pdf to slides, pdf to powerpoint converter, pdf to pptx online",
  openGraph: {
    title: "Convert PDF to PowerPoint Online Free | WeLovePDF",
    description: "Convert PDF documents into PowerPoint (.pptx) presentations.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Convert PDF to PowerPoint Online Free | WeLovePDF",
    description: "Convert PDF documents into PowerPoint (.pptx) presentations.",
  },
  alternates: {
    canonical: `${SITE_URL}/pdf-to-powerpoint`,
    languages: {
      en: `${SITE_URL}/pdf-to-powerpoint`,
      hi: `${SITE_URL}/hi/pdf-to-powerpoint`,
    },
  },
};

const HOW_TO_STEPS = [
  { name: "Upload your PDF", text: "Drop your PDF into the tool." },
  { name: "Convert", text: "Click Convert — every page becomes a high-resolution slide." },
  { name: "Download", text: "Save the resulting .pptx file (16:9 widescreen)." },
];

const FAQ_ITEMS = [
          { question: "Will the text be editable?", answer: "Each slide contains a high-resolution image of the page, not editable text. Use this when you need slides that look exactly like the PDF." },
          { question: "What's the slide aspect ratio?", answer: "Slides are 16:9 widescreen (13.33in x 7.5in), the modern PowerPoint default." },
        ];

const PDFToPowerPointClient = dynamic(
  () => import("./pdf-to-powerpoint-client").then((mod) => ({ default: mod.PDFToPowerPointClient })),
  { loading: () => <ToolContentSkeleton />, ssr: false },
);

export default function PDFToPowerPointPage() {
  const pageUrl = `${SITE_URL}/pdf-to-powerpoint`;
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "PDF to PowerPoint", url: pageUrl },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="PDF to PowerPoint Converter"
        description="Free online tool to convert a PDF into a PowerPoint presentation, one slide per page."
        url={pageUrl}
      />
      <HowToJsonLd
        name="How to Convert PDF to PowerPoint"
        description="Turn a PDF into a PPTX deck in 3 steps."
        steps={HOW_TO_STEPS}
      />
      <FAQPageJsonLd items={FAQ_ITEMS} />
    <ToolLayout
      title="PDF to PowerPoint"
      description="Convert PDF documents into editable PowerPoint presentations. Each page becomes a slide."
      toolName="PDF to PowerPoint"
      toolDescription="Convert your PDF files into PPTX presentations where every page is rendered as one slide."
      toolKey="pdf_to_powerpoint"
      seoContent={{
        h1: "Convert PDF to PowerPoint Online",
        h2: "How PDF to PowerPoint Works",
        content: `
          <p>Upload any PDF and get back a .pptx file where every page is dropped onto its own slide as a high-resolution image — preserving the exact look of the original.</p>
          <p><strong>Key features:</strong></p>
          <ul>
            <li>Each PDF page becomes one slide</li>
            <li>Layout, colors, and fonts preserved exactly</li>
            <li>16:9 widescreen slide format</li>
            <li>No registration or watermarks</li>
          </ul>
        `,
        faq: FAQ_ITEMS,
      }}
    >
      <PDFToPowerPointClient />
    </ToolLayout>
    </>
  );
}
