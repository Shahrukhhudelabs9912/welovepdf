import { Metadata } from "next";
import { FileText, AlertCircle, CheckCircle, XCircle, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service - WeLovePDF",
  description: "Terms and conditions for using WeLovePDF's PDF tools service.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Please read these terms carefully before using our service.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
            <AlertCircle className="h-4 w-4" />
            <span>Effective: May 1, 2026</span>
          </div>
        </div>

        <div className="mb-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
          <h2 className="text-2xl font-bold">Quick Summary</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-1 h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="font-semibold">You Can</h3>
                <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Use our tools for personal & commercial purposes</li>
                  <li>• Process up to 100MB files for free</li>
                  <li>• Expect automatic file deletion</li>
                  <li>• Get basic customer support</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <XCircle className="mt-1 h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="font-semibold">You Cannot</h3>
                <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Upload illegal or copyrighted content</li>
                  <li>• Abuse our service with automated scripts</li>
                  <li>• Reverse engineer our platform</li>
                  <li>• Resell our service without permission</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          <section>
            <div className="flex items-center gap-3">
              <Scale className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              By accessing and using WeLovePDF ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">2. Description of Service</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              WeLovePDF provides online PDF processing tools including but not limited to: merging, splitting, compressing, converting, editing, and protecting PDF documents. The Service is provided "as is" and we reserve the right to modify or discontinue the Service at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">3. User Responsibilities</h2>
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <h3 className="font-semibold">3.1. Acceptable Use</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  You agree to use the Service only for lawful purposes and in accordance with these Terms. You are responsible for all content you upload and process through our Service.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <h3 className="font-semibold">3.2. Prohibited Activities</h3>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-gray-600 dark:text-gray-400">
                  <li>Uploading viruses, malware, or harmful code</li>
                  <li>Attempting to gain unauthorized access to our systems</li>
                  <li>Using the Service to process illegal content</li>
                  <li>Violating intellectual property rights</li>
                  <li>Automated scraping or data extraction</li>
                </ul>
              </div>

              <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <h3 className="font-semibold">3.3. File Limitations</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Free users: Maximum 100MB per file, 10 files per session.<br />
                  Premium users: Maximum 2GB per file, 50 files per session.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold">4. Privacy & Data Security</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Your privacy is important to us. Please review our <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</a> for details on how we handle your data. Key points:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600 dark:text-gray-400">
              <li>Files are automatically deleted within 1 hour</li>
              <li>We use end-to-end encryption for file transfers</li>
              <li>No long-term storage of your files</li>
              <li>We don't share your data with third parties</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold">5. Intellectual Property</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              The Service and its original content, features, and functionality are owned by WeLovePDF and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              You retain all rights to the files you upload. By uploading files, you grant us a temporary license to process them as necessary to provide the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">6. Limitation of Liability</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              To the maximum extent permitted by law, WeLovePDF shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
            <div className="mt-6 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4">
              <p className="text-yellow-800 dark:text-yellow-300">
                <strong>Important:</strong> While we take every precaution to protect your files, you should always keep backups of important documents. We are not responsible for any data loss.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold">7. Termination</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">8. Changes to Terms</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "effective date" at the top.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">9. Governing Law</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              These Terms shall be governed and construed in accordance with the laws of Delaware, United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">10. Contact Information</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <p className="font-medium">legal@welovepdf.com</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                WeLovePDF Inc.<br />
                123 Privacy Street, Suite 100<br />
                Wilmington, DE 19801<br />
                United States
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 rounded-2xl bg-gray-50 dark:bg-gray-900 p-8 text-center">
          <h2 className="text-2xl font-bold">Need Help?</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            If you have questions about these terms or need clarification on any point, please don't hesitate to contact us.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              Contact Support
            </a>
            <a
              href="/privacy"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              View Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}