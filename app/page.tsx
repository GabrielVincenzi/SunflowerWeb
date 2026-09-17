import React from 'react'
import gsap from "gsap";
import { ScrollTrigger, SplitText } from 'gsap/all';
import Hero from "@/components/Hero";
import DockMenu from "@/components/DockMenu";
import DraggableSection from "@/components/DraggableSection";
import StatSection from "@/components/StatSection";
import ZoomSection from "@/components/ZoomSection";
import MarqueeSection from "@/components/MarqueeSection";
import FooterSection from "@/components/FooterSection";
import FAQSection from "@/components/FAQSection";
import Divider from "@/components/Divider";
import HowItWorksSection from "@/components/HowItWorksSection";
import "./globals.css";
import "../styles/fonts.css";

gsap.registerPlugin(ScrollTrigger, SplitText);

function App() {
  return (
    <div className="sf-page">
      <Hero />

      <Divider />

      <ZoomSection />
      <StatSection />
      <HowItWorksSection />

      <Divider />

      <DraggableSection />
      <MarqueeSection />
      <FAQSection />

      <Divider />

      <DockMenu />
      <FooterSection />
    </div>
  )
}

export default App;