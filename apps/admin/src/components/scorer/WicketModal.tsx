import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, UserCheck, AlertTriangle } from 'lucide-react';
import { CricketPlayer, WicketType } from '@/types/cricket';

interface WicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  striker: { id: string; name: string };
  nonStriker: { id: string; name: string };
  availableBatsmen: CricketPlayer[];
  fieldingPlayers: CricketPlayer[];
  onConfirmWicket: (data: {
    wicketType: WicketType;
    dismissedPlayerId: string;
    fielderName?: string;
    newBatsmanId: string;
    runsScored: number;
  }) => void;
}

const WICKET_TYPES: { id: WicketType; label: string; desc: string }[] = [
  { id: 'bowled', label: 'Bowled', desc: 'Clean bowled' },
  { id: 'caught', label: 'Caught', desc: 'Fielder or keeper catch' },
  { id: 'run_out', label: 'Run Out', desc: 'Stumps broken' },
  { id: 'lbw', label: 'LBW', desc: 'Leg before wicket' },
  { id: 'stumped', label: 'Stumped', desc: 'By wicketkeeper' },
  { id: 'hit_wicket', label: 'Hit Wicket', desc: 'Hit own stumps' },
];

export const WicketModal: React.FC<WicketModalProps> = ({
  isOpen,
  onClose,
  striker,
  nonStriker,
  availableBatsmen,
  fieldingPlayers,
  onConfirmWicket,
}) => {
  const [wicketType, setWicketType] = useState<WicketType>('caught');
  const [dismissedId, setDismissedId] = useState<string>(striker.id);
  const [fielderName, setFielderName] = useState<string>('');
  const [newBatsmanId, setNewBatsmanId] = useState<string>(availableBatsmen[0]?.id || '');
  const [runsOnWicket, setRunsOnWicket] = useState<number>(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (availableBatsmen.length > 0 && !newBatsmanId) {
      alert('Please select the incoming batsman!');
      return;
    }
    onConfirmWicket({
      wicketType,
      dismissedPlayerId: dismissedId,
      fielderName: ['caught', 'run_out', 'stumped'].includes(wicketType) ? fielderName : undefined,
      newBatsmanId,
      runsScored: wicketType === 'run_out' ? runsOnWicket : 0,
    });
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
          {/* Header Banner */}
          <div className="bg-white px-5 py-4 text-slate-900 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base tracking-tight text-slate-900">Record Dismissal</h3>
                <p className="text-[11px] text-slate-500">Select dismissal type and next batsman</p>
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

          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {/* Wicket Type Grid */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1.5 text-[11px]">
                Dismissal Mode
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {WICKET_TYPES.map((type) => {
                  const isSelected = wicketType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        setWicketType(type.id);
                        if (type.id !== 'run_out') {
                          setDismissedId(striker.id);
                        }
                      }}
                      className={`p-2 rounded-xl border text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="font-bold text-xs">{type.label}</div>
                      <div className="text-[10px] text-slate-500 truncate">{type.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Who is out */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1.5 text-[11px]">
                Batter Out
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDismissedId(striker.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${
                    dismissedId === striker.id
                      ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-left">
                    <span className="text-[10px] text-rose-600 font-bold uppercase block">Striker</span>
                    <span className="text-xs font-semibold">{striker.name}</span>
                  </div>
                  {dismissedId === striker.id && <UserCheck className="w-4 h-4 text-rose-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => setDismissedId(nonStriker.id)}
                  disabled={wicketType !== 'run_out'}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                    dismissedId === nonStriker.id
                      ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  } ${wicketType !== 'run_out' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="text-left">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Non-Striker</span>
                    <span className="text-xs font-semibold">{nonStriker.name}</span>
                  </div>
                  {dismissedId === nonStriker.id && <UserCheck className="w-4 h-4 text-rose-600" />}
                </button>
              </div>
            </div>

            {/* Fielder input (if caught, run out, stumped) */}
            {['caught', 'run_out', 'stumped'].includes(wicketType) && (
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1.5 text-[11px]">
                  Fielder Involved
                </label>
                <select
                  value={fielderName}
                  onChange={(e) => setFielderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium focus:border-slate-900 focus:outline-none"
                >
                  <option value="">Select fielder (optional)...</option>
                  {fieldingPlayers.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name} ({f.role})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Runs on delivery if run out */}
            {wicketType === 'run_out' && (
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1.5 text-[11px]">
                  Runs Scored Before Run Out
                </label>
                <div className="flex gap-2">
                  {[0, 1, 2].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRunsOnWicket(r)}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs border transition-colors cursor-pointer ${
                        runsOnWicket === r
                          ? 'border-amber-500 bg-amber-500 text-slate-950 font-bold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {r} {r === 1 ? 'Run' : 'Runs'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Incoming Batsman Selection */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1.5 text-[11px]">
                Next Batsman In
              </label>
              {availableBatsmen.length === 0 ? (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-2 text-amber-800 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>All out! No further batsmen available in this squad.</span>
                </div>
              ) : (
                <select
                  value={newBatsmanId}
                  onChange={(e) => setNewBatsmanId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold focus:border-slate-900 focus:outline-none"
                  required
                >
                  <option value="">-- Choose next batsman --</option>
                  {availableBatsmen.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.role} • {b.battingStyle || 'Right Hand'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Action buttons */}
            <div className="pt-3 flex items-center justify-end space-x-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl border border-slate-200 font-semibold text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
              >
                Record Wicket
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
