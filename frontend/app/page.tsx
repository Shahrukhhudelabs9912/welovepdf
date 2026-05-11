import { HeroSection } from "@/components/home/hero";
import { ToolsGrid } from "@/components/home/tools-grid";
import { FeaturesSection } from "@/components/home/features";
import { Testimonials } from "@/components/home/testimonials";
import { FAQ } from "@/components/home/faq";
import { CTASection } from "@/components/home/cta";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeroSection />
      <ToolsGrid />
      <FeaturesSection />
      <Testimonials />
      <FAQ />
      <CTASection />
    </div>
  );
}
