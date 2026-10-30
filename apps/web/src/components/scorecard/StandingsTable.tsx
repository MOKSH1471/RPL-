import React from 'react';
import { TeamStanding } from '@/lib/cricketData';
import { Trophy } from 'lucide-react';

interface StandingsTableProps {
  standings: TeamStanding[];
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ standings }) => {
  const hasPlayedMatches = standings.some((s) => s.played > 0);

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4 text-slate-900">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>RPL Points Table</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Updated automatically as matches conclude
          </p>
        </div>
      </div>

      {standings.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          No team standings available yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[10px] sm:text-xs border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 sm:px-4">#</th>
                <th className="py-3 px-3 sm:px-4">Team</th>
                <th className="py-3 px-2 text-center">P</th>
                <th className="py-3 px-2 text-center">W</th>
                <th className="py-3 px-2 text-center">L</th>
                <th className="py-3 px-2 text-center">NRR</th>
                <th className="py-3 px-3 text-center">Pts</th>
                <th className="py-3 px-3 text-center hidden sm:table-cell">Form</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {standings.map((team, idx) => (
                <tr key={team.teamId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 sm:px-4 font-mono font-bold text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3 sm:px-4">
                    <div className="flex items-center space-x-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: team.colorCode || '#F59E0B' }}
                      />
                      <span className="font-bold text-slate-900">{team.teamName}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">
                        ({team.shortName})
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-slate-600">{team.played}</td>
                  <td className="py-3 px-2 text-center font-mono font-bold text-emerald-600">{team.won}</td>
                  <td className="py-3 px-2 text-center font-mono text-rose-500">{team.lost}</td>
                  <td className="py-3 px-2 text-center font-mono text-slate-600">{team.nrr}</td>
                  <td className="py-3 px-3 text-center font-mono font-black text-amber-600 text-sm sm:text-base">
                    {team.points}
                  </td>
                  <td className="py-3 px-3 text-center hidden sm:table-cell">
                    {team.form.length === 0 ? (
                      <span className="text-slate-300 font-mono text-xs">-</span>
                    ) : (
                      <div className="flex items-center justify-center space-x-1">
                        {team.form.map((res, i) => (
                          <span
                            key={i}
                            className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
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
