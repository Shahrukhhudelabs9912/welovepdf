import type { Metadata } from "next";
import { ToolLayout } from "@/components/tools/tool-layout";
import { ToolComponent } from "@/components/tools/tool-component";

export const metadata: Metadata = {
  title: "Merge PDF Online Free - Combine Multiple PDF Files | WeLovePDF",
  description: "Merge multiple PDF files into a single document online for free. Combine PDFs quickly and securely with our easy-to-use tool. No registration required.",
  keywords: "merge pdf, combine pdf, merge pdf online, merge pdf free, join pdf, pdf merger, merge multiple pdf",
  openGraph: {
    title: "Merge PDF Online Free - Combine Multiple PDF Files | WeLovePDF",
    description: "Merge multiple PDF files into a single document online for free.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Merge PDF Online Free - Combine Multiple PDF Files | WeLovePDF",
    description: "Merge multiple PDF files into a single document online for free.",
  },
  alternates: {
    canonical: "https://welovepdf.com/merge-pdf",
    languages: {
      en: "https://welovepdf.com/merge-pdf",
      hi: "https://welovepdf.com/hi/merge-pdf",
    },
  },
};

export default function MergePDFPage() {
  return (
    <ToolLayout
      title="Merge PDF"
      description="Combine multiple PDF files into a single document in the order you want."
      toolName="Merge PDF"
      toolDescription="Easily merge multiple PDF files into one organized document. Drag and drop to rearrange pages, choose the order, and download the merged PDF instantly."
      seoContent={{
        h1: "Merge PDF Files Online for Free",
        h2: "How to Merge PDF Files",
        content: `
          <p>Our free PDF merger allows you to combine multiple PDF documents into a single file quickly and easily. Whether you need to merge invoices, reports, chapters, or any other PDF documents, our tool handles it seamlessly.</p>
          <p><strong>Key features:</strong></p>
          <ul>
            <li>Merge unlimited PDF files for free</li>
            <li>Drag and drop interface for easy reordering</li>
            <li>Maintains original quality of all documents</li>
            <li>Secure processing with automatic file deletion</li>
            <li>No registration or watermarks</li>
          </ul>
          <p>Perfect for students combining research papers, professionals merging reports, or anyone needing to organize multiple PDFs into one document.</p>
        `,
        faq: [
          {
            question: "Is PDF merging free?",
            answer: "Yes, our PDF merger is completely free with no hidden charges. You can merge unlimited files without registration."
          },
          {
            question: "Can I reorder pages before merging?",
            answer: "Yes, you can drag and drop files to rearrange them in any order before merging. The merged PDF will follow your specified order."
          },
          {
            question: "Is there a file size limit?",
            answer: "You can merge PDFs up to 100MB each for free. For larger files, consider using our premium plan."
          },
          {
            question: "How many PDFs can I merge at once?",
            answer: "You can merge up to 20 PDF files at once. If you need to merge more, simply process them in batches."
          },
          {
            question: "Is my data secure?",
            answer: "Absolutely. All files are processed securely with end-to-end encryption and are automatically deleted from our servers after 1 hour."
          },
          {
            question: "Can I merge scanned PDFs?",
            answer: "Yes, our merger works with both digital and scanned PDFs. Scanned PDFs will be merged as images within the final document."
          }
        ]
      }}
    >
      <ToolComponent
        toolName="merge-pdf"
        endpoint="http://127.0.0.1:8000/api/merge-pdf"
        title="Merge PDF Files"
        description="Upload multiple PDF files to merge them into a single document."
        accept="application/pdf"
        multiple={true}
        maxSize={100 * 1024 * 1024} // 100MB
        autoClearFiles={true}
      />

      {/* Additional Info */}
      <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl">
        <h3 className="text-lg font-semibold mb-4">How to Merge PDFs</h3>
        <ol className="space-y-3 list-decimal list-inside">
          <li className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Upload PDFs:</span> Click "Select Files" or drag and drop your PDF files
          </li>
          <li className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Arrange Order:</span> Files are merged in the order they appear (upload order)
          </li>
          <li className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Merge:</span> Click "Merge PDFs" to combine all files into one document
          </li>
          <li className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Download:</span> Your merged PDF will download automatically
          </li>
        </ol>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Tip: For best results, ensure all PDFs are in the correct order before merging. You can remove and re-upload files if needed.
        </p>
      </div>
    </ToolLayout>
  );
}