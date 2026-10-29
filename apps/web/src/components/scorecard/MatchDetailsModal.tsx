import React, { useState, useEffect, useRef } from 'react';
import { CricketMatch, InningsState } from '@/types';
import { formatOvers, calculateRunRate, calculateRequiredRunRate } from '@/lib/cricketData';
import { BoundaryStrikeAnimation } from '@/components/ui/SixerStrikeAnimation';
import { X, Trophy, MapPin, Calendar, Clock, Activity, ShieldCheck, Sparkles } from 'lucide-react';

interface MatchDetailsModalProps {
  match: CricketMatch | null;
  onClose: () => void;
}

export const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({ match, onClose }) => {
  if (!match) return null;

  const [selectedInningsNum, setSelectedInningsNum] = useState<1 | 2>(
    match.currentInningsNumber || 1
  );
  const [showBoundaryAnimation, setShowBoundaryAnimation] = useState(false);
  const [boundaryRuns, setBoundaryRuns] = useState<4 | 6>(6);
  const [boundaryAnimKey, setBoundaryAnimKey] = useState(0);
  const lastSeenBallIdRef = useRef<string | null>(null);
  const isInitialMount = useRef(true);

  const triggerBoundaryAnimation = (runs: 4 | 6) => {
    setBoundaryRuns(runs);
    setBoundaryAnimKey((k) => k + 1);
    setShowBoundaryAnimation(true);
  };

  // Real-time detector: triggers 4s / 6s & Traket reveal animation as soon as admin records a boundary
  useEffect(() => {
    if (!match) return;

    const currentInnings = match.currentInningsNumber === 1 ? match.innings1 : match.innings2;
    if (!currentInnings) return;

    const deliveries =
      currentInnings.currentOverBalls && currentInnings.currentOverBalls.length > 0
        ? currentInnings.currentOverBalls
        : currentInnings.balls;

    const latestBall = deliveries && deliveries.length > 0 ? deliveries[deliveries.length - 1] : null;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      lastSeenBallIdRef.current = latestBall ? latestBall.id : null;
      return;
    }

    if (latestBall && latestBall.id !== lastSeenBallIdRef.current) {
      lastSeenBallIdRef.current = latestBall.id;

      // If the newly recorded delivery from admin is a 6 or 4!
      if (latestBall.runsOffBat === 6) {
        triggerBoundaryAnimation(6);
      } else if (latestBall.runsOffBat === 4) {
        triggerBoundaryAnimation(4);
      }
    }
  }, [match]);

  const innings: InningsState | undefined =
    selectedInningsNum === 1 ? match.innings1 : match.innings2;

  const battingTeam = innings?.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
  const bowlingTeam = innings?.bowlingTeamId === match.teamA.id ? match.teamA : match.teamB;

  // Key live metrics
  const crr = innings ? calculateRunRate(innings.totalRuns, innings.legalBallsBowled) : '0.00';
  let rrr = '0.00';
  if (match.status === 'live' && selectedInningsNum === 2 && match.target && innings) {
    const runsNeeded = Math.max(0, match.target - innings.totalRuns);
    const ballsRemaining = Math.max(0, match.oversPerSide * 6 - innings.legalBallsBowled);
    rrr = calculateRequiredRunRate(runsNeeded, ballsRemaining);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-[#14161b] text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Bar with Match Title and Close Button ── */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-[#181a20]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase tracking-wider border border-amber-500/30">
                {match.tournamentName || 'RPL Season 9'}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {match.stage || `Match ${match.matchNumber}`}
              </span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-slate-100 tracking-tight mt-1 flex items-center space-x-2">
              <span>{match.teamA.name}</span>
              <span className="text-amber-400 text-sm font-normal">vs</span>
              <span>{match.teamB.name}</span>
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => triggerBoundaryAnimation(4)}
              title="Preview 4s & Sponsor Reveal Animation"
              className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 text-[10px] sm:text-xs font-bold transition-all cursor-pointer"
            >
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500" />
              </span>
              <span>⚡ Test 4</span>
            </button>

            <button
              type="button"
              onClick={() => triggerBoundaryAnimation(6)}
              title="Preview 6er & Sponsor Reveal Animation"
              className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-[10px] sm:text-xs font-bold transition-all cursor-pointer"
            >
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
              </span>
              <span>⚡ Test 6er</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Live Match Summary Banner ── */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#1c1f27] to-[#171920] border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-medium flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{match.venue}</span>
            </div>
            <div className="text-sm font-semibold text-amber-400">
              {match.resultSummary || (match.target ? `Target: ${match.target} runs` : 'Match in progress')}
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
              <span className="text-slate-400 block text-[10px] uppercase font-sans">CRR</span>
              <span className="text-slate-100 font-bold text-sm">{crr}</span>
            </div>
            {match.status === 'live' && selectedInningsNum === 2 && (
              <div className="bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
                <span className="text-amber-400 block text-[10px] uppercase font-sans">RRR</span>
                <span className="text-amber-300 font-bold text-sm">{rrr}</span>
              </div>
            )}
            <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
              <span className="text-slate-400 block text-[10px] uppercase font-sans">Format</span>
              <span className="text-slate-100 font-bold text-sm">{match.oversPerSide} Ov</span>
            </div>
          </div>
        </div>

        {/* ── Innings Tab Selector ── */}
        <div className="flex items-center space-x-2 p-3 sm:p-4 bg-[#181a20] border-b border-slate-800">
          <button
            type="button"
            onClick={() => setSelectedInningsNum(1)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedInningsNum === 1
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            1st Inns · {match.teamA.shortName} ({match.innings1.totalRuns}/{match.innings1.totalWickets})
          </button>

          {match.innings2 && (
            <button
              type="button"
              onClick={() => setSelectedInningsNum(2)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedInningsNum === 2
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              2nd Inns · {match.teamB.shortName} ({match.innings2.totalRuns}/{match.innings2.totalWickets})
            </button>
          )}
        </div>

        {/* ── Scorecard Body ── */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {!innings ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Innings has not commenced yet.
            </div>
          ) : (
            <>
              {/* Live Crease & Current Over Widget (when live) */}
              {match.status === 'live' && selectedInningsNum === match.currentInningsNumber && (
                <div className="bg-[#1c1f27] border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Live at Crease</span>
                    </span>
                    {/* Recent Over Deliveries */}
                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] text-slate-400 font-medium mr-1">This Over:</span>
                      {(() => {
                        const deliveries = innings.currentOverBalls && innings.currentOverBalls.length > 0
                          ? innings.currentOverBalls
                          : innings.balls.slice(-6);
                        if (deliveries.length === 0) return <span className="text-slate-500 text-xs font-mono">-</span>;
                        return deliveries.map((b, i) => {
                          let bg = 'bg-slate-800 text-slate-200 border-slate-700';
                          let label = b.runsOffBat.toString();
                          if (b.isWicket) {
                            bg = 'bg-rose-500 text-white border-rose-400 font-bold';
                            label = 'W';
                          } else if (b.runsOffBat === 6) {
                            bg = 'bg-amber-500 text-slate-950 font-black border-amber-400';
                            label = '6';
                          } else if (b.runsOffBat === 4) {
                            bg = 'bg-cyan-500 text-slate-950 font-black border-cyan-400';
                            label = '4';
                          } else if (b.runsOffBat === 0 && !b.isExtra) {
                            bg = 'bg-slate-800 text-slate-400 border-slate-700';
                            label = '•';
                          } else if (b.isExtra) {
                            bg = 'bg-indigo-500 text-white font-bold border-indigo-400';
                            label = `${b.extraType === 'wide' ? 'Wd' : b.extraType === 'noball' ? 'Nb' : 'Ex'}`;
                          }
                          return (
                            <span
                              key={i}
                              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] font-mono flex items-center justify-center border shadow-xs ${bg}`}
                            >
                              {label}
                            </span>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Batsmen & Bowler Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    {/* Striker */}
                    {(() => {
                      const striker = innings.batsmen.find((b) => b.playerId === innings.activeStrikerId || b.isStriker) || innings.batsmen[0];
                      return striker ? (
                        <div className="bg-[#14161b] p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Striker</span>
                          <span className="font-bold text-slate-100 truncate block">
                            {striker.name} <span className="text-amber-400 font-black">*</span>
                          </span>
                          <span className="font-mono text-slate-300 text-[11px]">
                            {striker.runs} ({striker.balls}) · {striker.fours} 4s, {striker.sixes} 6s
                          </span>
                        </div>
                      ) : null;
                    })()}

                    {/* Non-Striker */}
                    {(() => {
                      const nonStriker = innings.batsmen.find((b) => b.playerId === innings.activeNonStrikerId || (!b.isStriker && !b.isOut)) || innings.batsmen[1];
                      return nonStriker ? (
                        <div className="bg-[#14161b] p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Non-Striker</span>
                          <span className="font-bold text-slate-100 truncate block">{nonStriker.name}</span>
                          <span className="font-mono text-slate-300 text-[11px]">
                            {nonStriker.runs} ({nonStriker.balls}) · {nonStriker.fours} 4s, {nonStriker.sixes} 6s
                          </span>
                        </div>
                      ) : null;
                    })()}

                    {/* Active Bowler */}
                    {(() => {
                      const bowler = innings.bowlers.find((b) => b.playerId === innings.activeBowlerId) || innings.bowlers[innings.bowlers.length - 1];
                      return bowler ? (
                        <div className="bg-[#14161b] p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Bowler</span>
                          <span className="font-bold text-slate-100 truncate block">{bowler.name}</span>
                          <span className="font-mono text-slate-300 text-[11px]">
                            {bowler.wickets}/{bowler.runsConceded} ({formatOvers(bowler.legalBalls)} ov) · Econ {bowler.economy.toFixed(1)}
                          </span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}

              {/* Batting Scorecard Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                    Batting Scorecard — <span className="text-slate-200">{battingTeam.name}</span>
                  </h4>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {innings.totalRuns}/{innings.totalWickets} ({formatOvers(innings.legalBallsBowled)} ov)
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#181a20]">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-800/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px] sm:text-xs">
                      <tr>
                        <th className="py-2.5 px-3 sm:px-4">Batter</th>
                        <th className="py-2.5 px-2 sm:px-3">Dismissal</th>
                        <th className="py-2.5 px-2 text-right">R</th>
                        <th className="py-2.5 px-2 text-right">B</th>
                        <th className="py-2.5 px-2 text-right">4s</th>
                        <th className="py-2.5 px-2 text-right">6s</th>
                        <th className="py-2.5 px-3 text-right">SR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-medium">
                      {innings.batsmen.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-slate-500">
                            No batting stats recorded yet
                          </td>
                        </tr>
                      ) : (
                        innings.batsmen.map((batsman) => (
                          <tr key={batsman.playerId} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-2.5 px-3 sm:px-4">
                              <span className="font-bold text-slate-100">{batsman.name}</span>
                              {!batsman.isOut && <span className="text-amber-400 ml-1 font-bold">*</span>}
                            </td>
                            <td className="py-2.5 px-2 sm:px-3 text-slate-400 text-xs">
                              {batsman.isOut ? batsman.dismissalText || 'out' : 'not out'}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-100">
                              {batsman.runs}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-slate-400">
                              {batsman.balls}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-slate-400">
                              {batsman.fours}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-slate-400">
                              {batsman.sixes}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-300">
                              {batsman.strikeRate.toFixed(1)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Extras and Total Footer */}
                  <div className="p-3 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Extras: <strong className="text-slate-200">{innings.extras.total}</strong>{' '}
                      (w {innings.extras.wides}, nb {innings.extras.noballs}, b {innings.extras.byes}, lb {innings.extras.legbyes})
                    </span>
                    <span className="font-bold text-slate-200">
                      Total: {innings.totalRuns}/{innings.totalWickets} ({formatOvers(innings.legalBallsBowled)} Ov)
                    </span>
                  </div>
                </div>
              </div>

              {/* Fall of Wickets */}
              {innings.fallOfWickets && innings.fallOfWickets.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                    Fall of Wickets
                  </h4>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {innings.fallOfWickets.map((fow) => (
                      <span
                        key={fow.wicketNumber}
                        className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 text-slate-300"
                      >
                        <strong className="text-amber-400">{fow.score}/{fow.wicketNumber}</strong> ({fow.playerOutName}, {fow.overDisplay} ov)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bowling Scorecard Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                    Bowling — <span className="text-slate-200">{bowlingTeam.name}</span>
                  </h4>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#181a20]">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-800/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px] sm:text-xs">
                      <tr>
                        <th className="py-2.5 px-3 sm:px-4">Bowler</th>
                        <th className="py-2.5 px-2 text-right">O</th>
                        <th className="py-2.5 px-2 text-right">M</th>
                        <th className="py-2.5 px-2 text-right">R</th>
                        <th className="py-2.5 px-2 text-right">W</th>
                        <th className="py-2.5 px-3 text-right">Econ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-medium">
                      {innings.bowlers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-500">
                            No bowling figures recorded
                          </td>
                        </tr>
                      ) : (
                        innings.bowlers.map((bowler) => (
                          <tr key={bowler.playerId} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-2.5 px-3 sm:px-4 font-bold text-slate-100">
                              {bowler.name}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-slate-300">
                              {formatOvers(bowler.legalBalls)}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-slate-400">
                              {bowler.maidens}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-100">
                              {bowler.runsConceded}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono font-bold text-amber-400">
                              {bowler.wickets}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-300">
                              {bowler.economy.toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div className="p-4 sm:p-5 bg-[#181a20] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Toss: {match.tossWinnerId ? `${match.tossWinnerId === match.teamA.id ? match.teamA.name : match.teamB.name} elected to ${match.tossDecision}` : 'Yet to be conducted'}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Floating Boundary (4 or 6) & Traket Animation at z-[60] directly above the live scorecard */}
      {showBoundaryAnimation && (
        <BoundaryStrikeAnimation
          key={boundaryAnimKey}
          runs={boundaryRuns}
          onComplete={() => setShowBoundaryAnimation(false)}
        />
      )}
    </div>
  );
};
