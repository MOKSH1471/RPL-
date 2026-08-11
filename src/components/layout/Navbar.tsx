import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Menu, X, ArrowRight } from 'lucide-react';

interface NavbarProps {
  onRegisterClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onRegisterClick }) => {
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
    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 border-b transition-colors duration-300 ${
        isScrolled
          ? 'bg-white/85 backdrop-blur-md border-slate-200/80 shadow-sm'
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & RPL Wordmark */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center space-x-3 group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-pink-500 p-0.5 border border-slate-200 shadow-sm">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-lg sm:text-xl text-slate-900 tracking-wider">
                RPL <span className="text-amber-600">Season 9</span>
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-slate-500 -mt-1">
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
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-pink-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Action CTA & Mobile Controls */}
          <div className="flex items-center space-x-3">
            {/* Primary "Register Now" CTA */}
            <button
              type="button"
              onClick={onRegisterClick}
              className="py-2.5 px-4 sm:px-6 rounded-full bg-gradient-to-r from-amber-500 via-emerald-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white font-extrabold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center space-x-1.5 min-h-[40px] touch-manipulation"
            >
              <span>Register Now</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm min-h-[40px] touch-manipulation"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
              className="md:hidden overflow-hidden"
            >
              <div className="my-2 p-5 rounded-3xl bg-white/95 border border-slate-200 shadow-2xl backdrop-blur-xl space-y-3">
                <nav className="flex flex-col space-y-2">
                  {navItems.map((item) => {
                    return (
                      <a
                        key={item.id}
                        href={item.href}
                        onClick={(e) => handleNavClick(item.href, e)}
                        className="flex items-center justify-between p-3 rounded-xl font-bold text-base text-slate-800 hover:bg-slate-50 transition-all"
                      >
                        <span>{item.label}</span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
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
