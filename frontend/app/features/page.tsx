import { Zap, Shield, Globe, Lock, Cpu, Users, Clock, FileText, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageMeta } from "@/components/seo-provider";
import Link from "next/link";

export default function FeaturesPage() {
  const coreFeatures = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast Processing",
      description: "Process PDFs in seconds with our optimized engine. No waiting, no delays.",
      details: ["Parallel processing", "Web Workers", "Cloud acceleration"],
      id: "speed",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Bank-Level Security",
      description: "Your files are encrypted end-to-end and automatically deleted after processing.",
      details: ["AES-256 encryption", "Auto-delete", "No third-party storage"],
      id: "security",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Accessibility",
      description: "Available in multiple languages with servers worldwide for low latency.",
      details: ["15+ languages", "Global CDN", "24/7 availability"],
      id: "languages",
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Privacy First",
      description: "We never store, share, or analyze your files. Process everything locally in your browser.",
      details: ["Browser processing", "No data retention", "GDPR compliant"],
      id: "privacy",
    },
    {
      icon: <Cpu className="h-6 w-6" />,
      title: "AI-Powered Tools",
      description: "Smart features like PDF summarization, key point extraction, and automatic formatting.",
      details: ["AI summarization", "Smart analysis", "Auto-formatting"],
      id: "ai",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Collaboration",
      description: "Share, comment, and collaborate on PDFs with your team in real-time.",
      details: ["Real-time editing", "Team workspaces", "Version history"],
      id: "collaboration",
    },
  ];

  const technicalFeatures = [
    {
      title: "Browser Processing",
      description: "Most operations happen directly in your browser for maximum privacy.",
      icon: <FileText className="h-5 w-5" />,
      id: "browser",
    },
    {
      title: "Batch Operations",
      description: "Process multiple files simultaneously with our batch processing engine.",
      icon: <Clock className="h-5 w-5" />,
      id: "batch",
    },
    {
      title: "Format Support",
      description: "Support for all major PDF standards and compatibility with other formats.",
      icon: <CheckCircle className="h-5 w-5" />,
      id: "formats",
    },
    {
      title: "API Access",
      description: "Integrate our PDF tools into your applications with our developer API.",
      icon: <Sparkles className="h-5 w-5" />,
      id: "api",
    },
  ];

  const comparisons = [
    {
      feature: "File Size Limit",
      welovepdf: "100 MB",
      competitor: "50 MB",
      advantage: true,
    },
    {
      feature: "Processing Speed",
      welovepdf: "2-5 seconds",
      competitor: "10-30 seconds",
      advantage: true,
    },
    {
      feature: "Privacy",
      welovepdf: "Browser-based",
      competitor: "Cloud upload",
      advantage: true,
    },
    {
      feature: "Free Tools",
      welovepdf: "All 14+ tools",
      competitor: "Limited tools",
      advantage: true,
    },
    {
      feature: "AI Features",
      welovepdf: "Included",
      competitor: "Premium only",
      advantage: true,
    },
    {
      feature: "Language Support",
      welovepdf: "15+ languages",
      competitor: "5 languages",
      advantage: true,
    },
  ];

  return (
    <>
      <PageMeta
        title="Features - WeLovePDF Advanced PDF Tools"
        description="Discover our powerful features: lightning-fast processing, bank-level security, AI-powered tools, and global accessibility."
        keywords="PDF features, fast PDF processing, secure PDF tools, AI PDF, browser PDF processing"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        {/* Hero Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center">
              <Badge className="mb-4 gap-1 bg-primary/10 px-4 py-1 text-primary">
                <Sparkles className="h-3 w-3" />
                Why Choose Us
              </Badge>
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Powerful Features for
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Modern PDF Workflows
                </span>
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                We've built the most comprehensive set of PDF tools with a focus on speed, security,
                and user experience. Discover what makes WeLovePDF different.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2">
                  Try All Tools Free
                  <Zap className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  Compare Features
                  <Users className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold">Core Features</h2>
              <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
                Everything you need for professional PDF manipulation
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {coreFeatures.map((feature, index) => (
                <Card 
                  key={index} 
                  id={feature.id}
                  className="border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Features */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold">Technical Excellence</h2>
              <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
                Built with modern technology for reliability and performance
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              {technicalFeatures.map((feature, index) => (
                <div key={index} id={feature.id} className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold">How We Compare</h2>
              <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
                See how WeLovePDF stacks up against traditional PDF tools
              </p>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                    <th className="px-6 py-4 text-left font-semibold">Feature</th>
                    <th className="px-6 py-4 text-left font-semibold">WeLovePDF</th>
                    <th className="px-6 py-4 text-left font-semibold">Typical Competitor</th>
                    <th className="px-6 py-4 text-left font-semibold">Advantage</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((item, index) => (
                    <tr 
                      key={index} 
                      className={index % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-gray-50 dark:bg-gray-900"}
                    >
                      <td className="px-6 py-4 font-medium">{item.feature}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-primary">{item.welovepdf}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{item.competitor}</td>
                      <td className="px-6 py-4">
                        {item.advantage ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            WeWin
                          </Badge>
                        ) : (
                          <Badge variant="outline">Equal</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl text-center">
            <Card className="border-gray-200 dark:border-gray-800 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-12">
                <h2 className="mb-4 text-3xl font-bold">Ready to Experience Better PDF Tools?</h2>
                <p className="mb-8 text-gray-600 dark:text-gray-400">
                  Join millions of users who trust WeLovePDF for their document needs.
                  No registration required, completely free to use.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="gap-2">
                    Start Processing PDFs
                    <Zap className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2">
                    View All Tools
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}