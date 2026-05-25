"use client";

import { Calendar, User, Tag, ArrowRight, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageMeta } from "@/components/seo-provider";
import { useTranslations } from "next-intl";
import Link from "next/link";

const blogPosts = [
  {
    id: 1,
    title: "How to Merge PDF Files Without Losing Quality",
    excerpt: "Learn the best practices for merging multiple PDF documents while maintaining image quality and formatting.",
    author: "Sarah Johnson",
    date: "2024-03-15",
    readTime: "5 min read",
    category: "Tutorial",
    tags: ["PDF", "Merge", "Quality"],
    image: "/api/placeholder/400/250",
  },
  {
    id: 2,
    title: "Top 10 PDF Security Tips for Businesses",
    excerpt: "Protect your sensitive documents with these essential PDF security measures every business should implement.",
    author: "Michael Chen",
    date: "2024-03-10",
    readTime: "8 min read",
    category: "Security",
    tags: ["Security", "Business", "Protect"],
    image: "/api/placeholder/400/250",
  },
  {
    id: 3,
    title: "The Future of PDF Technology: AI and Beyond",
    excerpt: "Explore how artificial intelligence is revolutionizing PDF processing and what to expect in the coming years.",
    author: "Alexandra Rivera",
    date: "2024-03-05",
    readTime: "6 min read",
    category: "Technology",
    tags: ["AI", "Future", "Technology"],
    image: "/api/placeholder/400/250",
  },
  {
    id: 4,
    title: "How to Compress PDFs for Faster Email Delivery",
    excerpt: "Reduce PDF file sizes significantly without compromising quality for quick email attachments and sharing.",
    author: "David Wilson",
    date: "2024-02-28",
    readTime: "4 min read",
    category: "Tips",
    tags: ["Compress", "Email", "Optimization"],
    image: "/api/placeholder/400/250",
  },
  {
    id: 5,
    title: "Converting PDF to Editable Formats: Word vs Google Docs",
    excerpt: "Compare different methods for converting PDFs to editable documents and choose the best approach for your needs.",
    author: "Emma Thompson",
    date: "2024-02-20",
    readTime: "7 min read",
    category: "Comparison",
    tags: ["Convert", "Word", "Google Docs"],
    image: "/api/placeholder/400/250",
  },
  {
    id: 6,
    title: "Accessibility in PDF Documents: Making Content Available to All",
    excerpt: "Learn how to create accessible PDFs that work with screen readers and meet WCAG guidelines.",
    author: "James Miller",
    date: "2024-02-15",
    readTime: "9 min read",
    category: "Accessibility",
    tags: ["Accessibility", "WCAG", "Inclusive"],
    image: "/api/placeholder/400/250",
  },
];

const categories = [
  { name: "All", count: 12 },
  { name: "Tutorial", count: 4 },
  { name: "Security", count: 3 },
  { name: "Technology", count: 2 },
  { name: "Tips", count: 2 },
  { name: "Comparison", count: 1 },
];

const popularTags = [
  "PDF", "Merge", "Compress", "Convert", "Security", "AI", "Quality", "Business", "Accessibility", "Optimization"
];

export default function BlogPage() {
  const t = useTranslations("blog");

  return (
    <>
      <PageMeta
        title="PDF Blog & Tutorials | WeLovePDF"
        description="Learn about PDF processing, security tips, tutorials, and the latest trends in document technology."
        keywords="PDF blog, PDF tutorials, document tips, PDF security, PDF technology"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        {/* Hero Section */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                {t("hero_heading_part1")} <span className="text-primary">{t("hero_heading_part2")}</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                {t("hero_subtitle")}
              </p>
              
              {/* Search Bar */}
              <div className="mx-auto mt-10 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="search"
                    placeholder={t("search_placeholder")}
                    className="pl-10 pr-4 py-6 text-base"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-8">
                  {/* Categories */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        {t("categories_title")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <div
                            key={category.name}
                            className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                          >
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {category.name}
                            </span>
                            <Badge variant="secondary">{category.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Popular Tags */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("popular_tags_title")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {popularTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Newsletter */}
                  <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                    <CardHeader>
                      <CardTitle>{t("newsletter_title")}</CardTitle>
                      <CardDescription>
                        {t("newsletter_description")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Input placeholder={t("newsletter_placeholder")} />
                        <Button className="w-full">{t("newsletter_subscribe")}</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Blog Posts */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  {blogPosts.map((post) => (
                    <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                      <div className="h-48 bg-gradient-to-r from-primary/20 to-primary/10" />
                      <CardHeader>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{post.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{post.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                        <CardTitle className="mt-4 text-xl">{post.title}</CardTitle>
                        <CardDescription>{post.excerpt}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          <Badge>{post.category}</Badge>
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Link
                          href={`/blog/${post.id}`}
                          className="flex items-center gap-2 text-primary hover:underline"
                        >
                          {t("read_article")}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-12 flex justify-center">
                  <nav className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                      {"<"}
                    </Button>
                    <Button variant="default" size="icon">
                      1
                    </Button>
                    <Button variant="outline" size="icon">
                      2
                    </Button>
                    <Button variant="outline" size="icon">
                      3
                    </Button>
                    <Button variant="outline" size="icon">
                      {">"}
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("cta_heading")}
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              {t("cta_description")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" className="gap-2">
                {t("cta_submit_article")}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                {t("cta_contact_editors")}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}