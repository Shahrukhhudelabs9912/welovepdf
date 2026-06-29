import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ToolPageSkeleton } from "@/components/skeleton-loader";
import {
  SoftwareApplicationJsonLd,
  HowToJsonLd,
  FAQPageJsonLd,
  BreadcrumbJsonLd,
} from "@/components/seo/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pdforca.com";

const PDFToExcelClient = dynamic(
  () => import("./pdf-to-excel-client").then((mod) => ({ default: mod.PDFToExcelClient })),
  { loading: () => <ToolPageSkeleton />, ssr: false },
);

export const metadata: Metadata = {
  title: "Convert PDF to Excel Online Free | PDFOrca",
  description: "Convert PDF documents to editable Excel (.xlsx) spreadsheets online for free. Extract tables and data from PDFs.",
  keywords: "pdf to excel, convert pdf to excel, pdf to xlsx, pdf to spreadsheet, extract tables from pdf, pdf to excel converter",
  openGraph: {
    title: "Convert PDF to Excel Online Free | PDFOrca",
    description: "Convert PDF documents to editable Excel (.xlsx) spreadsheets online for free. Extract tables and data from PDFs.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Convert PDF to Excel Online Free | PDFOrca",
    description: "Convert PDF documents to editable Excel (.xlsx) spreadsheets online for free. Extract tables and data from PDFs.",
  },
  alternates: {
    canonical: `${SITE_URL}/pdf-to-excel`,
    languages: {
      en: `${SITE_URL}/pdf-to-excel`,
      hi: `${SITE_URL}/hi/pdf-to-excel`,
    },
  },
};

const HOW_TO_STEPS = [
  { name: "Upload your PDF", text: "Drop the PDF you want to convert into the tool." },
  { name: "Convert", text: "Click Convert — tables are detected and reconstructed as Excel sheets." },
  { name: "Download", text: "Save the .xlsx file and edit it in Excel, Google Sheets, or LibreOffice." },
];

const FAQ_ITEMS = [
  { question: "What kinds of PDFs work best?", answer: "PDFs with clearly delimited tables. Scanned PDFs need OCR first — try our OCR PDF tool." },
  { question: "Will the formulas be preserved?", answer: "PDFs only store rendered values, not formulas. The Excel output contains the values shown in the PDF." },
  { question: "Is my PDF safe?", answer: "Yes. Files are processed over HTTPS and deleted automatically after processing." },
  { question: "What's the maximum file size?", answer: "100 MB per PDF for free users." },
];

export default function PDFToExcelPage() {
  const pageUrl = `${SITE_URL}/pdf-to-excel`;
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "PDF to Excel", url: pageUrl },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="PDF to Excel Converter"
        description="Free online tool to extract tables and data from PDFs into editable Excel .xlsx spreadsheets."
        url={pageUrl}
      />
      <HowToJsonLd
        name="How to Convert PDF to Excel"
        description="Extract tabular data from a PDF into Excel in 3 steps."
        steps={HOW_TO_STEPS}
      />
      <FAQPageJsonLd items={FAQ_ITEMS} />
      <PDFToExcelClient />
    </>
  );
}
