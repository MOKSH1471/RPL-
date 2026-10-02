import React, { useState, useEffect } from 'react';
import { MeshGradient } from '@/components/ui/MeshGradient';
import { IntroSplash } from '@/components/ui/IntroSplash';
import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { LeaguesSection } from '@/components/sections/LeaguesSection';
import { ScheduleSection } from '@/components/sections/ScheduleSection';
import { GallerySection } from '@/components/sections/GallerySection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { RegistrationPage } from '@/components/pages/RegistrationPage';
import { PrivacyPolicyPage } from '@/components/pages/PrivacyPolicyPage';
import { TermsPage } from '@/components/pages/TermsPage';
import { Footer } from '@/components/layout/Footer';
import { CheckStatusModal } from '@/components/ui/CheckStatusModal';
import { LeagueType } from '@/types';

export function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'register' | 'privacy' | 'terms'>('home');
  const [selectedLeague, setSelectedLeague] = useState<LeagueType>('cricket');
  const [showIntro, setShowIntro] = useState(true);
  const [isCheckStatusOpen, setIsCheckStatusOpen] = useState(false);
  const [checkStatusMobile, setCheckStatusMobile] = useState('');
  const [autoTriggerPay, setAutoTriggerPay] = useState(false);

  useEffect(() => {
    const parseParams = () => {
      const searchParams = new URLSearchParams(window.location.search);
      let hashQuery = '';
      if (window.location.hash && window.location.hash.includes('?')) {
        hashQuery = window.location.hash.substring(window.location.hash.indexOf('?'));
      }
      const hashParams = new URLSearchParams(hashQuery);

      const urlMob = searchParams.get('mobile') || searchParams.get('phone') || searchParams.get('check') || hashParams.get('mobile') || hashParams.get('phone') || hashParams.get('check');
      const shouldPay = searchParams.get('pay') === '1' || searchParams.get('pay') === 'true' || hashParams.get('pay') === '1' || hashParams.get('pay') === 'true';
      const openCheckPass = searchParams.get('checkPass') === '1' || hashParams.get('checkPass') === '1';

      if (urlMob && urlMob.replace(/\D/g, '').length === 10) {
        setCheckStatusMobile(urlMob.replace(/\D/g, ''));
        setAutoTriggerPay(shouldPay);
        setIsCheckStatusOpen(true);
      } else if (openCheckPass) {
        setIsCheckStatusOpen(true);
      }
    };

    parseParams();
    window.addEventListener('hashchange', parseParams);
    return () => window.removeEventListener('hashchange', parseParams);
  }, []);

  useEffect(() => {
    const checkRoute = () => {
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();

      if (path === '/register' || path.startsWith('/register') || hash === '#/register' || hash === '#register') {
        setCurrentPage('register');
        setShowIntro(false);
      } else if (hash === '#/privacy-policy' || hash === '#privacy-policy') {
        setCurrentPage('privacy');
        setShowIntro(false);
      } else if (hash === '#/terms' || hash === '#terms') {
        setCurrentPage('terms');
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

  if (currentPage === 'privacy') {
    return <PrivacyPolicyPage onBackToHome={handleBackToHome} />;
  }

  if (currentPage === 'terms') {
    return <TermsPage onBackToHome={handleBackToHome} />;
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
          onCheckPassClick={() => setIsCheckStatusOpen(true)}
        />

        <main>
          {currentPage === 'register' ? (
            <RegistrationPage
              initialLeague={selectedLeague}
              onBackToHome={handleBackToHome}
              onOpenCheckStatus={(mobile) => {
                if (mobile) setCheckStatusMobile(mobile);
                setIsCheckStatusOpen(true);
              }}
            />
          ) : (
            <>
              <HeroSection
                onSelectLeague={handleSelectLeague}
                onRegisterClick={handleRegisterClick}
              />
              <AboutSection />
              <LeaguesSection onSelectLeague={handleSelectLeague} />
              <ScheduleSection onRegisterClick={handleRegisterClick} />
              <GallerySection />
              <HowItWorksSection />
            </>
          )}
        </main>

        <Footer onRegisterClick={handleRegisterClick} />

        {/* Global Check Pass / Pay Due Modal */}
        <CheckStatusModal
          isOpen={isCheckStatusOpen}
          onClose={() => {
            setIsCheckStatusOpen(false);
            setAutoTriggerPay(false);
          }}
          initialMobile={checkStatusMobile}
          autoTriggerPay={autoTriggerPay}
        />
      </div>
    </div>
  );
}

export default App;
