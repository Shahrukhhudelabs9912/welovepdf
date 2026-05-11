import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[80vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
        <FileText className="h-12 w-12 text-blue-600 dark:text-blue-400" />
      </div>
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
      <h2 className="mt-4 text-3xl font-semibold text-gray-800 dark:text-gray-200">
        Page Not Found
      </h2>
      <p className="mt-4 max-w-md text-lg text-gray-600 dark:text-gray-400">
        The page you are looking for doesn't exist or has been moved. 
        Try using our search or go back to the homepage.
      </p>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-11 rounded-md px-8"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
        <Link
          href="/merge-pdf"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground gap-2 h-11 rounded-md px-8"
        >
          <FileText className="h-4 w-4" />
          Try Merge PDF Tool
        </Link>
      </div>
      <div className="mt-12 w-full max-w-md">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Popular PDF Tools
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Merge PDF", href: "/merge-pdf" },
              { name: "Split PDF", href: "/split-pdf" },
              { name: "Compress PDF", href: "/compress-pdf" },
              { name: "PDF to Word", href: "/pdf-to-word" },
            ].map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {tool.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}