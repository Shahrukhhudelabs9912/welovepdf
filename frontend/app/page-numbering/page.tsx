import type { Metadata } from "next";
import { ToolLayout } from "@/components/tools/tool-layout";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { Hash, Type, Layout, Settings, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Add Page Numbers to PDF Online Free | WeLovePDF",
  description: "Add professional page numbers to your PDF documents online for free. Customize font, size, position, and format of page numbers.",
  keywords: "add page numbers to pdf, pdf page numbers, number pages in pdf, pdf pagination, page numbering, pdf footer",
  openGraph: {
    title: "Add Page Numbers to PDF Online Free | WeLovePDF",
    description: "Add professional page numbers to your PDF documents online for free.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Add Page Numbers to PDF Online Free | WeLovePDF",
    description: "Add professional page numbers to your PDF documents online for free.",
  },
  alternates: {
    canonical: "https://welovepdf.com/page-numbering",
    languages: {
      en: "https://welovepdf.com/page-numbering",
      hi: "https://welovepdf.com/hi/page-numbering",
    },
  },
};

export default function PageNumberingPage() {
  return (
    <ToolLayout
      title="Add Page Numbers to PDF"
      description="Add professional page numbers to your PDF documents with full customization options."
      toolName="Page Numbering"
      toolDescription="Easily add page numbers to your PDF files with complete control over appearance and placement. Choose from various formats, fonts, sizes, and positions to create perfectly numbered documents for reports, theses, manuals, or presentations."
      seoContent={{
        h1: "Add Page Numbers to PDF Online for Free",
        h2: "How to Add Page Numbers to PDF",
        content: `
          <p>Our free PDF page numbering tool allows you to add professional page numbers to your documents quickly and easily. Whether you need simple numeric pagination, Roman numerals, or custom formats like "Page X of Y", our tool handles it all.</p>
          <p><strong>Key features:</strong></p>
          <ul>
            <li>Multiple number formats: 1, 2, 3... or i, ii, iii... or A, B, C...</li>
            <li>Custom starting page number</li>
            <li>Control which pages get numbered (all, odd, even, specific ranges)</li>
            <li>Choose position: top/bottom, left/center/right</li>
            <li>Customize font, size, color, and style</li>
            <li>Add prefixes/suffixes (e.g., "Page 1 of 10")</li>
            <li>Preview changes before applying</li>
            <li>Secure processing with automatic file deletion</li>
          </ul>
          <p>Perfect for academic papers, business reports, legal documents, manuals, and any document requiring professional pagination.</p>
        `,
        faq: [
          {
            question: "Can I skip the first page or title page?",
            answer: "Yes! You can specify which pages should be numbered. Common setups include skipping the cover page, starting numbering from page 2 or 3, or using Roman numerals for front matter.",
          },
          {
            question: "What number formats are available?",
            answer: "We support Arabic numerals (1, 2, 3), Roman numerals (I, II, III, i, ii, iii), alphabetic (A, B, C), and custom formats. You can also add prefixes like 'Page' or suffixes like 'of 50'.",
          },
          {
            question: "Can I add page numbers to multiple PDFs at once?",
            answer: "Yes, you can upload multiple PDF files and apply the same page numbering settings to all of them simultaneously, saving you time on batch processing.",
          },
          {
            question: "Will adding page numbers affect my document's layout?",
            answer: "No, page numbers are added as a separate layer and don't interfere with your existing content. The tool automatically adjusts spacing to ensure your content remains intact.",
          },
        ],
      }}
    >
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Upload PDF for Page Numbering</h3>
          <FileUpload
            accept="application/pdf"
            multiple={true}
            maxSize={100 * 1024 * 1024}
          />
        </div>

        {/* Numbering Options */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Format & Style */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Type className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold">Format & Style</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Number Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start gap-2">
                    <Hash className="h-4 w-4" />
                    1, 2, 3
                  </Button>
                  <Button variant="outline" className="justify-start gap-2">
                    <Type className="h-4 w-4" />
                    I, II, III
                  </Button>
                  <Button variant="outline" className="justify-start gap-2">
                    <Type className="h-4 w-4" />
                    i, ii, iii
                  </Button>
                  <Button variant="outline" className="justify-start gap-2">
                    <Type className="h-4 w-4" />
                    A, B, C
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Starting Number</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    defaultValue="1"
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">(Page 1 will be this number)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Format Template</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Prefix"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                    defaultValue="Page"
                  />
                  <span className="text-gray-500">#</span>
                  <input
                    type="text"
                    placeholder="Suffix"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                    defaultValue="of {total}"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Example: "Page 1 of 10" where # is page number and {`{total}`} is total pages
                </p>
              </div>
            </div>
          </div>

          {/* Position & Layout */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Layout className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold">Position & Layout</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Position</label>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start gap-2">
                    Top
                  </Button>
                  <Button variant="outline" className="justify-start gap-2">
                    Bottom
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Alignment</label>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 gap-2">
                    <AlignLeft className="h-4 w-4" />
                    Left
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <AlignCenter className="h-4 w-4" />
                    Center
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <AlignRight className="h-4 w-4" />
                    Right
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Page Range</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="all-pages" defaultChecked className="rounded" />
                    <label htmlFor="all-pages" className="text-sm">All pages</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="odd-pages" className="rounded" />
                    <label htmlFor="odd-pages" className="text-sm">Odd pages only</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="even-pages" className="rounded" />
                    <label htmlFor="even-pages" className="text-sm">Even pages only</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="custom-range" className="rounded" />
                    <label htmlFor="custom-range" className="text-sm">Custom range:</label>
                    <input
                      type="text"
                      placeholder="e.g., 2-10"
                      className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Live Preview</h3>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Advanced Settings
            </Button>
          </div>
          
          <div className="relative aspect-[3/4] max-w-md mx-auto border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 p-8">
            {/* Simulated PDF page */}
            <div className="h-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded flex flex-col">
              <div className="p-6 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-4 w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-4 w-5/6"></div>
              </div>
              
              {/* Page number preview */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex justify-center">
                  <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded text-center">
                    <span className="font-medium">Page 1 of 12</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm">
              Preview - Your actual PDF will look similar
            </div>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="flex-1 gap-2">
              <Hash className="h-4 w-4" />
              Add Page Numbers
            </Button>
            <Button variant="outline" size="lg" className="flex-1">
              Reset Settings
            </Button>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}