import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, Search, Ticket } from 'lucide-react';
import { FlipText } from '@/components/ui/RevealLinks';

interface NavbarProps {
  onRegisterClick: () => void;
  currentPage?: 'home' | 'register' | 'scorer' | 'privacy' | 'terms' | 'faq' | 'scorecard' | 'rules' | 'schedule';
  onNavigateHome?: () => void;
  onScorerClick?: () => void;
  onCheckPassClick?: () => void;
  onSpectatorClick?: () => void;
  onScorecardClick?: () => void;
  onRulesClick?: () => void;
  isAdminPreview?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRegisterClick,
  currentPage = 'home',
  onNavigateHome,
  onScorerClick,
  onCheckPassClick,
  onSpectatorClick,
  onScorecardClick,
  onRulesClick,
  isAdminPreview = false,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('about');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tickingRef = useRef(false);
  const isManualScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Release manual scroll lock if user physically scrolls or interacts
  useEffect(() => {
    const handleUserInteraction = () => {
      if (isManualScrollingRef.current) {
        isManualScrollingRef.current = false;
        if (scrollTimeoutRef.current !== null) {
          window.clearTimeout(scrollTimeoutRef.current);
          scrollTimeoutRef.current = null;
        }
      }
    };

    window.addEventListener('wheel', handleUserInteraction, { passive: true });
    window.addEventListener('touchstart', handleUserInteraction, { passive: true });
    window.addEventListener('scrollend', handleUserInteraction, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('scrollend', handleUserInteraction);
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Passive, throttled scroll observer for background blur state and active section
  useEffect(() => {
    const handleScroll = () => {
      if (!tickingRef.current) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;

          // Threshold check (~60px)
          setIsScrolled(scrollY > 60);

          // Only compute active section if user is scrolling naturally (not during programmatic click animation)
          if (!isManualScrollingRef.current) {
            const isAtBottom =
              window.innerHeight + window.scrollY >=
              document.documentElement.scrollHeight - 80;

            if (isAtBottom) {
              setActiveSection((prev) => (prev !== 'connect' ? 'connect' : prev));
            } else if (scrollY < 120) {
              setActiveSection((prev) => (prev !== 'about' ? 'about' : prev));
            } else {
              const sections = ['about', 'leagues', 'schedule', 'gallery', 'connect'];
              let currentSection = '';

              for (const sectionId of sections) {
                const element = document.getElementById(sectionId);
                if (element) {
                  const rect = element.getBoundingClientRect();
                  if (rect.top <= 180 && rect.bottom >= 100) {
                    currentSection = sectionId;
                    break;
                  }
                }
              }

              if (currentSection) {
                setActiveSection((prev) => (prev !== currentSection ? currentSection : prev));
              }
            }
          }

          tickingRef.current = false;
        });

        tickingRef.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const allNavItems = [
    { id: 'about', label: 'About', href: '#about' },
    { id: 'leagues', label: 'Leagues', href: '#leagues' },
    { id: 'schedule', label: 'Schedule', href: '#/schedule', isRoute: true },
    { id: 'gallery', label: 'Gallery', href: '#gallery' },
    { id: 'rules', label: 'Rules', href: '#/rules', isRoute: true, adminOnly: true },
    { id: 'faq', label: 'FAQ', href: '#/faq', isRoute: true },
    { id: 'connect', label: 'Connect with RPL', href: '#connect' },
  ];

  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdminPreview);

  const handleItemClick = (
    item: { id: string; label: string; href: string; isRoute?: boolean },
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    if (item.isRoute && item.id === 'rules' && onRulesClick) {
      document.body.style.overflow = '';
      setMobileMenuOpen(false);
      onRulesClick();
      return;
    }
    if (item.isRoute && item.id === 'schedule') {
      document.body.style.overflow = '';
      setMobileMenuOpen(false);
      window.location.hash = '/schedule';
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    handleNavClick(item.href, e);
  };

  const scrollToElement = (targetId: string) => {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;

    const navbarOffset = 70;
    const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = Math.max(0, elementPosition - navbarOffset);

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  };

  const handleNavClick = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (href === '#/faq' || href === '#faq') {
      window.location.hash = '/faq';
      document.body.style.overflow = '';
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    const targetId = href.replace('#', '');
    setActiveSection(targetId);

    // Lock scroll tracking so smooth scrolling through intermediate sections doesn't interrupt or stutter the indicator
    isManualScrollingRef.current = true;
    if (scrollTimeoutRef.current !== null) {
      window.clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = window.setTimeout(() => {
      isManualScrollingRef.current = false;
      scrollTimeoutRef.current = null;
    }, 1000);

    document.body.style.overflow = '';
    setMobileMenuOpen(false);

    if (currentPage !== 'home' && onNavigateHome) {
      onNavigateHome();
      setTimeout(() => {
        scrollToElement(targetId);
      }, 150);
      return;
    }

    setTimeout(() => {
      scrollToElement(targetId);
    }, 50);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveSection('about');

    isManualScrollingRef.current = true;
    if (scrollTimeoutRef.current !== null) {
      window.clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = window.setTimeout(() => {
      isManualScrollingRef.current = false;
      scrollTimeoutRef.current = null;
    }, 1000);

    document.body.style.overflow = '';
    setMobileMenuOpen(false);
    if (currentPage !== 'home' && onNavigateHome) {
      onNavigateHome();
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 border-b transition-colors duration-300 w-full max-w-full ${isScrolled || mobileMenuOpen
          ? 'bg-white/95 backdrop-blur-md border-slate-200/80 shadow-xs'
          : 'bg-white/75 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none border-slate-200/50 sm:border-transparent'
          }`}
      >
        <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-20 gap-1.5 sm:gap-2">
            {/* Logo & RPL Wordmark */}
            <a
              href="#"
              onClick={handleLogoClick}
              className="flex items-center space-x-2 sm:space-x-3 group shrink-0 min-w-0"
            >
              <img
                src="/rpl-logo.png"
                alt="RPL Logo"
                className="h-9 sm:h-11 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform drop-shadow-xs"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-display font-extrabold text-xs sm:text-lg text-slate-900 tracking-tight whitespace-nowrap leading-tight">
                  RPL <span className="text-amber-600">Season 9</span>
                </span>
                <span className="text-[9.5px] sm:text-[12px] font-bold text-slate-700 sm:text-slate-800 mt-0.5 whitespace-nowrap tracking-normal">
                  &ldquo;जीतने से ज़्यादा, जिताने वाले महान है।&rdquo;
                </span>
              </div>
            </a>

            {/* Desktop Motion Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-0.5 lg:space-x-1 relative shrink-0">
              {navItems.map((item) => {
                const isActive = item.isRoute
                  ? currentPage === item.id
                  : activeSection === item.id && currentPage === 'home';
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => handleItemClick(item, e)}
                    className={`relative px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${isActive ? 'text-amber-600 font-bold' : 'text-slate-700 hover:text-slate-900'
                      }`}
                  >
                    <span className="whitespace-nowrap">{item.label}</span>

                    {/* Motion Active Indicator Line */}
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-indicator"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
                        transition={{
                          type: 'spring',
                          stiffness: 350,
                          damping: 30,
                          mass: 0.8,
                        }}
                      />
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Right Action CTA & Mobile Controls */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              {/* Live Matches & Scorecard CTA (Visible when admin preview is enabled) */}
              {onScorecardClick && isAdminPreview && (
                <button
                  type="button"
                  onClick={() => {
                    document.body.style.overflow = '';
                    setMobileMenuOpen(false);
                    onScorecardClick();
                  }}
                  className="py-1 px-2.5 sm:px-3 sm:py-1.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider flex items-center space-x-1.5 border border-slate-800 shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer shrink-0 whitespace-nowrap"
                  title="View Live Matches & Scores"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-amber-400 font-extrabold">LIVE</span>
                  <span className="hidden sm:inline">Matches</span>
                </button>
              )}

              {/* Spectator Reg CTA */}
              <button
                type="button"
                onClick={() => {
                  document.body.style.overflow = '';
                  setMobileMenuOpen(false);
                  onSpectatorClick?.();
                }}
                className="hidden lg:inline-flex items-center space-x-1.5 py-1 px-3 sm:py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300/80 font-bold text-[10px] sm:text-xs uppercase tracking-wider shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer shrink-0 whitespace-nowrap"
                title="Check Registration Pass or Pay Pending Dues"
              >
                <Ticket className="w-3.5 h-3.5 text-amber-600" />
                <span>Spectator Registration</span>
              </button>

              {/* Primary "Register Now" CTA with Character Flip Animation */}
              <motion.button
                type="button"
                initial="initial"
                whileHover="hovered"
                whileTap="hovered"
                onClick={() => {
                  document.body.style.overflow = '';
                  setMobileMenuOpen(false);
                  onRegisterClick();
                }}
                className="hidden sm:flex py-1.5 px-3 sm:px-5 sm:py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-wider shadow-sm hover:shadow-md active:scale-95 transition-all items-center justify-center min-h-[32px] sm:min-h-[40px] touch-manipulation cursor-pointer border border-amber-300/30 shrink-0 whitespace-nowrap"
              >
                <FlipText>Player Registration</FlipText>
              </motion.button>

              {/* Mobile Hamburger Toggle (3 Bars) */}
              <div className="md:hidden">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`p-1.5 rounded-xl border transition-colors shadow-xs min-h-[36px] min-w-[36px] flex items-center justify-center touch-manipulation shrink-0 cursor-pointer ${mobileMenuOpen
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900'
                    }`}
                  aria-label="Toggle Navigation Menu"
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Dropdown Menu Card */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="md:hidden pb-3 relative z-50"
              >
                <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-2.5">
                  {/* Live Matches & Scorecard Button in Mobile Menu (Visible when admin preview is enabled) */}
                  {onScorecardClick && isAdminPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        document.body.style.overflow = '';
                        setMobileMenuOpen(false);
                        onScorecardClick();
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 transition-all border border-slate-800 cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-extrabold text-white">Live Matches & Scorecards</span>
                      </div>
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-amber-400 text-slate-950">
                        SCORES
                      </span>
                    </button>
                  )}

                  {/* Live Cricket Scorer Button in Mobile Menu */}
                  {onScorerClick && (
                    <button
                      type="button"
                      onClick={() => {
                        document.body.style.overflow = '';
                        setMobileMenuOpen(false);
                        onScorerClick();
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 transition-all border border-amber-200 cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span className="font-extrabold text-slate-900">Live Cricket Scorer</span>
                      </div>
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-amber-300 text-amber-950">
                        LIVE
                      </span>
                    </button>
                  )}

                  {/* Navigation Links with Proper Smooth Scroll */}
                  <nav className="flex flex-col space-y-1">
                    {navItems.map((item) => {
                      const isActive = item.isRoute
                        ? currentPage === item.id
                        : activeSection === item.id && currentPage === 'home';
                      return (
                        <a
                          key={item.id}
                          href={item.href}
                          onClick={(e) => handleItemClick(item, e)}
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all min-h-[42px] cursor-pointer ${isActive
                            ? 'bg-amber-100/90 text-amber-950 font-extrabold border border-amber-300 shadow-2xs'
                            : 'text-slate-800 hover:bg-slate-50 active:bg-slate-100'
                            }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            {isActive ? (
                              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-transparent shrink-0" />
                            )}
                            <span>{item.label}</span>
                          </div>
                          <ArrowRight className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-amber-700' : 'text-slate-400'}`} />
                        </a>
                      );
                    })}
                  </nav>

                  {/* Bottom Register CTA in Mobile Menu */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        document.body.style.overflow = '';
                        setMobileMenuOpen(false);
                        onRegisterClick();
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer min-h-[42px]"
                    >
                      <span>Player Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        document.body.style.overflow = '';
                        setMobileMenuOpen(false);
                        onSpectatorClick?.();
                      }}
                      className="w-full py-2 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-extrabold text-xs uppercase tracking-wider border border-amber-300 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer min-h-[38px]"
                    >
                      <Ticket className="w-3.5 h-3.5 text-amber-600" />
                      <span>Spectator Registration</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Background Dim Backdrop when Mobile Menu is Open */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              document.body.style.overflow = '';
              setMobileMenuOpen(false);
            }}
            className="md:hidden fixed inset-0 bg-slate-950/25 backdrop-blur-2xs z-30"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
