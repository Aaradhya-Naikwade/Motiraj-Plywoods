import Features from "@/components/Features";
import Hero from "@/components/Hero";
import MatchesSection from "@/components/MatchesSection";
import WhyShopSection from "@/components/WhyShopSection";
import LoveSection from "@/components/LoveSection";
import NewArrivalSection from "@/components/NewArrivalSection";
import LuxuryExperienceSection from "@/components/LuxuryExperienceSection";
import MotirajGallerySection from "@/components/MotirajGallerySection";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fdf9f1]">
      <Hero />
      <Features />
      <MatchesSection />
      <WhyShopSection />
      <LoveSection />
      <NewArrivalSection />
      <LuxuryExperienceSection />
      <MotirajGallerySection />
    </main>
  );
}