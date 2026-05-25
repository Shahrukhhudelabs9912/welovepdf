import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/routing';
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AnalyticsInitializer } from "@/components/analytics-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import { FileProvider } from "@/lib/file-context";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "WeLovePDF - Fast, Secure & AI-Powered PDF Tools",
  description: "Merge, split, compress, convert PDF files online for free. Fast, secure, and AI-powered PDF tools with privacy-first approach.",
  keywords: "PDF tools, merge PDF, split PDF, compress PDF, PDF to Word, Word to PDF, PDF converter, AI PDF summarization",
  authors: [{ name: "WeLovePDF" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://welovepdf.com",
    title: "WeLovePDF - Fast, Secure & AI-Powered PDF Tools",
    description: "Merge, split, compress, convert PDF files online for free. Fast, secure, and AI-powered PDF tools.",
    siteName: "WeLovePDF",
  },
  twitter: {
    card: "summary_large_image",
    title: "WeLovePDF - Fast, Secure & AI-Powered PDF Tools",
    description: "Merge, split, compress, convert PDF files online for free.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Load messages for the current locale (detected via cookie by middleware)
  const messages = await getMessages();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen flex flex-col ${inter.className}`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <AnalyticsInitializer />
              <Header />
              <FileProvider>
                <main className="flex-1">{children}</main>
              </FileProvider>
              <Footer />
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
