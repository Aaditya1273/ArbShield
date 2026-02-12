import { CallToAction } from "@/components/web/cta";
import FaqsSection from "@/components/web/faqs";
import FeaturesSection from "@/components/web/features";
import Footer from "@/components/web/footer";
import Hero from "@/components/web/hero";
import HowItWorksSection from "@/components/web/how-it-works";
import LogoCloud from "@/components/web/logo-cloud";

export default function Home() {
  return (
    <>
      <Hero />
      <LogoCloud />
      <FeaturesSection />
      <HowItWorksSection />
      <FaqsSection />
      <CallToAction />
      <Footer />
    </>
  );
}
