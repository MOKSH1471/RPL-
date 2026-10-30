import React from 'react';
import { CricketMatch, InningsState, BallEvent } from '@/types';
import { formatOvers, calculateRunRate, calculateRequiredRunRate } from '@/lib/cricketData';
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

  const currentInnings: InningsState | undefined =
    match.currentInningsNumber === 2 ? innings2 : innings1;
  const battingTeam = currentInnings?.battingTeamId === match.teamA.id ? match.teamA : match.teamB;

  const isTeam1Batting = match.status === 'live' && currentInnings?.battingTeamId === team1.id;
  const isTeam2Batting = match.status === 'live' && currentInnings?.battingTeamId === team2.id;

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

  // Extract recent balls of current over (up to 6)
  const recentBalls: BallEvent[] = React.useMemo(() => {
    if (!currentInnings || match.status !== 'live') return [];
    if (currentInnings.currentOverBalls && currentInnings.currentOverBalls.length > 0) {
      return currentInnings.currentOverBalls;
    }
    if (currentInnings.balls && currentInnings.balls.length > 0) {
      return [...currentInnings.balls].slice(0, 6).reverse();
    }
    return [];
  }, [currentInnings, match.status]);

  // Extract active batsmen on crease (if live)
  const activeStriker = currentInnings?.batsmen?.find(
    (b) => b.isStriker || b.playerId === currentInnings.activeStrikerId
  );
  const activeNonStriker = currentInnings?.batsmen?.find(
    (b) => !b.isStriker && !b.isOut && (b.playerId === currentInnings.activeNonStrikerId || b.playerId !== activeStriker?.playerId)
  );
  const activeBowler = currentInnings?.bowlers?.find(
    (bw) => bw.playerId === currentInnings.activeBowlerId
  ) || currentInnings?.bowlers?.[0];

  // Current Run Rate & Required Run Rate
  const crr = currentInnings ? calculateRunRate(currentInnings.totalRuns, currentInnings.legalBallsBowled) : '0.00';
  let rrr = '';
  if (match.status === 'live' && match.currentInningsNumber === 2 && match.target && innings2) {
    const runsNeeded = Math.max(0, match.target - innings2.totalRuns);
    const ballsRemaining = Math.max(0, match.oversPerSide * 6 - innings2.legalBallsBowled);
    rrr = calculateRequiredRunRate(runsNeeded, ballsRemaining);
  }

  // Status badge with clean light styling (no neon/dark/ai slop)
  const renderStatus = () => {
    switch (match.status) {
      case 'live':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/90 text-xs font-bold shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
            <span>LIVE</span>
          </span>
        );
      case 'innings_break':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
            Innings Break
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
            Finished
          </span>
        );
      case 'upcoming':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-50/70 text-amber-900 border border-amber-200/70 text-xs font-semibold">
            Upcoming
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
            Match {match.matchNumber || 1}
          </span>
        );
    }
  };

  // Team Emblem: clean squircle with team color & initials
  const renderTeamEmblem = (color?: string, shortName?: string) => {
    const safeColor = color || '#D97706';
    const safeText = (shortName || 'TM').slice(0, 2).toUpperCase();
    return (
      <div
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-white text-[11px] sm:text-xs font-black shrink-0 shadow-2xs border border-black/10"
        style={{ backgroundColor: safeColor }}
      >
        {safeText}
      </div>
    );
  };

  // Ball token renderer with clean sports palette
  const renderBallToken = (b: BallEvent, idx: number) => {
    let text = `${b.runsOffBat || 0}`;
    let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';

    if (b.isWicket) {
      text = 'W';
      badgeClass = 'bg-rose-100 text-rose-800 border-rose-300 font-black animate-pulse';
    } else if (b.runsOffBat === 6) {
      text = '6';
      badgeClass = 'bg-amber-100 text-amber-900 border-amber-300 font-black';
    } else if (b.runsOffBat === 4) {
      text = '4';
      badgeClass = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black';
    } else if (b.isExtra && b.extraType === 'wide') {
      text = 'Wd';
      badgeClass = 'bg-orange-50 text-orange-800 border-orange-200 text-[10px]';
    } else if (b.isExtra && b.extraType === 'noball') {
      text = 'Nb';
      badgeClass = 'bg-orange-50 text-orange-800 border-orange-200 text-[10px]';
    } else if (b.runsOffBat === 0 && !b.isExtra) {
      text = '•';
      badgeClass = 'bg-slate-100 text-slate-500 border-slate-200 font-bold';
    }

    return (
      <span
        key={b.id || idx}
        className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full border text-[11px] font-mono font-bold shrink-0 ${badgeClass}`}
      >
        {text}
      </span>
    );
  };

  // Match context / summary line
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
    return 'RPL Season 9 Match';
  };

  const accentColor = battingTeam?.colorCode || team1?.colorCode || '#D97706';

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
      className="group relative bg-white hover:bg-amber-50/20 border border-slate-200/90 hover:border-amber-400/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md active:scale-[0.99] select-none text-slate-900 overflow-hidden"
    >
      {/* 4px Left Team Accent Stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 transition-opacity"
        style={{ backgroundColor: accentColor }}
      />

      {/* ── Top Header Row: Stage / Venue & Status ── */}
      <div className="flex items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-slate-100">
        <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
          {match.stage || `Match ${match.matchNumber || 1}`} · {match.oversPerSide || 10} Overs
          {match.venue ? ` · ${match.venue}` : ''}
        </span>
        <div className="shrink-0">{renderStatus()}</div>
      </div>

      {/* ── Team Rows ── */}
      <div className="py-3 space-y-2.5">
        {/* Team 1 */}
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            {renderTeamEmblem(team1.colorCode, team1.shortName)}
            <div className="flex items-center space-x-1.5 truncate">
              <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight truncate group-hover:text-amber-800 transition-colors">
                {team1.name}
              </span>
              {isTeam1Batting && (
                <span className="text-[11px] text-amber-700 font-bold px-1.5 py-0.2 rounded-md bg-amber-100/80 shrink-0">
                  Batting
                </span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="font-mono tabular-nums font-black text-slate-900 text-sm sm:text-base">
              {team1Score}
            </span>
          </div>
        </div>

        {/* Team 2 */}
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            {renderTeamEmblem(team2.colorCode, team2.shortName)}
            <div className="flex items-center space-x-1.5 truncate">
              <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight truncate group-hover:text-amber-800 transition-colors">
                {team2.name}
              </span>
              {isTeam2Batting && (
                <span className="text-[11px] text-amber-700 font-bold px-1.5 py-0.2 rounded-md bg-amber-100/80 shrink-0">
                  Batting
                </span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="font-mono tabular-nums font-black text-slate-900 text-sm sm:text-base">
              {team2Score}
            </span>
            {match.target && match.status === 'live' && match.currentInningsNumber === 2 && (
              <div className="text-[10px] sm:text-[11px] text-amber-700 font-mono font-bold mt-0.5">
                Target {match.target}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Live Over Ball Tokens Strip (When match is live) ── */}
      {match.status === 'live' && recentBalls.length > 0 && (
        <div className="py-2 px-2.5 sm:px-3 rounded-xl bg-slate-50 border border-slate-150 mb-2 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap overflow-hidden">
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Over:
            </span>
            <div className="flex items-center space-x-1">
              {recentBalls.map((b, i) => renderBallToken(b, i))}
            </div>
          </div>
          <div className="text-[11px] font-mono text-slate-600 font-semibold shrink-0">
            CRR: <span className="font-bold text-slate-900">{crr}</span>
            {rrr ? <> · RRR: <span className="font-bold text-amber-700">{rrr}</span></> : null}
          </div>
        </div>
      )}

      {/* ── Active Crease Duo (Striker & Bowler) ── */}
      {match.status === 'live' && (activeStriker || activeBowler) && (
        <div className="pb-2 text-[11px] sm:text-xs text-slate-600 flex items-center justify-between gap-2 truncate font-medium">
          <div className="truncate">
            {activeStriker && (
              <span className="truncate">
                <span className="text-slate-900 font-bold">{activeStriker.name}</span>
                <span className="font-mono text-slate-500"> {activeStriker.runs}*({activeStriker.balls})</span>
              </span>
            )}
            {activeNonStriker && (
              <span className="text-slate-400 hidden sm:inline">
                {' '}· {activeNonStriker.name} <span className="font-mono text-slate-500">{activeNonStriker.runs}({activeNonStriker.balls})</span>
              </span>
            )}
          </div>
          {activeBowler && (
            <div className="shrink-0 text-slate-600 font-mono text-[10px] sm:text-[11px]">
              Bowl: <span className="font-bold text-slate-900">{activeBowler.name.split(' ').slice(-1)[0]}</span> ({formatOvers(activeBowler.legalBalls)}-{activeBowler.runsConceded}-{activeBowler.wickets})
            </div>
          )}
        </div>
      )}

      {/* ── Bottom Summary Row: Context & Scorecard Action ── */}
      <div className="pt-2 sm:pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs sm:text-[13px] text-slate-600">
        <span className="line-clamp-1 pr-2 font-medium text-slate-600">{getMatchContextLine()}</span>
        <span className="shrink-0 flex items-center text-amber-700 font-bold group-hover:text-amber-800 transition-colors text-xs">
          <span>Scorecard</span>
          <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
};
