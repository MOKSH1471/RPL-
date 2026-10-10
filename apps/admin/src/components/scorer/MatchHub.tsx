import React, { useState } from 'react';
import {
  Trophy,
  Plus,
  Play,
  RotateCcw,
  Calendar,
  MapPin,
  Clock,
  Swords,
  ChevronRight,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { CricketMatch } from '@/types/cricket';
import { formatOvers } from '@/lib/cricketMockData';

interface MatchHubProps {
  matches: CricketMatch[];
  activeMatchId?: string;
  onSelectMatch: (match: CricketMatch) => void;
  onOpenScheduleWizard: () => void;
  onResetMatch: (matchId: string) => void;
  onDeleteMatch: (matchId: string) => void;
}

export const MatchHub: React.FC<MatchHubProps> = ({
  matches,
  activeMatchId,
  onSelectMatch,
  onOpenScheduleWizard,
  onResetMatch,
  onDeleteMatch,
}) => {
  const [matchToDelete, setMatchToDelete] = useState<CricketMatch | null>(null);

  const liveCount = matches.filter((m) => m.status === 'live').length;
  const completedCount = matches.filter((m) => m.status === 'completed').length;
  const upcomingCount = matches.filter((m) => m.status === 'upcoming').length;

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* ── Top Header & Stats Strip ── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-[10px] uppercase tracking-wider">
              Admin & Scorer
            </span>
            <span className="text-xs font-bold text-slate-500">Live Match Operations</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mt-1">
            RPL Matches & Live Scorer
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Schedule tournament fixtures, conduct tosses, and manage ball-by-ball live scoring
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenScheduleWizard}
          className="self-start md:self-auto px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Schedule New Match</span>
        </button>
      </div>

      {/* ── Match Status Metrics ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Total Matches
          </span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
            {matches.length}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
              Live Scoring
            </span>
          </div>
          <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">
            {liveCount}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Upcoming
          </span>
          <span className="text-2xl font-black text-cyan-600 font-mono mt-1 block">
            {upcomingCount}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Completed
          </span>
          <span className="text-2xl font-black text-slate-700 font-mono mt-1 block">
            {completedCount}
          </span>
        </div>
      </div>

      {/* ── Matches Listing ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-slate-900">Tournament Match Cards</h3>
          <span className="text-xs text-slate-500 font-semibold">
            {matches.length} {matches.length === 1 ? 'match' : 'matches'} listed
          </span>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <Swords className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-black text-base text-slate-900">No Matches Scheduled Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Click the "Schedule New Match" button above to pick teams, set overs, and perform the toss.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenScheduleWizard}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xs transition-all cursor-pointer inline-flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule First Match</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {matches.map((match) => {
              const currentInnings =
                match.currentInningsNumber === 1
                  ? match.innings1
                  : match.innings2 || match.innings1;
              const battingTeam =
                currentInnings.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
              const bowlingTeam =
                currentInnings.battingTeamId === match.teamA.id ? match.teamB : match.teamA;
              const isMatchActive = match.id === activeMatchId;

              const tossWinner =
                match.tossWinnerId === match.teamA.id ? match.teamA : match.teamB;

              return (
                <div
                  key={match.id}
                  className={`bg-white rounded-3xl border p-5 transition-all shadow-xs hover:shadow-md flex flex-col justify-between ${
                    isMatchActive
                      ? 'border-amber-400 ring-2 ring-amber-400/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header Strip */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900">Match #{match.matchNumber}</span>
                        <span>•</span>
                        <span>{match.stage}</span>
                        <span>•</span>
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          {match.oversPerSide} Ov
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {match.status === 'live' && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px] flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>LIVE</span>
                          </span>
                        )}
                        {match.status === 'completed' && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                            COMPLETED
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMatchToDelete(match);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Match"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Team VS Display */}
                    <div className="grid grid-cols-5 items-center py-1">
                      {/* Team A */}
                      <div className="col-span-2 flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-xs shrink-0"
                          style={{ backgroundColor: match.teamA.colorCode }}
                        >
                          {match.teamA.shortName}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-sm text-slate-900 truncate">
                            {match.teamA.name}
                          </h4>
                          <span className="text-[11px] text-slate-500">
                            {match.teamA.players.length} players
                          </span>
                        </div>
                      </div>

                      {/* VS Center */}
                      <div className="col-span-1 text-center">
                        <span className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 inline-flex items-center justify-center font-black text-xs text-slate-400">
                          VS
                        </span>
                      </div>

                      {/* Team B */}
                      <div className="col-span-2 flex items-center justify-end space-x-3 text-right">
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-sm text-slate-900 truncate">
                            {match.teamB.name}
                          </h4>
                          <span className="text-[11px] text-slate-500">
                            {match.teamB.players.length} players
                          </span>
                        </div>
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-xs shrink-0"
                          style={{ backgroundColor: match.teamB.colorCode }}
                        >
                          {match.teamB.shortName}
                        </div>
                      </div>
                    </div>

                    {/* Score or Toss Result Banner */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-semibold">Toss Result:</span>
                        <span className="font-bold text-amber-800">
                          {tossWinner.shortName} won & elected to {match.tossDecision}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-xs font-bold text-slate-700">
                          {battingTeam.shortName} Score:
                        </span>
                        <div className="flex items-baseline space-x-2">
                          <span className="font-mono font-black text-lg text-slate-950">
                            {currentInnings.totalRuns}/{currentInnings.totalWickets}
                          </span>
                          <span className="font-mono text-xs text-slate-500 font-semibold">
                            ({formatOvers(currentInnings.legalBallsBowled)}/{match.oversPerSide} ov)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center space-x-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{match.venue}</span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => onResetMatch(match.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 text-xs font-semibold transition-colors cursor-pointer border border-transparent hover:border-amber-200"
                        title="Reset Match Score to 0-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMatchToDelete(match);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer border border-transparent hover:border-red-200"
                        title="Delete Match Completely"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectMatch(match)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Open Live Scorer</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Match Confirmation Modal */}
      {matchToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black text-red-600 tracking-wider">
                Permanent Action
              </span>
              <h4 className="font-black text-lg text-slate-900">
                Delete Match #{matchToDelete.matchNumber}?
              </h4>
              <p className="text-xs text-slate-600 pt-1">
                Are you sure you want to delete{' '}
                <strong>
                  {matchToDelete.teamA.name} vs {matchToDelete.teamB.name}
                </strong>
                ? This fixture and its score will be removed.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMatchToDelete(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = matchToDelete.id;
                  setMatchToDelete(null);
                  onDeleteMatch(id);
                }}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition-all cursor-pointer active:scale-95"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
