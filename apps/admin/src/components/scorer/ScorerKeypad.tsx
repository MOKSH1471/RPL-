import React from 'react';
import { RotateCcw, ArrowLeftRight, ShieldAlert } from 'lucide-react';

interface ScorerKeypadProps {
  onScoreRun: (runs: number) => void;
  onQuickExtra: (type: 'wide' | 'noball' | 'bye' | 'legbye', runs?: number) => void;
  onOpenWicketModal: () => void;
  onUndoLastBall: () => void;
  onRotateStrike: () => void;
  canUndo: boolean;
}

export const ScorerKeypad: React.FC<ScorerKeypadProps> = ({
  onScoreRun,
  onQuickExtra,
  onOpenWicketModal,
  onUndoLastBall,
  onRotateStrike,
  canUndo,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-2xs space-y-3">
      {/* ── Row 1: Standard Runs (Primary Keypad) ── */}
      <div className="grid grid-cols-6 gap-2">
        {/* 0 (Dot) */}
        <button
          type="button"
          onClick={() => onScoreRun(0)}
          className="h-14 sm:h-16 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-mono font-bold text-2xl border border-slate-200 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all"
        >
          <span>0</span>
          <span className="text-[9px] uppercase font-semibold text-slate-400 -mt-0.5">Dot</span>
        </button>

        {/* 1 */}
        <button
          type="button"
          onClick={() => onScoreRun(1)}
          className="h-14 sm:h-16 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-mono font-bold text-2xl border border-slate-300 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all shadow-2xs"
        >
          <span>1</span>
          <span className="text-[9px] uppercase font-semibold text-slate-500 -mt-0.5">Single</span>
        </button>

        {/* 2 */}
        <button
          type="button"
          onClick={() => onScoreRun(2)}
          className="h-14 sm:h-16 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-mono font-bold text-2xl border border-slate-300 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all shadow-2xs"
        >
          <span>2</span>
          <span className="text-[9px] uppercase font-semibold text-slate-500 -mt-0.5">Two</span>
        </button>

        {/* 3 */}
        <button
          type="button"
          onClick={() => onScoreRun(3)}
          className="h-14 sm:h-16 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-mono font-bold text-2xl border border-slate-300 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all shadow-2xs"
        >
          <span>3</span>
          <span className="text-[9px] uppercase font-semibold text-slate-500 -mt-0.5">Three</span>
        </button>

        {/* 4 (Boundary) */}
        <button
          type="button"
          onClick={() => onScoreRun(4)}
          className="h-14 sm:h-16 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-2xl border border-emerald-700 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all shadow-2xs"
        >
          <span>4</span>
          <span className="text-[9px] uppercase font-extrabold tracking-wider text-emerald-100 -mt-0.5">Four</span>
        </button>

        {/* 6 (Maximum) */}
        <button
          type="button"
          onClick={() => onScoreRun(6)}
          className="h-14 sm:h-16 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold text-2xl border border-purple-700 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all shadow-2xs"
        >
          <span>6</span>
          <span className="text-[9px] uppercase font-extrabold tracking-wider text-purple-100 -mt-0.5">Six</span>
        </button>
      </div>

      {/* ── Row 2: Extras & Match Actions ── */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {/* Wide */}
        <button
          type="button"
          onClick={() => onQuickExtra('wide', 1)}
          className="py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex flex-col items-center justify-center cursor-pointer active:scale-95"
        >
          <span className="font-mono text-sm font-bold">WD</span>
          <span className="text-[9px] text-amber-800 font-medium">+1 Wide</span>
        </button>

        {/* No Ball */}
        <button
          type="button"
          onClick={() => onQuickExtra('noball', 1)}
          className="py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-300 font-bold text-xs flex flex-col items-center justify-center cursor-pointer active:scale-95"
        >
          <span className="font-mono text-sm font-bold">NB</span>
          <span className="text-[9px] text-orange-800 font-medium">+1 No Ball</span>
        </button>

        {/* Bye */}
        <button
          type="button"
          onClick={() => onQuickExtra('bye', 1)}
          className="py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs flex flex-col items-center justify-center cursor-pointer active:scale-95"
        >
          <span className="font-mono text-sm font-bold">BYE</span>
          <span className="text-[9px] text-slate-500 font-medium">+1 Bye</span>
        </button>

        {/* Leg Bye */}
        <button
          type="button"
          onClick={() => onQuickExtra('legbye', 1)}
          className="py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs flex flex-col items-center justify-center cursor-pointer active:scale-95"
        >
          <span className="font-mono text-sm font-bold">LB</span>
          <span className="text-[9px] text-slate-500 font-medium">+1 Leg Bye</span>
        </button>

        {/* Swap Strike */}
        <button
          type="button"
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
