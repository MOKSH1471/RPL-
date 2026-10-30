import React, { useState, useEffect, useRef } from 'react';
import { CricketMatch, InningsState } from '@/types';
import { formatOvers, calculateRunRate, calculateRequiredRunRate } from '@/lib/cricketData';
import { BoundaryStrikeAnimation } from '@/components/ui/SixerStrikeAnimation';
import { WicketStrikeAnimation } from '@/components/ui/WicketStrikeAnimation';
import { X, MapPin } from 'lucide-react';

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

  const [showWicketAnimation, setShowWicketAnimation] = useState(false);
  const [wicketAnimKey, setWicketAnimKey] = useState(0);

  const lastSeenBallIdRef = useRef<string | null>(null);
  const isInitialMount = useRef(true);

  const triggerBoundaryAnimation = (runs: 4 | 6) => {
    setShowWicketAnimation(false);
    setBoundaryRuns(runs);
    setBoundaryAnimKey((k) => k + 1);
    setShowBoundaryAnimation(true);
  };

  const triggerWicketAnimation = () => {
    setShowBoundaryAnimation(false);
    setWicketAnimKey((k) => k + 1);
    setShowWicketAnimation(true);
  };

  // Real-time detector: triggers wickets & boundaries animation as soon as admin records an event
  useEffect(() => {
    if (!match) return;

    const currentInnings = match.currentInningsNumber === 1 ? match.innings1 : match.innings2;
    if (!currentInnings) return;

    const latestBall = currentInnings.balls && currentInnings.balls.length > 0 ? currentInnings.balls[0] : null;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      lastSeenBallIdRef.current = latestBall ? latestBall.id : null;
      return;
    }

    if (latestBall && latestBall.id !== lastSeenBallIdRef.current) {
      lastSeenBallIdRef.current = latestBall.id;

      if (latestBall.isWicket || (latestBall.wicketType && latestBall.wicketType !== 'none')) {
        triggerWicketAnimation();
      } else if (latestBall.runsOffBat === 6) {
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
  const inn1BatTeam = match.innings1?.battingTeamId === match.teamB.id ? match.teamB : match.teamA;
  const inn2BatTeam = match.innings2?.battingTeamId === match.teamA.id ? match.teamA : match.teamB;

  // Key live metrics
  const crr = innings ? calculateRunRate(innings.totalRuns, innings.legalBallsBowled) : '0.00';
  let rrr = '';
  if (match.status === 'live' && selectedInningsNum === 2 && match.target && innings) {
    const runsNeeded = Math.max(0, match.target - innings.totalRuns);
    const ballsRemaining = Math.max(0, match.oversPerSide * 6 - innings.legalBallsBowled);
    rrr = calculateRequiredRunRate(runsNeeded, ballsRemaining);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white text-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Bar: Match Header & Close Button ── */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="min-w-0 pr-3">
            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px] uppercase tracking-wider shrink-0">
                {match.tournamentName || 'RPL Season 9'}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 font-semibold truncate">
                {match.stage || `Match ${match.matchNumber || 1}`} · {match.oversPerSide || 10} Overs
              </span>
            </div>
            <h3 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center space-x-1.5 truncate leading-tight">
              <span className="truncate">{match.teamA.name}</span>
              <span className="text-amber-600 text-xs font-bold px-1 py-0.2 rounded bg-amber-100/70 shrink-0">vs</span>
              <span className="truncate">{match.teamB.name}</span>
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Match Summary & Rates Bar ── */}
        <div className="p-3 sm:p-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="space-y-0.5 min-w-0">
            {match.venue && (
              <div className="text-xs text-slate-500 font-medium flex items-center space-x-1 truncate">
                <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                <span className="truncate">{match.venue}</span>
              </div>
            )}
            <div className="text-xs sm:text-sm font-bold text-slate-900">
              {match.resultSummary || (match.target ? `Target: ${match.target} runs` : 'Match in progress')}
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono shrink-0">
            <div className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-center">
              <span className="text-slate-400 block text-[9px] uppercase font-sans font-bold">CRR</span>
              <span className="text-slate-900 font-bold">{crr}</span>
            </div>
            {match.status === 'live' && selectedInningsNum === 2 && rrr && (
              <div className="bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-center">
                <span className="text-amber-800 block text-[9px] uppercase font-sans font-bold">RRR</span>
                <span className="text-amber-900 font-bold">{rrr}</span>
              </div>
            )}
            <div className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-center">
              <span className="text-slate-400 block text-[9px] uppercase font-sans font-bold">Overs</span>
              <span className="text-slate-900 font-bold">{match.oversPerSide} Ov</span>
            </div>
          </div>
        </div>

        {/* ── Innings Tab Selector ── */}
        <div className="flex items-center space-x-1.5 p-2 sm:p-3 bg-slate-50/70 border-b border-slate-100 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedInningsNum(1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedInningsNum === 1
                ? 'bg-amber-500 text-slate-950 shadow-2xs font-black'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            1st Inns · {inn1BatTeam.shortName || inn1BatTeam.name} ({match.innings1.totalRuns}/{match.innings1.totalWickets})
          </button>

          {match.innings2 && (
            <button
              type="button"
              onClick={() => setSelectedInningsNum(2)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedInningsNum === 2
                  ? 'bg-amber-500 text-slate-950 shadow-2xs font-black'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              2nd Inns · {inn2BatTeam.shortName || inn2BatTeam.name} ({match.innings2.totalRuns}/{match.innings2.totalWickets})
            </button>
          )}
        </div>

        {/* ── Scorecard Body ── */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {!innings ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Innings has not commenced yet.
            </div>
          ) : (
            <>
              {/* Live Crease & Current Over Strip (when live) */}
              {match.status === 'live' && selectedInningsNum === match.currentInningsNumber && (
                <div className="bg-amber-50/40 border border-amber-200/70 rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Live at Crease</span>
                    </span>

                    {/* Recent Over Deliveries */}
                    <div className="flex items-center space-x-1 overflow-hidden">
                      <span className="text-[10px] text-slate-500 font-semibold mr-1">Over:</span>
                      {(() => {
                        const deliveries = innings.currentOverBalls && innings.currentOverBalls.length > 0
                          ? innings.currentOverBalls
                          : innings.balls.slice(0, 6).reverse();
                        if (deliveries.length === 0) return <span className="text-slate-400 text-xs font-mono">-</span>;
                        return deliveries.map((b, i) => {
                          let badgeClass = 'bg-white text-slate-700 border-slate-200';
                          let label = b.runsOffBat.toString();
                          if (b.isWicket) {
                            badgeClass = 'bg-rose-100 text-rose-800 border-rose-300 font-black animate-pulse';
                            label = 'W';
                          } else if (b.runsOffBat === 6) {
                            badgeClass = 'bg-amber-100 text-amber-900 border-amber-300 font-black';
                            label = '6';
                          } else if (b.runsOffBat === 4) {
                            badgeClass = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black';
                            label = '4';
                          } else if (b.runsOffBat === 0 && !b.isExtra) {
                            badgeClass = 'bg-slate-100 text-slate-500 border-slate-200 font-bold';
                            label = '•';
                          } else if (b.isExtra) {
                            badgeClass = 'bg-orange-50 text-orange-800 border-orange-200 text-[10px]';
                            label = `${b.extraType === 'wide' ? 'Wd' : b.extraType === 'noball' ? 'Nb' : 'Ex'}`;
                          }
                          return (
                            <span
                              key={i}
                              className={`w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center border shrink-0 ${badgeClass}`}
                            >
                              {label}
                            </span>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Active Crease Duo Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {/* Striker */}
                    {(() => {
                      const striker = innings.batsmen.find((b) => b.playerId === innings.activeStrikerId || b.isStriker) || innings.batsmen[0];
                      return striker ? (
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Striker</span>
                          <span className="font-bold text-slate-900 truncate block">
                            {striker.name} <span className="text-amber-600 font-black">*</span>
                          </span>
                          <span className="font-mono text-slate-600 text-[11px]">
                            {striker.runs} ({striker.balls}b) · {striker.fours} 4s, {striker.sixes} 6s
                          </span>
                        </div>
                      ) : null;
                    })()}

                    {/* Non-Striker */}
                    {(() => {
                      const nonStriker = innings.batsmen.find((b) => b.playerId === innings.activeNonStrikerId || (!b.isStriker && !b.isOut)) || innings.batsmen[1];
                      return nonStriker ? (
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Non-Striker</span>
                          <span className="font-bold text-slate-900 truncate block">{nonStriker.name}</span>
                          <span className="font-mono text-slate-600 text-[11px]">
                            {nonStriker.runs} ({nonStriker.balls}b) · {nonStriker.fours} 4s, {nonStriker.sixes} 6s
                          </span>
                        </div>
                      ) : null;
                    })()}

                    {/* Bowler */}
                    {(() => {
                      const bowler = innings.bowlers.find((b) => b.playerId === innings.activeBowlerId) || innings.bowlers[innings.bowlers.length - 1];
                      return bowler ? (
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Bowler</span>
                          <span className="font-bold text-slate-900 truncate block">{bowler.name}</span>
                          <span className="font-mono text-slate-600 text-[11px]">
                            {bowler.wickets}/{bowler.runsConceded} ({formatOvers(bowler.legalBalls)} ov) · Econ {bowler.economy.toFixed(1)}
                          </span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}

              {/* ── Batting Scorecard Table (Clean & No Overflow) ── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                    Batting Scorecard — <span className="text-slate-900">{battingTeam.name}</span>
                  </h4>
                  <span className="text-xs font-mono font-bold text-amber-700">
                    {innings.totalRuns}/{innings.totalWickets} ({formatOvers(innings.legalBallsBowled)} ov)
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs table-fixed">
                    <colgroup>
                      <col className="w-auto" />
                      <col className="w-8 sm:w-10" />
                      <col className="w-7 sm:w-9" />
                      <col className="w-6 sm:w-8" />
                      <col className="w-6 sm:w-8" />
                      <col className="w-11 sm:w-13" />
                    </colgroup>
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                      <tr>
                        <th className="py-2 px-2.5 sm:px-3">Batter</th>
                        <th className="py-2 px-1 text-right">R</th>
                        <th className="py-2 px-1 text-right">B</th>
                        <th className="py-2 px-1 text-right">4s</th>
                        <th className="py-2 px-1 text-right">6s</th>
                        <th className="py-2 px-2 text-right">SR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {innings.batsmen.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400">
                            No batting stats recorded yet
                          </td>
                        </tr>
                      ) : (
                        innings.batsmen.map((batsman) => {
                          const isAtCrease = batsman.playerId === innings.activeStrikerId || batsman.playerId === innings.activeNonStrikerId;
                          const hasBatted = batsman.balls > 0 || batsman.runs > 0 || isAtCrease || batsman.isOut;
                          const statusText = batsman.isOut ? batsman.dismissalText || 'out' : hasBatted ? 'not out' : 'Did not bat';
                          return (
                            <tr key={batsman.playerId} className="hover:bg-amber-50/15 transition-colors">
                              <td className="py-2 px-2.5 sm:px-3 truncate">
                                <div className="truncate">
                                  <span className="font-bold text-slate-900 truncate">
                                    {batsman.name}
                                    {!batsman.isOut && isAtCrease && <span className="text-amber-600 ml-1 font-black">*</span>}
                                  </span>
                                  <div className="text-[10px] text-slate-400 truncate italic">
                                    {statusText}
                                  </div>
                                </div>
                              </td>
                              <td className="py-2 px-1 text-right font-mono font-black text-slate-900">
                                {batsman.runs}
                              </td>
                              <td className="py-2 px-1 text-right font-mono text-slate-500">
                                {batsman.balls}
                              </td>
                              <td className="py-2 px-1 text-right font-mono text-slate-600">
                                {batsman.fours}
                              </td>
                              <td className="py-2 px-1 text-right font-mono text-slate-600">
                                {batsman.sixes}
                              </td>
                              <td className="py-2 px-2 text-right font-mono font-bold text-slate-700">
                                {batsman.strikeRate.toFixed(1)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>

                  {/* Extras and Total Footer */}
                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="text-[11px] truncate pr-2">
                      Extras: <strong className="text-slate-900">{innings.extras.total}</strong>{' '}
                      (w {innings.extras.wides}, nb {innings.extras.noballs}, b {innings.extras.byes}, lb {innings.extras.legbyes})
                    </span>
                    <span className="font-black text-slate-900 shrink-0 font-mono">
                      Total: {innings.totalRuns}/{innings.totalWickets} ({formatOvers(innings.legalBallsBowled)} Ov)
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Fall of Wickets ── */}
              {innings.fallOfWickets && innings.fallOfWickets.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-1.5">
                    Fall of Wickets
                  </h4>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {innings.fallOfWickets.map((fow) => (
                      <span
                        key={fow.wicketNumber}
                        className="bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200 text-slate-700 font-medium"
                      >
                        <strong className="text-amber-700 font-mono">{fow.score}/{fow.wicketNumber}</strong> ({fow.playerOutName}, {fow.overDisplay} ov)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Bowling Scorecard Table (Clean & No Overflow) ── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                    Bowling — <span className="text-slate-900">{bowlingTeam.name}</span>
                  </h4>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs table-fixed">
                    <colgroup>
                      <col className="w-auto" />
                      <col className="w-8 sm:w-10" />
                      <col className="w-6 sm:w-8" />
                      <col className="w-8 sm:w-10" />
                      <col className="w-7 sm:w-9" />
                      <col className="w-11 sm:w-13" />
                    </colgroup>
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                      <tr>
                        <th className="py-2 px-2.5 sm:px-3">Bowler</th>
                        <th className="py-2 px-1 text-right">O</th>
                        <th className="py-2 px-1 text-right">M</th>
                        <th className="py-2 px-1 text-right">R</th>
                        <th className="py-2 px-1 text-right font-bold text-amber-700">W</th>
                        <th className="py-2 px-2 text-right">Econ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {innings.bowlers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400">
                            No bowling figures recorded
                          </td>
                        </tr>
                      ) : (
                        innings.bowlers.map((bowler) => (
                          <tr key={bowler.playerId} className="hover:bg-amber-50/15 transition-colors">
                            <td className="py-2 px-2.5 sm:px-3 font-bold text-slate-900 truncate">
                              {bowler.name}
                            </td>
                            <td className="py-2 px-1 text-right font-mono text-slate-600">
                              {formatOvers(bowler.legalBalls)}
                            </td>
                            <td className="py-2 px-1 text-right font-mono text-slate-400">
                              {bowler.maidens}
                            </td>
                            <td className="py-2 px-1 text-right font-mono font-bold text-slate-900">
                              {bowler.runsConceded}
                            </td>
                            <td className="py-2 px-1 text-right font-mono font-black text-amber-700">
                              {bowler.wickets}
                            </td>
                            <td className="py-2 px-2 text-right font-mono font-bold text-slate-700">
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

        {/* ── Modal Footer with Integrated Test FX Controls ── */}
        <div className="p-3 sm:p-4 bg-slate-50/90 border-t border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs text-slate-600 shrink-0">
          {/* Strike Animation Test Controls (Permanently docked, zero overflow) */}
          <div className="flex items-center space-x-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-0.5">
              Test FX:
            </span>
            <button
              type="button"
              onClick={triggerWicketAnimation}
              title="Test OUT strike animation"
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition-colors cursor-pointer active:scale-95"
            >
              <span>⚡ Out</span>
            </button>
            <button
              type="button"
              onClick={() => triggerBoundaryAnimation(4)}
              title="Test 4s boundary animation"
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold transition-colors cursor-pointer active:scale-95"
            >
              <span>⚡ 4</span>
            </button>
            <button
              type="button"
              onClick={() => triggerBoundaryAnimation(6)}
              title="Test 6er strike animation"
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold transition-colors cursor-pointer active:scale-95"
            >
              <span>⚡ 6</span>
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end space-x-3 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-200/70">
            <span className="truncate pr-2 text-[11px] text-slate-500 max-w-[200px] sm:max-w-xs">
              Toss: {match.tossWinnerId ? `${match.tossWinnerId === match.teamA.id ? match.teamA.shortName || match.teamA.name : match.teamB.shortName || match.teamB.name} elected to ${match.tossDecision}` : 'Yet to be conducted'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors cursor-pointer shrink-0 text-xs shadow-2xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Floating Boundary (4 or 6) & Traket Animation directly above the live scorecard */}
      {showBoundaryAnimation && (
        <BoundaryStrikeAnimation
          key={boundaryAnimKey}
          runs={boundaryRuns}
          onComplete={() => setShowBoundaryAnimation(false)}
        />
      )}

      {/* Floating OUT & SeaMak GROUP Animation directly above the live scorecard */}
      {showWicketAnimation && (
        <WicketStrikeAnimation
          key={wicketAnimKey}
          onComplete={() => setShowWicketAnimation(false)}
        />
      )}
    </div>
  );
};
