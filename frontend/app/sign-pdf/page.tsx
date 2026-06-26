import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ToolLayout } from "@/components/tools/tool-layout";
import { ToolContentSkeleton } from "@/components/skeleton-loader";
import { SIGNATURE_FONTS } from "./signature-fonts";

import {
  SoftwareApplicationJsonLd,
  HowToJsonLd,
  FAQPageJsonLd,
  BreadcrumbJsonLd,
} from "@/components/seo/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://welovepdf.com";

export const metadata: Metadata = {
  title: "Sign PDF Online Free - Add Signature to PDF | WeLovePDF",
  description: "Sign PDF documents online for free. Type your signature or upload an image, then place it anywhere on the page. Download the signed PDF instantly.",
  keywords: "sign pdf, pdf signature, e-sign pdf, electronic signature pdf, add signature to pdf, pdf signer online",
  openGraph: {
    title: "Sign PDF Online Free - Add Signature to PDF | WeLovePDF",
    description: "Sign PDF documents online for free.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign PDF Online Free - Add Signature to PDF | WeLovePDF",
    description: "Sign PDF documents online for free.",
  },
  alternates: {
    canonical: `${SITE_URL}/sign-pdf`,
    languages: {
      en: `${SITE_URL}/sign-pdf`,
      hi: `${SITE_URL}/hi/sign-pdf`,
    },
  },
};

const HOW_TO_STEPS = [
  { name: "Upload your PDF", text: "Drop the PDF you want to sign into the tool." },
  { name: "Create your signature", text: "Type your name in a script font or upload a transparent PNG of your signature." },
  { name: "Place it on the page", text: "Click where the signature should appear and resize as needed." },
  { name: "Download", text: "Click Apply and save the signed PDF." },
];

const FAQ_ITEMS = [
          { question: "Is this a legally binding signature?", answer: "It's a visual signature — appropriate for many internal and personal documents. For legally binding e-signatures with audit trails, use a dedicated e-sign service." },
          { question: "Can I sign multiple pages?", answer: "The MVP signs one page per upload. Repeat the process to sign additional pages." },
          { question: "What image formats are supported?", answer: "PNG (recommended — supports transparency) and JPG." },
        ];

const SignPDFClient = dynamic(
  () => import("./sign-pdf-client").then((mod) => ({ default: mod.SignPDFClient })),
  { loading: () => <ToolContentSkeleton />, ssr: false },
);

export default function SignPDFPage() {
  const pageUrl = `${SITE_URL}/sign-pdf`;
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Sign PDF", url: pageUrl },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="PDF Signer"
        description="Free online tool to add a typed or uploaded signature to a PDF document."
        url={pageUrl}
      />
      <HowToJsonLd
        name="How to Sign a PDF"
        description="Add a visual signature to a PDF in 4 steps."
        steps={HOW_TO_STEPS}
      />
      <FAQPageJsonLd items={FAQ_ITEMS} />
      {/* Force load signature fonts at page mount so the tile picker shows real fonts, not cursive fallback. */}
      <div className="sr-only" aria-hidden="true">
        {SIGNATURE_FONTS.map((f) => (
          <span key={f.id} className={f.className}>
            {f.label}
          </span>
        ))}
      </div>
    <ToolLayout
      title="Sign PDF"
      description="Add a typed or uploaded signature to your PDF — click where you want it."
      toolName="Sign PDF"
      toolDescription="Type your name in a signature font or upload an existing signature image, then click the page to place it. Download the signed PDF instantly."
      toolKey="sign_pdf"
      seoContent={{
        h1: "Sign PDF Online for Free",
        h2: "How to Sign a PDF",
        content: `
          <p>Sign any PDF in seconds. Type your name and we'll render it in a handwritten-style font, or upload a transparent PNG of your handwritten signature. Click anywhere on the page to drop the signature, then download the signed PDF.</p>
          <p><strong>Key features:</strong></p>
          <ul>
            <li>Type a signature in a script font, or upload an image</li>
            <li>Click to position; resize before stamping</li>
            <li>Original PDF quality preserved</li>
            <li>Files auto-deleted after processing</li>
          </ul>
        `,
        faq: FAQ_ITEMS,
      }}
    >
      <SignPDFClient />
    </ToolLayout>
    </>
  );
}
