import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserRoundPlus, CheckCircle2 } from 'lucide-react';
import { CricketPlayer, LiveBowler } from '@/types/cricket';
import { formatOvers } from '@/lib/cricketMockData';

interface ChangeBowlerModalProps {
  isOpen: boolean;
  onClose: () => void;
  bowlingTeamPlayers: CricketPlayer[];
  currentBowlerId: string;
  previousBowlerId?: string;
  bowlerRecords: LiveBowler[];
  isOverEndPrompt?: boolean;
  onSelectBowler: (bowlerId: string) => void;
}

export const ChangeBowlerModal: React.FC<ChangeBowlerModalProps> = ({
  isOpen,
  onClose,
  bowlingTeamPlayers,
  currentBowlerId,
  previousBowlerId,
  bowlerRecords,
  isOverEndPrompt = false,
  onSelectBowler,
}) => {
  const [selectedId, setSelectedId] = useState<string>('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedId) {
      alert('Please select a bowler!');
      return;
    }
    onSelectBowler(selectedId);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="bg-white px-5 py-4 text-slate-900 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <UserRoundPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base tracking-tight text-slate-900">
                  {isOverEndPrompt ? 'Over Ended — Next Bowler' : 'Change Bowler'}
                </h3>
                <p className="text-[11px] text-slate-500">Select bowler for the next delivery</p>
              </div>
            </div>
            {!isOverEndPrompt && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="p-5 space-y-4 text-xs">
            {isOverEndPrompt && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold flex items-center justify-between">
                <span>Over completed. Consecutive overs by same bowler disallowed.</span>
              </div>
            )}

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {bowlingTeamPlayers.map((player) => {
                const record = bowlerRecords.find((b) => b.playerId === player.id);
                const isCurrent = player.id === currentBowlerId;
                const isPrev = isOverEndPrompt && player.id === previousBowlerId;
                const isSelected = selectedId === player.id;

                const oversFormatted = record ? formatOvers(record.legalBalls) : '0.0';
                const wickets = record ? record.wickets : 0;
                const runs = record ? record.runsConceded : 0;

                return (
                  <button
                    key={player.id}
                    type="button"
                    disabled={isCurrent || isPrev}
                    onClick={() => setSelectedId(player.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/70 text-slate-950 font-bold'
                        : isCurrent || isPrev
                        ? 'opacity-40 border-slate-200 bg-slate-100 cursor-not-allowed'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-xs text-slate-900">{player.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                            Active
                          </span>
                        )}
                        {isPrev && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded">
                            Last Over
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {player.bowlingStyle || player.role}
                      </div>
                    </div>

                    <div className="text-right flex items-center space-x-2">
                      <div className="text-xs font-mono font-bold text-slate-700">
                        {oversFormatted} ov • {wickets}/{runs}
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 flex items-center justify-end space-x-2.5 border-t border-slate-100">
              {!isOverEndPrompt && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 font-semibold text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
              >
                Set Bowler
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
