import React from 'react';
import { InView } from '@/components/ui/in-view';
import { Calendar, Clock, Lock, Sparkles, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

interface ScheduleSectionProps {
  onRegisterClick?: () => void;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({ onRegisterClick }) => {
  return (
    <section id="schedule" className="py-16 md:py-24 relative z-10 w-full max-w-full overflow-hidden bg-gradient-to-b from-white via-amber-50/40 to-slate-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Header */}
        <InView
          viewOptions={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
        >
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 text-amber-950 border border-amber-300 text-xs font-bold uppercase tracking-widest mb-3.5 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>SEASON FIXTURES & TIMETABLE</span>
          </div>

          <h2
            className="font-display font-extrabold text-slate-900 mb-3 sm:mb-4 tracking-tight"
            style={{ fontSize: 'clamp(1.75rem, 4vw + 0.5rem, 3.5rem)' }}
          >
            Tournament Match <span className="text-gradient-vibrant">Schedule</span>
          </h2>

          <p className="text-slate-600 text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-2xl mx-auto">
            Full matchday fixtures, pitch allocations, and broadcast timetables will be unlocked immediately following the official Player Auction &amp; Team Draft.
          </p>
        </InView>

        {/* Central Notice & Auction Status Card */}
        <InView
          viewOptions={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative overflow-hidden rounded-3xl bg-white border border-amber-200/80 p-6 sm:p-10 md:p-12 shadow-xl shadow-amber-900/5">
            {/* Subtle Radiant Background Blur Accent */}
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-orange-400/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Pulsing Lock & Countdown Icon */}
              <div className="relative mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 p-0.5 shadow-lg shadow-amber-500/25">
                  <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
                    <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600 animate-pulse" />
                  </div>
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 bg-slate-900 text-amber-300 p-1.5 rounded-xl border border-slate-700 shadow-sm">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-300/80 text-amber-900 font-extrabold text-xs uppercase tracking-wider mb-3">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Coming Soon • Post-Auction Release</span>
              </div>

              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mb-3">
                Schedule Will Be Updated After The Auction
              </h3>

              <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-8">
                Teams and squad compositions are being drafted. Once the team captains finish the player bidding and squad allotments, all group-stage and knockout fixtures will go live here in real-time.
              </p>

              {/* Step Roadmap Indicators */}
              <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 text-left">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Phase 1 • Active</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">Player Registration</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Collecting entries across Cricket, Football &amp; Women's leagues.</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 ring-2 ring-amber-400/40">
                  <div className="flex items-center space-x-2 text-amber-700 font-extrabold text-xs mb-1">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>Phase 2 • Upcoming</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">Player Auction</h4>
                  <p className="text-[11px] text-slate-600 mt-1">Captains draft teams &amp; assign official jerseys.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 opacity-90">
                  <div className="flex items-center space-x-2 text-slate-400 font-bold text-xs mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Phase 3 • Next</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-800">Fixtures Go Live</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Complete dates, timings &amp; pitch grounds announced.</p>
                </div>
              </div>

              {/* CTA */}
              {onRegisterClick && (
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={onRegisterClick}
                    className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    <span>Register Before Auction</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </InView>
      </div>
    </section>
  );
};

export default ScheduleSection;
