import React from 'react';
import { KineticText } from '@/components/ui/KineticText';
import { Calendar, MapPin, ChevronRight, Zap } from 'lucide-react';

interface HeroSectionProps {
  onSelectLeague: (league: 'cricket' | 'football' | 'womens') => void;
  onRegisterClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSelectLeague,
  onRegisterClick,
}) => {
  const tickerItems = [
    'Raj Premier League',
    'Cricket League',
    'Football League',
    "Women's Sports",
    'Vitraag Vigyaan',
    'Season 9 Championship',
    'Register Now',
  ];

  return (
    <section className="relative pt-20 pb-10 sm:pt-28 sm:pb-16 md:pt-40 md:pb-28 overflow-hidden min-h-[85vh] md:min-h-screen flex flex-col justify-between w-full max-w-full">
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10 my-auto text-center">
        {/* Main Display Headline scaling smoothly on all mobile screens */}
        <h1 className="font-display font-extrabold tracking-tight leading-[1.1] mb-3 sm:mb-6 max-w-full">
          <span className="block text-slate-900 text-3xl sm:text-5xl md:text-6xl lg:text-7xl break-words">
            Raj Premier League
          </span>
          <span className="block text-gradient-vibrant text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            Season 9
          </span>
        </h1>

        {/* Subtitle Description */}
        <p className="max-w-2xl mx-auto text-slate-700 text-xs sm:text-base md:text-lg font-medium leading-relaxed mb-6 sm:mb-10 px-2">
          The ultimate community sports championship presented by Vitraag Vigyaan. Three epic leagues —{' '}
          <span className="text-amber-600 font-bold">Cricket</span>,{' '}
          <span className="text-emerald-600 font-bold">Football</span>, and{' '}
          <span className="text-pink-600 font-bold">Women's Sports</span>. Step up and claim your glory.
        </p>

        {/* Info Chips: Dates & Venue — cleanly wrapping without overflow */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mb-8 sm:mb-12 max-w-full px-1">
          <div className="flex items-center space-x-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-xs text-xs sm:text-sm font-bold text-slate-800 min-h-[38px] sm:min-h-[44px]">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-600 shrink-0" />
            <span>Season Kickoff Coming Soon</span>
          </div>
          <div className="flex items-center space-x-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-xs text-xs sm:text-sm font-bold text-slate-800 min-h-[38px] sm:min-h-[44px]">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
            <span>Main Arena Grounds</span>
          </div>
          <div className="flex items-center space-x-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-xs text-xs sm:text-sm font-bold text-slate-800 min-h-[38px] sm:min-h-[44px]">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
            <span>Open Registration</span>
          </div>
        </div>

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
      </div>

      {/* Kinetic Velocity Text Marquee Banner */}
      <div className="w-full max-w-full border-y border-slate-200 bg-white/80 my-4 sm:my-8 overflow-hidden shadow-xs">
        <KineticText items={tickerItems} />
      </div>
    </section>
  );
};

export default HeroSection;
