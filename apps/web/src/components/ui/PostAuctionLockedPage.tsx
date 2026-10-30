import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowLeft, KeyRound, Sparkles, AlertCircle, CheckCircle2, Trophy, Users, ShieldCheck, Flame } from 'lucide-react';
import { unlockAdminPreview } from '@/lib/previewAuth';

interface PostAuctionLockedPageProps {
  type: 'rules' | 'scorecard';
  onBackToHome: () => void;
  onUnlocked: () => void;
  onRegisterClick?: () => void;
}

export const PostAuctionLockedPage: React.FC<PostAuctionLockedPageProps> = ({
  type,
  onBackToHome,
  onUnlocked,
  onRegisterClick,
}) => {
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const title = type === 'rules' ? 'Tournament Rules & Regulations' : 'Match Schedule & Live Scorecard';
  const subtitle =
    type === 'rules'
      ? 'Official playing conditions, code of conduct, points breakdown, and tournament regulations.'
      : 'Ball-by-ball CricHeroes scoring, dynamic wagon wheels, NRR standings, and live match commentary.';

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockAdminPreview(pin)) {
      setError(false);
      onUnlocked();
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="py-12 sm:py-20 md:py-24 px-3 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative bg-white/95 backdrop-blur-xl border border-amber-200/80 rounded-3xl sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-10 md:p-12 text-center overflow-hidden"
      >
        {/* Decorative Ambient Background Blooms */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-gradient-to-tl from-pink-500/15 to-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Back Link */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center space-x-2 text-xs sm:text-sm font-extrabold text-slate-600 hover:text-amber-600 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to RPL Home</span>
          </button>

          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] sm:text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
            <span>Season 9 Exclusive</span>
          </div>
        </div>

        {/* Floating Glowing Lock Icon */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <span className="absolute inset-0 rounded-3xl bg-amber-400/30 animate-ping opacity-60" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/20 border-2 border-white">
            <Lock className="w-9 h-9 drop-shadow-md" />
          </div>
        </div>

        {/* Sub-badge */}
        <div>
          <span className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-slate-900 text-amber-300 text-[11px] sm:text-xs font-black uppercase tracking-widest shadow-xs mb-4">
            <span>🔒 UNLOCKS POST-AUCTION</span>
          </span>
        </div>

        {/* Main Display Headline */}
        <h1 className="font-display font-extrabold text-slate-900 tracking-tight mb-4 text-2xl sm:text-4xl md:text-5xl leading-tight">
          {title}
        </h1>

        {/* Description */}
        <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
          {subtitle} All team rosters, fixtures, and scoring will be unlocked immediately following the{' '}
          <span className="font-extrabold text-slate-900 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300/50">
            RPL Season 9 Squad Auction Showdown
          </span>
          .
        </p>

        {/* 3-Phase Tournament Roadmap Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-10 text-left">
          {/* Phase 1 */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs">
            <div className="flex items-center space-x-2 text-emerald-700 font-extrabold text-[11px] uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Phase 1 • Active</span>
            </div>
            <h4 className="font-display font-bold text-slate-900 text-sm">Player Registration</h4>
            <p className="text-[11px] text-slate-600 mt-1">Collecting entries across Cricket, Football & Women's leagues.</p>
          </div>

          {/* Phase 2 */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300/80 shadow-2xs">
            <div className="flex items-center space-x-2 text-amber-800 font-extrabold text-[11px] uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Phase 2 • Upcoming</span>
            </div>
            <h4 className="font-display font-bold text-slate-900 text-sm">Squad Auction Showdown</h4>
            <p className="text-[11px] text-slate-600 mt-1">Captains draft teams & allocate official jerseys.</p>
          </div>

          {/* Phase 3 */}
          <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-300/80 shadow-2xs">
            <div className="flex items-center space-x-2 text-slate-600 font-extrabold text-[11px] uppercase tracking-wider mb-1">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>Phase 3 • Matchday</span>
            </div>
            <h4 className="font-display font-bold text-slate-900 text-sm">Live Scorecard Goes Live</h4>
            <p className="text-[11px] text-slate-600 mt-1">Official matches, fixtures, ball commentary & standings.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <button
            type="button"
            onClick={onBackToHome}
            className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg active:scale-98 transition-all cursor-pointer"
          >
            Return to RPL Home
          </button>

          {onRegisterClick && (
            <button
              type="button"
              onClick={onRegisterClick}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg active:scale-98 transition-all cursor-pointer"
            >
              Register Before Auction
            </button>
          )}
        </div>

        {/* Subtle Committee / Admin Unlock Panel */}
        <div className="mt-10 pt-6 border-t border-slate-200">
          {!showPinInput ? (
            <button
              type="button"
              onClick={() => setShowPinInput(true)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-amber-700 transition-colors cursor-pointer py-1 px-3 rounded-lg hover:bg-amber-50"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>Organizer / Admin Preview Access</span>
            </button>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleUnlockSubmit}
              className="max-w-sm mx-auto space-y-2.5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-950 font-extrabold uppercase tracking-wider">
                  Committee Passcode:
                </span>
                <button
                  type="button"
                  onClick={() => setShowPinInput(false)}
                  className="text-[11px] text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN..."
                  autoFocus
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-amber-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-400 text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all cursor-pointer shrink-0"
                >
                  Unlock
                </button>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[11px] text-rose-600 flex items-center justify-center space-x-1 font-bold"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Incorrect passcode. Please check and try again.</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
