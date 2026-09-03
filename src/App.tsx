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
import { AdminPortal } from '@/components/admin/AdminPortal';
import { Footer } from '@/components/layout/Footer';
import { LeagueType } from '@/types';

export function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'register' | 'admin'>('home');
  const [selectedLeague, setSelectedLeague] = useState<LeagueType>('cricket');
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const checkRoute = () => {
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();

      if (path === '/admin' || path.startsWith('/admin') || hash === '#/admin' || hash === '#admin') {
        setCurrentPage('admin');
        setShowIntro(false);
      } else if (path === '/register' || path.startsWith('/register') || hash === '#/register' || hash === '#register') {
        setCurrentPage('register');
        setShowIntro(false);
      } else {
        setCurrentPage('home');
      }
    };

    checkRoute();

    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);
    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
    };
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
    if (window.location.pathname !== '/' && window.location.pathname !== '') {
      window.history.pushState(null, '', '/');
    }
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentPage === 'admin') {
    return <AdminPortal onBackToHome={handleBackToHome} />;
  }

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

        <Footer onRegisterClick={handleRegisterClick} />
      </div>
    </div>
  );
}

export default App;
