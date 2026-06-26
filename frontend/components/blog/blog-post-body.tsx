"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import Link from "next/link";

/**
 * Renders the raw markdown body of a blog post into themed HTML.
 *
 * - GitHub-flavoured markdown (tables, strikethrough, task lists)
 * - Heading slugs + clickable anchor links (for shareable section URLs)
 * - Internal links use Next.js <Link> so navigation stays SPA-fast
 * - All styling driven by Tailwind `prose` classes on the wrapper
 *   (configured in tailwind.config.ts → typography plugin).
 */
export function BlogPostBody({ body }: { body: string }) {
  return (
    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-code:before:content-none prose-code:after:content-none prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-medium">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "wrap",
              properties: { className: "no-underline" },
            },
          ],
        ]}
        components={{
          // Use Next <Link> for internal nav so visiting a related-tool
          // CTA inside the post body doesn't trigger a full page reload.
          a: ({ href, children, ...rest }) => {
            if (!href) return <a {...rest}>{children}</a>;
            const isExternal = /^https?:\/\//.test(href);
            if (isExternal) {
              return (
                <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
                  {children}
                </a>
              );
            }
            return (
              <Link href={href} {...rest}>
                {children}
              </Link>
            );
          },
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
