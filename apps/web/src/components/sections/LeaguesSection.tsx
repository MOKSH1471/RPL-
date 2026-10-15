import React from 'react';
import { InView } from '@/components/ui/in-view';
import { LeagueType } from '@/types';
import { ArrowRight, Star, MessageCircle } from 'lucide-react';

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
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-600 block mb-3">
            CHAMPIONSHIP LEAGUES
          </span>
          <h2 className="font-display font-extrabold text-slate-900 mb-4 sm:mb-6 tracking-tight" style={{ fontSize: 'clamp(1.5rem, 4vw + 0.25rem, 3.75rem)' }}>
            Five Championship <span className="text-gradient-vibrant">Leagues</span>
          </h2>
          <p className="text-slate-700 text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-2xl">
            Select your arena. Tapping any league pre-configures your official RPL Season 9 registration form.
          </p>
        </InView>

        {/* Row 1: Cricket (Flagship 7-col hero card) vs Football & Women's (Secondary 5-col pair) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Flagship Card: Main Cricket League */}
          <InView
            viewOptions={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="lg:col-span-7 flex flex-col"
          >
            <div
              onClick={() => onSelectLeague('cricket')}
              className="group cursor-pointer p-5 sm:p-8 md:p-10 rounded-3xl bg-[#FFFBEB] border-2 border-amber-300 hover:border-amber-500 active:scale-[0.98] transition-all duration-200 flex flex-col justify-between h-full shadow-lg touch-manipulation"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-amber-700">
                    Team Spirit & Excitement
                  </span>
                  <span className="flex items-center space-x-1 text-[11px] font-bold text-amber-800 uppercase tracking-widest bg-amber-200/80 px-2.5 py-1 rounded-full border border-amber-300">
                    <Star className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
                    <span>Featured League</span>
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl text-slate-900 mb-3 sm:mb-4 group-hover:text-amber-700 transition-colors">
                  Main Cricket League
                </h3>

                <p className="text-slate-700 text-sm sm:text-base md:text-lg font-medium leading-relaxed mb-6 sm:mb-8 max-w-xl">
                  Gather your friends for the premier cricket championship! Packed with high energy, team bonding, and unforgettable moments together on the pitch.
                </p>

                <div className="mb-8 sm:mb-10">
                  <span className="text-xs text-slate-600 font-bold uppercase tracking-wider block mb-3">
                    Featured Playing Roles
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {['Batsman', 'Bowler', 'Wicketkeeper'].map((role, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg bg-amber-100/90 text-amber-900 border border-amber-200"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLeague('cricket');
                }}
                className="w-full py-3.5 sm:py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 touch-manipulation min-h-[48px]"
              >
                <span>Register for Main Cricket League</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </InView>

          {/* Secondary Pair: Football & Women's League */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            {/* Football League Card */}
            <InView
              viewOptions={{ once: true, amount: 0.05 }}
              transition={{ duration: 0.45, delay: 0.04, ease: 'easeOut' }}
              className="flex-1"
            >
              <div
                onClick={() => onSelectLeague('football')}
                className="group cursor-pointer p-6 sm:p-7 rounded-3xl bg-[#ECFDF5] border border-emerald-200 hover:border-emerald-500 active:scale-[0.98] transition-all duration-200 flex flex-col justify-between h-full shadow-md touch-manipulation"
              >
                <div>
                  <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-emerald-700 block mb-2">
                    Exciting Football
                  </span>
                  <h3 className="font-display font-extrabold text-xl sm:text-2xl md:text-3xl text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                    Football
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
                  <span>Register for Football</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </InView>

            {/* Women's League Card */}
            <InView
              viewOptions={{ once: true, amount: 0.05 }}
              transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
              className="flex-1"
            >
              <div
                onClick={() => onSelectLeague('womens')}
                className="group cursor-pointer p-6 sm:p-7 rounded-3xl bg-[#FDF2F8] border border-pink-200 hover:border-pink-500 active:scale-[0.98] transition-all duration-200 flex flex-col justify-between h-full shadow-md touch-manipulation"
              >
                <div>
                  <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-pink-700 block mb-2">
                    HER GAME. HER VOICE. HER POWER.
                  </span>
                  <h3 className="font-display font-extrabold text-xl sm:text-2xl md:text-3xl text-slate-900 mb-2 group-hover:text-pink-700 transition-colors">
                    Women's League
                  </h3>
                  <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                    <span className="font-bold text-slate-900 block mb-1">
                      WOMEN WHO PLAY. WOMEN WHO LEAD. WOMEN WHO INSPIRE.
                    </span>
                    Celebrating the spirit, strength, and diversity of women in sport.
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
                  <span>Register for Women's League</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </InView>
          </div>
        </div>

        {/* Row 2: Table Tennis & Carrom Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-6 lg:mt-8 items-stretch">
          {/* Table Tennis Card */}
          <InView
            viewOptions={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.45, delay: 0.12, ease: 'easeOut' }}
            className="flex flex-col"
          >
            <div
              onClick={() => onSelectLeague('table-tennis')}
              className="group cursor-pointer p-6 sm:p-8 rounded-3xl bg-[#F0F9FF] border-2 border-sky-200 hover:border-sky-500 active:scale-[0.98] transition-all duration-200 flex flex-col justify-between h-full shadow-md touch-manipulation"
            >
              <div>
                <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-sky-700 block mb-2">
                  SPEED, REFLEX & SPIN
                </span>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mb-3 group-hover:text-sky-700 transition-colors">
                  Table Tennis
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
                className="w-full py-3.5 px-5 rounded-xl font-extrabold text-xs sm:text-sm bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 touch-manipulation min-h-[48px]"
              >
                <span>Register for Table Tennis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </InView>

          {/* Carrom Card */}
          <InView
            viewOptions={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.45, delay: 0.16, ease: 'easeOut' }}
            className="flex flex-col"
          >
            <div
              onClick={() => onSelectLeague('carrom')}
              className="group cursor-pointer p-6 sm:p-8 rounded-3xl bg-[#FAF5FF] border-2 border-purple-200 hover:border-purple-500 active:scale-[0.98] transition-all duration-200 flex flex-col justify-between h-full shadow-md touch-manipulation"
            >
              <div>
                <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-purple-700 block mb-2">
                  STRIKE & POCKET MASTERY
                </span>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mb-3 group-hover:text-purple-700 transition-colors">
                  Carrom
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
                className="w-full py-3.5 px-5 rounded-xl font-extrabold text-xs sm:text-sm bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 touch-manipulation min-h-[48px]"
              >
                <span>Register for Carrom</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </InView>
        </div>

        {/* Team Ownership and Sponsorship Callout Banner */}
        <InView
          viewOptions={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
          className="mt-10 sm:mt-14 p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-purple-500/10 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left"
        >
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-700 block mb-1">
              Franchise & Partner Opportunities
            </span>
            <h4 className="font-display font-extrabold text-lg sm:text-xl text-slate-900">
              For Team Ownership and Sponsorship Please Contact
            </h4>
            <p className="text-slate-600 text-xs sm:text-sm font-medium mt-0.5">
              Partner with RPL to showcase your brand or lead an official tournament squad.
            </p>
          </div>

          <a
            href="https://wa.me/919321001499?text=Hello%20RPL%20Team%2C%20I%20am%20interested%20in%20Team%20Ownership%20and%20Sponsorship"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 shrink-0"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chat on WhatsApp: +91 9321001499</span>
          </a>
        </InView>
      </div>
    </section>
  );
};
