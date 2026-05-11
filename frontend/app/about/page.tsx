import { Users, Target, Globe, Shield, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageMeta } from "@/components/seo-provider";
import Link from "next/link";

export default function AboutPage() {
  const team = [
    {
      name: "Alex Chen",
      role: "Founder & CEO",
      bio: "Former Google engineer with 10+ years in document processing",
      avatar: "AC",
    },
    {
      name: "Maria Rodriguez",
      role: "Head of Product",
      bio: "Product leader from Adobe with expertise in PDF technologies",
      avatar: "MR",
    },
    {
      name: "David Kim",
      role: "Lead Developer",
      bio: "Full-stack developer specializing in browser-based processing",
      avatar: "DK",
    },
    {
      name: "Sarah Johnson",
      role: "Security Lead",
      bio: "Cybersecurity expert focused on data privacy and encryption",
      avatar: "SJ",
    },
  ];

  const milestones = [
    { year: "2020", event: "Founded with a vision to simplify PDF processing" },
    { year: "2021", event: "Launched first 5 PDF tools with browser-based processing" },
    { year: "2022", event: "Reached 1 million users and added AI features" },
    { year: "2023", event: "Expanded to 14+ tools with multi-language support" },
    { year: "2024", event: "Achieved 5 million users with enterprise features" },
  ];

  return (
    <>
      <PageMeta
        title="About WeLovePDF - Our Story & Mission"
        description="Learn about WeLovePDF's mission to make PDF processing simple, secure, and accessible for everyone. Meet our team and discover our values."
        keywords="about welovepdf, pdf tools company, our mission, our team, pdf processing"
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        {/* Hero Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <Badge className="mb-4" variant="outline">
                Our Story
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                We Believe in{" "}
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Simplicity & Security
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                WeLovePDF was founded with a simple mission: to make PDF processing accessible,
                secure, and effortless for everyone. No complicated software, no privacy concerns,
                just powerful tools that work right in your browser.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="mb-4 rounded-full bg-blue-100 p-3 dark:bg-blue-900/30 w-fit">
                    <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Our Mission</CardTitle>
                  <CardDescription>
                    What drives us every day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    To democratize PDF processing by providing free, high-quality tools that
                    anyone can use regardless of technical expertise. We believe everyone
                    deserves access to professional-grade document tools without cost barriers.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-4 rounded-full bg-green-100 p-3 dark:bg-green-900/30 w-fit">
                    <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle>Our Values</CardTitle>
                  <CardDescription>
                    Principles we stand by
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span><strong>Privacy First:</strong> Your documents never leave your browser</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span><strong>Accessibility:</strong> Free tools for everyone, forever</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span><strong>Innovation:</strong> Constantly improving with AI and new features</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-4 rounded-full bg-purple-100 p-3 dark:bg-purple-900/30 w-fit">
                    <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>Our Impact</CardTitle>
                  <CardDescription>
                    Making a difference
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">5M+</div>
                      <div className="text-sm text-gray-500">Users Worldwide</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">14+</div>
                      <div className="text-sm text-gray-500">PDF Tools</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">50+</div>
                      <div className="text-sm text-gray-500">Countries</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">99.9%</div>
                      <div className="text-sm text-gray-500">Uptime</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Meet Our Team
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Passionate experts dedicated to improving your PDF experience
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((member) => (
                <Card key={member.name} className="text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-2xl font-bold text-white">
                      {member.avatar}
                    </div>
                    <CardTitle>{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Our Journey
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                From a simple idea to serving millions worldwide
              </p>
            </div>

            <div className="mt-12">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className="relative flex items-start gap-8 pb-12">
                  {index < milestones.length - 1 && (
                    <div className="absolute left-6 top-12 h-full w-0.5 bg-gray-200 dark:bg-gray-800" />
                  )}
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold">
                    {milestone.year}
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-semibold">{milestone.event}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-r from-primary to-purple-600 p-8 text-center text-white">
            <h2 className="text-3xl font-bold">Join Our Mission</h2>
            <p className="mt-4 text-lg opacity-90">
              Help us make PDF processing better for everyone
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" className="gap-2">
                <Heart className="h-4 w-4" />
                Try Our Tools
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Users className="h-4 w-4" />
                Join Our Team
              </Button>
            </div>
            <p className="mt-6 text-sm opacity-80">
              <Link href="/careers" className="underline hover:no-underline">
                View open positions
              </Link>{" "}
              •{" "}
              <Link href="/contact" className="underline hover:no-underline">
                Contact us
              </Link>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}