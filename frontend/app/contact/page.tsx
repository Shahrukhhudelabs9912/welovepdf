import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageMeta } from "@/components/seo-provider";

export const metadata: Metadata = {
  title: "Contact Us | WeLovePDF Support & Help",
  description: "Get in touch with the WeLovePDF team for support, feedback, or partnership inquiries. We're here to help you with all your PDF needs.",
  keywords: "contact welovepdf, pdf support, help center, feedback, partnership, customer service",
  openGraph: {
    title: "Contact Us | WeLovePDF Support & Help",
    description: "Get in touch with the WeLovePDF team for support, feedback, or partnership inquiries.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | WeLovePDF Support & Help",
    description: "Get in touch with the WeLovePDF team for support, feedback, or partnership inquiries.",
  },
  alternates: {
    canonical: "https://welovepdf.com/contact",
    languages: {
      en: "https://welovepdf.com/contact",
      hi: "https://welovepdf.com/hi/contact",
    },
  },
};

const contactMethods = [
  {
    icon: <Mail className="h-6 w-6" />,
    title: "Email Support",
    description: "For general inquiries and support",
    details: "support@welovepdf.com",
    action: "Send Email",
    href: "mailto:support@welovepdf.com",
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: "Live Chat",
    description: "Available during business hours",
    details: "Mon-Fri, 9AM-6PM (UTC)",
    action: "Start Chat",
    href: "#",
  },
  {
    icon: <Phone className="h-6 w-6" />,
    title: "Phone Support",
    description: "For urgent matters",
    details: "+1 (555) 123-4567",
    action: "Call Now",
    href: "tel:+15551234567",
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: "Office Location",
    description: "Our headquarters",
    details: "123 PDF Street, San Francisco, CA 94107",
    action: "View Map",
    href: "https://maps.google.com",
  },
];

const faqs = [
  {
    question: "How long does it take to get a response?",
    answer: "We typically respond to all inquiries within 24 hours during business days. For urgent matters, please use our phone support.",
  },
  {
    question: "Do you offer enterprise solutions?",
    answer: "Yes! We provide custom enterprise solutions for businesses with high-volume PDF processing needs. Contact our sales team for a demo.",
  },
  {
    question: "Can I suggest a new feature?",
    answer: "Absolutely! We love hearing from our users. Please use the feedback form or email us directly with your suggestions.",
  },
  {
    question: "Is there a limit to file size?",
    answer: "Our free tier supports files up to 100MB. For larger files, consider our premium plans or contact us for enterprise solutions.",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageMeta
        title="Contact Us | WeLovePDF Support & Help"
        description="Get in touch with the WeLovePDF team for support, feedback, or partnership inquiries."
        keywords="contact welovepdf, pdf support, help center, feedback, partnership"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        {/* Hero Section */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Have questions, feedback, or need support? We're here to help you with all your PDF needs.
              Our team is ready to assist you.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {contactMethods.map((method, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center shadow-sm hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {method.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {method.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {method.description}
                  </p>
                  <p className="mt-4 font-medium text-gray-900 dark:text-white">
                    {method.details}
                  </p>
                  <a href={method.href}>
                    <Button
                      variant="outline"
                      className="mt-6 w-full"
                    >
                      {method.action}
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              {/* Contact Form */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Send us a message
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>

                <form className="mt-8 space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <Input placeholder="John" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name
                      </label>
                      <Input placeholder="Doe" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <Input type="email" placeholder="john@example.com" required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <Input placeholder="How can we help you?" required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <Textarea
                      placeholder="Please describe your inquiry in detail..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full gap-2">
                    <Send className="h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Company Info & FAQ */}
              <div className="space-y-8">
                {/* Company Info */}
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    About WeLovePDF
                  </h2>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    WeLovePDF is a leading online PDF solution trusted by millions of users worldwide.
                    Our mission is to make PDF processing simple, secure, and accessible to everyone.
                  </p>
                  
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Business Hours</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Monday - Friday: 9:00 AM - 6:00 PM (UTC)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Response Time</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Typically within 24 hours during business days
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ */}
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Frequently Asked Questions
                  </h2>
                  <div className="mt-6 space-y-6">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border-b border-gray-200 dark:border-gray-800 pb-6 last:border-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {faq.question}
                        </h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 text-center text-white">
            <h2 className="text-3xl font-bold">Need immediate assistance?</h2>
            <p className="mt-4 text-lg opacity-90">
              Our support team is available to help you with any urgent matters.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" className="gap-2">
                <Phone className="h-4 w-4" />
                Call Now: +1 (555) 123-4567
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 text-white hover:bg-white/20">
                Schedule a Call
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}