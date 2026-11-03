import React, { useState, useRef, useEffect } from 'react';
import { Ticket, Sparkles, ChevronUp, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileStickyBarProps {
  onSpectatorClick: () => void;
  onRegisterClick: () => void;
  onCheckPassClick?: () => void;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({
  onSpectatorClick,
  onRegisterClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={barRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className="md:hidden fixed bottom-3 left-3 right-3 z-30 max-w-md mx-auto pointer-events-auto animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      {/* Pop-up Modal Card with 2 Buttons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="mb-2 p-2 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-slate-900/20 space-y-1.5 ring-1 ring-black/5"
          >
            {/* Player Registration Option */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onRegisterClick();
              }}
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-300/80 active:scale-98 flex items-center gap-3 text-left transition-all cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-xs text-slate-900 flex items-center justify-between">
                  <span>Player Registration</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-900 border border-amber-300">Sports</span>
                </div>
                <p className="text-[10.5px] text-slate-600 truncate mt-0.5">Cricket, Football, TT, Carrom & more</p>
              </div>
            </button>

            {/* 90's Nostalgia Games Pass Option */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onSpectatorClick();
              }}
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-orange-500/5 hover:from-orange-500/20 hover:to-pink-500/20 border border-orange-300/80 active:scale-98 flex items-center gap-3 text-left transition-all cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Ticket className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-xs text-slate-900 flex items-center justify-between">
                  <span>90’s Nostalgia Pass</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-orange-100 text-orange-900 border border-orange-300">Pass</span>
                </div>
                <p className="text-[10.5px] text-slate-600 truncate mt-0.5">Full Stay Experience</p>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Floating Trigger Button: "Register Now" */}
      <div className="p-1 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-slate-900/15">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/25 active:scale-98 touch-manipulation cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-200 shrink-0" />
          <span>Register Now</span>
          <ChevronUp className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-amber-200' : 'text-white/80'}`} />
        </button>
      </div>
    </div>
  );
};
