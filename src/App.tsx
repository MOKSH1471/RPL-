import React, { useState, useEffect } from 'react';
import { MeshGradient } from '@/components/ui/MeshGradient';
import { IntroSplash } from '@/components/ui/IntroSplash';
import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { LeaguesSection } from '@/components/sections/LeaguesSection';
import { GallerySection } from '@/components/sections/GallerySection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { RegistrationPage } from '@/components/pages/RegistrationPage';
import { Footer } from '@/components/layout/Footer';
import { LeagueType } from '@/types';

export function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'register'>('home');
  const [selectedLeague, setSelectedLeague] = useState<LeagueType>('cricket');
  const [showIntro, setShowIntro] = useState(true);

  // Always start at landing page on fresh entry / reload
  useEffect(() => {
    if (window.location.hash === '#/register' || window.location.hash === '#register') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setCurrentPage('home');

    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/register' || hash === '#register') {
        setCurrentPage('register');
      } else if (hash === '#/home' || hash === '#home' || hash === '') {
        setCurrentPage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectLeague = (league: LeagueType) => {
    setSelectedLeague(league);
    setCurrentPage('register');
    window.location.hash = '/register';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegisterClick = () => {
    setCurrentPage('register');
    window.location.hash = '/register';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    window.location.hash = '/home';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden text-slate-900 bg-slate-50 selection:bg-amber-400 selection:text-slate-950">
      {/* Intro Splash Screen with TextMorph */}
      {showIntro && <IntroSplash onComplete={() => setShowIntro(false)} />}

      {/* Dynamic Radiant Ambient Mesh Gradient Background */}
      <MeshGradient activeLeague={selectedLeague} />

      {/* Main Page Layout Container */}
      <div className="relative z-10 w-full max-w-full overflow-x-hidden">
        <Navbar
          onRegisterClick={handleRegisterClick}
          currentPage={currentPage}
          onNavigateHome={handleBackToHome}
        />

        <main>
          {currentPage === 'register' ? (
            <RegistrationPage
              initialLeague={selectedLeague}
              onBackToHome={handleBackToHome}
            />
          ) : (
            <>
              <HeroSection
                onSelectLeague={handleSelectLeague}
                onRegisterClick={handleRegisterClick}
              />
              <AboutSection />
              <LeaguesSection onSelectLeague={handleSelectLeague} />
              <GallerySection />
              <HowItWorksSection />
            </>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
