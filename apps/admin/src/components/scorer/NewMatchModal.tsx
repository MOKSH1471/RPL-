import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, RotateCcw, Play, Trash2 } from 'lucide-react';
import { CricketMatch } from '@/types/cricket';
import { createInitialMatch } from '@/lib/cricketMockData';

interface NewMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNewMatch: (newMatch: CricketMatch) => void;
  onResetMatch: () => void;
  onDeleteMatch?: () => void;
}

export const NewMatchModal: React.FC<NewMatchModalProps> = ({
  isOpen,
  onClose,
  onStartNewMatch,
  onResetMatch,
  onDeleteMatch,
}) => {
  const [teamAName, setTeamAName] = useState('Royal Strikers');
  const [teamAShort, setTeamAShort] = useState('RS');
  const [teamBName, setTeamBName] = useState('RPL Super Kings');
  const [teamBShort, setTeamBShort] = useState('RSK');
  const [overs, setOvers] = useState<number>(10);
  const [venue, setVenue] = useState('RPL Main Ground');
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl'>('bat');

  if (!isOpen) return null;

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();

    const initial = createInitialMatch();
    initial.teamA.name = teamAName;
    initial.teamA.shortName = teamAShort;
    initial.teamB.name = teamBName;
    initial.teamB.shortName = teamBShort;
    initial.oversPerSide = overs;
    initial.venue = venue;
    initial.tossDecision = tossDecision;

    onStartNewMatch(initial);
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
                <h3 className="font-bold text-base tracking-tight text-slate-900">Match Configuration</h3>
                <p className="text-[11px] text-slate-500">Set team names, match overs, and venue</p>
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
                  onChange={(e) => setTeamAName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold focus:border-amber-500 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Short (e.g. RS)"
                  value={teamAShort}
                  onChange={(e) => setTeamAShort(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold uppercase focus:border-amber-500 focus:outline-none"
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
                  onChange={(e) => setTeamBName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold focus:border-amber-500 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Short (e.g. RSK)"
                  value={teamBShort}
                  onChange={(e) => setTeamBShort(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold uppercase focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Overs & Venue */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1 text-[11px]">
                  Overs Per Side (Custom Number)
                </label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={overs}
                    onChange={(e) => setOvers(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                    placeholder="Enter overs"
                    required
                  />
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
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1 text-[11px]">
                  Toss Winner Decision
                </label>
                <select
                  value={tossDecision}
                  onChange={(e) => setTossDecision(e.target.value as 'bat' | 'bowl')}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold focus:border-amber-500 focus:outline-none"
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
                onChange={(e) => setVenue(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset this match to clean demo state?')) {
                    onResetMatch();
                  }
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-amber-800 hover:bg-amber-50 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Score</span>
              </button>

              {onDeleteMatch && (
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

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start Match</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
