import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Sparkles, BookOpen } from "lucide-react";
import { getAllPosts } from "@/lib/blog";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://welovepdf.com";

export const metadata: Metadata = {
  title: "WeLovePDF Blog — PDF Tutorials, Tips & Use Cases",
  description:
    "Practical tutorials and tips for merging, splitting, compressing, converting, and managing PDF files. Real-world workflows for students, professionals, and businesses.",
  keywords:
    "pdf blog, pdf tutorials, pdf tips, document management, pdf how-to, welovepdf blog",
  openGraph: {
    title: "WeLovePDF Blog — PDF Tutorials, Tips & Use Cases",
    description:
      "Practical tutorials and tips for working with PDFs — built around our free online tools.",
    type: "website",
    url: `${SITE_URL}/blog`,
  },
  twitter: {
    card: "summary_large_image",
    title: "WeLovePDF Blog — PDF Tutorials, Tips & Use Cases",
    description:
      "Practical tutorials and tips for working with PDFs.",
  },
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
};

function formatDate(iso: string) {
  // Stable, locale-agnostic format so SSR and CSR don't disagree.
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BlogPage() {
  const posts = getAllPosts();
  const pageUrl = `${SITE_URL}/blog`;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Blog", url: pageUrl },
        ]}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {/* Hero */}
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                WeLovePDF Blog
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                Practical tutorials, tips, and use cases for working with PDFs.
                Every article links to the free tool that gets the job done.
              </p>
            </div>

            {/* Posts grid */}
            {posts.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <article
                    key={post.slug}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
                  >
                    {post.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.cover}
                        alt=""
                        className="aspect-[16/9] w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        <BookOpen className="h-10 w-10 opacity-80" />
                      </div>
                    )}

                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {post.category}
                        </span>
                      </div>

                      <h2 className="text-xl font-semibold text-gray-900 transition-colors group-hover:text-primary dark:text-white">
                        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
                          {post.title}
                        </Link>
                      </h2>

                      <p className="mt-3 flex-1 text-sm text-gray-600 dark:text-gray-400">
                        {post.description}
                      </p>

                      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <time dateTime={post.date}>{formatDate(post.date)}</time>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{post.readingMinutes} min</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="mt-16 rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
      <Sparkles className="mx-auto h-10 w-10 text-blue-600 dark:text-blue-400" />
      <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
        First posts are on the way
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
        We're publishing the first batch of tutorials. Check back soon — or
        explore the tools while you wait.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        Explore PDF tools <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
