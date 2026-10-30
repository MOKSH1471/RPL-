import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Lock,
  Sparkles,
  ShieldCheck,
  Flame,
  Share2,
  ChevronRight,
  Phone,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

interface SchedulePageProps {
  onBackToHome: () => void;
  onRegisterClick?: () => void;
  onCheckPassClick?: () => void;
}

export const SchedulePage: React.FC<SchedulePageProps> = ({
  onBackToHome,
  onRegisterClick,
  onCheckPassClick,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Raj Premier League (RPL) - Tournament Schedule',
          text: 'Check the official match schedule and timetable for RPL Season 9.',
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* ── 1. Sticky Navigation Header (Light Theme) ── */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 transition-shadow duration-200 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
          {/* Left: Back button & brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-amber-600 transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Home</span>
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <img
                src="/rpl-logo.png"
                alt="RPL Logo"
                className="h-6 w-auto object-contain drop-shadow-2xs"
              />
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 font-display">
                Tournament Schedule
              </span>
            </div>
          </div>

          {/* Right: Quick actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer active:scale-95"
              title="Share Schedule URL"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
            </button>

            {onRegisterClick && (
              <button
                onClick={onRegisterClick}
                className="py-1.5 px-3.5 sm:px-5 sm:py-2 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-wider shadow-sm hover:shadow-md active:scale-95 transition-all inline-flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Player Registration</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── 2. Hero Section ── */}
      <section className="relative bg-white border-b border-slate-200 py-10 sm:py-14 px-4 overflow-hidden">
        {/* Subtle ambient radiant lighting matching main page */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-orange-400/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold uppercase tracking-widest mb-3 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>SEASON FIXTURES &amp; TIMETABLE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold mb-3 tracking-tight font-display text-slate-900">
            Tournament Match <span className="text-amber-600">Schedule</span>
          </h1>

          <p className="text-slate-600 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed font-medium">
            Official timetable, arena schedules, and match progression for the Raj Premier League Championship.
          </p>
        </div>
      </section>

      {/* ── 3. Central Showdown Status Card (Original Content) ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        <div className="relative overflow-hidden rounded-3xl bg-white border border-amber-200/90 p-6 sm:p-10 md:p-12 shadow-xl shadow-amber-900/5">
          {/* Subtle Ambient Background Accents */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-orange-400/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Clock Icon with Lock Badge */}
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
              <span>Coming Soon</span>
            </div>

            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mb-3 max-w-2xl">
              Schedule Will Be Updated After The Squad Selection Showdown
            </h2>

            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-8">
              Teams and squad compositions will be drafted post registration. Once the team captains finish the player bidding and squad allotments, all group-stage and knockout fixtures will go live here.
            </p>

            {/* Step Roadmap Indicators */}
            <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-left">
              {/* Phase 1 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Phase 1 • Active</span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">Player Registration</h3>
                <p className="text-[11px] text-slate-500 mt-1">Collecting entries across Cricket, Football &amp; Women's leagues.</p>
              </div>

              {/* Phase 2 */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 ring-2 ring-amber-400/40">
                <div className="flex items-center space-x-2 text-amber-700 font-extrabold text-xs mb-1">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Phase 2 • Upcoming</span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">Squad Selection Showdown</h3>
                <p className="text-[11px] text-slate-600 mt-1">Captains draft teams &amp; assign official jerseys.</p>
              </div>

              {/* Phase 3 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 opacity-90">
                <div className="flex items-center space-x-2 text-slate-400 font-bold text-xs mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Phase 3 • Next</span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-800">Fixtures Go Live</h3>
                <p className="text-[11px] text-slate-500 mt-1">Complete dates &amp; timings announced.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. Coordinator & Helpline Callout ── */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-base sm:text-lg font-extrabold text-slate-900 font-display">
              Have Questions Regarding Matches or Schedule?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600">
              Contact our organizing committee for fixtures, timings, and team drafting assistance.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
            <a
              href="tel:+919321001499"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold tracking-wide shadow-xs transition-all hover:scale-105 active:scale-95"
            >
              <Phone className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Call Helpline</span>
            </a>

            <a
              href="https://wa.me/919321001499"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-wide shadow-xs transition-all hover:scale-105 active:scale-95"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>WhatsApp</span>
              <ExternalLink className="w-3 h-3 opacity-80 shrink-0" />
            </a>

            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Main Site</span>
            </button>
          </div>
        </div>
      </main>

      {/* ── 5. Global Official Footer ── */}
      <Footer onRegisterClick={onRegisterClick} onCheckPassClick={onCheckPassClick} />
    </div>
  );
};

export default SchedulePage;
