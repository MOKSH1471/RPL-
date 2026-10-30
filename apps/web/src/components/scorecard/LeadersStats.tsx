import React from 'react';
import { CricketMatch } from '@/types';
import { extractTournamentLeaders } from '@/lib/cricketData';
import { Flame, Target } from 'lucide-react';

interface LeadersStatsProps {
  matches: CricketMatch[];
}

export const LeadersStats: React.FC<LeadersStatsProps> = ({ matches }) => {
  const { topBatsmen, topBowlers } = extractTournamentLeaders(matches);

  if (topBatsmen.length === 0 && topBowlers.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200 p-8 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
          <Flame className="w-6 h-6" />
        </div>
        <h4 className="font-extrabold text-slate-900 text-base">No Tournament Stats Recorded Yet</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Player batting averages and bowling figures will calculate automatically as balls and innings are scored from the Admin Scorer.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {/* ── Orange Cap (Leading Run Scorers) ── */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center border border-orange-200">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Top Run Scorers</h3>
              <p className="text-[11px] text-slate-500">Tournament Leaderboard</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-orange-600">Runs</span>
        </div>

        {topBatsmen.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">No runs scored yet</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {topBatsmen.map((player) => (
              <div key={player.rank} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span
                    className={`w-5 text-center font-mono font-black text-xs ${
                      player.rank === 1 ? 'text-amber-500' : 'text-slate-400'
                    }`}
                  >
                    #{player.rank}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                      <span>{player.playerName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({player.teamShort})</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{player.secondaryStat}</div>
                  </div>
                </div>
                <div className="font-mono font-black text-base text-slate-900">
                  {player.statValue}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Purple Cap (Leading Wicket Takers) ── */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center border border-purple-200">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Top Wicket Takers</h3>
              <p className="text-[11px] text-slate-500">Tournament Leaderboard</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-purple-600">Wkts</span>
        </div>

        {topBowlers.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">No wickets taken yet</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {topBowlers.map((player) => (
              <div key={player.rank} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span
                    className={`w-5 text-center font-mono font-black text-xs ${
                      player.rank === 1 ? 'text-purple-600' : 'text-slate-400'
                    }`}
                  >
                    #{player.rank}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                      <span>{player.playerName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({player.teamShort})</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{player.secondaryStat}</div>
                  </div>
                </div>
                <div className="font-mono font-black text-base text-purple-600">
                  {player.statValue}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
