import React from 'react';
import { KineticText } from '@/components/ui/KineticText';
import { ChevronRight } from 'lucide-react';
import { LeagueType } from '@/types';

interface HeroSectionProps {
  onSelectLeague: (league: LeagueType) => void;
  onRegisterClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSelectLeague,
  onRegisterClick,
}) => {
  const tickerItems = [
    'Raj Premier League',
    'Main Cricket League',
    "Women's Cricket League",
    'Kaccha Pakka League',
    'Football League',
    'Carrom League',
    'Table Tennis League',
    'Register Now',
  ];

  const topLeagues = [
    { id: 'cricket' as LeagueType, name: 'Main Cricket League', emoji: '🏏', color: 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200' },
    { id: 'womens' as LeagueType, name: "Women's Cricket League", emoji: '🏏', color: 'bg-pink-100 text-pink-900 border-pink-300 hover:bg-pink-200' },
    { id: 'kaccha-pakka' as LeagueType, name: 'Kaccha Pakka League', emoji: '🌟', color: 'bg-orange-100 text-orange-900 border-orange-300 hover:bg-orange-200' },
    { id: 'football' as LeagueType, name: 'Football League', emoji: '⚽', color: 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200' },
    { id: 'carrom' as LeagueType, name: 'Carrom League', emoji: '🎯', color: 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200' },
    { id: 'table-tennis' as LeagueType, name: 'Table Tennis League', emoji: '🏓', color: 'bg-sky-100 text-sky-900 border-sky-300 hover:bg-sky-200' },
  ];

  return (
    <section className="relative pt-20 pb-10 sm:pt-28 sm:pb-16 md:pt-40 md:pb-28 overflow-hidden min-h-[85vh] md:min-h-screen flex flex-col justify-between w-full max-w-full">
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10 my-auto text-center">
        {/* On top sequence: 6 RPL Leagues */}
        <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6 max-w-full px-1">
          {topLeagues.map((lg) => (
            <button
              key={lg.id}
              type="button"
              onClick={() => onSelectLeague(lg.id)}
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs transition-all active:scale-95 cursor-pointer ${lg.color}`}
            >
              <span>{lg.emoji}</span>
              <span>{lg.name}</span>
            </button>
          ))}
        </div>

        {/* Main Display Headline scaling smoothly on all mobile screens */}
        <h1 className="font-display font-extrabold tracking-tight leading-[1.1] mb-3 sm:mb-6 max-w-full">
          <span className="block text-slate-900 text-3xl sm:text-5xl md:text-6xl lg:text-7xl break-words uppercase">
            Raj Premier League
          </span>
        </h1>

        {/* Subtitle Description with exact requested league sequence */}
        <p className="max-w-3xl mx-auto text-slate-700 text-xs sm:text-base md:text-lg font-medium leading-relaxed mb-6 sm:mb-10 px-2">
          The ultimate turf championship. Six epic leagues —{' '}
          <span className="text-amber-600 font-bold">Main Cricket League</span>,{' '}
          <span className="text-pink-600 font-bold">Women's Cricket League</span>,{' '}
          <span className="text-orange-600 font-bold">Kaccha Pakka League</span>,{' '}
          <span className="text-emerald-600 font-bold">Football League</span>,{' '}
          <span className="text-purple-600 font-bold">Carrom League</span> and{' '}
          <span className="text-sky-600 font-bold">Table Tennis League</span>. Step up and claim your glory.
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
      </div>

      {/* Kinetic Velocity Text Marquee Banner */}
      <div className="w-full max-w-full border-y border-slate-200 bg-white/80 my-4 sm:my-8 overflow-hidden shadow-xs">
        <KineticText items={tickerItems} />
      </div>
    </section>
  );
};

export default HeroSection;
