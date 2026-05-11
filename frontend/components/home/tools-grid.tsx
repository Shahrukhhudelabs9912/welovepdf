"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  Scissors,
  Minimize,
  FileText as FileWord,
  Image as ImageIcon,
  RotateCw,
  Lock,
  Shield,
  Droplets,
  Hash,
  Grid,
  Merge,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const tools = [
  {
    name: "Merge PDF",
    description: "Combine multiple PDF files into a single document",
    icon: Merge,
    href: "/merge-pdf",
    color: "from-blue-500 to-cyan-500",
    popular: true,
  },
  {
    name: "Split PDF",
    description: "Split a PDF into multiple files or extract specific pages",
    icon: Scissors,
    href: "/split-pdf",
    color: "from-green-500 to-emerald-500",
    popular: true,
  },
  {
    name: "Compress PDF",
    description: "Reduce PDF file size while maintaining quality",
    icon: Minimize,
    href: "/compress-pdf",
    color: "from-purple-500 to-pink-500",
    popular: true,
  },
  {
    name: "PDF to Word",
    description: "Convert PDF files to editable Word documents",
    icon: FileWord,
    href: "/pdf-to-word",
    color: "from-orange-500 to-red-500",
  },
  {
    name: "Word to PDF",
    description: "Convert Word documents to PDF format",
    icon: FileText,
    href: "/word-to-pdf",
    color: "from-blue-500 to-indigo-500",
  },
  {
    name: "PDF to JPG",
    description: "Convert PDF pages to high-quality JPG images",
    icon: ImageIcon,
    href: "/pdf-to-jpg",
    color: "from-yellow-500 to-amber-500",
  },
  {
    name: "JPG to PDF",
    description: "Convert JPG images to a single PDF document",
    icon: FileText,
    href: "/jpg-to-pdf",
    color: "from-teal-500 to-green-500",
  },
  {
    name: "Rotate PDF",
    description: "Rotate PDF pages 90°, 180°, or 270°",
    icon: RotateCw,
    href: "/rotate-pdf",
    color: "from-rose-500 to-pink-500",
  },
  {
    name: "Protect PDF",
    description: "Add password protection to PDF files",
    icon: Lock,
    href: "/protect-pdf",
    color: "from-red-500 to-orange-500",
  },
  {
    name: "Unlock PDF",
    description: "Remove password protection from PDF files",
    icon: Shield,
    href: "/unlock-pdf",
    color: "from-green-500 to-teal-500",
  },
  {
    name: "Add Watermark",
    description: "Add text or image watermarks to PDF pages",
    icon: Droplets,
    href: "/add-watermark",
    color: "from-cyan-500 to-blue-500",
  },
  {
    name: "Page Numbering",
    description: "Add page numbers to PDF documents",
    icon: Hash,
    href: "/page-numbering",
    color: "from-violet-500 to-purple-500",
  },
  {
    name: "Organize PDF",
    description: "Reorder, delete, or rotate pages in PDF",
    icon: Grid,
    href: "/organize-pdf",
    color: "from-amber-500 to-yellow-500",
  },
  {
    name: "AI Summarization",
    description: "AI-powered PDF summary and key points extraction",
    icon: Brain,
    href: "/ai-tools",
    color: "from-purple-500 to-indigo-500",
    featured: true,
  },
];

export function ToolsGrid() {
  return (
    <section id="tools" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            All PDF Tools in One Place
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Choose from our comprehensive suite of PDF tools. All tools are free to use with no
            registration required.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link href={tool.href}>
                <div className="group relative h-full cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-primary hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">
                  {tool.popular && (
                    <div className="absolute right-4 top-4 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      Popular
                    </div>
                  )}
                  {tool.featured && (
                    <div className="absolute right-4 top-4 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                      AI Featured
                    </div>
                  )}
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${tool.color}`}
                    >
                      <tool.icon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold">{tool.name}</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {tool.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium text-primary">
                    Use Tool
                    <svg
                      className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}