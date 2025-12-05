import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection, LiveDataSection, HowItWorksSection, CTASection } from "@/components/home/Sections";

export default function HomePage() {
  return (
    <div className="relative">
      <HeroSection currentAQI={42} locationName="Beograd" />
      <FeaturesSection />
      <LiveDataSection />
      <HowItWorksSection />
      <CTASection />
    </div>
  );
}

