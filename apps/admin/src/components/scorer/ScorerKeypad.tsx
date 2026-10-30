import React, { useState } from 'react';
import { RotateCcw, ArrowLeftRight, ShieldAlert } from 'lucide-react';

interface ScorerKeypadProps {
  onScoreRun: (runs: number) => void;
  onQuickExtra: (type: 'wide' | 'noball' | 'bye' | 'legbye', runs?: number, runsOffBat?: number) => void;
  onOpenWicketModal: () => void;
  onUndoLastBall: () => void;
  onRotateStrike: () => void;
  canUndo: boolean;
  disabled?: boolean;
}

export const ScorerKeypad: React.FC<ScorerKeypadProps> = ({
  onScoreRun,
  onQuickExtra,
  onOpenWicketModal,
  onUndoLastBall,
  onRotateStrike,
  canUndo,
  disabled = false,
}) => {
  const [activeExtraModal, setActiveExtraModal] = useState<'none' | 'wide' | 'noball' | 'bye' | 'legbye'>('none');
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-2xs space-y-3 ${disabled ? "opacity-40 pointer-events-none select-none" : ""}`}>
      {disabled && (
        <div className="text-center py-2 text-rose-600 font-extrabold text-xs tracking-wide bg-rose-50 border border-rose-200 rounded-xl">
          Innings Concluded (All Overs Bowled or All Out). Switch innings or finish match above.
        </div>
      )}
      {/* ── Row 1: Standard Runs (Primary Keypad) ── */}
      <div className="grid grid-cols-6 gap-2">
        {/* 0 (Dot) */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onScoreRun(0)}
          className="h-14 sm:h-16 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-mono font-bold text-2xl border border-slate-200 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all"
        >
          <span>0</span>
          <span className="text-[9px] uppercase font-semibold text-slate-400 -mt-0.5">Dot</span>
        </button>

        {/* 1 */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onScoreRun(1)}
          className="h-14 sm:h-16 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-mono font-bold text-2xl border border-slate-300 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all shadow-2xs"
        >
          <span>1</span>
          <span className="text-[9px] uppercase font-semibold text-slate-500 -mt-0.5">Single</span>
        </button>

        {/* 2 */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onScoreRun(2)}
          className="h-14 sm:h-16 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-mono font-bold text-2xl border border-slate-300 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all shadow-2xs"
        >
          <span>2</span>
          <span className="text-[9px] uppercase font-semibold text-slate-500 -mt-0.5">Two</span>
        </button>

        {/* 3 */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onScoreRun(3)}
          className="h-14 sm:h-16 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-mono font-bold text-2xl border border-slate-300 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all shadow-2xs"
        >
          <span>3</span>
          <span className="text-[9px] uppercase font-semibold text-slate-500 -mt-0.5">Three</span>
        </button>

        {/* 4 (Boundary) */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onScoreRun(4)}
          className="h-14 sm:h-16 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-2xl border border-emerald-700 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all shadow-2xs"
        >
          <span>4</span>
          <span className="text-[9px] uppercase font-extrabold tracking-wider text-emerald-100 -mt-0.5">Four</span>
        </button>

        {/* 6 (Maximum) */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onScoreRun(6)}
          className="h-14 sm:h-16 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold text-2xl border border-purple-700 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all shadow-2xs"
        >
          <span>6</span>
          <span className="text-[9px] uppercase font-extrabold tracking-wider text-purple-100 -mt-0.5">Six</span>
        </button>
      </div>

      {/* ── Sub-Options for Extras ── */}
      {activeExtraModal === 'noball' && (
        <div className="p-2.5 bg-orange-50 border border-orange-200 rounded-xl space-y-1.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-[11px] font-bold text-orange-950">
            <span>No Ball — Select runs scored off bat:</span>
            <button type="button" onClick={() => setActiveExtraModal('none')} className="text-orange-600 hover:text-orange-900 font-bold px-1.5 py-0.5 rounded cursor-pointer">✕ Close</button>
          </div>
          <div className="grid grid-cols-5 gap-1.5 font-bold text-xs">
            <button type="button" onClick={() => { onQuickExtra('noball', 1, 0); setActiveExtraModal('none'); }} className="py-1.5 rounded-lg bg-white border border-orange-200 hover:bg-orange-100 text-orange-950 cursor-pointer">NB (Dot)</button>
            <button type="button" onClick={() => { onQuickExtra('noball', 1, 1); setActiveExtraModal('none'); }} className="py-1.5 rounded-lg bg-white border border-orange-200 hover:bg-orange-100 text-orange-950 cursor-pointer">NB + 1</button>
            <button type="button" onClick={() => { onQuickExtra('noball', 1, 2); setActiveExtraModal('none'); }} className="py-1.5 rounded-lg bg-white border border-orange-200 hover:bg-orange-100 text-orange-950 cursor-pointer">NB + 2</button>
            <button type="button" onClick={() => { onQuickExtra('noball', 1, 4); setActiveExtraModal('none'); }} className="py-1.5 rounded-lg bg-emerald-600 text-white font-black hover:bg-emerald-700 cursor-pointer">NB + 4</button>
            <button type="button" onClick={() => { onQuickExtra('noball', 1, 6); setActiveExtraModal('none'); }} className="py-1.5 rounded-lg bg-purple-600 text-white font-black hover:bg-purple-700 cursor-pointer">NB + 6</button>
          </div>
        </div>
      )}

      {activeExtraModal === 'wide' && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-950">
            <span>Wide Ball — Select extra runs:</span>
            <button type="button" onClick={() => setActiveExtraModal('none')} className="text-amber-600 hover:text-amber-900 font-bold px-1.5 py-0.5 rounded cursor-pointer">✕ Close</button>
          </div>
          <div className="grid grid-cols-4 gap-1.5 font-bold text-xs">
            <button type="button" onClick={() => { onQuickExtra('wide', 1); setActiveExtraModal('none'); }} className="py-1.5 rounded-lg bg-white border border-amber-200 hover:bg-amber-100 text-amber-950 cursor-pointer">1 Wide</button>
            <button type="button" onClick={() => { onQuickExtra('wide', 2); setActiveExtraModal('none'); }} className="py-1.5 rounded-lg bg-white border border-amber-200 hover:bg-amber-100 text-amber-950 cursor-pointer">2 Wides (+1)</button>
            <button type="button" onClick={() => { onQuickExtra('wide', 3); setActiveExtraModal('none'); }} className="py-1.5 rounded-lg bg-white border border-amber-200 hover:bg-amber-100 text-amber-950 cursor-pointer">3 Wides (+2)</button>
            <button type="button" onClick={() => { onQuickExtra('wide', 5); setActiveExtraModal('none'); }} className="py-1.5 rounded-lg bg-amber-500 text-slate-950 font-black hover:bg-amber-600 cursor-pointer">5 Wides (+4 Boundary)</button>
          </div>
        </div>
      )}

      {activeExtraModal === 'bye' && (
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
            <span>Byes — Select runs:</span>
            <button type="button" onClick={() => setActiveExtraModal('none')} className="text-slate-600 hover:text-slate-900 font-bold px-1.5 py-0.5 rounded cursor-pointer">✕ Close</button>
          </div>
          <div className="grid grid-cols-4 gap-1.5 font-bold text-xs">
            <button type="button" onClick={() => { onQuickExtra('bye', 1); setActiveExtraModal('none'); }} className="py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-900 cursor-pointer">1 Bye</button>
            <button type="button" onClick={() => { onQuickExtra('bye', 2); setActiveExtraModal('none'); }} className="py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-900 cursor-pointer">2 Byes</button>
            <button type="button" onClick={() => { onQuickExtra('bye', 3); setActiveExtraModal('none'); }} className="py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-900 cursor-pointer">3 Byes</button>
            <button type="button" onClick={() => { onQuickExtra('bye', 4); setActiveExtraModal('none'); }} className="py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 cursor-pointer">4 Byes</button>
          </div>
        </div>
      )}

      {activeExtraModal === 'legbye' && (
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
            <span>Leg Byes — Select runs:</span>
            <button type="button" onClick={() => setActiveExtraModal('none')} className="text-slate-600 hover:text-slate-900 font-bold px-1.5 py-0.5 rounded cursor-pointer">✕ Close</button>
          </div>
          <div className="grid grid-cols-4 gap-1.5 font-bold text-xs">
            <button type="button" onClick={() => { onQuickExtra('legbye', 1); setActiveExtraModal('none'); }} className="py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-900 cursor-pointer">1 Leg Bye</button>
            <button type="button" onClick={() => { onQuickExtra('legbye', 2); setActiveExtraModal('none'); }} className="py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-900 cursor-pointer">2 Leg Byes</button>
            <button type="button" onClick={() => { onQuickExtra('legbye', 3); setActiveExtraModal('none'); }} className="py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-900 cursor-pointer">3 Leg Byes</button>
            <button type="button" onClick={() => { onQuickExtra('legbye', 4); setActiveExtraModal('none'); }} className="py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 cursor-pointer">4 Leg Byes</button>
          </div>
        </div>
      )}

      {/* ── Row 2: Extras & Match Actions ── */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {/* Wide */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setActiveExtraModal(activeExtraModal === 'wide' ? 'none' : 'wide')}
          className="py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex flex-col items-center justify-center cursor-pointer active:scale-95"
        >
          <span className="font-mono text-sm font-bold">WD</span>
          <span className="text-[9px] text-amber-800 font-medium">+1 Wide</span>
        </button>

        {/* No Ball */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setActiveExtraModal(activeExtraModal === 'noball' ? 'none' : 'noball')}
          className="py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-300 font-bold text-xs flex flex-col items-center justify-center cursor-pointer active:scale-95"
        >
          <span className="font-mono text-sm font-bold">NB</span>
          <span className="text-[9px] text-orange-800 font-medium">+1 No Ball</span>
        </button>

        {/* Bye */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setActiveExtraModal(activeExtraModal === 'bye' ? 'none' : 'bye')}
          className="py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs flex flex-col items-center justify-center cursor-pointer active:scale-95"
        >
          <span className="font-mono text-sm font-bold">BYE</span>
          <span className="text-[9px] text-slate-500 font-medium">+1 Bye</span>
        </button>

        {/* Leg Bye */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setActiveExtraModal(activeExtraModal === 'legbye' ? 'none' : 'legbye')}
          className="py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs flex flex-col items-center justify-center cursor-pointer active:scale-95"
        >
          <span className="font-mono text-sm font-bold">LB</span>
          <span className="text-[9px] text-slate-500 font-medium">+1 Leg Bye</span>
        </button>

        {/* Swap Strike */}
        <button
          type="button"
          disabled={disabled}
          onClick={onRotateStrike}
          className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex flex-col items-center justify-center cursor-pointer active:scale-95 border border-slate-200"
        >
          <ArrowLeftRight className="w-4 h-4 text-slate-600 mb-0.5" />
          <span className="text-[10px]">Swap Strike</span>
        </button>

        {/* Undo Ball */}
        <button
          type="button"
          onClick={onUndoLastBall}
          disabled={!canUndo}
          className={`py-2.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-colors border ${
            canUndo
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 cursor-pointer active:scale-95'
              : 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
          }`}
        >
          <RotateCcw className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Undo</span>
        </button>

        {/* WICKET BUTTON (Direct, clear red) */}
        <button
          type="button"
          disabled={disabled}
          onClick={onOpenWicketModal}
          className="col-span-4 sm:col-span-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex flex-col items-center justify-center cursor-pointer active:scale-95 shadow-xs border border-red-700"
        >
          <span className="font-black text-sm uppercase tracking-wider">OUT</span>
          <span className="text-[9px] text-red-100 uppercase">Wicket</span>
        </button>
      </div>
    </div>
  );
};
