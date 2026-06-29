/**
 * Careers page is intentionally disabled while we're a small operation.
 * The route still resolves (no 404), but renders an honest "not hiring"
 * placeholder so we don't show dummy job openings that would mislead
 * applicants.
 *
 * When real openings exist, replace this with a server component that
 * reads from a CMS or markdown file, and re-enable the nav link in
 * components/footer.tsx.
 */
import { Briefcase, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers - PDFOrca",
  description:
    "We're a small team focused on building the best free PDF tools. We're not actively hiring right now — but we'd love to hear from you.",
  robots: { index: false, follow: false },
};

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Careers
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-gray-600 dark:text-gray-300">
            We&apos;re a small, focused team and we&apos;re not actively hiring right now.
            That said, we&apos;re always glad to hear from people who care about privacy-first
            tools, Indic-language software, and pragmatic engineering.
          </p>

          <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-lg font-semibold">If we open roles, they will be:</h2>
            <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• Remote-first (India-friendly hours)</li>
              <li>• Honest about scope and compensation</li>
              <li>• Posted here first, with clear application steps</li>
            </ul>
          </div>

          <p className="mt-10 text-sm text-gray-600 dark:text-gray-400">
            Want to introduce yourself anyway? Send a short note explaining what you&apos;d
            love to work on — we read every message.
          </p>

          <div className="mt-6">
            <Link href="/contact">
              <Button className="gap-2">
                <Mail className="h-4 w-4" />
                Get in touch
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
