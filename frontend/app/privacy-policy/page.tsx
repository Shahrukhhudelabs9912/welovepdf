import { Shield, Lock, EyeOff, Server, Trash2, FileText, User, Globe, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageMeta } from "@/components/seo-provider";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "Information We Collect",
      icon: <FileText className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p>
            <strong>Uploaded Files:</strong> When you use our PDF tools, you may upload files for processing. 
            These files are processed entirely in your browser or temporary server memory and are never stored 
            permanently on our servers.
          </p>
          <p>
            <strong>Technical Information:</strong> We collect anonymous usage data including browser type, 
            device type, and feature usage to improve our services. This data is aggregated and cannot be 
            used to identify individual users.
          </p>
          <p>
            <strong>Account Information:</strong> If you create an account, we collect your email address 
            and basic profile information to provide personalized services.
          </p>
        </div>
      ),
    },
    {
      title: "How We Use Your Information",
      icon: <Server className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p>
            <strong>Service Provision:</strong> To process your PDF files and provide the tools you request.
          </p>
          <p>
            <strong>Improvement:</strong> To analyze usage patterns and improve our tools and user experience.
          </p>
          <p>
            <strong>Communication:</strong> To send you service-related notifications and updates (if you opt in).
          </p>
          <p>
            <strong>Security:</strong> To detect and prevent fraud, abuse, and security incidents.
          </p>
        </div>
      ),
    },
    {
      title: "Data Storage & Retention",
      icon: <Trash2 className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p>
            <strong>Uploaded Files:</strong> Files are automatically deleted from our servers within 1 hour 
            of processing completion. For browser-based processing, files never leave your device.
          </p>
          <p>
            <strong>Processing Data:</strong> Temporary processing data is kept only for the duration of 
            the operation and is immediately purged afterward.
          </p>
          <p>
            <strong>Account Data:</strong> If you create an account, we retain your account information 
            until you request deletion.
          </p>
          <p>
            <strong>Backups:</strong> System backups may retain data for up to 30 days for disaster recovery 
            purposes, after which they are permanently deleted.
          </p>
        </div>
      ),
    },
    {
      title: "Data Security",
      icon: <Lock className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p>
            <strong>Encryption:</strong> All data in transit is encrypted using TLS 1.3. Files at rest 
            (temporarily) are encrypted using AES-256 encryption.
          </p>
          <p>
            <strong>Access Controls:</strong> Strict access controls limit employee access to user data 
            to only what is necessary for providing support.
          </p>
          <p>
            <strong>Security Audits:</strong> Regular security audits and penetration testing ensure 
            our systems remain secure.
          </p>
          <p>
            <strong>Compliance:</strong> We comply with GDPR, CCPA, and other data protection regulations.
          </p>
        </div>
      ),
    },
    {
      title: "Third-Party Services",
      icon: <Globe className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p>
            <strong>Analytics:</strong> We use privacy-focused analytics services (Plausible Analytics) 
            that do not use cookies or collect personal data.
          </p>
          <p>
            <strong>Hosting:</strong> Our services are hosted on infrastructure providers (AWS, Google Cloud) 
            with strong security commitments.
          </p>
          <p>
            <strong>Payment Processing:</strong> For paid plans, we use Stripe for payment processing. 
            Payment information is handled directly by Stripe and never touches our servers.
          </p>
          <p>
            <strong>No Data Selling:</strong> We do not sell, rent, or trade your personal information 
            to third parties.
          </p>
        </div>
      ),
    },
    {
      title: "Your Rights",
      icon: <User className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p>
            <strong>Access:</strong> You have the right to access the personal information we hold about you.
          </p>
          <p>
            <strong>Correction:</strong> You can request correction of inaccurate or incomplete information.
          </p>
          <p>
            <strong>Deletion:</strong> You can request deletion of your personal information, subject to 
            legal obligations.
          </p>
          <p>
            <strong>Objection:</strong> You can object to certain processing of your personal information.
          </p>
          <p>
            <strong>Portability:</strong> You can request a copy of your data in a structured, machine-readable format.
          </p>
          <p>
            <strong>Withdraw Consent:</strong> Where processing is based on consent, you can withdraw consent at any time.
          </p>
        </div>
      ),
    },
  ];

  const contactInfo = [
    {
      title: "Data Protection Officer",
      email: "dpo@welovepdf.com",
      description: "For privacy-related inquiries and data subject requests",
    },
    {
      title: "General Support",
      email: "support@welovepdf.com",
      description: "For general questions about our services",
    },
    {
      title: "Legal Inquiries",
      email: "legal@welovepdf.com",
      description: "For legal and compliance matters",
    },
  ];

  return (
    <>
      <PageMeta
        title="Privacy Policy - WeLovePDF Data Protection"
        description="Comprehensive privacy policy detailing how WeLovePDF collects, uses, and protects your data. Learn about our security measures and your rights."
        keywords="privacy policy, data protection, GDPR, CCPA, PDF privacy, file security"
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
                Privacy Policy
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                Last updated: May 1, 2026. This policy describes how WeLovePDF collects, uses, 
                and protects your information.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button variant="outline" className="gap-2">
                  <EyeOff className="h-4 w-4" />
                  Quick Summary
                </Button>
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Download PDF Version
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Policy Sections */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="space-y-12">
              {sections.map((section, index) => (
                <Card key={index} className="border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        {section.icon}
                      </div>
                      <div>
                        <CardTitle>{section.title}</CardTitle>
                        <CardDescription>Section {index + 1} of {sections.length}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="prose prose-gray max-w-none dark:prose-invert">
                    {section.content}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold">Contact Us</h2>
              <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
                For questions about this privacy policy or to exercise your data rights
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {contactInfo.map((contact, index) => (
                <Card key={index} className="border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      {contact.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2 font-mono text-lg font-semibold text-primary">
                      {contact.email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {contact.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Policy Updates */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl">
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Policy Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    We may update this privacy policy from time to time. When we make significant changes, 
                    we will notify users through our website or via email (for registered users).
                  </p>
                  <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-900">
                    <h4 className="mb-2 font-semibold">Update History</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span>May 1, 2026</span>
                        <span>Current version</span>
                      </li>
                      <li className="flex justify-between">
                        <span>January 15, 2026</span>
                        <span>Added GDPR compliance details</span>
                      </li>
                      <li className="flex justify-between">
                        <span>October 1, 2025</span>
                        <span>Initial privacy policy</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    We recommend reviewing this policy periodically to stay informed about how we protect your information.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 p-8 dark:from-blue-900/20 dark:to-purple-900/20">
              <h2 className="mb-4 text-3xl font-bold">Have Privacy Questions?</h2>
              <p className="mb-8 text-gray-600 dark:text-gray-400">
                We're committed to transparency and protecting your privacy. 
                Contact us with any questions or concerns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Privacy Team
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  <Shield className="h-4 w-4" />
                  View Security Measures
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}