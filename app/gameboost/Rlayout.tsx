
import Navbar from "@/components/elements/Navbar";
import Footer from "@/components/elements/Footer";
import SmurfPromoCard from "@/components/elements/game/Boosting/SmurfPromoCard";
import HowItWorksSection from "@/components/elements/game/Boosting/HowItWorksSection";
import WhyUsSection from "@/components/elements/game/Boosting/whyUsSection";
import { FaqAccordion } from "@/components/elements/game/Boosting/FaqAccordion";
import MainLayout from "../Mainlayout";
import Marque from "@/components/elements/Marque";




export default function Rlayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <MainLayout>
      {children}
      <SmurfPromoCard />
      <FaqAccordion />
      <HowItWorksSection />
      <Marque />
      <WhyUsSection />  
    </MainLayout>
      
  
    
  );
}
