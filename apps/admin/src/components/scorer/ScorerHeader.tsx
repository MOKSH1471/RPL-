import React from 'react';
import { Play, RotateCcw, Trophy, CheckCircle2, Flag } from 'lucide-react';
import { CricketMatch } from '@/types/cricket';
import { formatOvers, calculateRunRate } from '@/lib/cricketMockData';

interface ScorerHeaderProps {
  match: CricketMatch;
  onBackToHome: () => void;
  onOpenNewMatchModal: () => void;
  onSwitchInnings: () => void;
  onManualEndMatch?: () => void;
  onCancelMatch?: () => void;
}

export const ScorerHeader: React.FC<ScorerHeaderProps> = ({
  match,
  onSwitchInnings,
  onManualEndMatch,
  onCancelMatch,
}) => {
  const currentInnings =
    match.currentInningsNumber === 1 ? match.innings1 : match.innings2 || match.innings1;
  const isSecondInnings = match.currentInningsNumber === 2;

  const battingTeam =
    currentInnings.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
  const bowlingTeam =
    currentInnings.bowlingTeamId === match.teamA.id ? match.teamA : match.teamB;

  const oversFormatted = formatOvers(currentInnings.legalBallsBowled);
  const currentRunRate = calculateRunRate(
    currentInnings.totalRuns,
    currentInnings.legalBallsBowled
  );

  // Target calculations for 2nd innings
  const target = match.target || (match.innings1 ? match.innings1.totalRuns + 1 : 0);
  const remainingRuns = isSecondInnings ? Math.max(0, target - currentInnings.totalRuns) : 0;
  const maxBalls = match.oversPerSide * 6;
  const remainingBalls = isSecondInnings
    ? Math.max(0, maxBalls - currentInnings.legalBallsBowled)
    : 0;
  const reqRunRate =
    remainingBalls > 0 ? (remainingRuns / (remainingBalls / 6)).toFixed(2) : '0.00';

  return (
    <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200">
      {/* Match Meta Information Bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 text-xs text-slate-500">
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="font-bold text-slate-800">{match.tournamentName}</span>
          <span>•</span>
          <span>{match.stage}</span>
          <span>•</span>
          <span>{match.oversPerSide} Overs match</span>
        </div>

        <div className="flex items-center space-x-2">
          {match.status === 'completed' ? (
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-900 font-extrabold text-[11px] uppercase tracking-wider flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              <span>Match Completed</span>
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-bold text-[11px]">
              {currentInnings.inningsNumber === 1 ? '1st Innings' : '2nd Innings'}
            </span>
          )}
        </div>
      </div>

      {/* Main Score & Teams Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Batting Team and Large Score Display */}
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-sm sm:text-base font-bold text-slate-800">
              {battingTeam.name}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold border border-slate-200">
              {battingTeam.shortName}
            </span>
            <span className="text-xs text-slate-400 font-medium">vs {bowlingTeam.shortName}</span>
          </div>

          <div className="flex items-baseline space-x-3 mt-1.5">
            <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-950">
              {currentInnings.totalRuns}/{currentInnings.totalWickets}
            </span>
            <span className="text-lg sm:text-xl font-mono text-slate-500 font-semibold">
              ({oversFormatted} / {match.oversPerSide} ov)
            </span>
          </div>

          {/* Context subline & Toss Display */}
          <div className="text-xs mt-1.5 font-medium flex items-center space-x-2 flex-wrap gap-y-1">
            {match.status === 'completed' ? (
              <span className="text-emerald-800 font-extrabold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300 flex items-center space-x-1.5 text-xs shadow-2xs">
                <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{match.resultSummary || 'Match Finished'}</span>
              </span>
            ) : isSecondInnings ? (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Target {target} • Need {remainingRuns} runs from {remainingBalls} balls (Req RR: {reqRunRate})
              </span>
            ) : (
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-bold">
                <span>🏆 Toss:</span>
                <span>
                  {(match.tossWinnerId === match.teamB.id ? match.teamB.name : match.teamA.name)} won & elected to{' '}
                  <strong className="uppercase">{match.tossDecision} first</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Key rates & Actions */}
        <div className="flex flex-row sm:flex-col items-end justify-between sm:justify-center gap-3">
          <div className="flex items-center space-x-4 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 font-mono text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">CRR</span>
              <span className="font-bold text-slate-900 text-sm">{currentRunRate}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                {isSecondInnings ? 'Target' : 'Projected'}
              </span>
              <span className="font-bold text-amber-600 text-sm">
                {isSecondInnings
                  ? target
                  : currentInnings.legalBallsBowled > 0
                  ? Math.round(Number(currentRunRate) * match.oversPerSide)
                  : '--'}
              </span>
            </div>
          </div>

          {/* Innings & Match Actions */}
          <div className="flex items-center space-x-2 flex-wrap">
            {match.status === 'completed' ? (
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center space-x-1 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Concluded</span>
                </span>
                <button
                  type="button"
                  onClick={onSwitchInnings}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer border border-slate-200"
                  title="View 1st Innings Score"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">1st Innings</span>
                </button>
              </div>
            ) : !isSecondInnings ? (
              <button
                type="button"
                onClick={onSwitchInnings}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>End 1st Innings</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onManualEndMatch}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                  title="Conclude match and finalize winner"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Declare / End Match</span>
                </button>

                <button
                  type="button"
                  onClick={onSwitchInnings}
                  className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer border border-slate-200"
                  title="Return to 1st Innings"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">1st Innings</span>
                </button>
              </>
            )}

            {match.status !== 'completed' && onCancelMatch && (
              <button
                type="button"
                onClick={onCancelMatch}
                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                title="Abandon or Cancel Match"
              >
                <span>End / Cancel</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
