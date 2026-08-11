import React from 'react';
import { KineticText } from '@/components/ui/KineticText';
import { Calendar, MapPin, ChevronRight, Zap } from 'lucide-react';

interface HeroSectionProps {
  onSelectLeague: (league: 'cricket' | 'football' | 'womens') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSelectLeague }) => {
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
    <section className="relative pt-28 pb-16 md:pt-40 md:pb-28 overflow-hidden min-h-screen flex flex-col justify-between">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 my-auto text-center">
        {/* Main Display Headline scaling smoothly on mobile screens without overflow */}
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-tight mb-4 sm:mb-6">
          <span className="block text-slate-900">Raj Premier League</span>
          <span className="block text-gradient-vibrant">
            Season 9
          </span>
        </h1>

        {/* Subtitle Description */}
        <p className="max-w-2xl mx-auto text-slate-700 text-sm sm:text-lg md:text-xl font-semibold leading-relaxed mb-8 sm:mb-10 px-2">
          The ultimate community sports championship presented by Vitraag Vigyaan. Three epic leagues —{' '}
          <span className="text-amber-600 font-bold">Cricket</span>,{' '}
          <span className="text-emerald-600 font-bold">Football</span>, and{' '}
          <span className="text-pink-600 font-bold">Women's Sports</span>. Step up and claim your glory.
        </p>

        {/* Info Chips: Dates & Venue */}
        <div className="flex flex-wrap justify-center items-center gap-2.5 sm:gap-4 mb-10 sm:mb-12">
          <div className="flex items-center space-x-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs sm:text-sm font-bold text-slate-800">
            <Calendar className="w-4 h-4 text-pink-600 shrink-0" />
            <span>Season Kickoff Coming Soon</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs sm:text-sm font-bold text-slate-800">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Main Arena Grounds</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs sm:text-sm font-bold text-slate-800">
            <Zap className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Open Registration</span>
          </div>
        </div>

        {/* Action CTAs with minimum 48px touch tap targets */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto px-2">
          <a
            href="#leagues"
            className="w-full sm:w-auto px-8 py-4 min-h-[48px] rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-500 to-pink-500 text-white font-extrabold text-base md:text-lg hover:shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-2 group touch-manipulation"
          >
            <span>Choose Your League</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#register"
            className="w-full sm:w-auto px-8 py-4 min-h-[48px] rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-base md:text-lg border border-slate-300 shadow-sm active:scale-95 transition-all text-center touch-manipulation"
          >
            Direct Registration
          </a>
        </div>
      </div>

      {/* Kinetic Velocity Text Marquee Banner */}
      <div className="w-full border-y border-slate-200 bg-white/80 my-6 sm:my-8 overflow-hidden shadow-sm">
        <KineticText items={tickerItems} />
      </div>
    </section>
  );
};
