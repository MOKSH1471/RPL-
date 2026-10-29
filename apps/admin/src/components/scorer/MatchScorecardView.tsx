import React, { useState } from 'react';
import { CricketMatch, InningsState } from '@/types/cricket';
import { formatOvers } from '@/lib/cricketMockData';

interface MatchScorecardViewProps {
  match: CricketMatch;
}

export const MatchScorecardView: React.FC<MatchScorecardViewProps> = ({ match }) => {
  const [selectedInningsNum, setSelectedInningsNum] = useState<1 | 2>(match.currentInningsNumber);

  const innings: InningsState | undefined =
    selectedInningsNum === 1 ? match.innings1 : match.innings2;

  const battingTeam =
    innings?.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
  const bowlingTeam =
    innings?.bowlingTeamId === match.teamA.id ? match.teamA : match.teamB;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-5">
      {/* Innings Selector Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setSelectedInningsNum(1)}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              selectedInningsNum === 1
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            1st Innings: {match.teamA.shortName} ({match.innings1.totalRuns}/{match.innings1.totalWickets})
          </button>

          {match.innings2 && (
            <button
              type="button"
              onClick={() => setSelectedInningsNum(2)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                selectedInningsNum === 2
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              2nd Innings: {match.teamB.shortName} ({match.innings2.totalRuns}/{match.innings2.totalWickets})
            </button>
          )}
        </div>

        {innings && (
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-800">
            <span>{battingTeam.name}:</span>
            <span className="font-mono font-extrabold text-slate-950 text-xl tracking-tight">
              {innings.totalRuns}/{innings.totalWickets}
            </span>
            <span className="text-slate-500 font-mono text-xs font-semibold">
              ({formatOvers(innings.legalBallsBowled)} ov)
            </span>
          </div>
        )}
      </div>

      {!innings ? (
        <div className="p-10 text-center text-slate-400 font-medium text-xs">
          Innings has not commenced yet.
        </div>
      ) : (
        <>
          {/* Batting Scorecard Table */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Batting Scorecard — {battingTeam.name}
              </h4>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px] sm:text-xs">
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
                <tbody className="divide-y divide-slate-100 font-medium">
                  {innings.batsmen.map((batsman) => {
                    const isAtCrease = batsman.playerId === innings.activeStrikerId || batsman.playerId === innings.activeNonStrikerId;
                    const hasBatted = batsman.balls > 0 || batsman.runs > 0 || isAtCrease || batsman.isOut;
                    const statusText = batsman.isOut ? batsman.dismissalText || 'out' : hasBatted ? 'not out' : 'Did not bat';
                    return (
                    <tr key={batsman.playerId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4">
                        <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                          <span>{batsman.name}</span>
                          {!batsman.isOut && isAtCrease && <span className="text-amber-500 font-bold">*</span>}
                        </div>
                      </td>
                      <td className={`py-2.5 px-2 sm:px-3 text-xs italic ${hasBatted ? 'text-slate-500' : 'text-slate-400 font-normal'}`}>
                        {statusText}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900">
                        {batsman.runs}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                        {batsman.balls}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                        {batsman.fours}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                        {batsman.sixes}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                        {batsman.strikeRate.toFixed(1)}
                      </td>
                    </tr>
                  );
                  })}

                  {/* Extras Row */}
                  <tr className="bg-slate-50/70 font-semibold text-xs text-slate-700">
                    <td colSpan={2} className="py-2 px-3 sm:px-4">
                      Extras (wd {innings.extras.wides}, nb {innings.extras.noballs}, b {innings.extras.byes}, lb {innings.extras.legbyes})
                    </td>
                    <td className="py-2 px-2 text-right font-mono font-bold">
                      {innings.extras.total}
                    </td>
                    <td colSpan={4}></td>
                  </tr>

                  {/* Total Row */}
                  <tr className="bg-slate-50 font-bold text-xs sm:text-sm text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={2} className="py-2.5 px-3 sm:px-4">
                      Total ({innings.totalWickets} wkts, {formatOvers(innings.legalBallsBowled)} ov)
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-950 font-black text-sm sm:text-base">
                      {innings.totalRuns}
                    </td>
                    <td colSpan={4}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Fall of Wickets */}
          {innings.fallOfWickets.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-1.5 uppercase tracking-wide text-[10px]">
                Fall of Wickets
              </span>
              <div className="flex flex-wrap gap-2 text-slate-600 font-mono">
                {innings.fallOfWickets.map((fow) => (
                  <span
                    key={fow.wicketNumber}
                    className="px-2 py-0.5 bg-white rounded border border-slate-200 font-medium text-[11px]"
                  >
                    {fow.score}-{fow.wicketNumber} ({fow.playerOutName}, {fow.overDisplay} ov)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bowling Scorecard Table */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Bowling Figures — {bowlingTeam.name}
              </h4>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px] sm:text-xs">
                  <tr>
                    <th className="py-2.5 px-3 sm:px-4">Bowler</th>
                    <th className="py-2.5 px-2 text-right">O</th>
                    <th className="py-2.5 px-2 text-right">M</th>
                    <th className="py-2.5 px-2 text-right">R</th>
                    <th className="py-2.5 px-2 text-right">W</th>
                    <th className="py-2.5 px-3 text-right">Econ</th>
                    <th className="py-2.5 px-2 text-right">WD</th>
                    <th className="py-2.5 px-2 text-right">NB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {innings.bowlers.map((bowler) => (
                    <tr key={bowler.playerId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4 font-bold text-slate-900">
                        {bowler.name}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-700">
                        {formatOvers(bowler.legalBalls)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-700">
                        {bowler.maidens}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900">
                        {bowler.runsConceded}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-black text-rose-600">
                        {bowler.wickets}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                        {bowler.economy.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-500">
                        {bowler.wides}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-500">
                        {bowler.noballs}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
