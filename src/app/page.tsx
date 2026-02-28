import Features from '@/components/Features';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import MatchesSection from '@/components/MatchesSection';
import ProductSlider from '@/components/ProductSlider';
import WhyShopSection from '@/components/WhyShopSection';
import LoveSection from '@/components/LoveSection';
import NewArrivalSection from '@/components/NewArrivalSection';
import LuxuryExperienceSection from '@/components/LuxuryExperienceSection';
import MotirajGallerySection from '@/components/MotirajGallerySection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fdf9f1]">
      {/* <Header /> */}
      <Hero />
      <Features />
      <MatchesSection/>
      <WhyShopSection/>
      {/* <ProductSlider/> */}
      <LoveSection/>
      <NewArrivalSection/>
      <LuxuryExperienceSection/>
      <MotirajGallerySection/>
      {/* <Footer/> */}

      <div className="m-10">
        
      </div>
    </main>
  );
}