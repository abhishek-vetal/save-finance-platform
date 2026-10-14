import Hero from "@/components/hero";
import HighlightsSection from "@/components/highlights-section";
import FeaturesSection from "@/components/features-section";
import HowItWorksSection from "@/components/how-it-works-section";
import { statsData } from "@/data/landing";
import checkUser from "@/lib/checkUser";
export const dynamic = "force-dynamic";

export default async function Home() {
  await checkUser();

  return (
    <>
      <Hero />

      {/* highlights */}
      <HighlightsSection statsData={statsData} />

      {/* features */}
      <FeaturesSection />

      {/* how it works */}
      <HowItWorksSection />
    </>
  );
}
