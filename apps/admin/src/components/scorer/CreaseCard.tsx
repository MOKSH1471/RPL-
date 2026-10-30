import React from 'react';
import { ArrowLeftRight, UserCheck } from 'lucide-react';
import { LiveBatsman, LiveBowler } from '@/types/cricket';
import { formatOvers } from '@/lib/cricketMockData';

interface CreaseCardProps {
  striker?: LiveBatsman;
  nonStriker?: LiveBatsman;
  activeBowler?: LiveBowler;
  onRotateStrike: () => void;
  onOpenChangeBowlerModal: () => void;
  onOpenChangeBatsmanModal?: (target: 'striker' | 'nonStriker') => void;
}

export const CreaseCard: React.FC<CreaseCardProps> = ({
  striker,
  nonStriker,
  activeBowler,
  onRotateStrike,
  onOpenChangeBowlerModal,
  onOpenChangeBatsmanModal,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
      {/* ── Batsmen at Crease (Col 7) ── */}
      <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Batting
          </span>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={onRotateStrike}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              title="Rotate Strike"
            >
              <ArrowLeftRight className="w-3 h-3 text-slate-600" />
              <span className="text-[11px]">Swap Strike</span>
            </button>

            {onOpenChangeBatsmanModal && (
              <button
                type="button"
                onClick={() => onOpenChangeBatsmanModal('striker')}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors cursor-pointer"
                title="Change Batsman"
              >
                <UserCheck className="w-3 h-3 text-amber-600" />
                <span className="text-[11px]">Change Batter</span>
              </button>
            )}
          </div>
        </div>

        {/* Batsmen Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-1.5 font-bold">Batter</th>
                <th className="pb-1.5 text-right">R</th>
                <th className="pb-1.5 text-right">B</th>
                <th className="pb-1.5 text-right">4s</th>
                <th className="pb-1.5 text-right">6s</th>
                <th className="pb-1.5 text-right">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {/* Striker */}
              <tr className="bg-amber-50/50">
                <td className="py-2 pr-2">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                    <span className="truncate">{striker?.name || 'Batsman 1'}</span>
                    <span className="text-amber-600 font-extrabold text-sm">*</span>
                    {onOpenChangeBatsmanModal && (
                      <button
                        type="button"
                        onClick={() => onOpenChangeBatsmanModal('striker')}
                        className="text-[10px] px-1 py-0.2 rounded text-slate-400 hover:text-amber-800 hover:bg-amber-100 transition-colors font-medium cursor-pointer"
                        title="Change Striker"
                      >
                        Change
                      </button>
                    )}
                  </div>
                </td>
                <td className="py-2 text-right font-mono font-bold text-slate-900 text-sm">
                  {striker?.runs || 0}
                </td>
                <td className="py-2 text-right font-mono text-slate-500">
                  {striker?.balls || 0}
                </td>
                <td className="py-2 text-right font-mono text-slate-600">
                  {striker?.fours || 0}
                </td>
                <td className="py-2 text-right font-mono text-slate-600">
                  {striker?.sixes || 0}
                </td>
                <td className="py-2 text-right font-mono text-slate-600">
                  {striker?.strikeRate.toFixed(1) || '0.0'}
                </td>
              </tr>

              {/* Non-Striker */}
              <tr>
                <td className="py-2 pr-2 text-slate-700">
                  <div className="flex items-center space-x-1.5 font-medium text-slate-800">
                    <span className="truncate">{nonStriker?.name || 'Batsman 2'}</span>
                    {onOpenChangeBatsmanModal && (
                      <button
                        type="button"
                        onClick={() => onOpenChangeBatsmanModal('nonStriker')}
                        className="text-[10px] px-1 py-0.2 rounded text-slate-400 hover:text-amber-800 hover:bg-amber-100 transition-colors font-medium cursor-pointer"
                        title="Change Non-Striker"
                      >
                        Change
                      </button>
                    )}
                  </div>
                </td>
                <td className="py-2 text-right font-mono font-bold text-slate-900 text-sm">
                  {nonStriker?.runs || 0}
                </td>
                <td className="py-2 text-right font-mono text-slate-500">
                  {nonStriker?.balls || 0}
                </td>
                <td className="py-2 text-right font-mono text-slate-600">
                  {nonStriker?.fours || 0}
                </td>
                <td className="py-2 text-right font-mono text-slate-600">
                  {nonStriker?.sixes || 0}
                </td>
                <td className="py-2 text-right font-mono text-slate-600">
                  {nonStriker?.strikeRate.toFixed(1) || '0.0'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Active Bowler (Col 5) ── */}
      <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Bowler
            </span>

            <button
              type="button"
              onClick={onOpenChangeBowlerModal}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <UserCheck className="w-3 h-3 text-slate-600" />
              <span className="text-[11px]">Change</span>
            </button>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <div className="font-bold text-slate-900 text-sm">
                {activeBowler?.name || 'Current Bowler'}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Right-arm Fast</div>
            </div>

            <div className="text-right">
              <span className="font-mono font-bold text-slate-900 text-base">
                {activeBowler?.wickets || 0}/{activeBowler?.runsConceded || 0}
              </span>
              <span className="text-xs text-slate-500 font-mono ml-1.5">
                ({activeBowler ? formatOvers(activeBowler.legalBalls) : '0.0'} ov)
              </span>
            </div>
          </div>
        </div>

        {/* Clean Bowler Metrics Grid */}
        <div className="grid grid-cols-4 gap-1 pt-3 mt-2 border-t border-slate-100 text-center font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">M</span>
            <span className="font-bold text-slate-700">{activeBowler?.maidens || 0}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Econ</span>
            <span className="font-bold text-slate-700">{activeBowler?.economy.toFixed(1) || '0.0'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Wd</span>
            <span className="font-bold text-slate-700">{activeBowler?.wides || 0}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Nb</span>
            <span className="font-bold text-slate-700">{activeBowler?.noballs || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
