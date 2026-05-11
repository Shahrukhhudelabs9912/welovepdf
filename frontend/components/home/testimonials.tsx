"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Marketing Manager",
    company: "TechCorp India",
    content:
      "WeLovePDF has revolutionized how our team handles documents. The AI summarization feature saves us hours every week. The Hindi support is a game-changer for our regional teams.",
    rating: 5,
    avatar: "PS",
  },
  {
    name: "Raj Patel",
    role: "Freelance Designer",
    company: "Self-Employed",
    content:
      "I use multiple PDF tools daily, and WeLovePDF is by far the fastest and most reliable. The browser processing feature gives me peace of mind about my clients' sensitive documents.",
    rating: 5,
    avatar: "RP",
  },
  {
    name: "Ananya Singh",
    role: "University Professor",
    company: "Delhi University",
    content:
      "As an educator, I need to process hundreds of research papers. The merge and compress tools are incredibly efficient. The privacy-first approach is exactly what academia needs.",
    rating: 5,
    avatar: "AS",
  },
  {
    name: "Michael Chen",
    role: "CTO",
    company: "StartupXYZ",
    content:
      "The parallel processing capabilities are impressive. We process large batches of legal documents in seconds instead of minutes. The API integration is also very developer-friendly.",
    rating: 5,
    avatar: "MC",
  },
  {
    name: "Sofia Rodriguez",
    role: "Legal Assistant",
    company: "Law Partners LLC",
    content:
      "Password protection and watermark features are essential for our legal documents. WeLovePDF handles everything securely and reliably. The auto-delete feature is a major plus.",
    rating: 5,
    avatar: "SR",
  },
  {
    name: "Arjun Mehta",
    role: "SEO Specialist",
    company: "Digital Boost",
    content:
      "The SEO optimization on tool pages is brilliant. I can see why they rank so well on Google. The Hindi keywords targeting is smart for the Indian market.",
    rating: 5,
    avatar: "AM",
  },
];

export function Testimonials() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted by Professionals Worldwide
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            See what our users have to say about their experience with WeLovePDF.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="absolute right-6 top-6 text-gray-200 dark:text-gray-800">
                <Quote className="h-8 w-8" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">{testimonial.content}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-8 dark:from-gray-800 dark:to-gray-900">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">4.9/5</div>
              <div className="mt-2 text-lg font-semibold">User Rating</div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Based on 12,847 reviews across platforms
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">98.7%</div>
              <div className="mt-2 text-lg font-semibold">Uptime</div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Reliable service with 24/7 monitoring
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">#1</div>
              <div className="mt-2 text-lg font-semibold">Google Ranking</div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Top result for "PDF tools" in 15 countries
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}