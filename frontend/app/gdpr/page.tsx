import { Shield, FileText, User, Download, Eye, Trash2, CheckCircle, Globe, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageMeta } from "@/components/seo-provider";
import Link from "next/link";

export default function GDPRPage() {
  const rights = [
    {
      icon: <Eye className="h-5 w-5" />,
      title: "Right to Access",
      description: "You can request a copy of all personal data we hold about you.",
      action: "Request Data Access",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Right to Rectification",
      description: "You can request correction of inaccurate or incomplete personal data.",
      action: "Update Your Data",
    },
    {
      icon: <Trash2 className="h-5 w-5" />,
      title: "Right to Erasure",
      description: "You can request deletion of your personal data under certain conditions.",
      action: "Request Deletion",
    },
    {
      icon: <Download className="h-5 w-5" />,
      title: "Right to Data Portability",
      description: "You can receive your data in a structured, commonly used format.",
      action: "Export Your Data",
    },
    {
      icon: <User className="h-5 w-5" />,
      title: "Right to Object",
      description: "You can object to certain types of processing of your personal data.",
      action: "Object to Processing",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Right to Restrict Processing",
      description: "You can request restriction of processing in certain circumstances.",
      action: "Restrict Processing",
    },
  ];

  const complianceMeasures = [
    {
      title: "Data Protection by Design",
      description: "We implement privacy measures from the initial design of our systems.",
      status: "Implemented",
    },
    {
      title: "Data Processing Agreements",
      description: "We have DPAs with all third-party processors who handle user data.",
      status: "Implemented",
    },
    {
      title: "Data Protection Officer",
      description: "We have appointed a Data Protection Officer to oversee compliance.",
      status: "Implemented",
    },
    {
      title: "Data Breach Notification",
      description: "We have procedures to notify authorities and users of data breaches.",
      status: "Implemented",
    },
    {
      title: "Privacy Impact Assessments",
      description: "We conduct PIAs for new features and data processing activities.",
      status: "Ongoing",
    },
    {
      title: "Employee Training",
      description: "All employees receive regular GDPR and data protection training.",
      status: "Ongoing",
    },
  ];

  const dataTransfers = [
    {
      country: "European Union",
      adequacy: "Yes",
      safeguards: "GDPR applies directly",
      status: "Fully Compliant",
    },
    {
      country: "United States",
      adequacy: "No",
      safeguards: "Standard Contractual Clauses",
      status: "Compliant",
    },
    {
      country: "United Kingdom",
      adequacy: "Yes",
      safeguards: "UK GDPR adequacy decision",
      status: "Fully Compliant",
    },
    {
      country: "Canada",
      adequacy: "Yes",
      safeguards: "Adequacy decision",
      status: "Fully Compliant",
    },
    {
      country: "Other Countries",
      adequacy: "No",
      safeguards: "SCCs + Additional Measures",
      status: "Compliant",
    },
  ];

  return (
    <>
      <PageMeta
        title="GDPR Compliance - WeLovePDF"
        description="WeLovePDF's commitment to GDPR compliance. Learn about your data protection rights and our compliance measures."
        keywords="GDPR, data protection, privacy rights, GDPR compliance, data subject rights"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        {/* Hero Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                GDPR Compliance
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                WeLovePDF is fully compliant with the EU General Data Protection Regulation (GDPR).
                This page outlines our compliance measures and your rights.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button className="gap-2">
                  <FileText className="h-4 w-4" />
                  Download GDPR Documentation
                </Button>
                <Button variant="outline" className="gap-2">
                  <User className="h-4 w-4" />
                  Exercise Your Rights
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold">Your Data Protection Rights</h2>
              <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
                Under GDPR, you have specific rights regarding your personal data
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rights.map((right, index) => (
                <Card key={index} className="border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      {right.icon}
                    </div>
                    <CardTitle>{right.title}</CardTitle>
                    <CardDescription>{right.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full gap-2">
                      {right.action}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Compliance Measures */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold">Our Compliance Measures</h2>
              <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
                We have implemented comprehensive measures to ensure GDPR compliance
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {complianceMeasures.map((measure, index) => (
                <Card key={index} className="border-gray-200 dark:border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="mb-2 text-xl font-semibold">{measure.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{measure.description}</p>
                      </div>
                      <Badge className={
                        measure.status === "Implemented" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      }>
                        {measure.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Data Transfers */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold">International Data Transfers</h2>
              <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
                We ensure lawful data transfers when processing occurs outside the EU/EEA
              </p>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                    <th className="px-6 py-4 text-left font-semibold">Country/Region</th>
                    <th className="px-6 py-4 text-left font-semibold">Adequacy Decision</th>
                    <th className="px-6 py-4 text-left font-semibold">Safeguards</th>
                    <th className="px-6 py-4 text-left font-semibold">Compliance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dataTransfers.map((transfer, index) => (
                    <tr 
                      key={index} 
                      className={index % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-gray-50 dark:bg-gray-900"}
                    >
                      <td className="px-6 py-4 font-medium">{transfer.country}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 ${
                          transfer.adequacy === "Yes" ? "text-green-600" : "text-amber-600"
                        }`}>
                          {transfer.adequacy === "Yes" ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Globe className="h-4 w-4" />
                          )}
                          {transfer.adequacy}
                        </span>
                      </td>
                      <td className="px-6 py-4">{transfer.safeguards}</td>
                      <td className="px-6 py-4">
                        <Badge className={
                          transfer.status.includes("Fully") 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        }>
                          {transfer.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Contact & Resources */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto max-w-6xl">
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Our DPO
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Our Data Protection Officer (DPO) is available to answer questions about 
                    GDPR compliance and assist with data subject requests.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold">Email</h4>
                      <p className="font-mono text-primary">dpo@welovepdf.com</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Response Time</h4>
                      <p>Within 30 days for data subject requests</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Languages</h4>
                      <p>English, German, French, Spanish</p>
                    </div>
                  </div>
                  <Button className="mt-6 w-full gap-2">
                    <Mail className="h-4 w-4" />
                    Contact DPO
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Resources & Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <h4 className="font-semibold">Privacy Policy</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Comprehensive privacy practices
                        </p>
                      </div>
                      <Link href="/privacy-policy">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <h4 className="font-semibold">Data Processing Agreement</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          For business customers
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <h4 className="font-semibold">Security Whitepaper</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Technical security measures
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 p-8 dark:from-blue-900/20 dark:to-purple-900/20">
              <h2 className="mb-4 text-3xl font-bold">Need GDPR Assistance?</h2>
              <p className="mb-8 text-gray-600 dark:text-gray-400">
                We're committed to transparency and data protection. 
                Contact us for any GDPR-related questions or to exercise your rights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="gap-2">
                  <User className="h-4 w-4" />
                  Exercise Your Rights
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Download Compliance Docs
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// ArrowRight icon component
function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}