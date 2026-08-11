import React, { useState } from 'react';
import { MeshGradient } from '@/components/ui/MeshGradient';
import { IntroSplash } from '@/components/ui/IntroSplash';
import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { LeaguesSection } from '@/components/sections/LeaguesSection';
import { GallerySection } from '@/components/sections/GallerySection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { RegisterSection } from '@/components/sections/RegisterSection';
import { Footer } from '@/components/layout/Footer';
import { LeagueType } from '@/types';

export function App() {
  const [selectedLeague, setSelectedLeague] = useState<LeagueType>('cricket');
  const [showIntro, setShowIntro] = useState(true);

  const handleSelectLeague = (league: LeagueType) => {
    setSelectedLeague(league);
    const registerElement = document.getElementById('register');
    if (registerElement) {
      registerElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRegisterClick = () => {
    const registerElement = document.getElementById('register');
    if (registerElement) {
      registerElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen text-slate-900 bg-slate-50 selection:bg-amber-400 selection:text-slate-950">
      {/* Intro Splash Screen with TextMorph */}
      {showIntro && <IntroSplash onComplete={() => setShowIntro(false)} />}

      {/* Dynamic Radiant Ambient Mesh Gradient Background */}
      <MeshGradient activeLeague={selectedLeague} />

      {/* Main Page Layout Container */}
      <div className="relative z-10">
        <Navbar onRegisterClick={handleRegisterClick} />
        
        <main>
          <HeroSection onSelectLeague={handleSelectLeague} />
          <AboutSection />
          <LeaguesSection onSelectLeague={handleSelectLeague} />
          <GallerySection />
          <HowItWorksSection />
          <RegisterSection
            selectedLeague={selectedLeague}
            onLeagueTabChange={(league) => setSelectedLeague(league)}
          />
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
