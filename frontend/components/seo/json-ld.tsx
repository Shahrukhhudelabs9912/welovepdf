import Script from "next/script";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pdforca.com";

type JsonLdProps = { id: string; data: Record<string, unknown> };

function JsonLd({ id, data }: JsonLdProps) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      id="ld-organization"
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "PDFOrca",
        url: SITE_URL,
        logo: `${SITE_URL}/icon-512.png`,
        sameAs: [
          "https://twitter.com/pdforca",
          "https://www.facebook.com/pdforca",
        ],
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <JsonLd
      id="ld-website"
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "PDFOrca",
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

type SoftwareAppProps = {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
};

export function SoftwareApplicationJsonLd({
  name,
  description,
  url,
  applicationCategory = "BusinessApplication",
}: SoftwareAppProps) {
  return (
    <JsonLd
      id={`ld-software-${name.toLowerCase().replace(/\s+/g, "-")}`}
      data={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name,
        description,
        url,
        applicationCategory,
        operatingSystem: "Any (Web-based)",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      }}
    />
  );
}

type FAQItem = { question: string; answer: string };

export function FAQPageJsonLd({ items }: { items: FAQItem[] }) {
  return (
    <JsonLd
      id="ld-faqpage"
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }}
    />
  );
}

type HowToStep = { name: string; text: string };

export function HowToJsonLd({
  name,
  description,
  steps,
}: {
  name: string;
  description: string;
  steps: HowToStep[];
}) {
  return (
    <JsonLd
      id={`ld-howto-${name.toLowerCase().replace(/\s+/g, "-")}`}
      data={{
        "@context": "https://schema.org",
        "@type": "HowTo",
        name,
        description,
        step: steps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.name,
          text: step.text,
        })),
      }}
    />
  );
}

type BreadcrumbItem = { name: string; url: string };

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return (
    <JsonLd
      id="ld-breadcrumb"
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

type ArticleProps = {
  headline: string;
  description: string;
  url: string;
  datePublished: string;   // ISO date — e.g. "2026-06-20"
  dateModified?: string;
  author: string;
  image?: string;          // absolute URL of cover image (falls back to icon)
  keywords?: string[];
};

/**
 * Schema.org Article markup. Used by individual blog posts at
 * /blog/[slug]. Without this, Google may still index the post but
 * won't show it as a rich result with author/date in search.
 */
export function ArticleJsonLd({
  headline,
  description,
  url,
  datePublished,
  dateModified,
  author,
  image,
  keywords,
}: ArticleProps) {
  return (
    <JsonLd
      id="ld-article"
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline,
        description,
        url,
        datePublished,
        dateModified: dateModified ?? datePublished,
        author: {
          "@type": "Person",
          name: author,
        },
        publisher: {
          "@type": "Organization",
          name: "PDFOrca",
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/icon-512.png`,
          },
        },
        image: image
          ? [image.startsWith("http") ? image : `${SITE_URL}${image}`]
          : [`${SITE_URL}/icon-512.png`],
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
        ...(keywords && keywords.length > 0 ? { keywords: keywords.join(", ") } : {}),
      }}
    />
  );
}
