import React from 'react';
import { Ticket, Sparkles } from 'lucide-react';

interface MobileStickyBarProps {
  onSpectatorClick: () => void;
  onRegisterClick: () => void;
  onCheckPassClick?: () => void;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({
  onSpectatorClick,
  onRegisterClick,
}) => {
  return (
    <div className="md:hidden fixed bottom-3 left-3 right-3 z-30 max-w-lg mx-auto pointer-events-auto animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="p-1.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-slate-900/15 flex items-center gap-2">
        {/* Spectator Reg Button */}
        <button
          type="button"
          onClick={onSpectatorClick}
          className="flex-1 py-3 px-2 rounded-xl border border-amber-300 bg-amber-50/90 hover:bg-amber-100 text-amber-950 font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all active:scale-95 touch-manipulation shadow-2xs cursor-pointer whitespace-nowrap"
        >
          <Ticket className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Spectator Registration</span>
        </button>

        {/* Player Reg Button (Mobile View) */}
        <button
          type="button"
          onClick={onRegisterClick}
          className="flex-1 py-3 px-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all shadow-md shadow-orange-500/25 active:scale-95 touch-manipulation cursor-pointer whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-100 shrink-0" />
          <span>Player Registration</span>
        </button>
      </div>
    </div>
  );
};
