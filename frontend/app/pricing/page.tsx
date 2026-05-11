import { Check, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageMeta } from "@/components/seo-provider";

export default function PricingPage() {

  const plans = [
    {
      name: "Free",
      description: "Perfect for occasional users",
      price: "$0",
      period: "forever",
      features: [
        "Merge up to 3 PDFs",
        "Compress PDFs up to 50MB",
        "Convert 5 files per day",
        "Basic watermarking",
        "Standard processing speed",
        "Files auto-delete after 1 hour",
      ],
      cta: "Get Started Free",
      popular: false,
    },
    {
      name: "Pro",
      description: "For professionals and small teams",
      price: "$9.99",
      period: "per month",
      features: [
        "Unlimited PDF merging",
        "Compress PDFs up to 500MB",
        "Unlimited conversions",
        "Advanced watermarking",
        "Priority processing",
        "Files stored for 24 hours",
        "Batch processing",
        "No ads",
      ],
      cta: "Start 14-Day Trial",
      popular: true,
    },
    {
      name: "Business",
      description: "For organizations and enterprises",
      price: "$29.99",
      period: "per month",
      features: [
        "Everything in Pro",
        "Compress PDFs up to 2GB",
        "API access",
        "Custom branding",
        "Dedicated support",
        "Files stored for 7 days",
        "Team management",
        "SLA guarantee",
        "Advanced analytics",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const faqs = [
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. Your Pro/Business features will remain active until the end of your billing period.",
    },
    {
      question: "Is there a free trial for Pro plan?",
      answer: "Yes, we offer a 14-day free trial for the Pro plan. No credit card required to start the trial.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for Business plans.",
    },
    {
      question: "Do you offer discounts for non-profits?",
      answer: "Yes, we offer a 50% discount for registered non-profit organizations. Contact our sales team with your documentation.",
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, changes take effect at the next billing cycle.",
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. All files are encrypted in transit and at rest. We automatically delete files after the retention period, and we never share your data with third parties.",
    },
  ];

  return (
    <>
      <PageMeta
        title="Pricing Plans - WeLovePDF"
        description="Choose the perfect plan for your PDF needs. Free forever plan available, Pro plan for professionals, and Business plan for enterprises."
        keywords="PDF pricing, PDF tools cost, free PDF tools, Pro PDF tools, Business PDF tools"
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        {/* Hero Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <Badge className="mb-4" variant="outline">
                Transparent Pricing
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                Simple,{" "}
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Fair Pricing
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                Choose the perfect plan for your PDF needs. No hidden fees, no surprises.
                Start with our free plan or try Pro free for 14 days.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-3">
              {plans.map((plan, index) => (
                <Card
                  key={plan.name}
                  className={`relative flex flex-col ${
                    plan.popular
                      ? "border-2 border-primary shadow-xl dark:border-primary"
                      : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="gap-1 bg-primary px-4 py-1">
                        <Star className="h-3 w-3" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="ml-2 text-gray-500 dark:text-gray-400">
                        /{plan.period}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full gap-2"
                      size="lg"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                      {plan.popular && <Zap className="h-4 w-4" />}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Compare All Features
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                See how our plans stack up against each other
              </p>
            </div>

            <div className="mt-12 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                    <th className="px-6 py-4 text-left font-semibold">Feature</th>
                    <th className="px-6 py-4 text-center font-semibold">Free</th>
                    <th className="px-6 py-4 text-center font-semibold">Pro</th>
                    <th className="px-6 py-4 text-center font-semibold">Business</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["PDF Merging", "3 files", "Unlimited", "Unlimited"],
                    ["File Size Limit", "50MB", "500MB", "2GB"],
                    ["Conversions/Day", "5", "Unlimited", "Unlimited"],
                    ["Watermarking", "Basic", "Advanced", "Advanced"],
                    ["Processing Speed", "Standard", "Priority", "Priority"],
                    ["File Retention", "1 hour", "24 hours", "7 days"],
                    ["Batch Processing", "❌", "✅", "✅"],
                    ["API Access", "❌", "❌", "✅"],
                    ["Custom Branding", "❌", "❌", "✅"],
                    ["Dedicated Support", "❌", "✅", "✅"],
                    ["Team Management", "❌", "❌", "✅"],
                    ["SLA Guarantee", "❌", "❌", "✅"],
                  ].map(([feature, free, pro, business], idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-gray-100 dark:border-gray-800 ${
                        idx % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-900/50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-medium">{feature}</td>
                      <td className="px-6 py-4 text-center">{free}</td>
                      <td className="px-6 py-4 text-center">{pro}</td>
                      <td className="px-6 py-4 text-center">{business}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Get answers to common questions about our pricing and plans
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-r from-primary to-purple-600 p-8 text-center text-white">
            <h2 className="text-3xl font-bold">Ready to Transform Your PDF Workflow?</h2>
            <p className="mt-4 text-lg opacity-90">
              Join thousands of professionals who trust WeLovePDF for their document needs.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" className="gap-2">
                Start Free Trial
                <Zap className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Contact Sales
              </Button>
            </div>
            <p className="mt-6 text-sm opacity-80">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </section>
      </div>
    </>
  );
}