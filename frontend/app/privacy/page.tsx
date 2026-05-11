import { Metadata } from "next";
import { Shield, Lock, Trash2, EyeOff, Server, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - WeLovePDF",
  description: "Learn how WeLovePDF protects your privacy with end-to-end encryption, automatic file deletion, and strict no-storage policy.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Your privacy is our top priority. Here's how we protect your data.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <Lock className="h-4 w-4" />
            <span>Last updated: May 1, 2026</span>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold">End-to-End Encryption</h3>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              All files are encrypted during upload, processing, and download using AES-256 encryption. 
              Your files are never accessible to anyone but you.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Trash2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold">Automatic File Deletion</h3>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Files are automatically deleted from our servers within 1 hour of processing completion. 
              We never store your files long-term.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                <EyeOff className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold">No File Storage</h3>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              We don't store your files on our servers. All processing happens in memory and 
              files are deleted immediately after you download them.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                <Server className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold">Secure Infrastructure</h3>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Our infrastructure is hosted on ISO 27001 certified data centers with 24/7 monitoring, 
              DDoS protection, and regular security audits.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
          <h2 className="text-2xl font-bold">Our Privacy Commitment</h2>
          <div className="mt-6 space-y-6">
            <div className="flex items-start gap-4">
              <Clock className="mt-1 h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-semibold">Temporary Processing Only</h3>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Files are kept only for the duration of processing (typically 1-5 minutes). 
                  After processing completes, files are immediately queued for deletion.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Shield className="mt-1 h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="font-semibold">No Third-Party Sharing</h3>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  We never share your files or personal information with third parties. 
                  All processing happens within our secure environment.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Lock className="mt-1 h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div>
                <h3 className="font-semibold">GDPR & CCPA Compliant</h3>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  We comply with global privacy regulations including GDPR and CCPA. 
                  You have the right to access, correct, or delete your data.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold">Detailed Privacy Policy</h2>
          <div className="mt-6 space-y-6">
            <section>
              <h3 className="text-xl font-semibold">1. Information We Collect</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                We collect minimal information necessary to provide our service:
              </p>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-gray-600 dark:text-gray-400">
                <li>Files you upload for processing (temporarily)</li>
                <li>Basic usage statistics (anonymized)</li>
                <li>Device and browser information for compatibility</li>
                <li>IP address for security and rate limiting</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold">2. How We Use Your Information</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Your information is used solely to:
              </p>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-gray-600 dark:text-gray-400">
                <li>Process your PDF files as requested</li>
                <li>Improve our service quality and performance</li>
                <li>Prevent abuse and ensure security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold">3. Data Retention</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                <strong>Files:</strong> Deleted within 1 hour of processing completion.<br />
                <strong>Metadata:</strong> Deleted after 30 days.<br />
                <strong>Account data:</strong> Retained until account deletion.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold">4. Your Rights</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                You have the right to:
              </p>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-gray-600 dark:text-gray-400">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing</li>
                <li>Data portability</li>
              </ul>
            </section>
          </div>
        </div>

        <div className="mt-12 rounded-2xl bg-gray-50 dark:bg-gray-900 p-8">
          <h2 className="text-2xl font-bold">Contact Us</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            If you have any questions about our privacy practices, please contact our Data Protection Officer at:
          </p>
          <div className="mt-4">
            <p className="font-medium">privacy@welovepdf.com</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
              We typically respond within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}