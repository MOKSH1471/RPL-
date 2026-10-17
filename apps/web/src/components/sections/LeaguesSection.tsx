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

        {/* Line 1: 1. Main Cricket League (Standalone Full Row) */}
        <InView
          viewOptions={{ once: true, amount: 0.05 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full flex flex-col mb-6 lg:mb-8"
        >
          <div
            onClick={() => onSelectLeague('cricket')}
            className="group cursor-pointer p-6 sm:p-8 md:p-10 rounded-3xl bg-[#FFFBEB] border-2 border-amber-300 hover:border-amber-500 active:scale-[0.99] transition-all duration-200 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center shadow-lg touch-manipulation"
          >
            {/* Left Column: Title & Description */}
            <div className="md:col-span-7 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-amber-700">
                  Team Spirit &amp; Excitement
                </span>
                <span className="flex items-center space-x-1 text-[11px] font-bold text-amber-800 uppercase tracking-widest bg-amber-200/80 px-2.5 py-1 rounded-full border border-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
                  <span>Featured Flagship League</span>
                </span>
              </div>

              <h3 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl text-slate-900 mb-2 sm:mb-3 group-hover:text-amber-700 transition-colors">
                Main Cricket League
              </h3>

              <p className="text-slate-700 text-sm sm:text-base font-medium leading-relaxed max-w-xl">
                Gather your friends for the premier cricket championship! Packed with high energy, team bonding, and unforgettable moments together on the pitch.
              </p>
            </div>

            {/* Right Column: Tournament Format & Highlights + Register Button */}
            <div className="md:col-span-5 flex flex-col justify-between h-full space-y-5 md:pl-6 md:border-l md:border-amber-200/80">
              <div>
                <span className="text-[11px] text-amber-800 font-extrabold uppercase tracking-wider block mb-2.5">
                  Tournament Format &amp; Highlights
                </span>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-200">
                    ⚡ Turf Cricket Championship
                  </span>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-200">
                    🏆 Trophies &amp; Awards
                  </span>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-200">
                    👕 Official Team Jersey
                  </span>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-200">
                    🤝 Community Spirit
                  </span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLeague('cricket');
                  }}
                  className="w-full py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 touch-manipulation min-h-[52px]"
                >
                  <span>Register for Main Cricket League</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </InView>

        {/* Line 2: 2. Women's Cricket League & 3. Kaccha Pakka League */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8 items-stretch">
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
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-pink-700 block">
                    HER GAME. HER VOICE. HER POWER.
                  </span>
                  <span className="text-[10px] font-bold text-pink-800 uppercase tracking-wider bg-pink-100 px-2 py-0.5 rounded-full border border-pink-200">
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
                className="w-full py-3.5 px-5 rounded-xl font-extrabold text-xs sm:text-sm bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 touch-manipulation min-h-[48px]"
              >
                <span>Register for Women's Cricket League</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </InView>

          {/* 3. Kaccha Pakka League Card */}
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
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-orange-700">
                    ENERGY & EXPERIENCE
                  </span>
                  <span className="flex items-center space-x-1 text-[11px] font-bold text-orange-900 uppercase tracking-widest bg-orange-100 px-2.5 py-0.5 rounded-full border border-orange-300">
                    <span>🌟</span>
                    <span>Age ≤16 & ≥56</span>
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mb-3 group-hover:text-orange-700 transition-colors">
                  Kaccha Pakka League
                </h3>

                <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                  At Kaccha Pakka league we bring in the energy and talent of our young stars age below 16 and experience of our young at our heart stars age 56 and above
                </p>

                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-orange-100 text-orange-900 border border-orange-200">
                      ⚡ Young Stars (≤16)
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-200">
                      🏆 Young at Heart (≥56)
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-yellow-100 text-yellow-900 border border-yellow-200">
                      🤝 Intergenerational Spirit
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLeague('kaccha-pakka');
                }}
                className="w-full py-3.5 px-5 rounded-xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 touch-manipulation min-h-[48px]"
              >
                <span>Register for Kaccha Pakka League</span>
                <ArrowRight className="w-4 h-4" />
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
                <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-emerald-700 block mb-3">
                  TURF FOOTBALL CHAMPIONSHIP
                </span>
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
                className="w-full py-3.5 px-5 rounded-xl font-extrabold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 touch-manipulation min-h-[48px]"
              >
                <span>Register for Football League</span>
                <ArrowRight className="w-4 h-4" />
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
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-sky-700">
                    SPEED, REFLEX &amp; SPIN
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    FREE ADD-ON
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mb-2 group-hover:text-sky-700 transition-colors">
                  Table Tennis League
                </h3>
                <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed mb-4">
                  Step up to the table for thrilling rallies, lightning-fast reflexes, and intense spin battles! Showcase your precision in singles and doubles format.
                </p>

                <div className="mb-6 p-2 rounded-xl bg-sky-100/70 border border-sky-200 text-[11px] text-sky-900 font-semibold flex items-center gap-1.5">
                  <span>💡</span>
                  <span>Free with Cricket / Football league registration</span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLeague('table-tennis');
                }}
                className="w-full py-3.5 px-5 rounded-xl font-extrabold text-xs sm:text-sm bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 touch-manipulation min-h-[48px]"
              >
                <span>Register for Table Tennis League</span>
                <ArrowRight className="w-4 h-4" />
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
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-purple-700">
                    STRIKE &amp; POCKET MASTERY
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    FREE ADD-ON
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mb-2 group-hover:text-purple-700 transition-colors">
                  Carrom League
                </h3>
                <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed mb-4">
                  Aim, strike, and pocket the queen! Bring your finest angles, board control, and tactical skill to the classic carrom board championship.
                </p>

                <div className="mb-6 p-2 rounded-xl bg-purple-100/70 border border-purple-200 text-[11px] text-purple-900 font-semibold flex items-center gap-1.5">
                  <span>💡</span>
                  <span>Free with Cricket / Football league registration</span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLeague('carrom');
                }}
                className="w-full py-3.5 px-5 rounded-xl font-extrabold text-xs sm:text-sm bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 touch-manipulation min-h-[48px]"
              >
                <span>Register for Carrom League</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </InView>
        </div>

        {/* Bottom Row: Official Spectator Pass & Team Ownership / Sponsorship (In One Line) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-8 sm:mt-10 items-stretch">
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
                  <span className="text-[11px] font-bold text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300">
                    Cheer, Relax &amp; Relive 90’s Games
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
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95 min-h-[48px]"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>Chat on WhatsApp: +91 9321001499</span>
              </a>
            </div>
          </InView>
        </div>
      </div>
    </section>
  );
};

export default LeaguesSection;
