import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Coins,
  ShieldCheck,
  UserCheck,
  RotateCcw,
  Sliders,
  Calendar,
  MapPin,
  Clock,
  Swords,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { CricketMatch, CricketTeam, CricketPlayer } from '@/types/cricket';
import { DEFAULT_TEAMS, createConfiguredMatch } from '@/lib/cricketMockData';
import { fetchCricketTeamsFromDb } from '@/lib/cricketApi';

interface MatchSchedulingWizardProps {
  onCancel: () => void;
  onMatchCreated: (newMatch: CricketMatch) => void;
  nextMatchNumber?: number;
}

type WizardStep = 'details' | 'toss' | 'lineups' | 'openers';

export const MatchSchedulingWizard: React.FC<MatchSchedulingWizardProps> = ({
  onCancel,
  onMatchCreated,
  nextMatchNumber = 1,
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('details');
  const [teams, setTeams] = useState<CricketTeam[]>(DEFAULT_TEAMS);

  // Step 1: Match Details
  const [matchNumber, setMatchNumber] = useState<number>(nextMatchNumber);
  const [tournamentName, setTournamentName] = useState('RPL Season 9 Premier Cup');
  const [stage, setStage] = useState('League Match');
  const [venue, setVenue] = useState('RPL Main Stadium (Under Floodlights)');
  const [oversInput, setOversInput] = useState<number>(10);
  const [selectedTeamAId, setSelectedTeamAId] = useState<string>(DEFAULT_TEAMS[0].id);
  const [selectedTeamBId, setSelectedTeamBId] = useState<string>(DEFAULT_TEAMS[1].id);

  // Load teams from MySQL Database
  React.useEffect(() => {
    fetchCricketTeamsFromDb().then((dbTeams) => {
      if (dbTeams && dbTeams.length > 0) {
        setTeams(dbTeams);
        setSelectedTeamAId(dbTeams[0].id);
        setSelectedTeamBId(dbTeams[1] ? dbTeams[1].id : dbTeams[0].id);
      }
    });
  }, []);

  // Step 2: Toss
  const [tossWinnerId, setTossWinnerId] = useState<string>(DEFAULT_TEAMS[0].id);
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl'>('bat');
  const [isFlippingCoin, setIsFlippingCoin] = useState(false);
  const [coinResultSide, setCoinResultSide] = useState<'heads' | 'tails' | null>(null);

  // Step 3 & 4: Lineups and Openers
  const teamA = teams.find((t) => t.id === selectedTeamAId) || teams[0];
  const teamB = teams.find((t) => t.id === selectedTeamBId) || teams[1];

  // Batting and Bowling 1st determinations
  const isTeamABattingFirst =
    (tossWinnerId === teamA.id && tossDecision === 'bat') ||
    (tossWinnerId === teamB.id && tossDecision === 'bowl');

  const battingTeam = isTeamABattingFirst ? teamA : teamB;
  const bowlingTeam = isTeamABattingFirst ? teamB : teamA;

  // Selected Openers
  const [strikerId, setStrikerId] = useState<string>('');
  const [nonStrikerId, setNonStrikerId] = useState<string>('');
  const [openingBowlerId, setOpeningBowlerId] = useState<string>('');

  // Auto-init openers if empty when reaching openers step
  const handleProceedToOpeners = () => {
    if (!strikerId) setStrikerId(battingTeam.players[0]?.id || '');
    if (!nonStrikerId) setNonStrikerId(battingTeam.players[1]?.id || '');
    if (!openingBowlerId) {
      // Pick first designated bowler or last player
      const designatedBowler = bowlingTeam.players.find((p) => p.role === 'Bowler');
      setOpeningBowlerId(designatedBowler?.id || bowlingTeam.players[bowlingTeam.players.length - 1]?.id || '');
    }
    setCurrentStep('openers');
  };

  // Flip coin helper
  const handleFlipCoin = () => {
    setIsFlippingCoin(true);
    setCoinResultSide(null);
    setTimeout(() => {
      const isA = Math.random() > 0.5;
      const winner = isA ? teamA : teamB;
      setTossWinnerId(winner.id);
      setCoinResultSide(isA ? 'heads' : 'tails');
      setIsFlippingCoin(false);
    }, 900);
  };

  // Final start match
  const handleStartMatch = () => {
    const validOvers = Math.max(1, oversInput || 10);
    const createdMatch = createConfiguredMatch({
      tournamentName,
      matchNumber,
      stage,
      venue,
      oversPerSide: validOvers,
      teamA,
      teamB,
      tossWinnerId,
      tossDecision,
      strikerId: strikerId || battingTeam.players[0]?.id,
      nonStrikerId: nonStrikerId || battingTeam.players[1]?.id,
      openingBowlerId: openingBowlerId || bowlingTeam.players[bowlingTeam.players.length - 1]?.id,
    });

    onMatchCreated(createdMatch);
  };

  const stepsList: { id: WizardStep; label: string; num: number }[] = [
    { id: 'details', label: 'Match Setup', num: 1 },
    { id: 'toss', label: 'Toss & Decision', num: 2 },
    { id: 'lineups', label: 'Squad Review', num: 3 },
    { id: 'openers', label: 'Crease Setup', num: 4 },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-slate-900 font-sans">
      {/* ── Wizard Header ── */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 p-5 sm:p-6 text-slate-950 border-b border-amber-300/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-amber-300 font-black text-[10px] uppercase tracking-wider">
                Step Wizard
              </span>
              <span className="text-xs font-bold text-slate-900/80">Match Scheduling & Live Setup</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 mt-1">
              Schedule & Setup Match
            </h2>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/90 hover:bg-white text-slate-900 font-bold text-xs shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel & Return</span>
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-4 gap-2 mt-5">
          {stepsList.map((s, idx) => {
            const isCompleted =
              (currentStep === 'toss' && idx < 1) ||
              (currentStep === 'lineups' && idx < 2) ||
              (currentStep === 'openers' && idx < 3);
            const isCurrent = currentStep === s.id;

            return (
              <div
                key={s.id}
                className={`flex flex-col p-2.5 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-slate-950 text-white shadow-md'
                    : isCompleted
                    ? 'bg-amber-600/20 text-slate-900 font-semibold'
                    : 'bg-white/40 text-slate-800'
                }`}
              >
                <div className="flex items-center space-x-1.5 text-xs font-black">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isCurrent
                        ? 'bg-amber-400 text-slate-950'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-400 text-white'
                    }`}
                  >
                    {isCompleted ? '✓' : s.num}
                  </span>
                  <span className="truncate">{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Wizard Body ── */}
      <div className="p-5 sm:p-7 min-h-[460px] bg-slate-50/60">
        <AnimatePresence mode="wait">
          {/* ───────────────── STEP 1: MATCH DETAILS & TEAMS ───────────────── */}
          {currentStep === 'details' && (
            <motion.div
              key="step-details"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6 max-w-4xl mx-auto"
            >
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
                  <Swords className="w-5 h-5 text-amber-500" />
                  <span>Select Competing Demo Teams</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Team A */}
                  <div className="space-y-2 p-4 rounded-xl border-2 border-amber-500/40 bg-amber-50/30">
                    <label className="block text-xs font-black uppercase tracking-wider text-amber-900">
                      Team 1 (First Roster)
                    </label>
                    <select
                      value={selectedTeamAId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setSelectedTeamAId(newId);
                        if (newId === selectedTeamBId) {
                          const other = teams.find((t) => t.id !== newId);
                          if (other) setSelectedTeamBId(other.id);
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name} ({team.shortName})
                        </option>
                      ))}
                    </select>

                    <div className="pt-2 flex items-center space-x-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                        style={{ backgroundColor: teamA.colorCode }}
                      />
                      <span className="text-xs font-semibold text-slate-700">
                        {teamA.players.length} players registered in squad
                      </span>
                    </div>
                  </div>

                  {/* Team B */}
                  <div className="space-y-2 p-4 rounded-xl border-2 border-cyan-500/40 bg-cyan-50/30">
                    <label className="block text-xs font-black uppercase tracking-wider text-cyan-900">
                      Team 2 (Opponent Roster)
                    </label>
                    <select
                      value={selectedTeamBId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setSelectedTeamBId(newId);
                        if (newId === selectedTeamAId) {
                          const other = teams.find((t) => t.id !== newId);
                          if (other) setSelectedTeamAId(other.id);
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      {teams.map((team) => (
                        <option key={team.id} value={team.id} disabled={team.id === selectedTeamAId}>
                          {team.name} ({team.shortName}) {team.id === selectedTeamAId ? '— (Selected as Team 1)' : ''}
                        </option>
                      ))}
                    </select>

                    <div className="pt-2 flex items-center space-x-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                        style={{ backgroundColor: teamB.colorCode }}
                      />
                      <span className="text-xs font-semibold text-slate-700">
                        {teamB.players.length} players registered in squad
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Overs & Settings */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-amber-500" />
                  <span>Match Overs & Format (Custom Input)</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Number of Overs per Side
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="relative w-full sm:w-48">
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={oversInput}
                          onChange={(e) => setOversInput(parseInt(e.target.value, 10) || 1)}
                          className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-400 font-mono font-black text-lg text-slate-900 bg-amber-50/20 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="e.g. 10"
                        />
                        <span className="absolute right-3 top-3 text-xs font-bold text-slate-500 pointer-events-none">
                          Overs
                        </span>
                      </div>

                      {/* Quick Presets */}
                      <div className="flex items-center flex-wrap gap-2">
                        {[6, 8, 10, 12, 15, 20].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setOversInput(num)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              oversInput === num
                                ? 'bg-slate-900 text-amber-300 font-black shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {num} Ov {num === 10 ? '(Standard)' : num === 20 ? '(T20)' : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Type any custom number of overs (e.g. 5, 8, 10, 14, 20) or choose a preset.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Match Number
                      </label>
                      <input
                        type="number"
                        value={matchNumber}
                        onChange={(e) => setMatchNumber(parseInt(e.target.value, 10) || 1)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Stage
                      </label>
                      <input
                        type="text"
                        value={stage}
                        onChange={(e) => setStage(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Venue
                      </label>
                      <input
                        type="text"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Step Action */}
              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => {
                    // Default toss winner to teamA
                    setTossWinnerId(selectedTeamAId);
                    setCurrentStep('toss');
                  }}
                  className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <span>Proceed to Toss & Decision</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ───────────────── STEP 2: TOSS & DECISION ───────────────── */}
          {currentStep === 'toss' && (
            <motion.div
              key="step-toss"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6 max-w-4xl mx-auto"
            >
              {/* Coin Toss Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <span>The Official Match Toss</span>
                </div>

                <h3 className="text-xl font-black text-slate-900">Who Won The Toss?</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Click the team that won the toss, or use the interactive Coin Flip button to simulate the toss!
                </p>

                {/* Interactive Coin Flip Button */}
                <div className="py-2">
                  <button
                    type="button"
                    onClick={handleFlipCoin}
                    disabled={isFlippingCoin}
                    className={`px-5 py-2.5 rounded-full font-black text-xs transition-all shadow-md inline-flex items-center space-x-2 cursor-pointer ${
                      isFlippingCoin
                        ? 'bg-amber-300 text-slate-900 animate-pulse'
                        : 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 hover:brightness-105'
                    }`}
                  >
                    <Coins className={`w-4 h-4 ${isFlippingCoin ? 'animate-spin' : ''}`} />
                    <span>{isFlippingCoin ? 'Spinning Gold Coin…' : 'Flip Coin (Random)'}</span>
                  </button>
                  {coinResultSide && !isFlippingCoin && (
                    <p className="text-xs font-bold text-emerald-600 mt-1.5">
                      Coin Landed! {tossWinnerId === teamA.id ? teamA.name : teamB.name} won the toss!
                    </p>
                  )}
                </div>

                {/* Team Selection Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-2">
                  {/* Team A Card */}
                  <button
                    type="button"
                    onClick={() => setTossWinnerId(teamA.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                      tossWinnerId === teamA.id
                        ? 'border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-400/40'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {tossWinnerId === teamA.id && (
                      <span className="absolute top-3 right-3 text-amber-600 font-bold text-xs flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Winner</span>
                      </span>
                    )}
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shadow-xs"
                        style={{ backgroundColor: teamA.colorCode }}
                      >
                        {teamA.shortName}
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-slate-900">{teamA.name}</div>
                        <div className="text-[11px] text-slate-500">{teamA.players[0]?.name}</div>
                      </div>
                    </div>
                  </button>

                  {/* Team B Card */}
                  <button
                    type="button"
                    onClick={() => setTossWinnerId(teamB.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                      tossWinnerId === teamB.id
                        ? 'border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-400/40'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {tossWinnerId === teamB.id && (
                      <span className="absolute top-3 right-3 text-amber-600 font-bold text-xs flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Winner</span>
                      </span>
                    )}
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shadow-xs"
                        style={{ backgroundColor: teamB.colorCode }}
                      >
                        {teamB.shortName}
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-slate-900">{teamB.name}</div>
                        <div className="text-[11px] text-slate-500">{teamB.players[0]?.name}</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Toss Decision Section */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-black text-base text-slate-900 text-center">
                  What Did {tossWinnerId === teamA.id ? teamA.name : teamB.name} Elect To Do?
                </h3>

                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => setTossDecision('bat')}
                    className={`p-4 rounded-2xl border-2 font-black text-sm flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      tossDecision === 'bat'
                        ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-md ring-2 ring-amber-400/40'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl">🏏</span>
                    <span>BAT FIRST</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Set the target</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTossDecision('bowl')}
                    className={`p-4 rounded-2xl border-2 font-black text-sm flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      tossDecision === 'bowl'
                        ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-md ring-2 ring-amber-400/40'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl">🎳</span>
                    <span>BOWL FIRST</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Chase the target</span>
                  </button>
                </div>

                {/* ── Official Toss Display Banner ── */}
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 via-amber-100/70 to-amber-50 border border-amber-300 shadow-2xs">
                  <div className="flex items-center space-x-2 text-xs font-black uppercase text-amber-900 mb-1">
                    <Trophy className="w-4 h-4 text-amber-600" />
                    <span>Official Toss Result Banner</span>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900">
                    <span className="text-amber-800 font-black">
                      {tossWinnerId === teamA.id ? teamA.name : teamB.name}
                    </span>{' '}
                    won the toss and elected to{' '}
                    <span className="uppercase text-amber-900 font-black tracking-wide">
                      {tossDecision === 'bat' ? 'Bat First' : 'Bowl First'}
                    </span>
                    .
                  </div>
                  <div className="mt-2 flex items-center gap-2 flex-wrap text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-white border border-amber-300 font-bold text-slate-800">
                      🏏 1st Innings Batting: <strong>{battingTeam.name}</strong>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white border border-amber-300 font-bold text-slate-800">
                      🎳 1st Innings Bowling: <strong>{bowlingTeam.name}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('details')}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-xs text-slate-700 flex items-center space-x-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep('lineups')}
                  className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <span>Review Squad Lineups</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ───────────────── STEP 3: SQUAD LINEUPS ───────────────── */}
          {currentStep === 'lineups' && (
            <motion.div
              key="step-lineups"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6 max-w-5xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Batting Team Lineup */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-xs shadow-2xs"
                        style={{ backgroundColor: battingTeam.colorCode }}
                      >
                        {battingTeam.shortName}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{battingTeam.name}</h4>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                          Batting 1st
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      {battingTeam.players.length} Players
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 text-xs">
                    {battingTeam.players.map((player, idx) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-5 font-mono font-bold text-[11px] text-slate-400">
                            #{player.jerseyNumber || idx + 1}
                          </span>
                          <span className="font-bold text-slate-800">{player.name}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-600">
                          {player.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bowling Team Lineup */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-xs shadow-2xs"
                        style={{ backgroundColor: bowlingTeam.colorCode }}
                      >
                        {bowlingTeam.shortName}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{bowlingTeam.name}</h4>
                        <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md">
                          Bowling 1st
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      {bowlingTeam.players.length} Players
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 text-xs">
                    {bowlingTeam.players.map((player, idx) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-5 font-mono font-bold text-[11px] text-slate-400">
                            #{player.jerseyNumber || idx + 1}
                          </span>
                          <span className="font-bold text-slate-800">{player.name}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-600">
                          {player.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('toss')}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-xs text-slate-700 flex items-center space-x-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Toss</span>
                </button>

                <button
                  type="button"
                  onClick={handleProceedToOpeners}
                  className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <span>Select Batsmen & Bowler</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ───────────────── STEP 4: OPENERS & CREASE SETUP ───────────────── */}
          {currentStep === 'openers' && (
            <motion.div
              key="step-openers"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6 max-w-4xl mx-auto"
            >
              {/* Select Batsmen Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-base text-slate-900 flex items-center space-x-2">
                    <span>🏏 Select Opening Batsmen for {battingTeam.name}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      // Swap strike
                      const temp = strikerId;
                      setStrikerId(nonStrikerId);
                      setNonStrikerId(temp);
                    }}
                    className="px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    ⇄ Swap Strike
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Striker Select */}
                  <div className="p-4 rounded-xl border-2 border-amber-400 bg-amber-50/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-wider text-amber-900">
                        Striker (Facing 1st Ball) *
                      </label>
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    </div>
                    <select
                      value={strikerId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setStrikerId(newId);
                        if (newId === nonStrikerId) {
                          const other = battingTeam.players.find((p) => p.id !== newId);
                          if (other) setNonStrikerId(other.id);
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {battingTeam.players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.role})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500">Takes strike for ball 0.1</p>
                  </div>

                  {/* Non-Striker Select */}
                  <div className="p-4 rounded-xl border-2 border-slate-300 bg-slate-50/60 space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Non-Striker (Bowler's End)
                    </label>
                    <select
                      value={nonStrikerId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setNonStrikerId(newId);
                        if (newId === strikerId) {
                          const other = battingTeam.players.find((p) => p.id !== newId);
                          if (other) setStrikerId(other.id);
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {battingTeam.players.map((p) => (
                        <option key={p.id} value={p.id} disabled={p.id === strikerId}>
                          {p.name} ({p.role}) {p.id === strikerId ? '— (Selected as Striker)' : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500">Stands at non-striker's crease</p>
                  </div>
                </div>
              </div>

              {/* Select Opening Bowler */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-black text-base text-slate-900">
                  🎳 Select Opening Bowler for {bowlingTeam.name}
                </h3>

                <div className="p-4 rounded-xl border-2 border-cyan-400 bg-cyan-50/40 space-y-2 max-w-lg">
                  <label className="text-xs font-black uppercase tracking-wider text-cyan-900">
                    Bowler (Over 1)
                  </label>
                  <select
                    value={openingBowlerId}
                    onChange={(e) => setOpeningBowlerId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {bowlingTeam.players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.bowlingStyle || p.role}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">Will deliver the first over of the match</p>
                </div>
              </div>

              {/* Crease Live Preview Strip */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white shadow-lg space-y-3">
                <div className="flex items-center justify-between text-xs text-amber-300 font-extrabold uppercase tracking-wider">
                  <span>Match Ready Confirmation</span>
                  <span>{oversInput} Overs Per Side</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">Striker</span>
                    <span className="font-extrabold text-sm text-white">
                      {battingTeam.players.find((p) => p.id === strikerId)?.name || 'Striker'} *
                    </span>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Non-Striker</span>
                    <span className="font-extrabold text-sm text-white">
                      {battingTeam.players.find((p) => p.id === nonStrikerId)?.name || 'Non-Striker'}
                    </span>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 block">Opening Bowler</span>
                    <span className="font-extrabold text-sm text-white">
                      {bowlingTeam.players.find((p) => p.id === openingBowlerId)?.name || 'Bowler'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('lineups')}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-xs text-slate-700 flex items-center space-x-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Lineups</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartMatch}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl hover:shadow-2xl transition-all flex items-center space-x-2 cursor-pointer active:scale-98"
                >
                  <Flame className="w-5 h-5 text-slate-950" />
                  <span>Launch Live Scoring 🚀</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
