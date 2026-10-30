import React from 'react';
import { CricketMatch } from '@/types';
import { formatOvers } from '@/lib/cricketData';
import { ChevronRight } from 'lucide-react';

interface MatchCardProps {
  match: CricketMatch;
  onSelect: (match: CricketMatch) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onSelect }) => {
  const innings1 = match.innings1;
  const innings2 = match.innings2;

  // Determine batting and bowling teams
  const team1 = innings1?.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
  const team2 = innings1?.battingTeamId === match.teamA.id ? match.teamB : match.teamA;

  const team1Score = innings1 && innings1.legalBallsBowled > 0
    ? `${innings1.totalRuns}/${innings1.totalWickets} (${formatOvers(innings1.legalBallsBowled)})`
    : innings1 && innings1.totalRuns > 0
    ? `${innings1.totalRuns}/${innings1.totalWickets} (0.0)`
    : match.status === 'upcoming'
    ? 'Yet to bat'
    : '0/0 (0.0)';

  const team2Score = innings2 && innings2.legalBallsBowled > 0
    ? `${innings2.totalRuns}/${innings2.totalWickets} (${formatOvers(innings2.legalBallsBowled)})`
    : innings2 && innings2.totalRuns > 0
    ? `${innings2.totalRuns}/${innings2.totalWickets} (0.0)`
    : match.status === 'live' && match.currentInningsNumber === 2
    ? '0/0 (0.0)'
    : 'Yet to bat';

  // Status badge
  const renderStatus = () => {
    switch (match.status) {
      case 'live':
        return (
          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs sm:text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Live</span>
          </div>
        );
      case 'innings_break':
        return <span className="text-amber-400 font-bold text-xs sm:text-sm">Innings Break</span>;
      case 'completed':
        return <span className="text-slate-400 font-semibold text-xs sm:text-sm">Completed</span>;
      case 'upcoming':
        return <span className="text-sky-400 font-semibold text-xs sm:text-sm">Upcoming</span>;
      default:
        return <span className="text-slate-400 font-semibold text-xs sm:text-sm">Stumps</span>;
    }
  };

  // Team Emblem
  const renderTeamEmblem = (color?: string, shortName?: string) => {
    const safeColor = color || '#D97706';
    const safeText = (shortName || 'TM').slice(0, 2).toUpperCase();
    return (
      <div
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-white text-[11px] sm:text-xs font-black shadow-xs shrink-0 border border-white/10"
        style={{ backgroundColor: safeColor }}
      >
        {safeText}
      </div>
    );
  };

  // Bottom equation / context line
  const getMatchContextLine = () => {
    if (match.resultSummary) {
      return match.resultSummary;
    }
    if (match.status === 'live' && innings2 && match.target) {
      const runsNeeded = Math.max(0, match.target - innings2.totalRuns);
      const ballsRemaining = Math.max(0, match.oversPerSide * 6 - innings2.legalBallsBowled);
      return `${team2.shortName || team2.name} need ${runsNeeded} runs in ${ballsRemaining} balls · Target ${match.target}`;
    }
    if (match.status === 'upcoming') {
      return match.venue ? `Venue: ${match.venue}` : 'Match scheduled';
    }
    if (match.venue) {
      return match.venue;
    }
    return 'Live RPL Match';
  };

  return (
    <div
      onClick={() => onSelect(match)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(match);
        }
      }}
      className="group relative bg-slate-900/95 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl active:scale-[0.99] select-none text-slate-100"
    >
      {/* ── Top Header Row: Match Stage/Overs & Status ── */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <span className="text-xs sm:text-[13px] text-slate-400 font-medium truncate">
          {match.stage || `Match ${match.matchNumber || 1} · ${match.oversPerSide || 10} Overs`}
        </span>
        <div className="shrink-0">{renderStatus()}</div>
      </div>

      {/* ── Middle Rows: Team 1 & Team 2 ── */}
      <div className="py-3.5 space-y-2.5">
        {/* Team 1 Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            {renderTeamEmblem(team1.colorCode, team1.shortName)}
            <span className="font-semibold text-slate-100 text-sm sm:text-base tracking-tight truncate group-hover:text-amber-300 transition-colors">
              {team1.name}
            </span>
          </div>
          <div className="text-right shrink-0">
            <span className="font-mono font-bold text-slate-100 text-sm sm:text-base">
              {team1Score}
            </span>
          </div>
        </div>

        {/* Team 2 Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            {renderTeamEmblem(team2.colorCode, team2.shortName)}
            <span className="font-semibold text-slate-100 text-sm sm:text-base tracking-tight truncate group-hover:text-amber-300 transition-colors">
              {team2.name}
            </span>
          </div>
          <div className="text-right shrink-0">
            <span className="font-mono font-bold text-slate-100 text-sm sm:text-base">
              {team2Score}
            </span>
            {match.target && match.status === 'live' && match.currentInningsNumber === 2 && (
              <div className="text-[11px] text-amber-400 font-medium font-mono">
                Target {match.target}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Summary Row: Context Line ── */}
      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs sm:text-[13px] text-slate-400">
        <span className="line-clamp-1 pr-2">{getMatchContextLine()}</span>
        <span className="shrink-0 flex items-center text-amber-400 group-hover:translate-x-0.5 transition-transform text-xs font-semibold">
          Scorecard <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </span>
      </div>
    </div>
  );
};
