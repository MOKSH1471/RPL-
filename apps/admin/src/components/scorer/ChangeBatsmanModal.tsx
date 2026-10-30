import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserRoundPlus, CheckCircle2, UserCheck, ArrowLeftRight } from 'lucide-react';
import { CricketPlayer, LiveBatsman } from '@/types/cricket';

interface ChangeBatsmanModalProps {
  isOpen: boolean;
  onClose: () => void;
  battingTeamPlayers: CricketPlayer[];
  currentStriker?: LiveBatsman;
  currentNonStriker?: LiveBatsman;
  inningsBatsmen?: LiveBatsman[];
  initialTarget?: 'striker' | 'nonStriker';
  onSelectBatsman: (data: {
    target: 'striker' | 'nonStriker';
    playerId: string;
    playerName: string;
  }) => void;
}

export const ChangeBatsmanModal: React.FC<ChangeBatsmanModalProps> = ({
  isOpen,
  onClose,
  battingTeamPlayers,
  currentStriker,
  currentNonStriker,
  inningsBatsmen = [],
  initialTarget = 'striker',
  onSelectBatsman,
}) => {
  const [target, setTarget] = useState<'striker' | 'nonStriker'>(initialTarget);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  if (!isOpen) return null;

  const currentOccupantId = target === 'striker' ? currentStriker?.playerId : currentNonStriker?.playerId;
  const otherOccupantId = target === 'striker' ? currentNonStriker?.playerId : currentStriker?.playerId;

  const handleConfirm = () => {
    if (!selectedPlayerId) {
      alert('Please select a batsman from the squad!');
      return;
    }
    const player = battingTeamPlayers.find((p) => p.id === selectedPlayerId);
    if (!player) return;

    onSelectBatsman({
      target,
      playerId: player.id,
      playerName: player.name,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="bg-white px-5 py-4 text-slate-900 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <UserRoundPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-tight text-slate-900">
                  Select / Change Batsman
                </h3>
                <p className="text-[11px] text-slate-500">
                  Choose batsman for the active crease position
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

          <div className="p-5 space-y-4">
            {/* Position Picker Toggle */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Crease Position To Change
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setTarget('striker');
                    setSelectedPlayerId('');
                  }}
                  className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                    target === 'striker'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Striker *</span>
                  <span className="text-[10px] font-normal opacity-80">(Facing)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTarget('nonStriker');
                    setSelectedPlayerId('');
                  }}
                  className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                    target === 'nonStriker'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Non-Striker</span>
                  <span className="text-[10px] font-normal opacity-80">(Runner)</span>
                </button>
              </div>
            </div>

            {/* Current Occupant Info */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <span className="text-slate-500">Currently at {target}:</span>
              <span className="font-bold text-slate-900">
                {target === 'striker' ? currentStriker?.name || 'Empty' : currentNonStriker?.name || 'Empty'}
              </span>
            </div>

            {/* Squad List */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Select Batsman From Squad
              </label>
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {battingTeamPlayers.map((player) => {
                  const isCurrent = player.id === currentOccupantId;
                  const isOther = player.id === otherOccupantId;
                  const isDismissed = inningsBatsmen.some((b) => b.playerId === player.id && b.isOut);
                  const isSelected = player.id === selectedPlayerId;

                  return (
                    <button
                      key={player.id}
                      type="button"
                      disabled={isOther || isDismissed}
                      onClick={() => setSelectedPlayerId(player.id)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 shadow-xs ring-1 ring-amber-400'
                          : isOther
                          ? 'border-slate-100 bg-slate-50 opacity-40 cursor-not-allowed'
                          : isCurrent
                          ? 'border-slate-300 bg-slate-100 font-bold'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-5 font-mono text-[10px] text-slate-400">
                          #{player.jerseyNumber || '-'}
                        </span>
                        <div>
                          <div className="font-extrabold text-slate-900 flex items-center space-x-1.5">
                            <span>{player.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                                Current
                              </span>
                            )}
                            {isOther && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                                At Other End
                              </span>
                            )}
                            {isDismissed && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-bold">
                                Out
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {player.role} • {player.battingStyle || 'Right Hand'}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedPlayerId}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Confirm Batsman
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
