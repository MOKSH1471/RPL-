import React from 'react';
import { InView } from '@/components/ui/in-view';
import { LeagueType } from '@/types';
import { ArrowRight, Star, MessageCircle, Sparkles } from 'lucide-react';

interface LeaguesSectionProps {
  onSelectLeague: (league: LeagueType) => void;
}

export const LeaguesSection: React.FC<LeaguesSectionProps> = ({ onSelectLeague }) => {
  return (
    <section id="leagues" className="py-16 md:py-24 relative z-10 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Header with InView */}
        <InView
          viewOptions={{ once: true, amount: 0.05 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="max-w-4xl mb-10 md:mb-16"
        >
          <h2 className="font-display font-extrabold text-slate-900 mb-4 sm:mb-6 tracking-tight" style={{ fontSize: 'clamp(1.5rem, 4vw + 0.25rem, 3.75rem)' }}>
            Six Championship <span className="text-gradient-vibrant">Leagues</span>
          </h2>
          <p className="text-slate-700 text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-2xl">
            Select your arena. Tapping any league pre-configures your official RPL Season 9 registration form.
          </p>
        </InView>

        {/* Row 1: 3 Cricket Leagues (Main Cricket League, Women's Cricket League, Kaccha Pakka Cricket League) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-6 lg:mb-8 items-stretch">
          {/* 1. Main Cricket League Card */}
          <InView
            viewOptions={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="flex flex-col"
          >
            <div
              onClick={() => onSelectLeague('cricket')}
              className="group cursor-pointer p-6 sm:p-8 rounded-3xl bg-[#FEFCE8] border-2 border-amber-300 hover:border-amber-500 active:scale-[0.98] transition-all duration-200 flex flex-col justify-between h-full shadow-md touch-manipulation"
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-3">
                  <span className="text-[10px] xl:text-[11px] font-extrabold uppercase tracking-wider text-amber-700 whitespace-nowrap">
                    TEAM SPIRIT &amp; EXCITEMENT
                  </span>
                  <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-900 uppercase tracking-wider bg-amber-200/80 px-2 py-0.5 rounded-full border border-amber-300 whitespace-nowrap shrink-0">
                    <Star className="w-3 h-3 fill-amber-600 text-amber-600" />
                    <span>Featured</span>
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mb-3 group-hover:text-amber-700 transition-colors">
                  Main Cricket League
                </h3>

                <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                  Gather your friends for the premier cricket championship! Packed with high energy, team bonding, and unforgettable moments together on the pitch.
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLeague('cricket');
                }}
                className="w-full py-3.5 px-3 sm:px-4 rounded-xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white flex items-center justify-center space-x-1.5 transition-all shadow-md active:scale-95 touch-manipulation min-h-[48px] whitespace-nowrap"
              >
                <span>Register for Main Cricket League</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </InView>

          {/* 2. Women's Cricket League Card */}
          <InView
            viewOptions={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.45, delay: 0.04, ease: 'easeOut' }}
            className="flex flex-col"
          >
            <div
              onClick={() => onSelectLeague('womens')}
              className="group cursor-pointer p-6 sm:p-8 rounded-3xl bg-[#FDF2F8] border border-pink-200 hover:border-pink-500 active:scale-[0.98] transition-all duration-200 flex flex-col justify-between h-full shadow-md touch-manipulation"
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-3">
                  <span className="text-[10px] xl:text-[11px] font-extrabold uppercase tracking-wider text-pink-700 whitespace-nowrap">
                    HER GAME. HER VOICE. HER POWER.
                  </span>
                  <span className="text-[10px] font-bold text-pink-800 uppercase tracking-wider bg-pink-100 px-2 py-0.5 rounded-full border border-pink-200 whitespace-nowrap shrink-0">
                    Women Only
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mb-3 group-hover:text-pink-700 transition-colors">
                  Women's Cricket League
                </h3>
                <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                  <span className="font-bold text-slate-900 block mb-1">
                    WOMEN WHO PLAY. WOMEN WHO LEAD. WOMEN WHO INSPIRE.
                  </span>
                  Celebrating the spirit, strength, and diversity of women in turf cricket sport.
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLeague('womens');
                }}
                className="w-full py-3.5 px-3 sm:px-4 rounded-xl font-extrabold text-[11px] xs:text-xs sm:text-sm bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center space-x-1.5 transition-all shadow-md active:scale-95 touch-manipulation min-h-[48px] whitespace-nowrap"
              >
                <span>Register for Women's Cricket League</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </InView>

          {/* 3. Kaccha Pakka Cricket League Card */}
          <InView
            viewOptions={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
            className="flex flex-col"
          >
            <div
              onClick={() => onSelectLeague('kaccha-pakka')}
              className="group cursor-pointer p-6 sm:p-8 rounded-3xl bg-[#FFFBEB] border-2 border-orange-300 hover:border-orange-500 active:scale-[0.98] transition-all duration-200 flex flex-col justify-between h-full shadow-md touch-manipulation"
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-3">
                  <span className="text-[10px] xl:text-[11px] font-extrabold uppercase tracking-wider text-orange-700 whitespace-nowrap">
                    ENERGY &amp; EXPERIENCE
                  </span>
                  <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-orange-900 uppercase tracking-wider bg-orange-100 px-2 py-0.5 rounded-full border border-orange-300 whitespace-nowrap shrink-0">
                    <span>🌟</span>
                    <span>Age ≤16 &amp; ≥56</span>
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mb-3 group-hover:text-orange-700 transition-colors">
                  Kaccha Pakka Cricket League
                </h3>

                <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                  At Kaccha Pakka Cricket League we bring in the energy and talent of our young stars age below 16 and experience of our young at our heart stars age 56 and above
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLeague('kaccha-pakka');
                }}
                className="w-full py-3.5 px-3 sm:px-4 rounded-xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white flex items-center justify-center space-x-1.5 transition-all shadow-md active:scale-95 touch-manipulation min-h-[48px] whitespace-nowrap"
              >
                <span>Register for Kaccha Pakka League</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </InView>
        </div>

        {/* Line 3: 4. Football League, 5. Table Tennis League, 6. Carrom League */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* 4. Football League Card */}
          <InView
            viewOptions={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.45, delay: 0.12, ease: 'easeOut' }}
            className="flex flex-col"
          >
            <div
              onClick={() => onSelectLeague('football')}
              className="group cursor-pointer p-6 sm:p-8 rounded-3xl bg-[#ECFDF5] border border-emerald-200 hover:border-emerald-500 active:scale-[0.98] transition-all duration-200 flex flex-col justify-between h-full shadow-md touch-manipulation"
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-3">
                  <span className="text-[9.5px] xs:text-[10px] xl:text-[11px] font-extrabold uppercase tracking-wide text-emerald-700 whitespace-nowrap">
                    STRIKE &amp; SCORE
                  </span>
                  <span className="text-[9.5px] xs:text-[10px] font-bold text-emerald-800 uppercase tracking-wide bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 whitespace-nowrap shrink-0">
                    TURF CHAMPIONSHIP
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors">
                  Football League
                </h3>
                <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                  Step onto the turf for fast-paced football, great teamwork, and pure excitement! Play with passion, cheer on your squad, and make amazing memories with friends.
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLeague('football');
                }}
                className="w-full py-3.5 px-3 sm:px-4 rounded-xl font-extrabold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 touch-manipulation min-h-[48px] whitespace-nowrap"
              >
                <span>Register for Football League</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </InView>

          {/* 5. Table Tennis League Card */}
          <InView
            viewOptions={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.45, delay: 0.16, ease: 'easeOut' }}
            className="flex flex-col"
          >
            <div
              onClick={() => onSelectLeague('table-tennis')}
              className="group cursor-pointer p-6 sm:p-8 rounded-3xl bg-[#F0F9FF] border-2 border-sky-200 hover:border-sky-500 active:scale-[0.98] transition-all duration-200 flex flex-col justify-between h-full shadow-md touch-manipulation"
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-3">
                  <span className="text-[10px] xl:text-[11px] font-extrabold uppercase tracking-wider text-sky-700 whitespace-nowrap">
                    SPEED, REFLEX &amp; SPIN
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 whitespace-nowrap shrink-0">
                    FREE ADD-ON
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mb-2 group-hover:text-sky-700 transition-colors">
                  Table Tennis League
                </h3>
                <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                  Step up to the table for thrilling rallies, lightning-fast reflexes, and intense spin battles! Showcase your precision in singles and doubles format.
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLeague('table-tennis');
                }}
                className="w-full py-3.5 px-3 sm:px-4 rounded-xl font-extrabold text-xs sm:text-sm bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 touch-manipulation min-h-[48px] whitespace-nowrap"
              >
                <span>Register for Table Tennis League</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </InView>

          {/* 6. Carrom League Card */}
          <InView
            viewOptions={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
            className="flex flex-col"
          >
            <div
              onClick={() => onSelectLeague('carrom')}
              className="group cursor-pointer p-6 sm:p-8 rounded-3xl bg-[#FAF5FF] border-2 border-purple-200 hover:border-purple-500 active:scale-[0.98] transition-all duration-200 flex flex-col justify-between h-full shadow-md touch-manipulation"
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-3">
                  <span className="text-[10px] xl:text-[11px] font-extrabold uppercase tracking-wider text-purple-700 whitespace-nowrap">
                    STRIKE &amp; POCKET MASTERY
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 whitespace-nowrap shrink-0">
                    FREE ADD-ON
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mb-2 group-hover:text-purple-700 transition-colors">
                  Carrom League
                </h3>
                <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                  Aim, strike, and pocket the queen! Bring your finest angles, board control, and tactical skill to the classic carrom board championship.
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLeague('carrom');
                }}
                className="w-full py-3.5 px-3 sm:px-4 rounded-xl font-extrabold text-xs sm:text-sm bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 touch-manipulation min-h-[48px] whitespace-nowrap"
              >
                <span>Register for Carrom League</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </InView>
        </div>

        {/* Divider between 6 Leagues and Event Passes / Sponsorship */}
        <div className="relative my-8 sm:my-12">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-300/80" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#FFFDF5] px-4 py-1 text-xs sm:text-sm font-extrabold uppercase tracking-widest text-slate-500 rounded-full border border-slate-200/80 shadow-2xs">
              Event Passes &amp; Sponsorships
            </span>
          </div>
        </div>

        {/* Bottom Row: Official Spectator Pass & Team Ownership / Sponsorship (In One Line) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Card 1: Official Spectator Pass */}
          <InView
            viewOptions={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.45, delay: 0.18, ease: 'easeOut' }}
            className="flex flex-col"
          >
            <div
              onClick={() => onSelectLeague('spectator')}
              className="group cursor-pointer p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-300 hover:border-amber-400 active:scale-[0.99] transition-all duration-200 flex flex-col justify-between h-full shadow-md touch-manipulation"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Non-Playing Event Pass</span>
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mb-2 group-hover:text-amber-700 transition-colors">
                  Official Spectator Pass
                </h3>

                <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                  Don’t want to play in tournament matches? Join as an official spectator! Cheer your teams, participate in 90’s Nostalgia games, enjoy evening &amp; late-night snacks, access opening ceremonies, and arrange optional stay.
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLeague('spectator');
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm sm:text-base shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all active:scale-95 touch-manipulation min-h-[48px]"
              >
                <span>Get Spectator Pass</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </InView>

          {/* Card 2: Team Ownership and Sponsorship */}
          <InView
            viewOptions={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.45, delay: 0.22, ease: 'easeOut' }}
            className="flex flex-col"
          >
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border-2 border-emerald-300/80 shadow-md flex flex-col justify-between h-full">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-xs">
                    <span>🤝</span>
                    <span>Franchise &amp; Partner Opportunities</span>
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mb-2">
                  Team Ownership &amp; Sponsorship
                </h3>

                <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                  Partner with RPL to showcase your brand or lead an official tournament squad. For team ownership, title sponsorships, and franchise inquiries, connect with our organizing committee directly.
                </p>
              </div>

              <a
                href="https://wa.me/919321001499?text=Hello%20RPL%20Team%2C%20I%20am%20interested%20in%20Team%20Ownership%20and%20Sponsorship"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-3 sm:px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs xs:text-sm sm:text-base shadow-md flex items-center justify-center space-x-1.5 sm:space-x-2 transition-all active:scale-95 min-h-[48px] whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-white shrink-0" />
                <span className="whitespace-nowrap">Chat on WhatsApp: +91 9321001499</span>
              </a>
            </div>
          </InView>
        </div>
      </div>
    </section>
  );
};

export default LeaguesSection;
