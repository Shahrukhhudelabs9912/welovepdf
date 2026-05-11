import { Briefcase, MapPin, DollarSign, Clock, Users, Award, Heart, Zap, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageMeta } from "@/components/seo-provider";
import Link from "next/link";

export default function CareersPage() {
  const jobOpenings = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      salary: "$120k - $160k",
      description: "Build the next generation of PDF tools with React, Next.js, and TypeScript.",
      requirements: ["5+ years React experience", "TypeScript expertise", "Next.js/App Router"],
    },
    {
      id: 2,
      title: "PDF Processing Engineer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$140k - $180k",
      description: "Work on our core PDF processing engine and optimization algorithms.",
      requirements: ["C++/Rust experience", "PDF specification knowledge", "Performance optimization"],
    },
    {
      id: 3,
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      salary: "$100k - $140k",
      description: "Design intuitive interfaces for complex PDF manipulation tools.",
      requirements: ["Figma expertise", "Design systems", "User research"],
    },
    {
      id: 4,
      title: "DevOps Engineer",
      department: "Infrastructure",
      location: "Remote",
      type: "Full-time",
      salary: "$130k - $170k",
      description: "Build and scale our cloud infrastructure for global PDF processing.",
      requirements: ["AWS/GCP", "Kubernetes", "CI/CD pipelines"],
    },
    {
      id: 5,
      title: "Customer Success Manager",
      department: "Support",
      location: "New York, NY",
      type: "Full-time",
      salary: "$90k - $120k",
      description: "Help enterprise customers succeed with our PDF tools platform.",
      requirements: ["SaaS experience", "Technical support", "Account management"],
    },
    {
      id: 6,
      title: "AI/ML Engineer",
      department: "Research",
      location: "Remote",
      type: "Full-time",
      salary: "$150k - $200k",
      description: "Develop AI features for PDF analysis, summarization, and automation.",
      requirements: ["Python/TensorFlow", "NLP experience", "ML deployment"],
    },
  ];

  const benefits = [
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Competitive Salary",
      description: "Top-of-market compensation with equity options",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Flexible Hours",
      description: "Work when you're most productive, with async collaboration",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Remote First",
      description: "Work from anywhere with global team retreats",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Culture",
      description: "Collaborative, inclusive environment with learning budget",
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Career Growth",
      description: "Clear promotion paths and mentorship programs",
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Health & Wellness",
      description: "Comprehensive health insurance and wellness stipend",
    },
  ];

  return (
    <>
      <PageMeta
        title="Careers at WeLovePDF - Join Our Team"
        description="Build the future of PDF tools with us. Explore open positions in engineering, design, product, and more."
        keywords="PDF jobs, remote careers, tech jobs, engineering positions, design jobs"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        {/* Hero Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center">
              <Badge className="mb-4 gap-1 bg-primary/10 px-4 py-1 text-primary">
                <Briefcase className="h-3 w-3" />
                We're Hiring
              </Badge>
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Build the Future of
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PDF Tools
                </span>
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                Join our mission to make PDF manipulation faster, smarter, and more accessible for everyone.
                We're building tools that millions of users rely on every day.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2">
                  View Open Positions
                  <Briefcase className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  Learn About Culture
                  <Users className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold">Why Work With Us</h2>
              <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
                We believe in creating an environment where talented people can do their best work.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      {benefit.icon}
                    </div>
                    <CardTitle>{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold">Open Positions</h2>
              <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
                {jobOpenings.length} roles available across engineering, design, product, and more.
              </p>
            </div>
            <div className="space-y-6">
              {jobOpenings.map((job) => (
                <Card key={job.id} className="border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-semibold">{job.title}</h3>
                          <Badge variant="outline">{job.department}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {job.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {job.salary}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{job.description}</p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {job.requirements.map((req, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button className="gap-2">
                        Apply Now
                        <Briefcase className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Culture & Values */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold">Our Culture & Values</h2>
              <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
                What makes WeLovePDF a great place to work
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User-First Mindset
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Everything we build starts with our users. We obsess over making PDF tools that are
                    intuitive, reliable, and solve real problems for millions of people worldwide.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Speed & Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    We believe PDF tools should be fast. Our engineering team focuses on optimization,
                    parallel processing, and delivering results in seconds, not minutes.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy & Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    User data protection is non-negotiable. We implement end-to-end encryption,
                    auto-delete policies, and transparent data handling practices.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Global Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Our tools serve users in 150+ countries. We build with localization in mind,
                    supporting multiple languages and adapting to diverse user needs.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl text-center">
            <Card className="border-gray-200 dark:border-gray-800 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-12">
                <h2 className="mb-4 text-3xl font-bold">Ready to Join Our Team?</h2>
                <p className="mb-8 text-gray-600 dark:text-gray-400">
                  Don't see the perfect role? We're always looking for talented people.
                  Send us your resume and tell us how you can contribute.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="gap-2">
                    View All Positions
                    <Briefcase className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2">
                    Contact Hiring Team
                    <Users className="h-4 w-4" />
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