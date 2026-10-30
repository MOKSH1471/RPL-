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
import { FAQPage } from '@/components/pages/FAQPage';
import { RulesPage } from '@/components/pages/RulesPage';
import { SchedulePage } from '@/components/pages/SchedulePage';
import { ScorecardPage } from '@/components/scorecard/ScorecardPage';
import { PostAuctionLockedPage } from '@/components/ui/PostAuctionLockedPage';
import { checkIsAdminPreview, lockAdminPreview } from '@/lib/previewAuth';
import { Footer } from '@/components/layout/Footer';
import { MobileStickyBar } from '@/components/layout/MobileStickyBar';
import { CheckStatusModal } from '@/components/ui/CheckStatusModal';
import { LeagueType } from '@/types';
import { warmUpBackend } from '@/lib/api';

export function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'register' | 'privacy' | 'terms' | 'faq' | 'scorecard' | 'rules' | 'schedule'>('home');
  const [selectedLeague, setSelectedLeague] = useState<LeagueType>('cricket');
  const [showIntro, setShowIntro] = useState(true);
  const [isCheckStatusOpen, setIsCheckStatusOpen] = useState(false);
  const [checkStatusMobile, setCheckStatusMobile] = useState('');
  const [registrationPrefill, setRegistrationPrefill] = useState<any>(null);
  const [isAdminPreview, setIsAdminPreview] = useState<boolean>(() => checkIsAdminPreview());

  // Background server spin-up on visit
  useEffect(() => {
    warmUpBackend();
  }, []);

  useEffect(() => {
    const parseParams = () => {
      const searchParams = new URLSearchParams(window.location.search);
      let hashQuery = '';
      if (window.location.hash && window.location.hash.includes('?')) {
        hashQuery = window.location.hash.substring(window.location.hash.indexOf('?'));
      }
      const hashParams = new URLSearchParams(hashQuery);

      const urlMob = searchParams.get('mobile') || searchParams.get('phone') || searchParams.get('check') || hashParams.get('mobile') || hashParams.get('phone') || hashParams.get('check');
      const openCheckPass = searchParams.get('checkPass') === '1' || hashParams.get('checkPass') === '1';

      if (urlMob && urlMob.replace(/\D/g, '').length === 10) {
        setCheckStatusMobile(urlMob.replace(/\D/g, ''));
        setIsCheckStatusOpen(true);
      } else if (openCheckPass) {
        setIsCheckStatusOpen(true);
      }

      if (checkIsAdminPreview()) {
        setIsAdminPreview(true);
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
      } else if (path === '/faq' || hash === '#/faq' || hash === '#faq') {
        setCurrentPage('faq');
      } else if (
        path === '/rules' ||
        path.startsWith('/rules') ||
        hash === '#/rules' ||
        hash === '#rules' ||
        hash === '#/rules-regulations' ||
        hash === '#rules-regulations'
      ) {
        setCurrentPage('rules');
        setShowIntro(false);
      } else if (
        path === '/schedule' ||
        path.startsWith('/schedule') ||
        hash === '#/schedule' ||
        hash === '#schedule'
      ) {
        setCurrentPage('schedule');
        setShowIntro(false);
      } else if (
        path === '/scorecard' ||
        path.startsWith('/scorecard') ||
        hash === '#/scorecard' ||
        hash === '#scorecard' ||
        path === '/matches' ||
        path.startsWith('/matches') ||
        hash === '#/matches' ||
        hash === '#matches'
      ) {
        setCurrentPage('scorecard');
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
    setRegistrationPrefill(null);
    setCurrentPage('register');
    window.location.hash = '/register';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 20);
  };

  const handleRegisterClick = () => {
    setSelectedLeague('cricket');
    setRegistrationPrefill(null);
    setCurrentPage('register');
    window.location.hash = '/register';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 20);
  };

  const handleRegisterNewPlayer = (prefillData: any) => {
    setIsCheckStatusOpen(false);
    setSelectedLeague('cricket');
    setRegistrationPrefill(prefillData);
    setCurrentPage('register');
    window.location.hash = '/register';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 20);
  };

  const handleScorecardClick = () => {
    setCurrentPage('scorecard');
    window.location.hash = '/scorecard';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRulesClick = () => {
    setCurrentPage('rules');
    window.location.hash = '/rules';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setSelectedLeague('cricket');
    setRegistrationPrefill(null);
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

  if (currentPage === 'faq') {
    return <FAQPage onBackToHome={handleBackToHome} onRegisterClick={handleRegisterClick} />;
  }

  if (currentPage === 'rules' && isAdminPreview) {
    return (
      <RulesPage
        onBackToHome={handleBackToHome}
        onRegisterClick={handleRegisterClick}
        onCheckPassClick={() => setIsCheckStatusOpen(true)}
      />
    );
  }

  if (currentPage === 'schedule') {
    return (
      <SchedulePage
        onBackToHome={handleBackToHome}
        onRegisterClick={handleRegisterClick}
        onCheckPassClick={() => setIsCheckStatusOpen(true)}
      />
    );
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
          onSpectatorClick={() => handleSelectLeague('spectator')}
          currentPage={currentPage}
          onNavigateHome={handleBackToHome}
          onCheckPassClick={() => setIsCheckStatusOpen(true)}
          onScorecardClick={handleScorecardClick}
          onRulesClick={handleRulesClick}
          isAdminPreview={isAdminPreview}
        />

        <main>
          {currentPage === 'register' ? (
            <RegistrationPage
              key={`${selectedLeague}-${registrationPrefill ? 'prefill' : 'default'}`}
              initialLeague={selectedLeague}
              initialPrefillData={registrationPrefill}
              onBackToHome={handleBackToHome}
              onOpenCheckStatus={(mobile) => {
                if (mobile) setCheckStatusMobile(mobile);
                setIsCheckStatusOpen(true);
              }}
            />
          ) : currentPage === 'scorecard' ? (
            !isAdminPreview ? (
              <PostAuctionLockedPage
                type="scorecard"
                onBackToHome={handleBackToHome}
                onUnlocked={() => setIsAdminPreview(true)}
                onRegisterClick={handleRegisterClick}
              />
            ) : (
              <ScorecardPage onBackToHome={handleBackToHome} />
            )
          ) : currentPage === 'rules' ? (
            <PostAuctionLockedPage
              type="rules"
              onBackToHome={handleBackToHome}
              onUnlocked={() => setIsAdminPreview(true)}
              onRegisterClick={handleRegisterClick}
            />
          ) : (
            <>
              <HeroSection
                onSelectLeague={handleSelectLeague}
                onRegisterClick={handleRegisterClick}
                onSpectatorClick={() => handleSelectLeague('spectator')}
                onCheckPassClick={() => setIsCheckStatusOpen(true)}
              />
              <AboutSection />
              <LeaguesSection onSelectLeague={handleSelectLeague} />
              <ScheduleSection onRegisterClick={handleRegisterClick} />
              <GallerySection />
              <HowItWorksSection />
            </>
          )}
        </main>

        <Footer
          onRegisterClick={handleRegisterClick}
          onCheckPassClick={() => setIsCheckStatusOpen(true)}
          isAdminPreview={isAdminPreview}
        />

        {/* Floating indicator when Admin Preview Mode is active */}
        {isAdminPreview && (
          <div className="fixed bottom-3 right-3 z-50 flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-950/90 text-amber-300 border border-amber-400/40 text-xs font-bold shadow-2xl backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Admin Preview Active</span>
            <button
              type="button"
              onClick={() => {
                lockAdminPreview();
                setIsAdminPreview(false);
              }}
              className="ml-1 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] uppercase font-bold transition-colors cursor-pointer"
              title="Lock preview mode"
            >
              Lock
            </button>
          </div>
        )}

        {/* Mobile Sticky Quick Action Bar (Option 1) */}
        {currentPage === 'home' && (
          <MobileStickyBar
            onSpectatorClick={() => handleSelectLeague('spectator')}
            onRegisterClick={handleRegisterClick}
          />
        )}

        {/* Global Check Pass Modal */}
        <CheckStatusModal
          isOpen={isCheckStatusOpen}
          onClose={() => {
            setIsCheckStatusOpen(false);
          }}
          initialMobile={checkStatusMobile}
          onRegisterNewPlayer={handleRegisterNewPlayer}
        />
      </div>
    </div>
  );
}

export default App;
