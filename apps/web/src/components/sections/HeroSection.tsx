import React, { useState } from 'react';
import { KineticText } from '@/components/ui/KineticText';
import { ChevronRight } from 'lucide-react';
import { LeagueType } from '@/types';
import { TeamOwnerModal } from '@/components/ui/TeamOwnerModal';

export interface TitleSponsorConfig {
  name: string;
  logo?: string;
  badgeText?: string;
  presenterText?: string;
  altText?: string;
}

// ── Easily configurable Title Sponsor (modify or set to null if changed) ──
export const TITLE_SPONSOR: TitleSponsorConfig | null = {
  name: 'Shri Bakul Bhai Doshi',
  badgeText: 'TITLE SPONSOR',
  presenterText: 'PRESENTS',
  altText: 'Shri Bakul Bhai Doshi',
};

interface HeroSectionProps {
  onSelectLeague?: (league: LeagueType) => void;
  onRegisterClick?: () => void;
  onSpectatorClick?: () => void;
  onCheckPassClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = () => {
  const [isTeamOwnerOpen, setIsTeamOwnerOpen] = useState(false);

  const sponsorTickerItems = [
    'Raj Premier League',
    'Shri Bakul Bhai Doshi',
    'Yuvraj Caterers',
    'Traket Multiventures Pvt.Ltd',
    'SeaMak Group',
  ];

  return (
    <section className="relative pt-16 pb-10 sm:pt-24 sm:pb-16 md:pt-32 md:pb-24 overflow-hidden min-h-[85vh] md:min-h-screen flex flex-col justify-between w-full max-w-full">
      <div className="w-full max-w-5xl lg:max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10 my-auto text-center">
        {/* Title Sponsor Presentation Header */}
        {TITLE_SPONSOR && (
          <div className="flex flex-col items-center justify-center mb-6 sm:mb-8 md:mb-10">
            {TITLE_SPONSOR.logo ? (
              <div className="h-14 sm:h-18 md:h-24 lg:h-28 flex items-center justify-center mb-1 sm:mb-2">
                <img
                  src={TITLE_SPONSOR.logo}
                  alt={TITLE_SPONSOR.altText || TITLE_SPONSOR.name}
                  className="h-full w-auto max-w-[210px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[460px] object-contain drop-shadow-xs"
                  loading="eager"
                />
              </div>
            ) : (
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-extrabold text-slate-900 tracking-wide uppercase drop-shadow-xs">
                {TITLE_SPONSOR.name}
              </div>
            )}

            {/* Presents Text with generous breathing room */}
            <div className="text-xs sm:text-sm md:text-base font-extrabold text-amber-600 tracking-[0.32em] sm:tracking-[0.4em] uppercase mt-2 sm:mt-3">
              {TITLE_SPONSOR.presenterText || 'PRESENTS'}
            </div>
          </div>
        )}

        {/* Main Display Headline (wraps naturally on mobile with bold size like old version, single line on desktop) */}
        <h1 className="font-display font-extrabold tracking-tight leading-[1.1] mb-3 sm:mb-6 max-w-full">
          <span className="block text-slate-900 text-3xl sm:text-5xl md:text-6xl lg:text-[3.25rem] xl:text-[4.25rem] 2xl:text-7xl break-words lg:whitespace-nowrap uppercase tracking-wider">
            Raj Premier League
          </span>
        </h1>

        {/* Subtitle Description with exact requested league sequence */}
        <p className="max-w-3xl mx-auto text-slate-700 text-xs sm:text-base md:text-lg font-medium leading-relaxed mb-6 sm:mb-10 px-2">
          The ultimate turf championship. Six epic leagues —{' '}
          <span className="text-orange-600 font-bold">RPL Cricket League</span>,{' '}
          <span className="text-orange-600 font-bold">Women's Cricket League</span>,{' '}
          <span className="text-orange-600 font-bold">Kaccha Pakka Cricket League</span>,{' '}
          <span className="text-orange-600 font-bold">Football League</span>,{' '}
          <span className="text-orange-600 font-bold">Table Tennis League</span> and{' '}
          <span className="text-orange-600 font-bold">Carrom League</span>. Step up and claim your glory.
        </p>

        {/* Action CTAs with touch-optimized buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-xs sm:max-w-xl mx-auto px-1">
          <a
            href="#leagues"
            className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 min-h-[48px] sm:min-h-[52px] rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-sm sm:text-base md:text-lg hover:shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-2 group touch-manipulation shadow-md"
          >
            <span>Choose Your League</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <button
            type="button"
            onClick={() => setIsTeamOwnerOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 min-h-[48px] sm:min-h-[52px] rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-sm sm:text-base md:text-lg border border-slate-300 shadow-xs active:scale-95 transition-all text-center touch-manipulation cursor-pointer"
          >
            Team Owner &amp; Sponsorship
          </button>
        </div>
      </div>

      {/* Kinetic Velocity Text Marquee Banner - Hall of Sponsors */}
      <div className="w-full max-w-full border-y border-slate-200 bg-white/80 my-4 sm:my-8 overflow-hidden shadow-xs">
        <KineticText items={sponsorTickerItems} speed="38s" />
      </div>

      {/* Team Owner & Sponsorship Modal */}
      <TeamOwnerModal
        isOpen={isTeamOwnerOpen}
        onClose={() => setIsTeamOwnerOpen(false)}
      />
    </section>
  );
};

export default HeroSection;
