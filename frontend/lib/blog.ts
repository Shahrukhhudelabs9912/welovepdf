import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

/**
 * Markdown-based blog system.
 *
 * Posts live in `<repo-root>/content/blog/<slug>.md`. Each file has
 * YAML frontmatter (title, description, date, category, etc.) followed
 * by the post body in standard Markdown.
 *
 * To publish a new post, drop a new `.md` file into `content/blog/`.
 * The /blog listing and sitemap pick it up automatically — no database,
 * no CMS, no rebuild script required (Next.js statically renders all
 * posts at build time).
 */

const BLOG_DIR = path.join(process.cwd(), "..", "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;          // ISO date — e.g. "2026-06-20"
  category: string;      // "Tutorial" | "Tips" | "Comparison" | "Use Case"
  author: string;
  cover?: string;        // optional hero image path, e.g. "/blog/merge-aadhaar-cover.png"
  relatedTool?: string;  // slug of the related tool — e.g. "merge-pdf"
  keywords?: string[];   // SEO keywords for the post
  readingMinutes: number;
};

export type Post = PostMeta & {
  body: string;          // raw markdown — rendered by <BlogPostBody />
};

/**
 * List every post's metadata, sorted newest first. Used by the
 * /blog index page and the sitemap.
 */
export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));

  const posts = files
    .map((file): PostMeta | null => {
      const slug = file.replace(/\.md$/, "");
      try {
        const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
        const { data, content } = matter(raw);
        const stats = readingTime(content);
        return {
          slug,
          title: String(data.title ?? slug),
          description: String(data.description ?? ""),
          date: String(data.date ?? "1970-01-01"),
          category: String(data.category ?? "General"),
          author: String(data.author ?? "WeLovePDF Team"),
          cover: data.cover ? String(data.cover) : undefined,
          relatedTool: data.relatedTool ? String(data.relatedTool) : undefined,
          keywords: Array.isArray(data.keywords)
            ? data.keywords.map(String)
            : undefined,
          readingMinutes: Math.max(1, Math.round(stats.minutes)),
        };
      } catch (err) {
        // A broken/half-written file shouldn't take the whole index
        // down — log and skip it.
        console.warn(`[blog] failed to parse ${file}:`, err);
        return null;
      }
    })
    .filter((p): p is PostMeta => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return posts;
}

/**
 * Load a single post by slug, including the rendered Markdown body.
 * Returns null if the post doesn't exist — used by /blog/[slug] to
 * trigger Next.js's notFound().
 */
export function getPostBySlug(slug: string): Post | null {
  // Sanitize: reject anything that could escape the blog directory.
  // We only allow simple kebab-case slugs.
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) return null;

  const file = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;

  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const stats = readingTime(content);

  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: String(data.date ?? "1970-01-01"),
    category: String(data.category ?? "General"),
    author: String(data.author ?? "WeLovePDF Team"),
    cover: data.cover ? String(data.cover) : undefined,
    relatedTool: data.relatedTool ? String(data.relatedTool) : undefined,
    keywords: Array.isArray(data.keywords)
      ? data.keywords.map(String)
      : undefined,
    readingMinutes: Math.max(1, Math.round(stats.minutes)),
    body: content,
  };
}

/**
 * All slugs — for Next.js `generateStaticParams()`.
 */
export function getAllPostSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}
