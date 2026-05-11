import { Copyright, FileText, Mail, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageMeta } from "@/components/seo-provider";
import Link from "next/link";

export default function DMCAPage() {
  const requirements = [
    {
      title: "Identification of Copyrighted Work",
      description: "A description of the copyrighted work you claim has been infringed",
      required: true,
    },
    {
      title: "Identification of Infringing Material",
      description: "URLs or specific location of the allegedly infringing material",
      required: true,
    },
    {
      title: "Contact Information",
      description: "Your address, telephone number, and email address",
      required: true,
    },
    {
      title: "Good Faith Statement",
      description: "A statement that you believe the use is not authorized",
      required: true,
    },
    {
      title: "Accuracy Statement",
      description: "A statement that the information in your notice is accurate",
      required: true,
    },
    {
      title: "Signature",
      description: "Your physical or electronic signature",
      required: true,
    },
  ];

  const processSteps = [
    {
      step: 1,
      title: "Submit Notice",
      description: "Send a complete DMCA notice to our designated agent",
      timeframe: "Within 24 hours",
      icon: <Mail className="h-5 w-5" />,
    },
    {
      step: 2,
      title: "Review & Verification",
      description: "We review the notice for completeness and validity",
      timeframe: "1-2 business days",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      step: 3,
      title: "Content Removal",
      description: "If valid, we remove or disable access to the infringing material",
      timeframe: "Immediately after verification",
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
      step: 4,
      title: "Counter-Notice",
      description: "The affected user may submit a counter-notice if they believe removal was mistaken",
      timeframe: "10-14 business days",
      icon: <Copyright className="h-5 w-5" />,
    },
    {
      step: 5,
      title: "Resolution",
      description: "We follow DMCA procedures to resolve the dispute",
      timeframe: "10-14 business days",
      icon: <CheckCircle className="h-5 w-5" />,
    },
  ];

  const counterNoticeInfo = [
    {
      requirement: "Identification",
      description: "Identification of the material that was removed",
    },
    {
      requirement: "Good Faith Belief",
      description: "Statement of good faith belief that removal was a mistake",
    },
    {
      requirement: "Consent to Jurisdiction",
      description: "Consent to jurisdiction in your federal district",
    },
    {
      requirement: "Contact Information",
      description: "Your name, address, and telephone number",
    },
    {
      requirement: "Signature",
      description: "Your physical or electronic signature",
    },
  ];

  return (
    <>
      <PageMeta
        title="DMCA Policy - WeLovePDF Copyright Protection"
        description="WeLovePDF's Digital Millennium Copyright Act (DMCA) policy. Learn how to report copyright infringement and our procedures for handling claims."
        keywords="DMCA, copyright, infringement, takedown notice, counter notice, digital millennium copyright act"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        {/* Hero Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Copyright className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                DMCA Policy
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                Digital Millennium Copyright Act (DMCA) Compliance and Copyright Infringement Procedures
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button className="gap-2">
                  <Mail className="h-4 w-4" />
                  Submit DMCA Notice
                </Button>
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Download Notice Template
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* DMCA Requirements */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold">DMCA Notice Requirements</h2>
              <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
                A valid DMCA notice must include all of the following information
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {requirements.map((req, index) => (
                <Card key={index} className="border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{req.title}</CardTitle>
                      {req.required && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          Required
                        </span>
                      )}
                    </div>
                    <CardDescription>{req.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm">
                      {req.required ? (
                        <>
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <span className="text-amber-600 dark:text-amber-400">Required for valid notice</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-green-600 dark:text-green-400">Recommended</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold">DMCA Process Timeline</h2>
              <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
                Our step-by-step process for handling DMCA notices
              </p>
            </div>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gray-200 dark:bg-gray-800"></div>
              
              {processSteps.map((step, index) => (
                <div 
                  key={index} 
                  className={`relative mb-12 flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {/* Step content */}
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12'}`}>
                    <Card className="border-gray-200 dark:border-gray-800">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            {step.icon}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold">{step.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Step {step.step}</p>
                          </div>
                        </div>
                        <p className="mb-3">{step.description}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">{step.timeframe}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Step number */}
                  <div className="absolute left-1/2 top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-primary text-white dark:border-gray-950">
                    {step.step}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Counter Notice */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold">Counter-Notice Information</h2>
              <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
                If you believe your content was removed by mistake, you may submit a counter-notice
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    When to Submit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                      <span>You believe the DMCA notice was filed in error</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                      <span>You have authorization to use the copyrighted material</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                      <span>The material was removed due to a misidentification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                      <span>You are willing to accept service of process</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Counter-Notice Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {counterNoticeInfo.map((info, index) => (
                      <div key={index} className="border-b pb-3 last:border-0">
                        <h4 className="font-semibold">{info.requirement}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{info.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto max-w-6xl">
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Designated DMCA Agent
                </CardTitle>
                <CardDescription>
                  Send all DMCA notices and counter-notices to our designated agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <h3 className="mb-4 text-xl font-semibold">Contact Information</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold">Name</h4>
                        <p>DMCA Agent, WeLovePDF Inc.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold">Email</h4>
                        <p className="font-mono text-primary">dmca@welovepdf.com</p>
                      </div>
                      <div>
                        <h4 className="font-semibold">Phone</h4>
                        <p>+1 (555) 123-4567</p>
                      </div>
                      <div>
                        <h4 className="font-semibold">Response Time</h4>
                        <p>Within 48 hours for complete notices</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-4 text-xl font-semibold">Notice Submission</h3>
                    <div className="space-y-4">
                      <div className="rounded-lg border p-4">
                        <h4 className="mb-2 font-semibold">Preferred Method</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Email to dmca@welovepdf.com with "DMCA Notice" in subject
                        </p>
                        <Button className="mt-3 w-full gap-2">
                          <Mail className="h-4 w-4" />
                          Send DMCA Notice
                        </Button>
                      </div>
                      <div className="rounded-lg border p-4">
                        <h4 className="mb-2 font-semibold">Alternative Method</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Physical mail to our registered agent address (available upon request)
                        </p>
                      </div>
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
              <h2 className="mb-4 text-3xl font-bold">Need DMCA Assistance?</h2>
              <p className="mb-8 text-gray-600 dark:text-gray-400">
                We take copyright protection seriously and respond promptly to valid DMCA notices.
                Contact our DMCA agent for assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Contact DMCA Agent
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Download Notice Template
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}