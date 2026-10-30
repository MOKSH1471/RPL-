import React from 'react';
import { TeamStanding } from '@/lib/cricketData';
import { Trophy } from 'lucide-react';

interface StandingsTableProps {
  standings: TeamStanding[];
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ standings }) => {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/90 p-3 sm:p-5 shadow-xs space-y-3 sm:space-y-4 text-slate-900 overflow-hidden">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center space-x-1.5 sm:space-x-2">
            <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
            <span>RPL Points Table</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Updated automatically as matches conclude
          </p>
        </div>
      </div>

      {standings.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          No team standings available yet.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-xs sm:text-sm table-fixed">
            <colgroup>
              <col className="w-6 sm:w-8" />
              <col className="w-auto" />
              <col className="w-7 sm:w-9" />
              <col className="w-7 sm:w-9" />
              <col className="w-7 sm:w-9" />
              <col className="w-13 sm:w-16" />
              <col className="w-8 sm:w-12" />
              <col className="hidden sm:table-column sm:w-20" />
            </colgroup>
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[10px] sm:text-xs border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-1 text-center">#</th>
                <th className="py-2.5 px-1.5 sm:px-2">Team</th>
                <th className="py-2.5 px-1 text-center font-semibold">P</th>
                <th className="py-2.5 px-1 text-center font-semibold text-emerald-700">W</th>
                <th className="py-2.5 px-1 text-center font-semibold text-rose-600">L</th>
                <th className="py-2.5 px-1 text-center font-semibold">NRR</th>
                <th className="py-2.5 px-1 text-center font-bold text-amber-700">Pts</th>
                <th className="py-2.5 px-2 text-center hidden sm:table-cell">Form</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {standings.map((team, idx) => (
                <tr key={team.teamId} className="hover:bg-amber-50/20 transition-colors">
                  <td className="py-2.5 px-1 text-center font-mono font-bold text-slate-400 text-xs">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-1.5 sm:px-2 truncate">
                    <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0"
                        style={{ backgroundColor: team.colorCode || '#F59E0B' }}
                      />
                      <span className="font-bold text-slate-900 truncate text-xs sm:text-sm">
                        {team.teamName}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono shrink-0 hidden xs:inline">
                        ({team.shortName})
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-1 text-center font-mono text-slate-600 text-xs">{team.played}</td>
                  <td className="py-2.5 px-1 text-center font-mono font-bold text-emerald-700 text-xs">{team.won}</td>
                  <td className="py-2.5 px-1 text-center font-mono text-rose-600 text-xs">{team.lost}</td>
                  <td className="py-2.5 px-1 text-center font-mono text-slate-600 text-[11px] sm:text-xs">{team.nrr}</td>
                  <td className="py-2.5 px-1 text-center font-mono font-black text-amber-700 text-xs sm:text-sm">
                    {team.points}
                  </td>
                  <td className="py-2.5 px-2 text-center hidden sm:table-cell">
                    {team.form.length === 0 ? (
                      <span className="text-slate-300 font-mono text-xs">-</span>
                    ) : (
                      <div className="flex items-center justify-center space-x-1">
                        {team.form.map((res, i) => (
                          <span
                            key={i}
                            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[9px] sm:text-[10px] font-black flex items-center justify-center ${
                              res === 'W'
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                : 'bg-rose-100 text-rose-700 border border-rose-300'
                            }`}
                          >
                            {res}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
