import Link from "next/link";
import { FileText, Shield, Zap, Globe, Heart, Share2 } from "lucide-react";

const footerLinks = {
  Tools: [
    { name: "Merge PDF", href: "/merge-pdf" },
    { name: "Split PDF", href: "/split-pdf" },
    { name: "Compress PDF", href: "/compress-pdf" },
    { name: "PDF to Word", href: "/pdf-to-word" },
    { name: "Word to PDF", href: "/word-to-pdf" },
    { name: "PDF to JPG", href: "/pdf-to-jpg" },
  ],
  Features: [
    { name: "AI PDF Summarization", href: "/ai-tools" },
    { name: "Privacy & Security", href: "/privacy" },
    { name: "Fast Processing", href: "/features#speed" },
    { name: "Multi-language", href: "/features#languages" },
    { name: "Browser Processing", href: "/features#browser" },
  ],
  Company: [
    { name: "About Us", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
    { name: "Careers", href: "/careers" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "GDPR", href: "/gdpr" },
    { name: "DMCA", href: "/dmca" },
  ],
};

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">WeLovePDF</h2>
                <p className="text-sm text-muted-foreground">
                  Fast, Secure & AI-Powered PDF Tools
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm">
              The most comprehensive PDF toolkit online. Process your documents with military-grade
              security, AI-powered features, and blazing fast performance.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                <Shield className="h-3 w-3" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                <Zap className="h-3 w-3" />
                <span>Fast Processing</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                <Globe className="h-3 w-3" />
                <span>Multi-language</span>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold">{category}</h3>
              <ul className="mt-4 space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center text-sm text-muted-foreground md:text-left">
              <p>
                © {new Date().getFullYear()} WeLovePDF. All rights reserved. Made with ❤️ for PDF
                lovers worldwide.
              </p>
              <p className="mt-1">
                Files are automatically deleted after processing. We never store your documents.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Heart className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Share2 className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>
              WeLovePDF supports: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG, TIFF, and more.
              Maximum file size: 100MB per file.
            </p>
            <p className="mt-1">
              This service uses secure HTTPS encryption. All processing happens in secure
              environments.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}