import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import TextMorph from './TextMorph';
import { Flame, ArrowRight } from 'lucide-react';

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const completedRef = useRef(false);

  const handleEnter = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsFadingOut(true);
    setTimeout(() => onComplete(), 500);
  };

  useEffect(() => {
    // Allows full TextMorph cycle ("SEASON 9") before smooth transition to site
    const timer = setTimeout(() => handleEnter(), 4200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-[#FFFDF5] via-[#F8FAFC] to-[#F1F5F9] transition-all duration-500 ease-in-out touch-manipulation ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-105 blur-sm' : 'opacity-100'
      }`}
    >
      {/* Top Branding Bar */}
      <div className="w-full flex justify-between items-center max-w-7xl mx-auto pt-1 sm:pt-4 px-0.5 sm:px-0 gap-2 select-none">
        <div className="inline-flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-amber-300/90 shadow-xs shrink-0">
          <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-800 whitespace-nowrap">
            Raj Premier League
          </span>
        </div>

        <button
          type="button"
          onClick={handleEnter}
          onTouchStart={handleEnter}
          className="inline-flex items-center space-x-1 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200 hover:border-slate-300 shadow-xs active:bg-slate-100 transition-colors text-[10px] sm:text-xs font-bold text-slate-700 hover:text-slate-900 uppercase tracking-wider whitespace-nowrap shrink-0 touch-manipulation cursor-pointer"
        >
          <span>Skip Intro</span>
          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
        </button>
      </div>

      {/* Center Content: RPL Logo + Quote + Text Morph */}
      <div className="w-full max-w-5xl flex flex-col items-center justify-center my-auto px-2 sm:px-4 space-y-2 sm:space-y-4 overflow-visible">
        <div className="relative animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center">
          <div className="absolute -inset-10 sm:-inset-14 bg-amber-400/25 rounded-full blur-2xl pointer-events-none animate-pulse-slow" />
          
          {/* Logo with masked shiny sweep animation */}
          <div className="relative inline-block">
            <img
              src="/rpl-logo.png"
              alt="RPL Logo"
              className="relative h-44 xs:h-48 sm:h-56 md:h-64 max-h-[26vh] w-auto object-contain drop-shadow-xl select-none pointer-events-none"
            />
            {/* Glossy light sheen layer swept across the logo silhouette */}
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              style={{
                maskImage: 'url(/rpl-logo.png)',
                WebkitMaskImage: 'url(/rpl-logo.png)',
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
              }}
            >
              <div className="absolute inset-y-0 w-32 sm:w-44 bg-gradient-to-r from-transparent via-white/85 to-transparent animate-logo-shine" />
            </div>
          </div>

          {/* Hindi Quote with synchronized golden shine sweep */}
          <div className="relative inline-block mt-2 sm:mt-3">
            <p className="text-base sm:text-xl md:text-2xl font-extrabold text-amber-950 tracking-wide text-center drop-shadow-xs font-display">
              &ldquo;जीतने से ज़्यादा, जिताने वाले महान है।&rdquo;
            </p>
            <p
              aria-hidden="true"
              className="absolute inset-0 text-base sm:text-xl md:text-2xl font-extrabold tracking-wide text-center font-display pointer-events-none select-none quote-shine-sync"
            >
              &ldquo;जीतने से ज़्यादा, जिताने वाले महान है।&rdquo;
            </p>
          </div>
        </div>

        <div className="w-full h-36 sm:h-44 flex items-center justify-center overflow-visible">
          <TextMorph
            words={"ARE YOU\nREADY?\nRAJ PREMIER LEAGUE\nSEASON 9"}
            color="#0F172A"
            loop={false}
            transition={{ duration: 0.6, delay: 0.35, ease: 'backOut' }}
            font={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: '800',
              fontSize: 'clamp(1.05rem, 4.6vw, 3.2rem)',
              lineHeight: '1.2em',
              letterSpacing: '0.01em',
              textAlign: 'center',
            }}
          />
        </div>
      </div>

      {/* Bottom Action Button & Progress Line */}
      <div className="w-full max-w-md mx-auto mb-4 sm:mb-6 text-center space-y-4 px-4">
        <button
          type="button"
          onClick={handleEnter}
          onTouchStart={handleEnter}
          className="w-full py-4 px-6 sm:px-8 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-base md:text-lg transition-all shadow-md active:scale-95 flex items-center justify-center space-x-3 group min-h-[48px] touch-manipulation cursor-pointer"
        >
          <span>Enter Championship</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Accurate Countdown Progress Bar (0% -> 100% over 4.2s) */}
        <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 h-full rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 4.2, ease: 'linear' }}
          />
        </div>
      </div>
    </div>
  );
};
