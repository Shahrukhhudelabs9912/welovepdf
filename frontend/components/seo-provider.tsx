import { ReactNode } from "react";
import Head from "next/head";

interface SEOProviderProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  children: ReactNode;
}

export function SEOProvider({
  title = "WeLovePDF - Fast, Secure & AI-Powered PDF Tools",
  description = "Merge, split, compress, convert PDF files online for free. Fast, secure, and AI-powered PDF tools with privacy-first approach.",
  keywords = "PDF tools, merge PDF, split PDF, compress PDF, PDF to Word, Word to PDF, PDF converter, AI PDF summarization",
  image = "https://welovepdf.com/og-image.png",
  url = "https://welovepdf.com",
  type = "website",
  children,
}: SEOProviderProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "WeLovePDF",
    "url": "https://welovepdf.com",
    "description": "Online PDF tools for merging, splitting, compressing, converting, and editing PDF documents.",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "12500"
    },
    "featureList": [
      "Merge PDF files",
      "Split PDF documents", 
      "Compress PDF size",
      "Convert PDF to Word, Excel, JPG",
      "AI-powered PDF summarization",
      "Password protection",
      "Watermark addition"
    ]
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is WeLovePDF free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! All basic PDF tools are completely free. We offer premium features for advanced needs."
        }
      },
      {
        "@type": "Question",
        "name": "Are my files secure?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. We use end-to-end encryption and automatically delete files after 1 hour."
        }
      },
      {
        "@type": "Question",
        "name": "What file sizes are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We support files up to 100MB for free users and up to 2GB for premium users."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to install any software?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No installation required. WeLovePDF works entirely in your browser."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use it on mobile?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Our website is fully responsive and works perfectly on all mobile devices."
        }
      }
    ]
  };

  return (
    <>
      <Head>
        {/* Primary Meta Tags */}
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="author" content="WeLovePDF" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content={type} />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:site_name" content="WeLovePDF" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={url} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={image} />
        
        {/* Additional SEO Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="canonical" href={url} />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
        />
        
        {/* Additional SEO for PDF tools */}
        <meta name="application-name" content="WeLovePDF" />
        <meta name="apple-mobile-web-app-title" content="WeLovePDF" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        
        {/* SEO for PDF tools specifically */}
        <meta name="pdf:tool" content="merge,split,compress,convert,edit" />
        <meta name="pdf:format" content="PDF, DOCX, JPG, PNG, TXT" />
        <meta name="pdf:max_size" content="100MB" />
        
        {/* Performance hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.welovepdf.com" />
      </Head>
      {children}
    </>
  );
}

/**
 * Component for adding meta tags to specific pages
 */
export function PageMeta({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
}: {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
}) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <link rel="canonical" href={url} />
    </Head>
  );
}

/**
 * Breadcrumb structured data component
 */
export function BreadcrumbSchema({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
    />
  );
}