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

export const metadata: Metadata = {
  title: "Unlock PDF Online Free - Remove PDF Password | PDFOrca",
  description: "Unlock password-protected PDFs online for free. Remove the open password using the original password and download the unlocked PDF. Secure and private.",
  keywords: "unlock pdf, remove pdf password, pdf password remover, decrypt pdf, unlock pdf online, pdf unlocker",
  openGraph: {
    title: "Unlock PDF Online Free - Remove PDF Password | PDFOrca",
    description: "Unlock password-protected PDFs online for free.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unlock PDF Online Free - Remove PDF Password | PDFOrca",
    description: "Unlock password-protected PDFs online for free.",
  },
  alternates: {
    canonical: `${SITE_URL}/unlock-pdf`,
    languages: {
      en: `${SITE_URL}/unlock-pdf`,
      hi: `${SITE_URL}/hi/unlock-pdf`,
    },
  },
};

const HOW_TO_STEPS = [
  { name: "Upload the protected PDF", text: "Drop the password-protected PDF into the tool." },
  { name: "Enter the password", text: "Type the original open password — we cannot recover unknown passwords." },
  { name: "Download the unlocked PDF", text: "Click Unlock and save the decrypted PDF." },
];

const FAQ_ITEMS = [
          {
            question: "Do I need the password to unlock the PDF?",
            answer: "Yes. You must know the original password — we cannot recover or bypass it. This tool only removes the password layer once the correct password is provided.",
          },
          {
            question: "Is it safe to upload my password-protected PDF?",
            answer: "Yes. Files are processed over HTTPS and deleted automatically after processing. Passwords are never stored.",
          },
          {
            question: "What if my PDF has owner permissions but no open password?",
            answer: "Use this tool the same way — leave the password empty or enter the owner password. The unlocked PDF will allow printing, copying, and editing freely.",
          },
        ];

const UnlockPDFClient = dynamic(
  () => import("./unlock-pdf-client").then((mod) => ({ default: mod.UnlockPDFClient })),
  { loading: () => <ToolContentSkeleton />, ssr: false }
);

export default function UnlockPDFPage() {
  const pageUrl = `${SITE_URL}/unlock-pdf`;
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Unlock PDF", url: pageUrl },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="PDF Password Remover"
        description="Free online tool to remove password protection from a PDF using the original password."
        url={pageUrl}
      />
      <HowToJsonLd
        name="How to Unlock a PDF"
        description="Strip the password from a PDF in 3 steps."
        steps={HOW_TO_STEPS}
      />
      <FAQPageJsonLd items={FAQ_ITEMS} />
    <ToolLayout
      title="Unlock PDF"
      description="Remove password protection from a PDF using the original password."
      toolName="Unlock PDF"
      toolDescription="Decrypt password-protected PDFs in seconds. Just upload the file, enter the original password, and download the unlocked PDF — no installation, no registration."
      toolKey="unlock_pdf"
      seoContent={{
        h1: "Unlock PDF Online for Free",
        h2: "How to Remove a Password from a PDF",
        content: `
          <p>Our free Unlock PDF tool removes the password protection from any PDF you have the password for. Once unlocked, the file is fully editable and shareable without prompting for a password every time it's opened.</p>
          <p><strong>Key features:</strong></p>
          <ul>
            <li>Works with AES and RC4 encrypted PDFs</li>
            <li>Files are processed securely and deleted automatically</li>
            <li>No software install required</li>
            <li>Maintains original PDF quality and structure</li>
          </ul>
        `,
        faq: FAQ_ITEMS,
      }}
    >
      <UnlockPDFClient />
    </ToolLayout>
    </>
  );
}
