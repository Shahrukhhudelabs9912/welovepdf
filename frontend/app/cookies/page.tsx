import { Cookie, Shield, Settings, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageMeta } from "@/components/seo-provider";
import Link from "next/link";

export default function CookiesPage() {
  const cookieTypes = [
    {
      name: "Essential Cookies",
      description: "Required for the website to function properly",
      necessary: true,
      examples: ["Session management", "Security features", "Load balancing"],
      duration: "Session or up to 24 hours",
    },
    {
      name: "Analytics Cookies",
      description: "Help us understand how visitors use our site",
      necessary: false,
      examples: ["Page visits", "Feature usage", "Error tracking"],
      duration: "Up to 2 years",
    },
    {
      name: "Preference Cookies",
      description: "Remember your settings and preferences",
      necessary: false,
      examples: ["Language selection", "Theme preference", "Tool settings"],
      duration: "Up to 1 year",
    },
    {
      name: "Marketing Cookies",
      description: "Used to deliver relevant advertisements",
      necessary: false,
      examples: ["Ad targeting", "Campaign measurement", "Conversion tracking"],
      duration: "Up to 2 years",
    },
  ];

  const cookieDetails = [
    {
      provider: "WeLovePDF",
      name: "session_id",
      purpose: "Maintain your session while using our tools",
      duration: "24 hours",
      type: "Essential",
    },
    {
      provider: "Plausible Analytics",
      name: "_plausible_key",
      purpose: "Anonymous website analytics (no personal data)",
      duration: "1 year",
      type: "Analytics",
    },
    {
      provider: "WeLovePDF",
      name: "theme_preference",
      purpose: "Remember your dark/light mode preference",
      duration: "1 year",
      type: "Preference",
    },
    {
      provider: "WeLovePDF",
      name: "language",
      purpose: "Remember your selected language",
      duration: "1 year",
      type: "Preference",
    },
  ];

  return (
    <>
      <PageMeta
        title="Cookie Policy - WeLovePDF"
        description="Learn about how WeLovePDF uses cookies and similar technologies to enhance your experience."
        keywords="cookie policy, cookies, privacy, tracking, GDPR cookies"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        {/* Hero Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Cookie className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                Cookie Policy
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                Last updated: May 1, 2026. This policy explains how we use cookies and similar technologies.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button className="gap-2">
                  <Settings className="h-4 w-4" />
                  Cookie Settings
                </Button>
                <Button variant="outline" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Privacy Policy
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Cookie Types */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold">Types of Cookies We Use</h2>
              <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
                We use different types of cookies for various purposes
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {cookieTypes.map((cookie, index) => (
                <Card key={index} className="border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Cookie className="h-5 w-5" />
                        {cookie.name}
                      </CardTitle>
                      {cookie.necessary ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Necessary
                        </span>
                      ) : (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          Optional
                        </span>
                      )}
                    </div>
                    <CardDescription>{cookie.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="mb-2 text-sm font-semibold">Examples:</h4>
                        <ul className="space-y-1">
                          {cookie.examples.map((example, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">Duration:</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{cookie.duration}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Cookie Details Table */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold">Detailed Cookie Information</h2>
              <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
                Specific cookies used on our website
              </p>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                    <th className="px-6 py-4 text-left font-semibold">Provider</th>
                    <th className="px-6 py-4 text-left font-semibold">Cookie Name</th>
                    <th className="px-6 py-4 text-left font-semibold">Purpose</th>
                    <th className="px-6 py-4 text-left font-semibold">Duration</th>
                    <th className="px-6 py-4 text-left font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {cookieDetails.map((cookie, index) => (
                    <tr 
                      key={index} 
                      className={index % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-gray-50 dark:bg-gray-900"}
                    >
                      <td className="px-6 py-4 font-medium">{cookie.provider}</td>
                      <td className="px-6 py-4 font-mono text-sm">{cookie.name}</td>
                      <td className="px-6 py-4">{cookie.purpose}</td>
                      <td className="px-6 py-4">{cookie.duration}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                          cookie.type === "Essential" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : cookie.type === "Analytics"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                        }`}>
                          {cookie.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Cookie Control */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold">Managing Your Cookie Preferences</h2>
              <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
                You have control over which cookies you accept
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Browser Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Most web browsers allow you to control cookies through their settings. You can:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Block all cookies
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Block third-party cookies
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Delete cookies when you close your browser
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      View and manage individual cookies
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <EyeOff className="h-5 w-5" />
                    Our Cookie Consent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    When you first visit our website, you'll see a cookie consent banner where you can:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Accept all cookies
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Accept only essential cookies
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Customize your preferences
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Change your preferences anytime
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Button className="w-full gap-2">
                      <Settings className="h-4 w-4" />
                      Update Cookie Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* GDPR & Legal */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto max-w-6xl">
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Legal Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-2 text-xl font-semibold">GDPR Compliance</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      For users in the European Economic Area (EEA), we comply with the General Data Protection 
                      Regulation (GDPR). This means:
                    </p>
                    <ul className="mt-3 space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                        <span>We obtain explicit consent for non-essential cookies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                        <span>We provide clear information about cookie usage</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                        <span>We make it easy to withdraw consent</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                        <span>We document and honor cookie preferences</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold">Other Regulations</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      We also comply with other privacy regulations including:
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline">CCPA (California)</Badge>
                      <Badge variant="outline">LGPD (Brazil)</Badge>
                      <Badge variant="outline">PIPEDA (Canada)</Badge>
                      <Badge variant="outline">APP (Australia)</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-8 dark:from-amber-900/20 dark:to-orange-900/20">
              <h2 className="mb-4 text-3xl font-bold">Need Help With Cookies?</h2>
              <p className="mb-8 text-gray-600 dark:text-gray-400">
                Contact us if you have questions about our cookie policy or need assistance 
                managing your preferences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="gap-2">
                  <Cookie className="h-4 w-4" />
                  Manage Cookie Preferences
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Contact Privacy Team
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}