import React from 'react';
import { KineticText } from '@/components/ui/KineticText';
import { ChevronRight, Sparkles, ArrowRight, Ticket } from 'lucide-react';
import { LeagueType } from '@/types';

interface HeroSectionProps {
  onSelectLeague?: (league: LeagueType) => void;
  onRegisterClick?: () => void;
  onSpectatorClick?: () => void;
  onCheckPassClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onRegisterClick,
  onSpectatorClick,
  onCheckPassClick,
}) => {
  const tickerItems = [
    'Raj Premier League',
    'Main Cricket League',
    "Women's Cricket League",
    'Kaccha Pakka Cricket League',
    'Football League',
    'Table Tennis League',
    'Carrom League',
    'Register Now',
  ];

  return (
    <section className="relative pt-20 pb-10 sm:pt-28 sm:pb-16 md:pt-40 md:pb-28 overflow-hidden min-h-[85vh] md:min-h-screen flex flex-col justify-between w-full max-w-full">
      <div className="w-full max-w-5xl lg:max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10 my-auto text-center">
        {/* Main Display Headline (wraps naturally on mobile with bold size like old version, single line on desktop) */}
        <h1 className="font-display font-extrabold tracking-tight leading-[1.1] mb-3 sm:mb-6 max-w-full">
          <span className="block text-slate-900 text-3xl sm:text-5xl md:text-6xl lg:text-[3.25rem] xl:text-[4.25rem] 2xl:text-7xl break-words lg:whitespace-nowrap uppercase tracking-wider">
            Raj Premier League
          </span>
        </h1>

        {/* Subtitle Description with exact requested league sequence */}
        <p className="max-w-3xl mx-auto text-slate-700 text-xs sm:text-base md:text-lg font-medium leading-relaxed mb-6 sm:mb-10 px-2">
          The ultimate turf championship. Six epic leagues —{' '}
          <span className="text-amber-600 font-bold">Main Cricket League</span>,{' '}
          <span className="text-pink-600 font-bold">Women's Cricket League</span>,{' '}
          <span className="text-orange-600 font-bold">Kaccha Pakka Cricket League</span>,{' '}
          <span className="text-emerald-600 font-bold">Football League</span>,{' '}
          <span className="text-sky-600 font-bold">Table Tennis League</span> and{' '}
          <span className="text-purple-600 font-bold">Carrom League</span>. Step up and claim your glory.
        </p>


        {/* Action CTAs with touch-optimized buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-xs sm:max-w-md mx-auto px-1">
          <a
            href="#leagues"
            className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 min-h-[48px] sm:min-h-[52px] rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-sm sm:text-base md:text-lg hover:shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-2 group touch-manipulation shadow-md"
          >
            <span>Choose Your League</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <button
            type="button"
            onClick={onRegisterClick}
            className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 min-h-[48px] sm:min-h-[52px] rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-sm sm:text-base md:text-lg border border-slate-300 shadow-xs active:scale-95 transition-all text-center touch-manipulation"
          >
            Direct Registration
          </button>
        </div>

        {/* Spectator Pass & Already Registered Prompt */}
        <div className="mt-5 sm:mt-7 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 w-full px-1 max-w-full">
          {onSpectatorClick && (
            <button
              type="button"
              onClick={onSpectatorClick}
              className="group inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-5 sm:py-2.5 rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 hover:from-amber-500/25 hover:to-orange-500/25 text-slate-800 hover:text-amber-950 border border-amber-300/80 hover:border-amber-400 shadow-2xs hover:shadow-xs transition-all duration-200 text-[11px] xs:text-xs sm:text-sm font-semibold active:scale-95 cursor-pointer backdrop-blur-xs whitespace-nowrap max-w-full"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0 animate-pulse" />
              <span className="whitespace-nowrap">Attending as a supporter? <strong className="font-extrabold text-amber-700 underline underline-offset-2">Get Spectator Pass</strong></span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0 group-hover:translate-x-1 transition-transform" />
            </button>
          )}

          {onCheckPassClick && (
            <button
              type="button"
              onClick={onCheckPassClick}
              className="group inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-amber-900 border border-slate-200/90 hover:border-amber-300 shadow-2xs hover:shadow-xs transition-all duration-200 text-[11px] xs:text-xs sm:text-sm font-semibold active:scale-95 cursor-pointer backdrop-blur-xs whitespace-nowrap max-w-full"
            >
              <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0 group-hover:rotate-12 transition-transform" />
              <span className="whitespace-nowrap">Already registered? <strong className="font-extrabold text-amber-700 underline underline-offset-2">Check Pass / Pay Due</strong></span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Kinetic Velocity Text Marquee Banner */}
      <div className="w-full max-w-full border-y border-slate-200 bg-white/80 my-4 sm:my-8 overflow-hidden shadow-xs">
        <KineticText items={tickerItems} />
      </div>
    </section>
  );
};

export default HeroSection;
