import React, { useEffect, useState } from 'react';
import TextMorph from './TextMorph';
import { Flame, ArrowRight } from 'lucide-react';

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleEnter();
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  const handleEnter = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-[#FFFDF5] via-[#F8FAFC] to-[#F1F5F9] transition-all duration-500 ease-in-out touch-manipulation ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-105 filter blur-sm' : 'opacity-100'
      }`}
    >
      {/* Top Branding Bar */}
      <div className="w-full flex justify-between items-center max-w-7xl mx-auto pt-2 sm:pt-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-amber-300 shadow-sm">
          <Flame className="w-4 h-4 text-amber-600" />
          <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-amber-700">
            VITRAAG VIGYAAN
          </span>
        </div>

        <button
          onClick={handleEnter}
          onTouchStart={handleEnter}
          className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3.5 py-2 min-h-[40px] rounded-full bg-white border border-slate-200 shadow-sm active:bg-slate-100 transition-colors uppercase tracking-widest touch-manipulation"
        >
          Skip Intro →
        </button>
      </div>

      {/* Center Text Morph Container */}
      <div className="w-full max-w-5xl h-64 sm:h-80 flex items-center justify-center my-auto px-1 sm:px-4 overflow-visible">
        <TextMorph
          words={"ARE YOU\nREADY?\nRAJ PREMIER LEAGUE\nSEASON 9"}
          color="#0F172A"
          transition={{
            duration: 0.6,
            delay: 0.35,
            ease: "backOut",
          }}
          font={{
            fontFamily: "Syne, sans-serif",
            fontWeight: "800",
            fontSize: "clamp(1.05rem, 4.6vw, 3.2rem)",
            lineHeight: "1.2em",
            letterSpacing: "0.01em",
            textAlign: "center",
          }}
        />
      </div>

      {/* Bottom Action Button & Progress Line */}
      <div className="w-full max-w-md mx-auto mb-4 sm:mb-6 text-center space-y-4 px-4">
        <button
          onClick={handleEnter}
          onTouchStart={handleEnter}
          className="w-full py-4 px-6 sm:px-8 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-base md:text-lg transition-all shadow-md active:scale-95 flex items-center justify-center space-x-3 group min-h-[48px] touch-manipulation"
        >
          <span>Enter Championship</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-full w-full animate-marquee" />
        </div>
      </div>
    </div>
  );
};
