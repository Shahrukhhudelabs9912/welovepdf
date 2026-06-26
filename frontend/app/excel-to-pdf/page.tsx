import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ToolPageSkeleton } from "@/components/skeleton-loader";
import {
  SoftwareApplicationJsonLd,
  HowToJsonLd,
  FAQPageJsonLd,
  BreadcrumbJsonLd,
} from "@/components/seo/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://welovepdf.com";

const ExcelToPDFClient = dynamic(
  () => import("./excel-to-pdf-client").then((mod) => ({ default: mod.ExcelToPDFClient })),
  { loading: () => <ToolPageSkeleton />, ssr: false },
);

export const metadata: Metadata = {
  title: "Convert Excel to PDF Online Free | WeLovePDF",
  description: "Convert Excel spreadsheets (.xls, .xlsx) to PDF online for free. Preserve formatting, formulas, and charts. No registration required.",
  keywords: "excel to pdf, convert excel to pdf, xls to pdf, xlsx to pdf, excel to pdf converter, free excel to pdf",
  openGraph: {
    title: "Convert Excel to PDF Online Free | WeLovePDF",
    description: "Convert Excel spreadsheets (.xls, .xlsx) to PDF online for free. Preserve formatting, formulas, and charts. No registration required.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Convert Excel to PDF Online Free | WeLovePDF",
    description: "Convert Excel spreadsheets (.xls, .xlsx) to PDF online for free. Preserve formatting, formulas, and charts. No registration required.",
  },
  alternates: {
    canonical: `${SITE_URL}/excel-to-pdf`,
    languages: {
      en: `${SITE_URL}/excel-to-pdf`,
      hi: `${SITE_URL}/hi/excel-to-pdf`,
    },
  },
};

const HOW_TO_STEPS = [
  { name: "Upload your spreadsheet", text: "Drop a .xls or .xlsx file into the tool." },
  { name: "Convert", text: "Click Convert — sheets, charts, and formatting are flattened to PDF." },
  { name: "Download", text: "Save the PDF, ready to share or print." },
];

const FAQ_ITEMS = [
  { question: "Will my charts and formatting be preserved?", answer: "Yes. Charts, conditional formatting, and cell styles are rendered into the PDF." },
  { question: "Does each sheet become a separate page?", answer: "Sheets are paginated according to their print area, so a multi-sheet workbook produces multiple pages." },
  { question: "Is my spreadsheet safe?", answer: "Yes. Files are processed over HTTPS and deleted automatically after processing." },
  { question: "What's the maximum file size?", answer: "100 MB per file for free users." },
];

export default function ExcelToPDFPage() {
  const pageUrl = `${SITE_URL}/excel-to-pdf`;
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Excel to PDF", url: pageUrl },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="Excel to PDF Converter"
        description="Free online tool to convert Excel .xls and .xlsx spreadsheets into PDF documents."
        url={pageUrl}
      />
      <HowToJsonLd
        name="How to Convert Excel to PDF"
        description="Turn a spreadsheet into a PDF in 3 steps."
        steps={HOW_TO_STEPS}
      />
      <FAQPageJsonLd items={FAQ_ITEMS} />
      <ExcelToPDFClient />
    </>
  );
}
