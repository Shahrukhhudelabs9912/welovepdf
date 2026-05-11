import type { Metadata } from "next";
import { AIToolsSection } from "@/components/ai/ai-tools-section";

export const metadata: Metadata = {
  title: "AI PDF Tools - Summarize, Extract & Analyze PDFs | WeLovePDF",
  description: "AI-powered PDF tools: Summarize PDFs, extract key points, generate titles, and analyze documents with advanced AI. Process PDFs intelligently.",
  keywords: "AI PDF summarizer, PDF summary, extract key points from PDF, AI PDF analysis, PDF to summary, intelligent PDF tools",
  openGraph: {
    title: "AI PDF Tools - Summarize, Extract & Analyze PDFs | WeLovePDF",
    description: "AI-powered PDF tools: Summarize PDFs, extract key points, generate titles, and analyze documents.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI PDF Tools - Summarize, Extract & Analyze PDFs | WeLovePDF",
    description: "AI-powered PDF tools: Summarize PDFs, extract key points, generate titles, and analyze documents.",
  },
};

export default function AIToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            AI-Powered{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PDF Intelligence
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl text-gray-600 dark:text-gray-300">
            Transform your PDF documents with advanced AI. Summarize, analyze, and extract insights
            from your PDFs in seconds.
          </p>
        </div>

        <AIToolsSection />

        <div className="mt-20 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold">How Our AI Works</h2>
              <p className="mt-4 text-blue-100">
                Our AI models are trained on millions of documents to understand context, extract
                key information, and generate human-like summaries. We use state-of-the-art language
                models optimized for document analysis.
              </p>
              <div className="mt-6 space-y-4">
                {[
                  "Extracts text with 99.9% accuracy",
                  "Understands context and relationships",
                  "Supports multiple languages",
                  "Maintains document structure",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold">Use Cases</h3>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {[
                  "Research Papers",
                  "Legal Documents",
                  "Business Reports",
                  "Academic Texts",
                  "Technical Manuals",
                  "Books & Articles",
                ].map((useCase, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-white/10 p-4 text-center hover:bg-white/20 transition-colors"
                  >
                    {useCase}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}