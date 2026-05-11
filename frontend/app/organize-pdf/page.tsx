import type { Metadata } from "next";
import { ToolLayout } from "@/components/tools/tool-layout";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { ListOrdered, SortAsc, SortDesc, Filter, Grid, Columns } from "lucide-react";

export const metadata: Metadata = {
  title: "Organize PDF Pages Online Free | WeLovePDF",
  description: "Rearrange, sort, and organize PDF pages online for free. Reorder pages, delete unwanted pages, and create custom page sequences.",
  keywords: "organize pdf, rearrange pdf pages, sort pdf pages, reorder pdf, pdf organizer, pdf page manager",
  openGraph: {
    title: "Organize PDF Pages Online Free | WeLovePDF",
    description: "Rearrange, sort, and organize PDF pages online for free.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Organize PDF Pages Online Free | WeLovePDF",
    description: "Rearrange, sort, and organize PDF pages online for free.",
  },
  alternates: {
    canonical: "https://welovepdf.com/organize-pdf",
    languages: {
      en: "https://welovepdf.com/organize-pdf",
      hi: "https://welovepdf.com/hi/organize-pdf",
    },
  },
};

export default function OrganizePDFPage() {
  return (
    <ToolLayout
      title="Organize PDF Pages"
      description="Rearrange, sort, and organize PDF pages to create the perfect document flow."
      toolName="Organize PDF"
      toolDescription="Take control of your PDF document structure. Reorder pages, delete unwanted sections, sort pages numerically or alphabetically, and create custom page sequences for presentations, reports, or portfolios."
      seoContent={{
        h1: "Organize PDF Pages Online for Free",
        h2: "How to Organize PDF Pages",
        content: `
          <p>Our free PDF organizer tool gives you complete control over your document's structure. Whether you need to rearrange pages for a presentation, remove unnecessary sections, or sort pages in a specific order, our tool makes it simple and intuitive.</p>
          <p><strong>Key features:</strong></p>
          <ul>
            <li>Drag and drop interface for easy page reordering</li>
            <li>Sort pages numerically, alphabetically, or by date</li>
            <li>Delete unwanted pages with one click</li>
            <li>Rotate pages to correct orientation</li>
            <li>Extract specific page ranges into new documents</li>
            <li>Visual thumbnail preview of all pages</li>
            <li>Secure processing with automatic file deletion</li>
          </ul>
          <p>Perfect for organizing reports, creating presentations, compiling portfolios, or preparing documents for printing.</p>
        `,
        faq: [
          {
            question: "Can I organize multiple PDFs at once?",
            answer: "Yes! You can upload multiple PDF files and organize their pages together as if they were a single document. Our tool merges them temporarily for organization.",
          },
          {
            question: "How do I reorder pages?",
            answer: "Simply drag and drop page thumbnails to rearrange them. You can also use our sorting options to automatically organize pages by number, alphabetical order, or custom criteria.",
          },
          {
            question: "Can I delete pages from my PDF?",
            answer: "Absolutely. Select the pages you want to remove and delete them with one click. The remaining pages will be renumbered automatically.",
          },
          {
            question: "Is there a limit to the number of pages I can organize?",
            answer: "Our free tier supports PDFs with up to 500 pages. For larger documents, consider splitting them first or upgrading to our premium plan.",
          },
        ],
      }}
    >
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Upload PDF to Organize</h3>
          <FileUpload
            accept="application/pdf"
            multiple={true}
            maxSize={100 * 1024 * 1024}
          />
        </div>

        {/* Organization Tools */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <ListOrdered className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold">Page Reordering</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Drag and drop pages to rearrange them in any order. Visual thumbnails make it easy to see your document structure.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm">Page 1: Cover</span>
                <Button variant="ghost" size="sm">Move</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm">Page 2: Table of Contents</span>
                <Button variant="ghost" size="sm">Move</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm">Page 3: Introduction</span>
                <Button variant="ghost" size="sm">Move</Button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <SortAsc className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold">Sorting Options</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Automatically organize pages using various sorting methods.
            </p>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2">
                <SortAsc className="h-4 w-4" />
                Sort A-Z (by filename)
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <SortDesc className="h-4 w-4" />
                Sort Z-A (reverse)
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Filter className="h-4 w-4" />
                Sort by page number
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Grid className="h-4 w-4" />
                Sort by date modified
              </Button>
            </div>
          </div>
        </div>

        {/* Page Preview */}
        <div className="mt-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Page Preview</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Grid className="h-4 w-4" />
                Grid
              </Button>
              <Button variant="outline" size="sm">
                <Columns className="h-4 w-4" />
                List
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((page) => (
              <div
                key={page}
                className="relative aspect-[3/4] rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
              >
                <div className="text-gray-500 dark:text-gray-400 text-sm">Page {page}</div>
                <div className="absolute top-2 right-2">
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="flex-1 gap-2">
              <ListOrdered className="h-4 w-4" />
              Apply Organization
            </Button>
            <Button variant="outline" size="lg" className="flex-1">
              Reset to Original
            </Button>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}