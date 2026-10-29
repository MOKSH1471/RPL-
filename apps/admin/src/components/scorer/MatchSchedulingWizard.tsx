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
  Edit3,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  UserPlus,
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

  // Step 3: Lineup Editing State
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editableSquad, setEditableSquad] = useState<CricketPlayer[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState<'Batter' | 'Bowler' | 'All-rounder' | 'Wicketkeeper'>('Batter');

  const openEditLineup = (teamId: string) => {
    const targetTeam = teams.find((t) => t.id === teamId);
    if (targetTeam) {
      setEditableSquad([...targetTeam.players]);
      setEditingTeamId(teamId);
      setNewPlayerName('');
      setNewPlayerRole('Batter');
    }
  };

  const handleMovePlayer = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= editableSquad.length) return;
    const updated = [...editableSquad];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setEditableSquad(updated);
  };

  const handleRemoveFromLineup = (playerId: string) => {
    setEditableSquad((prev) => prev.filter((p) => p.id !== playerId));
  };

  const handleAddPlayerToLineup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    const newP: CricketPlayer = {
      id: `custom-p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newPlayerName.trim(),
      role: newPlayerRole,
      battingStyle: 'Right Hand Bat',
      bowlingStyle: newPlayerRole === 'Bowler' ? 'Right Arm Fast' : undefined,
    };
    setEditableSquad((prev) => [...prev, newP]);
    setNewPlayerName('');
  };

  const handleSaveLineup = () => {
    if (!editingTeamId) return;
    setTeams((prev) =>
      prev.map((t) => (t.id === editingTeamId ? { ...t, players: editableSquad } : t))
    );
    // If current opener was removed, reset opener IDs
    setStrikerId('');
    setNonStrikerId('');
    setOpeningBowlerId('');
    setEditingTeamId(null);
  };

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

  const handleScheduleAsUpcomingAndExit = () => {
    const validOvers = Math.max(1, Math.min(50, Number(oversInput) || 10));
    const effectiveTossWinnerId = currentStep !== 'details' ? tossWinnerId : '';
    const effectiveTossDecision = currentStep !== 'details' ? tossDecision : 'bat';

    // Determine who bats 1st if toss occurred, else teamA
    const batTeam =
      effectiveTossWinnerId && effectiveTossWinnerId === teamB.id && effectiveTossDecision === 'bat'
        ? teamB
        : effectiveTossWinnerId && effectiveTossWinnerId === teamA.id && effectiveTossDecision === 'bowl'
        ? teamB
        : teamA;
    const bowlTeam = batTeam.id === teamA.id ? teamB : teamA;

    const sPlayer = batTeam.players[0] || { id: 'p-1', name: `${batTeam.shortName} Batter 1`, role: 'Batter' as const };
    const nsPlayer = batTeam.players[1] || { id: 'p-2', name: `${batTeam.shortName} Batter 2`, role: 'Batter' as const };
    const bPlayer = bowlTeam.players[bowlTeam.players.length - 1] || bowlTeam.players[0] || { id: 'b-1', name: `${bowlTeam.shortName} Bowler 1`, role: 'Bowler' as const };

    const upcomingMatch: CricketMatch = {
      id: `match-rpl-${Date.now()}`,
      tournamentName,
      matchNumber,
      stage,
      venue,
      oversPerSide: validOvers,
      teamA,
      teamB,
      tossWinnerId: effectiveTossWinnerId,
      tossDecision: effectiveTossDecision,
      status: 'upcoming',
      currentInningsNumber: 1,
      innings1: {
        inningsNumber: 1,
        battingTeamId: batTeam.id,
        bowlingTeamId: bowlTeam.id,
        totalRuns: 0,
        totalWickets: 0,
        legalBallsBowled: 0,
        extras: { wides: 0, noballs: 0, byes: 0, legbyes: 0, total: 0 },
        activeStrikerId: sPlayer.id,
        activeNonStrikerId: nsPlayer.id,
        activeBowlerId: bPlayer.id,
        batsmen: [
          {
            playerId: sPlayer.id,
            name: sPlayer.name,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            isStriker: true,
            isOut: false,
          },
          {
            playerId: nsPlayer.id,
            name: nsPlayer.name,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            isStriker: false,
            isOut: false,
          },
        ],
        bowlers: [
          {
            playerId: bPlayer.id,
            name: bPlayer.name,
            legalBalls: 0,
            maidens: 0,
            runsConceded: 0,
            wickets: 0,
            economy: 0,
            wides: 0,
            noballs: 0,
          },
        ],
        balls: [],
        currentOverBalls: [],
        fallOfWickets: [],
        isCompleted: false,
      },
      streamOverlayToken: `rpl_obs_${Math.random().toString(36).substring(2, 10)}`,
    };

    onMatchCreated(upcomingMatch);
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

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleScheduleAsUpcomingAndExit}
              className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Schedule & Exit</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl bg-white/90 hover:bg-white text-slate-900 font-bold text-xs shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </div>
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
              <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleScheduleAsUpcomingAndExit}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer border border-amber-400/30 active:scale-95"
                  title="Schedule this match fixture as upcoming and exit to Match Hub without starting play"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Schedule Match & Exit</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Default toss winner to teamA
                    setTossWinnerId(selectedTeamAId);
                    setCurrentStep('toss');
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
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
              <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('details')}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-xs text-slate-700 flex items-center space-x-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Details</span>
                </button>

                <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleScheduleAsUpcomingAndExit}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer border border-amber-400/30 active:scale-95"
                    title="Save fixture with toss result and return to Match Hub"
                  >
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Schedule & Exit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep('lineups')}
                    className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
                  >
                    <span>Review Squad Lineups</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
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
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-500">
                        {battingTeam.players.length} Players
                      </span>
                      <button
                        type="button"
                        onClick={() => openEditLineup(battingTeam.id)}
                        className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] flex items-center space-x-1 cursor-pointer active:scale-95 transition-all shadow-2xs"
                        title="Edit Batting Lineup Order & Players"
                      >
                        <Edit3 className="w-3 h-3 text-amber-600" />
                        <span>Edit Lineup</span>
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 text-xs">
                    {battingTeam.players.map((player, idx) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-5 font-mono font-bold text-[11px] text-slate-400">
                            {idx + 1}.
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
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-500">
                        {bowlingTeam.players.length} Players
                      </span>
                      <button
                        type="button"
                        onClick={() => openEditLineup(bowlingTeam.id)}
                        className="px-2.5 py-1 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold text-[11px] flex items-center space-x-1 cursor-pointer active:scale-95 transition-all shadow-2xs"
                        title="Edit Bowling Lineup Order & Players"
                      >
                        <Edit3 className="w-3 h-3 text-cyan-600" />
                        <span>Edit Lineup</span>
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 text-xs">
                    {bowlingTeam.players.map((player, idx) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-5 font-mono font-bold text-[11px] text-slate-400">
                            {idx + 1}.
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

              {/* ── EDIT LINEUP MODAL ── */}
              {editingTeamId && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
                  <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] flex flex-col animate-scaleUp">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                          <Edit3 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-900">
                            Edit Playing Lineup • {teams.find((t) => t.id === editingTeamId)?.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Reorder batting sequence, add or remove players for this match.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingTeamId(null)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick Add Player Form */}
                    <form onSubmit={handleAddPlayerToLineup} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add new player name..."
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                      <select
                        value={newPlayerRole}
                        onChange={(e) => setNewPlayerRole(e.target.value as any)}
                        className="px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
                      >
                        <option value="Batter">Batter</option>
                        <option value="Bowler">Bowler</option>
                        <option value="All-rounder">All-rounder</option>
                        <option value="Wicketkeeper">Wicketkeeper</option>
                      </select>
                      <button
                        type="submit"
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </form>

                    {/* Reorderable Player List */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
                      {editableSquad.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                          No players in this lineup. Use the form above to add players.
                        </div>
                      ) : (
                        editableSquad.map((player, idx) => (
                          <div
                            key={player.id}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 hover:border-slate-300 transition-colors"
                          >
                            <div className="flex items-center space-x-2 min-w-0">
                              <span className="w-6 font-mono font-black text-xs text-slate-400">
                                {idx + 1}.
                              </span>
                              <div className="min-w-0">
                                <span className="font-extrabold text-xs text-slate-900 block truncate">
                                  {player.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {player.role}
                                </span>
                              </div>
                            </div>

                            {/* Reorder & Action Controls */}
                            <div className="flex items-center space-x-1 shrink-0">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMovePlayer(idx, 'up')}
                                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                                title="Move Up (Bat earlier)"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === editableSquad.length - 1}
                                onClick={() => handleMovePlayer(idx, 'down')}
                                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                                title="Move Down (Bat later)"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveFromLineup(player.id)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer ml-1"
                                title="Remove from this match"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Modal Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">
                        {editableSquad.length} Players in Lineup
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setEditingTeamId(null)}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveLineup}
                          className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md cursor-pointer active:scale-95 transition-all"
                        >
                          Save Lineup
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
