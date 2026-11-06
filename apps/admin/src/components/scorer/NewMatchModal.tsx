import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, RotateCcw, Play, Trash2, Lock, ShieldAlert } from 'lucide-react';
import { CricketMatch } from '@/types/cricket';
import { createInitialMatch } from '@/lib/cricketMockData';

interface NewMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNewMatch: (newMatch: CricketMatch) => void;
  onResetMatch: () => void;
  onDeleteMatch?: () => void;
  currentMatch?: CricketMatch;
  isScorecardAdmin?: boolean;
}

export const NewMatchModal: React.FC<NewMatchModalProps> = ({
  isOpen,
  onClose,
  onStartNewMatch,
  onResetMatch,
  onDeleteMatch,
  currentMatch,
  isScorecardAdmin = false,
}) => {
  const [teamAName, setTeamAName] = useState(currentMatch?.teamA.name || 'Team 1');
  const [teamAShort, setTeamAShort] = useState(currentMatch?.teamA.shortName || 'T1');
  const [teamBName, setTeamBName] = useState(currentMatch?.teamB.name || 'Team 2');
  const [teamBShort, setTeamBShort] = useState(currentMatch?.teamB.shortName || 'T2');
  const [overs, setOvers] = useState<number>(currentMatch?.oversPerSide || 10);
  const [venue, setVenue] = useState(currentMatch?.venue || 'RPL Main Stadium');
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl'>(currentMatch?.tossDecision || 'bat');

  useEffect(() => {
    if (currentMatch) {
      setTeamAName(currentMatch.teamA.name);
      setTeamAShort(currentMatch.teamA.shortName);
      setTeamBName(currentMatch.teamB.name);
      setTeamBShort(currentMatch.teamB.shortName);
      setOvers(currentMatch.oversPerSide || 10);
      setVenue(currentMatch.venue || 'RPL Main Stadium');
      setTossDecision(currentMatch.tossDecision || 'bat');
    }
  }, [currentMatch, isOpen]);

  if (!isOpen) return null;

  const isCompleted = currentMatch?.status === 'completed';
  const isReadOnly = isCompleted || isScorecardAdmin;

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompleted || isScorecardAdmin) return;

    if (currentMatch) {
      const updated: CricketMatch = {
        ...currentMatch,
        teamA: {
          ...currentMatch.teamA,
          name: teamAName,
          shortName: teamAShort,
        },
        teamB: {
          ...currentMatch.teamB,
          name: teamBName,
          shortName: teamBShort,
        },
        oversPerSide: overs,
        venue,
        tossDecision,
        status: 'live',
      };
      onStartNewMatch(updated);
    } else {
      const initial = createInitialMatch();
      initial.teamA.name = teamAName;
      initial.teamA.shortName = teamAShort;
      initial.teamB.name = teamBName;
      initial.teamB.shortName = teamBShort;
      initial.oversPerSide = overs;
      initial.venue = venue;
      initial.tossDecision = tossDecision;
      onStartNewMatch(initial);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="bg-white px-5 py-4 text-slate-900 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base tracking-tight text-slate-900 flex items-center space-x-2">
                  <span>Match Configuration</span>
                  {isCompleted && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                      Completed
                    </span>
                  )}
                  {!isCompleted && isScorecardAdmin && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black uppercase">
                      Scorer View
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isCompleted
                    ? 'Official tournament record — match finalized'
                    : isScorecardAdmin
                    ? 'Official fixture details set by Tournament Committee'
                    : 'Set team names, match overs, and venue'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Locked / Completed Notice */}
          {isCompleted && (
            <div className="mx-5 mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-2.5 text-xs text-slate-600">
              <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block">Match Concluded & Result Locked</span>
                This fixture has finished. Team configurations, scores, and match results are preserved for tournament standings.
              </div>
            </div>
          )}

          {!isCompleted && isScorecardAdmin && (
            <div className="mx-5 mt-4 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start space-x-2 text-xs text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Tournament Fixture Protection</span>
                Official team rosters and overs are locked by the Committee. If match was misconfigured, use <strong className="font-black">Reset Score</strong> below to restart scoring back to 0-0.
              </div>
            </div>
          )}

          <form onSubmit={handleStart} className="p-5 space-y-3.5 text-xs">
            {/* Teams Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-bold uppercase text-slate-700 text-[11px]">
                  Team A (Batting 1st)
                </label>
                <input
                  type="text"
                  value={teamAName}
                  disabled={isReadOnly}
                  onChange={(e) => setTeamAName(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs font-semibold focus:border-amber-500 focus:outline-none ${
                    isReadOnly ? 'bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed' : 'border-slate-300'
                  }`}
                  required
                />
                <input
                  type="text"
                  placeholder="Short (e.g. RT)"
                  value={teamAShort}
                  disabled={isReadOnly}
                  onChange={(e) => setTeamAShort(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs font-bold uppercase focus:border-amber-500 focus:outline-none ${
                    isReadOnly ? 'bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed' : 'border-slate-300'
                  }`}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold uppercase text-slate-700 text-[11px]">
                  Team B (Bowling 1st)
                </label>
                <input
                  type="text"
                  value={teamBName}
                  disabled={isReadOnly}
                  onChange={(e) => setTeamBName(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs font-semibold focus:border-amber-500 focus:outline-none ${
                    isReadOnly ? 'bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed' : 'border-slate-300'
                  }`}
                  required
                />
                <input
                  type="text"
                  placeholder="Short (e.g. PP)"
                  value={teamBShort}
                  disabled={isReadOnly}
                  onChange={(e) => setTeamBShort(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs font-bold uppercase focus:border-amber-500 focus:outline-none ${
                    isReadOnly ? 'bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed' : 'border-slate-300'
                  }`}
                  required
                />
              </div>
            </div>

            {/* Overs & Venue */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1 text-[11px]">
                  Overs Per Side
                </label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={overs}
                    disabled={isReadOnly}
                    onChange={(e) => setOvers(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs font-mono font-bold focus:border-amber-500 focus:outline-none ${
                      isReadOnly ? 'bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed' : 'border-slate-300'
                    }`}
                    placeholder="Enter overs"
                    required
                  />
                  {!isReadOnly && (
                    <div className="flex items-center space-x-1 shrink-0">
                      {[6, 10, 20].map((ov) => (
                        <button
                          key={ov}
                          type="button"
                          onClick={() => setOvers(ov)}
                          className={`px-1.5 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                            overs === ov
                              ? 'bg-amber-500 text-slate-950 border-amber-500'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {ov}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1 text-[11px]">
                  Toss Winner Decision
                </label>
                <select
                  value={tossDecision}
                  disabled={isReadOnly}
                  onChange={(e) => setTossDecision(e.target.value as 'bat' | 'bowl')}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs font-semibold focus:border-amber-500 focus:outline-none ${
                    isReadOnly ? 'bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed' : 'border-slate-300'
                  }`}
                >
                  <option value="bat">Elected to Bat First</option>
                  <option value="bowl">Elected to Bowl First</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase text-slate-700 mb-1 text-[11px]">
                Ground / Venue
              </label>
              <input
                type="text"
                value={venue}
                disabled={isReadOnly}
                onChange={(e) => setVenue(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-lg border text-xs font-semibold focus:border-amber-500 focus:outline-none ${
                  isReadOnly ? 'bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed' : 'border-slate-300'
                }`}
              />
            </div>

            {/* Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div>
                {!isCompleted && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Reset match score for "${teamAName} vs ${teamBName}" back to 0-0?`)) {
                        onResetMatch();
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-amber-200 text-amber-900 bg-amber-50 hover:bg-amber-100 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                    <span>Reset Score</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {!isCompleted && !isScorecardAdmin && onDeleteMatch && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this match completely?')) {
                        onDeleteMatch();
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Match</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  {isCompleted ? 'Close' : 'Cancel'}
                </button>

                {!isCompleted && !isScorecardAdmin && (
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Start Match</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
