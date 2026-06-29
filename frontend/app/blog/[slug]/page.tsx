import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Clock, User } from "lucide-react";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";
import { BlogPostBody } from "@/components/blog/blog-post-body";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pdforca.com";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post not found | PDFOrca Blog" };

  const url = `${SITE_URL}/blog/${slug}`;
  const ogImage = post.cover
    ? (post.cover.startsWith("http") ? post.cover : `${SITE_URL}${post.cover}`)
    : `${SITE_URL}/icon-512.png`;

  return {
    title: `${post.title} | PDFOrca Blog`,
    description: post.description,
    keywords: post.keywords?.join(", "),
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
    alternates: { canonical: url },
  };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Friendly display names for the tools a post can link back to.
// Kept in sync with the routes in app/sitemap.ts → TOOL_ROUTES.
const TOOL_NAMES: Record<string, string> = {
  "merge-pdf": "Merge PDF",
  "split-pdf": "Split PDF",
  "compress-pdf": "Compress PDF",
  "pdf-to-word": "PDF to Word",
  "word-to-pdf": "Word to PDF",
  "pdf-to-jpg": "PDF to JPG",
  "jpg-to-pdf": "JPG to PDF",
  "pdf-to-excel": "PDF to Excel",
  "excel-to-pdf": "Excel to PDF",
  "pdf-to-powerpoint": "PDF to PowerPoint",
  "powerpoint-to-pdf": "PowerPoint to PDF",
  "protect-pdf": "Protect PDF",
  "unlock-pdf": "Unlock PDF",
  "organize-pdf": "Organize PDF",
  "extract-pages": "Extract Pages",
  "rotate-pdf": "Rotate PDF",
  "add-watermark": "Add Watermark",
  "page-numbering": "Page Numbering",
  "sign-pdf": "Sign PDF",
  "ocr-pdf": "OCR PDF",
  "ai-tools": "AI Tools",
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${slug}`;
  const relatedToolName = post.relatedTool ? TOOL_NAMES[post.relatedTool] : undefined;

  return (
    <>
      <ArticleJsonLd
        headline={post.title}
        description={post.description}
        url={url}
        datePublished={post.date}
        author={post.author}
        image={post.cover}
        keywords={post.keywords}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Blog", url: `${SITE_URL}/blog` },
          { name: post.title, url },
        ]}
      />

      <article className="min-h-screen bg-white dark:bg-gray-950">
        {/* Header */}
        <header className="border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white dark:border-gray-800 dark:from-gray-900 dark:to-gray-950">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-400"
            >
              <ArrowLeft className="h-4 w-4" />
              All posts
            </Link>

            <div className="mt-6 flex items-center gap-2">
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {post.category}
              </span>
            </div>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              {post.title}
            </h1>

            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              {post.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{post.readingMinutes} min read</span>
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          {post.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.cover}
              alt=""
              className="mb-10 aspect-[16/9] w-full rounded-2xl object-cover shadow-md"
            />
          )}

          <BlogPostBody body={post.body} />

          {/* Related tool CTA */}
          {post.relatedTool && relatedToolName && (
            <aside className="mt-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white shadow-lg">
              <p className="text-sm font-medium uppercase tracking-wide text-blue-100">
                Try the tool from this post
              </p>
              <h3 className="mt-2 text-2xl font-bold">{relatedToolName}</h3>
              <p className="mt-2 text-blue-100">
                Free, no signup, files deleted after processing. Open it in a new tab and follow along.
              </p>
              <Link
                href={`/${post.relatedTool}`}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-gray-100"
              >
                Open {relatedToolName}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </aside>
          )}

          {/* Back to blog */}
          <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to all posts
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
