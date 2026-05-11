"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Brain, Globe, Lock, Cpu, Cloud, Users } from "lucide-react";

const features = [
  {
    name: "Military-Grade Security",
    description:
      "All files are automatically deleted after processing. We use end-to-end encryption and never store your documents.",
    icon: Shield,
    color: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
  },
  {
    name: "Blazing Fast Processing",
    description:
      "Leverage parallel processing and WebAssembly for ultra-fast PDF operations. Process large files in seconds.",
    icon: Zap,
    color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
  },
  {
    name: "AI-Powered Features",
    description:
      "Use AI to summarize PDFs, extract key points, generate titles, and more. Powered by advanced language models.",
    icon: Brain,
    color: "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30",
  },
  {
    name: "Multi-Language Support",
    description:
      "Full support for English and Hindi, with more languages coming soon. Optimized for regional search keywords.",
    icon: Globe,
    color: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30",
  },
  {
    name: "Browser Processing",
    description:
      "Process files directly in your browser for maximum privacy. No server upload required for basic operations.",
    icon: Lock,
    color: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
  },
  {
    name: "Parallel Processing",
    description:
      "Use Web Workers and serverless functions to process multiple files simultaneously. No queues, no waiting.",
    icon: Cpu,
    color: "text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/30",
  },
  {
    name: "Cloud Integration",
    description:
      "Connect directly to Google Drive, Dropbox, and OneDrive. Seamlessly import and export your documents.",
    icon: Cloud,
    color: "text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30",
  },
  {
    name: "Team Collaboration",
    description:
      "Share processed files with team members, add comments, and collaborate in real-time on document workflows.",
    icon: Users,
    color: "text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/30",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
      <div className="container mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Why Choose WeLovePDF?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            We combine cutting-edge technology with user-centric design to deliver the best PDF
            processing experience.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-4">
                <div className={`inline-flex rounded-lg p-3 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">{feature.name}</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="text-center lg:text-left">
              <div className="text-4xl font-bold">100%</div>
              <div className="mt-2 text-lg">File Privacy Guarantee</div>
              <p className="mt-2 text-blue-100">
                We never store your documents. All files are deleted immediately after processing.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">50M+</div>
              <div className="mt-2 text-lg">PDFs Processed</div>
              <p className="mt-2 text-blue-100">
                Trusted by millions of users worldwide for their PDF needs.
              </p>
            </div>
            <div className="text-center lg:text-right">
              <div className="text-4xl font-bold">{"<2s"}</div>
              <div className="mt-2 text-lg">Average Processing Time</div>
              <p className="mt-2 text-blue-100">
                Lightning-fast processing using parallel computing and optimized algorithms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}