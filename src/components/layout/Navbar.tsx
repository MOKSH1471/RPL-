import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Menu, X, ArrowRight } from 'lucide-react';
import { FlipText } from '@/components/ui/RevealLinks';

interface NavbarProps {
  onRegisterClick: () => void;
  currentPage?: 'home' | 'register';
  onNavigateHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRegisterClick,
  currentPage = 'home',
  onNavigateHome,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('about');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tickingRef = useRef(false);



  // Passive, throttled scroll observer for background blur state
  useEffect(() => {
    const handleScroll = () => {
      if (!tickingRef.current) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;

          // Threshold check (~60px)
          setIsScrolled(scrollY > 60);

          // Active section check (desktop only to prevent mobile re-renders)
          if (window.innerWidth >= 768) {
            const scrollPosition = scrollY + 220;
            const sections = ['about', 'leagues', 'gallery', 'how-it-works', 'register'];

            for (const sectionId of sections) {
              const element = document.getElementById(sectionId);
              if (element) {
                const top = element.offsetTop;
                const height = element.offsetHeight;
                if (scrollPosition >= top && scrollPosition < top + height) {
                  setActiveSection(sectionId);
                  break;
                }
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

  const navItems = [
    { id: 'about', label: 'About', href: '#about' },
    { id: 'leagues', label: 'Leagues', href: '#leagues' },
    { id: 'gallery', label: 'Gallery', href: '#gallery' },
    { id: 'how-it-works', label: 'How It Works', href: '#how-it-works' },
  ];

  const handleNavClick = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (currentPage === 'register' && onNavigateHome) {
      onNavigateHome();
      setTimeout(() => {
        const targetId = href.replace('#', '');
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }
    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (currentPage === 'register' && onNavigateHome) {
      onNavigateHome();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 border-b transition-colors duration-300 w-full max-w-full overflow-hidden ${
        isScrolled
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
            className="flex items-center space-x-1.5 sm:space-x-3 group shrink-0 min-w-0"
          >
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 p-0.5 border border-slate-200 shadow-xs shrink-0">
              <div className="w-full h-full bg-white rounded-[9px] sm:rounded-[14px] flex items-center justify-center">
                <Trophy className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-600 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-display font-extrabold text-xs sm:text-lg text-slate-900 tracking-tight whitespace-nowrap">
                RPL <span className="text-amber-600">Season 9</span>
              </span>
              <span className="text-[7px] sm:text-[10px] uppercase font-bold tracking-widest text-slate-500 -mt-0.5 whitespace-nowrap">
                Vitraag Vigyaan
              </span>
            </div>
          </a>

          {/* Desktop Motion Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-1 relative">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleNavClick(item.href, e)}
                  className={`relative px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive ? 'text-amber-600' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {item.label}

                  {/* Motion Active Indicator Line */}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Action CTA & Mobile Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            {/* Primary "Register Now" CTA with Character Flip Animation */}
            <motion.button

              type="button"
              initial="initial"
              whileHover="hovered"
              whileTap="hovered"
              onClick={() => {
                setMobileMenuOpen(false);
                onRegisterClick();
              }}
              className="py-1.5 px-2.5 sm:px-5 sm:py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-wider shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center min-h-[32px] sm:min-h-[40px] touch-manipulation cursor-pointer border border-amber-300/30 shrink-0 whitespace-nowrap"
            >
              <FlipText>Register Now</FlipText>
            </motion.button>




            {/* Mobile Hamburger Toggle */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs min-h-[34px] min-w-[34px] flex items-center justify-center touch-manipulation shrink-0 cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-Out Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden max-h-[calc(100vh-4rem)] overflow-y-auto pb-2"
            >
              <div className="my-1.5 p-3 sm:p-4 rounded-2xl bg-white/95 border border-slate-200 shadow-xl backdrop-blur-xl space-y-1">
                <nav className="flex flex-col space-y-0.5">
                  {navItems.map((item) => {
                    return (
                      <a
                        key={item.id}
                        href={item.href}
                        onClick={(e) => handleNavClick(item.href, e)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-800 hover:bg-slate-50 transition-all min-h-[40px] active:bg-amber-50"
                      >
                        <span>{item.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </a>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Navbar;
