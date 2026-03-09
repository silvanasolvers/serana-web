import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll } from '@react-three/drei';
import LiquidBackground from '../components/Experience/LiquidBackground';
import HeroSection from '../components/Experience/HeroSection';
import CoreADNSection from '../components/Experience/CoreADNSection';
import ProfilesSection from '../components/Experience/ProfilesSection';
import EcommerceSection from '../components/Experience/EcommerceSection';

export default function LandingPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#FEFADF]">
      {/* Background Canvas */}
      <LiquidBackground />

      {/* Main Content */}
      <main className="relative z-10 w-full h-full overflow-y-auto snap-y snap-mandatory scroll-smooth">
        <section className="h-screen snap-start">
          <HeroSection />
        </section>
        <section className="min-h-screen snap-start">
          <CoreADNSection />
        </section>
        <section className="h-screen snap-start">
          <ProfilesSection />
        </section>
        <section className="h-screen snap-start">
          <EcommerceSection />
        </section>
      </main>
    </div>
  );
}
