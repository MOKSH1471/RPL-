import React, { useState, useEffect } from 'react';
import {
  Trophy,
  ArrowLeft,
  RotateCcw,
  SlidersHorizontal,
  FileSpreadsheet,
  Activity,
  History,
  LayoutGrid,
  Plus,
} from 'lucide-react';
import {
  CricketMatch,
  BallEvent,
  ExtraType,
  WicketType,
  InningsState,
  LiveBatsman,
} from '@/types/cricket';
import {
  loadSavedMatch,
  saveMatchToStorage,
  resetMatchInStorage,
  formatOvers,
  loadMatchesList,
  saveMatchesList,
  createInitialMatch,
} from '@/lib/cricketMockData';
import {
  fetchCricketMatchesFromDb,
  syncMatchToDb,
  deleteMatchFromDb,
} from '@/lib/cricketApi';
import { ScorerHeader } from './ScorerHeader';
import { CreaseCard } from './CreaseCard';
import { OverTimeline } from './OverTimeline';
import { ScorerKeypad } from './ScorerKeypad';
import { WicketModal } from './WicketModal';
import { ChangeBowlerModal } from './ChangeBowlerModal';
import { ChangeBatsmanModal } from './ChangeBatsmanModal';
import { MatchScorecardView } from './MatchScorecardView';
import { NewMatchModal } from './NewMatchModal';
import { MatchHub } from './MatchHub';
import { MatchSchedulingWizard } from './MatchSchedulingWizard';

interface ScorerPageProps {
  onBackToHome: () => void;
}

export const ScorerPage: React.FC<ScorerPageProps> = ({ onBackToHome }) => {
  const [match, setMatch] = useState<CricketMatch>(() => loadSavedMatch());
  const [matchesList, setMatchesList] = useState<CricketMatch[]>(() => loadMatchesList());
  const [viewMode, setViewMode] = useState<'scoring' | 'hub' | 'wizard'>('scoring');
  const [activeTab, setActiveTab] = useState<'scorer' | 'scorecard' | 'log'>('scorer');

  // Modals state
  const [isWicketModalOpen, setIsWicketModalOpen] = useState(false);
  const [isChangeBowlerOpen, setIsChangeBowlerOpen] = useState(false);
  const [isChangeBatsmanOpen, setIsChangeBatsmanOpen] = useState(false);
  const [changeBatsmanTarget, setChangeBatsmanTarget] = useState<'striker' | 'nonStriker'>('striker');
  const [isOverEndPrompt, setIsOverEndPrompt] = useState(false);
  const [isNewMatchModalOpen, setIsNewMatchModalOpen] = useState(false);

  // Initial load from Database / Vite store (replaces hardcoded demo cache when online)
  useEffect(() => {
    fetchCricketMatchesFromDb().then((dbMatches) => {
      const localMatches = loadMatchesList();
      if (dbMatches && dbMatches.length > 0) {
        // Sync any locally scheduled fixtures that haven't reached the DB yet
        const dbIds = new Set(dbMatches.map((m) => m.id));
        const pendingSync = (localMatches || []).filter((m) => !dbIds.has(m.id));
        pendingSync.forEach((m) => syncMatchToDb(m));

        const merged = [...pendingSync, ...dbMatches];
        setMatchesList(merged);
        saveMatchesList(merged);
        setMatch((current) => merged.find((m) => m.id === current.id) || merged[0]);
      } else if (localMatches && localMatches.length > 0) {
        localMatches.forEach((m) => syncMatchToDb(m));
        setMatchesList(localMatches);
      }
    });
  }, []);

  // Auto persist whenever match updates (syncs to LocalStorage AND MySQL Database)
  useEffect(() => {
    saveMatchToStorage(match);
    syncMatchToDb(match);
    setMatchesList((prev) => {
      const idx = prev.findIndex((m) => m.id === match.id);
      if (idx >= 0) {
        const updated = prev.map((m) => (m.id === match.id ? match : m));
        saveMatchesList(updated);
        return updated;
      }
      return prev;
    });
  }, [match]);

  // Auto-complete match if in 2nd innings and target was already reached or balls/wickets exhausted
  useEffect(() => {
    if (match.status === 'completed') return;

    if (match.currentInningsNumber === 2 && match.innings2) {
      const inn = match.innings2;
      const target = match.target || (match.innings1 ? match.innings1.totalRuns + 1 : 0);
      const maxLegalBalls = match.oversPerSide * 6;

      if (target > 0 && inn.totalRuns >= target) {
        const chasingTeam = inn.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
        const wicketsRem = Math.max(0, 10 - inn.totalWickets);
        const winSummary = `${chasingTeam.name} won by ${wicketsRem} wicket${wicketsRem === 1 ? '' : 's'}!`;

        setMatch((prev) => ({
          ...prev,
          status: 'completed',
          winnerTeamId: chasingTeam.id,
          resultSummary: winSummary,
          innings2: prev.innings2 ? { ...prev.innings2, isCompleted: true } : prev.innings2,
        }));
      } else if (inn.legalBallsBowled >= maxLegalBalls || inn.totalWickets >= 10) {
        const defendingTeam = inn.bowlingTeamId === match.teamA.id ? match.teamA : match.teamB;
        let winSummary = '';
        let winnerId: string | undefined = undefined;

        if (target > 0 && inn.totalRuns < target - 1) {
          const runsDef = target - 1 - inn.totalRuns;
          winSummary = `${defendingTeam.name} won by ${runsDef} run${runsDef === 1 ? '' : 's'}!`;
          winnerId = defendingTeam.id;
        } else if (target > 0 && inn.totalRuns === target - 1) {
          winSummary = 'Match Tied!';
        } else {
          winSummary = 'Innings completed.';
        }

        setMatch((prev) => ({
          ...prev,
          status: 'completed',
          winnerTeamId: winnerId,
          resultSummary: winSummary,
          innings2: prev.innings2 ? { ...prev.innings2, isCompleted: true } : prev.innings2,
        }));
      }
    }
  }, [match]);

  const currentInnings =
    match.currentInningsNumber === 1 ? match.innings1 : match.innings2 || match.innings1;
  const battingTeam =
    currentInnings.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
  const bowlingTeam =
    currentInnings.bowlingTeamId === match.teamA.id ? match.teamA : match.teamB;

  const striker = currentInnings.batsmen.find((b) => b.isStriker);
  const nonStriker = currentInnings.batsmen.find((b) => !b.isStriker && !b.isOut);
  const activeBowler = currentInnings.bowlers.find(
    (b) => b.playerId === currentInnings.activeBowlerId
  );

  // Available batsmen in batting lineup who haven't batted yet
  const battedPlayerIds = new Set(currentInnings.batsmen.map((b) => b.playerId));
  const availableBatsmen = battingTeam.players.filter((p) => !battedPlayerIds.has(p.id));

  // Strike Rotation Helper
  const handleRotateStrike = () => {
    setMatch((prev) => {
      const innKey = prev.currentInningsNumber === 1 ? 'innings1' : 'innings2';
      const inn = { ...prev[innKey]! };
      const updatedBatsmen = inn.batsmen.map((b) => {
        if (b.isOut) return b;
        return { ...b, isStriker: !b.isStriker };
      });
      inn.batsmen = updatedBatsmen;
      const newStriker = updatedBatsmen.find((b) => b.isStriker);
      const newNonStriker = updatedBatsmen.find((b) => !b.isStriker && !b.isOut);
      if (newStriker) inn.activeStrikerId = newStriker.playerId;
      if (newNonStriker) inn.activeNonStrikerId = newNonStriker.playerId;

      return {
        ...prev,
        [innKey]: inn,
      };
    });
  };

  // Change or Substitute Batsman at Crease
  const handleSelectBatsman = ({
    target,
    playerId,
    playerName,
  }: {
    target: 'striker' | 'nonStriker';
    playerId: string;
    playerName: string;
  }) => {
    setMatch((prev) => {
      const innKey = prev.currentInningsNumber === 1 ? 'innings1' : 'innings2';
      const inn = { ...prev[innKey]! };

      let updatedBatsmen = [...inn.batsmen];
      const existingIdx = updatedBatsmen.findIndex((b) => b.playerId === playerId);

      if (target === 'striker') {
        inn.activeStrikerId = playerId;
        updatedBatsmen = updatedBatsmen.map((b) => ({
          ...b,
          isStriker: b.playerId === playerId,
        }));
        if (existingIdx !== -1) {
          updatedBatsmen[existingIdx] = {
            ...updatedBatsmen[existingIdx],
            isStriker: true,
            isOut: false,
          };
        } else {
          updatedBatsmen.push({
            playerId,
            name: playerName,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            isStriker: true,
            isOut: false,
          });
        }
      } else {
        inn.activeNonStrikerId = playerId;
        if (existingIdx !== -1) {
          updatedBatsmen[existingIdx] = {
            ...updatedBatsmen[existingIdx],
            isStriker: false,
            isOut: false,
          };
        } else {
          updatedBatsmen.push({
            playerId,
            name: playerName,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            isStriker: false,
            isOut: false,
          });
        }
      }

      inn.batsmen = updatedBatsmen;
      return {
        ...prev,
        [innKey]: inn,
      };
    });
  };

  // Main Ball Delivery Engine (Clean, Factual Cricket Logic)
  const recordBallDelivery = ({
    runsOffBat = 0,
    isExtra = false,
    extraType = 'none' as ExtraType,
    extraRuns = 0,
    isLegalDelivery = true,
    isWicket = false,
    wicketType = 'none' as WicketType,
    dismissedPlayerId,
    dismissedPlayerName,
    fielderName,
    newBatsmanId,
  }: {
    runsOffBat?: number;
    isExtra?: boolean;
    extraType?: ExtraType;
    extraRuns?: number;
    isLegalDelivery?: boolean;
    isWicket?: boolean;
    wicketType?: WicketType;
    dismissedPlayerId?: string;
    dismissedPlayerName?: string;
    fielderName?: string;
    newBatsmanId?: string;
  }) => {
    setMatch((prev) => {
      const innKey = prev.currentInningsNumber === 1 ? 'innings1' : 'innings2';
      const inn = { ...prev[innKey]! };

      const currentOverNumber = Math.floor(inn.legalBallsBowled / 6);
      const ballInCurrentOver = inn.currentOverBalls.length + 1;
      const totalBallRuns = runsOffBat + extraRuns;

      // Factual delivery log description
      let logText = '';
      if (isWicket) {
        logText = `Wicket: ${dismissedPlayerName || striker?.name} (${wicketType}${
          fielderName ? ` by ${fielderName}` : ''
        })`;
      } else if (extraType === 'wide') {
        logText = `Wide ball (+${extraRuns} extra)`;
      } else if (extraType === 'noball') {
        logText = `No ball (+${extraRuns} extra, ${runsOffBat} runs off bat)`;
      } else if (extraType === 'bye') {
        logText = `Bye (+${extraRuns} runs)`;
      } else if (extraType === 'legbye') {
        logText = `Leg bye (+${extraRuns} runs)`;
      } else if (runsOffBat === 4) {
        logText = `FOUR runs`;
      } else if (runsOffBat === 6) {
        logText = `SIX runs`;
      } else if (runsOffBat === 0) {
        logText = `Dot ball`;
      } else {
        logText = `${runsOffBat} run${runsOffBat > 1 ? 's' : ''}`;
      }

      const ballEvent: BallEvent = {
        id: `ball-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        inningsNumber: prev.currentInningsNumber,
        overNumber: currentOverNumber,
        ballInOver: ballInCurrentOver,
        legalBallNumber: inn.legalBallsBowled + (isLegalDelivery ? 1 : 0),
        isLegalDelivery,
        bowlerId: inn.activeBowlerId,
        bowlerName: activeBowler?.name || 'Bowler',
        strikerId: inn.activeStrikerId,
        strikerName: striker?.name || 'Striker',
        nonStrikerId: inn.activeNonStrikerId,
        nonStrikerName: nonStriker?.name || 'Non-Striker',
        runsOffBat,
        isExtra,
        extraType,
        extraRuns,
        totalBallRuns,
        isWicket,
        wicketType,
        dismissedPlayerId,
        dismissedPlayerName,
        fielderName,
        commentary: logText,
        timestamp: Date.now(),
      };

      // 1. Update Innings Totals
      inn.totalRuns += totalBallRuns;
      if (isWicket) inn.totalWickets += 1;
      if (isLegalDelivery) inn.legalBallsBowled += 1;

      // Extras Breakdown
      if (extraType === 'wide') inn.extras.wides += extraRuns;
      if (extraType === 'noball') inn.extras.noballs += extraRuns;
      if (extraType === 'bye') inn.extras.byes += extraRuns;
      if (extraType === 'legbye') inn.extras.legbyes += extraRuns;
      inn.extras.total += extraRuns;

      // 2. Update Active Striker Batsman
      const updatedBatsmen = [...inn.batsmen];
      const strikerIdx = updatedBatsmen.findIndex((b) => b.playerId === inn.activeStrikerId);
      if (strikerIdx !== -1) {
        const b = { ...updatedBatsmen[strikerIdx] };
        b.runs += runsOffBat;
        if (extraType !== 'wide') b.balls += 1;
        if (runsOffBat === 4) b.fours += 1;
        if (runsOffBat === 6) b.sixes += 1;
        b.strikeRate = b.balls > 0 ? (b.runs / b.balls) * 100 : 0;

        if (isWicket && dismissedPlayerId === b.playerId) {
          b.isOut = true;
          b.isStriker = false;
          b.dismissalText = `${wicketType}${fielderName ? ` c ${fielderName}` : ''} b ${activeBowler?.name || ''}`;
        }
        updatedBatsmen[strikerIdx] = b;
      }

      // If non-striker was run out
      if (isWicket && dismissedPlayerId === inn.activeNonStrikerId) {
        const nsIdx = updatedBatsmen.findIndex((b) => b.playerId === inn.activeNonStrikerId);
        if (nsIdx !== -1) {
          updatedBatsmen[nsIdx] = {
            ...updatedBatsmen[nsIdx],
            isOut: true,
            dismissalText: `run out (${fielderName || 'throw'})`,
          };
        }
      }

      // If wicket fell and new batsman is selected
      if (isWicket && newBatsmanId) {
        const incomingPlayer = battingTeam.players.find((p) => p.id === newBatsmanId);
        if (incomingPlayer) {
          const newLiveBatsman: LiveBatsman = {
            playerId: incomingPlayer.id,
            name: incomingPlayer.name,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            isStriker: dismissedPlayerId === inn.activeStrikerId,
            isOut: false,
          };
          updatedBatsmen.push(newLiveBatsman);

          if (dismissedPlayerId === inn.activeStrikerId) {
            inn.activeStrikerId = incomingPlayer.id;
          } else {
            inn.activeNonStrikerId = incomingPlayer.id;
          }
        }

        // Record Fall of Wickets
        inn.fallOfWickets.push({
          wicketNumber: inn.totalWickets,
          score: inn.totalRuns,
          overDisplay: formatOvers(inn.legalBallsBowled),
          playerOutName: dismissedPlayerName || striker?.name || 'Batsman',
        });
      }

      inn.batsmen = updatedBatsmen;

      // 3. Update Active Bowler
      const updatedBowlers = [...inn.bowlers];
      let bowlerIdx = updatedBowlers.findIndex((b) => b.playerId === inn.activeBowlerId);
      if (bowlerIdx === -1 && activeBowler) {
        updatedBowlers.push({ ...activeBowler });
        bowlerIdx = updatedBowlers.length - 1;
      }

      if (bowlerIdx !== -1) {
        const b = { ...updatedBowlers[bowlerIdx] };
        if (isLegalDelivery) b.legalBalls += 1;
        const bowlerRuns = runsOffBat + (['wide', 'noball'].includes(extraType) ? extraRuns : 0);
        b.runsConceded += bowlerRuns;
        if (isWicket && wicketType !== 'run_out') b.wickets += 1;
        if (extraType === 'wide') b.wides += 1;
        if (extraType === 'noball') b.noballs += 1;
        b.economy = b.legalBalls > 0 ? (b.runsConceded / b.legalBalls) * 6 : 0;
        updatedBowlers[bowlerIdx] = b;
      }
      inn.bowlers = updatedBowlers;

      // 4. Over timeline & Ball history
      inn.balls = [ballEvent, ...inn.balls];
      inn.currentOverBalls = [...inn.currentOverBalls, ballEvent];

      // 5. Strike Rotation logic on Odd Runs
      const runsToRotate = runsOffBat + (['bye', 'legbye'].includes(extraType) ? extraRuns : 0);
      if (runsToRotate % 2 !== 0 && !isWicket) {
        inn.batsmen = inn.batsmen.map((b) => {
          if (b.isOut) return b;
          return { ...b, isStriker: !b.isStriker };
        });
        const currentS = inn.batsmen.find((b) => b.isStriker);
        const currentNS = inn.batsmen.find((b) => !b.isStriker && !b.isOut);
        if (currentS) inn.activeStrikerId = currentS.playerId;
        if (currentNS) inn.activeNonStrikerId = currentNS.playerId;
      }

      // 6. Check Over Completion (6 legal balls)
      if (isLegalDelivery && inn.legalBallsBowled % 6 === 0 && inn.legalBallsBowled > 0) {
        // Swap strike at end of over
        inn.batsmen = inn.batsmen.map((b) => {
          if (b.isOut) return b;
          return { ...b, isStriker: !b.isStriker };
        });
        const endS = inn.batsmen.find((b) => b.isStriker);
        const endNS = inn.batsmen.find((b) => !b.isStriker && !b.isOut);
        if (endS) inn.activeStrikerId = endS.playerId;
        if (endNS) inn.activeNonStrikerId = endNS.playerId;

        // Reset current over ball indicators
        inn.currentOverBalls = [];

        // Prompt bowler selection
        setIsOverEndPrompt(true);
        setIsChangeBowlerOpen(true);
      }

      // 7. Check 2nd Innings Target Completion & Match End
      if (prev.currentInningsNumber === 2) {
        const targetToWin = prev.target || (prev.innings1 ? prev.innings1.totalRuns + 1 : 0);
        const maxLegalBalls = prev.oversPerSide * 6;

        // A) Chasing team crosses target -> Batting team WINS!
        if (targetToWin > 0 && inn.totalRuns >= targetToWin) {
          inn.isCompleted = true;
          const wicketsRemaining = Math.max(0, 10 - inn.totalWickets);
          const winSummary = `${battingTeam.name} won by ${wicketsRemaining} wicket${wicketsRemaining === 1 ? '' : 's'}!`;
          return {
            ...prev,
            status: 'completed',
            winnerTeamId: battingTeam.id,
            resultSummary: winSummary,
            [innKey]: inn,
          };
        }

        // B) All overs bowled or all 10 wickets out -> Defending team WINS or TIE!
        if (inn.legalBallsBowled >= maxLegalBalls || inn.totalWickets >= 10) {
          inn.isCompleted = true;
          if (targetToWin > 0 && inn.totalRuns < targetToWin - 1) {
            const runsDefended = targetToWin - 1 - inn.totalRuns;
            const winSummary = `${bowlingTeam.name} won by ${runsDefended} run${runsDefended === 1 ? '' : 's'}!`;
            return {
              ...prev,
              status: 'completed',
              winnerTeamId: bowlingTeam.id,
              resultSummary: winSummary,
              [innKey]: inn,
            };
          } else if (targetToWin > 0 && inn.totalRuns === targetToWin - 1) {
            return {
              ...prev,
              status: 'completed',
              resultSummary: 'Match Tied!',
              [innKey]: inn,
            };
          }
        }
      } else {
        // 1st Innings: Check if all overs bowled or 10 wickets down
        const maxLegalBalls = prev.oversPerSide * 6;
        if (inn.legalBallsBowled >= maxLegalBalls || inn.totalWickets >= 10) {
          inn.isCompleted = true;
        }
      }

      return {
        ...prev,
        [innKey]: inn,
      };
    });
  };

  // Instant 1-Click Undo Handler
  const handleUndoLastBall = () => {
    if (currentInnings.balls.length === 0) return;

    setMatch((prev) => {
      const innKey = prev.currentInningsNumber === 1 ? 'innings1' : 'innings2';
      const inn = { ...prev[innKey]! };

      const [lastBall, ...remainingBalls] = inn.balls;
      if (!lastBall) return prev;

      inn.totalRuns = Math.max(0, inn.totalRuns - lastBall.totalBallRuns);
      if (lastBall.isWicket) inn.totalWickets = Math.max(0, inn.totalWickets - 1);
      if (lastBall.isLegalDelivery) inn.legalBallsBowled = Math.max(0, inn.legalBallsBowled - 1);

      // Remove from current over bubbles
      inn.currentOverBalls = inn.currentOverBalls.slice(0, -1);
      inn.balls = remainingBalls;

      // Revert striker
      const strikerIdx = inn.batsmen.findIndex((b) => b.playerId === lastBall.strikerId);
      if (strikerIdx !== -1) {
        const b = { ...inn.batsmen[strikerIdx] };
        b.runs = Math.max(0, b.runs - lastBall.runsOffBat);
        if (lastBall.extraType !== 'wide') b.balls = Math.max(0, b.balls - 1);
        if (lastBall.runsOffBat === 4) b.fours = Math.max(0, b.fours - 1);
        if (lastBall.runsOffBat === 6) b.sixes = Math.max(0, b.sixes - 1);
        b.strikeRate = b.balls > 0 ? (b.runs / b.balls) * 100 : 0;
        if (lastBall.isWicket && lastBall.dismissedPlayerId === b.playerId) {
          b.isOut = false;
          b.dismissalText = undefined;
        }
        inn.batsmen[strikerIdx] = b;
      }

      // Revert bowler
      const bowlerIdx = inn.bowlers.findIndex((b) => b.playerId === lastBall.bowlerId);
      if (bowlerIdx !== -1) {
        const b = { ...inn.bowlers[bowlerIdx] };
        if (lastBall.isLegalDelivery) b.legalBalls = Math.max(0, b.legalBalls - 1);
        const bowlerRuns =
          lastBall.runsOffBat +
          (['wide', 'noball'].includes(lastBall.extraType) ? lastBall.extraRuns : 0);
        b.runsConceded = Math.max(0, b.runsConceded - bowlerRuns);
        if (lastBall.isWicket && lastBall.wicketType !== 'run_out') {
          b.wickets = Math.max(0, b.wickets - 1);
        }
        b.economy = b.legalBalls > 0 ? (b.runsConceded / b.legalBalls) * 6 : 0;
        inn.bowlers[bowlerIdx] = b;
      }

      return {
        ...prev,
        [innKey]: inn,
      };
    });
  };

  // Switch or Conclude Innings
  const handleSwitchInnings = () => {
    if (match.currentInningsNumber === 1) {
      if (
        !confirm(
          `Conclude 1st Innings? ${match.teamA.name} scored ${match.innings1.totalRuns}/${match.innings1.totalWickets}. Target for ${match.teamB.name} will be ${match.innings1.totalRuns + 1}.`
        )
      ) {
        return;
      }

      const teamB = match.teamB;
      const teamA = match.teamA;

      const newInnings2: InningsState = {
        inningsNumber: 2,
        battingTeamId: teamB.id,
        bowlingTeamId: teamA.id,
        totalRuns: 0,
        totalWickets: 0,
        legalBallsBowled: 0,
        extras: { wides: 0, noballs: 0, byes: 0, legbyes: 0, total: 0 },
        activeStrikerId: teamB.players[0].id,
        activeNonStrikerId: teamB.players[1].id,
        activeBowlerId: teamA.players[8].id,
        batsmen: [
          {
            playerId: teamB.players[0].id,
            name: teamB.players[0].name,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            isStriker: true,
            isOut: false,
          },
          {
            playerId: teamB.players[1].id,
            name: teamB.players[1].name,
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
            playerId: teamA.players[8].id,
            name: teamA.players[8].name,
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
      };

      setMatch((prev) => ({
        ...prev,
        currentInningsNumber: 2,
        target: prev.innings1.totalRuns + 1,
        innings2: newInnings2,
      }));
    } else {
      setMatch((prev) => ({
        ...prev,
        currentInningsNumber: 1,
      }));
    }
  };

  // Manual Match Declaration / Conclusion
  const handleManualEndMatch = () => {
    const isSecondInnings = match.currentInningsNumber === 2;
    const target = match.target || (match.innings1 ? match.innings1.totalRuns + 1 : 0);
    let summary = '';

    if (isSecondInnings && target > 0) {
      if (currentInnings.totalRuns >= target) {
        const wicketsRem = Math.max(0, 10 - currentInnings.totalWickets);
        summary = `${battingTeam.name} won by ${wicketsRem} wicket${wicketsRem === 1 ? '' : 's'}!`;
      } else if (currentInnings.totalRuns === target - 1) {
        summary = 'Match Tied!';
      } else {
        const runsRem = target - 1 - currentInnings.totalRuns;
        summary = `${bowlingTeam.name} won by ${runsRem} run${runsRem === 1 ? '' : 's'}!`;
      }
    } else {
      summary = `${battingTeam.name} concluded innings at ${currentInnings.totalRuns}/${currentInnings.totalWickets}.`;
    }

    if (window.confirm(`Declare / End Match now?\n\nResult: ${summary}`)) {
      setMatch((prev) => ({
        ...prev,
        status: 'completed',
        resultSummary: summary,
        innings1: prev.innings1 ? { ...prev.innings1, isCompleted: true } : prev.innings1,
        innings2: prev.innings2 ? { ...prev.innings2, isCompleted: true } : prev.innings2,
      }));
    }
  };

  // Cancel / Abandon Match
  const handleCancelMatch = () => {
    if (window.confirm('Cancel / Abandon this match?\nThis will mark the match as Abandoned / Cancelled.')) {
      setMatch((prev) => ({
        ...prev,
        status: 'completed',
        resultSummary: 'Match Abandoned / Cancelled',
      }));
    }
  };

  const handleResetSingleMatch = (matchId: string) => {
    if (window.confirm('Reset this match to fresh 0-0 state?')) {
      const fresh = resetMatchInStorage();
      setMatch(fresh);
      setMatchesList((prev) => prev.map((m) => (m.id === matchId ? fresh : m)));
    }
  };

  const handleDeleteMatch = (matchId: string) => {
    deleteMatchFromDb(matchId);
    setMatchesList((prev) => {
      const remaining = prev.filter((m) => m.id !== matchId);
      saveMatchesList(remaining);
      return remaining;
    });

    if (match.id === matchId) {
      const remaining = matchesList.filter((m) => m.id !== matchId);
      if (remaining.length > 0) {
        setMatch(remaining[0]);
        saveMatchToStorage(remaining[0]);
      } else {
        const empty = createInitialMatch();
        empty.id = `match-template-${Date.now()}`;
        setMatch(empty);
        saveMatchToStorage(empty);
      }
      setViewMode('hub');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-16 selection:bg-amber-400 selection:text-slate-950">
      {/* Professional Top Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center space-x-1.5 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Admin Portal</span>
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm tracking-tight text-slate-900">
                RPL Match Scorer
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  viewMode === 'scoring' && match.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {viewMode === 'scoring'
                  ? match.status === 'completed'
                    ? 'Completed'
                    : 'Live'
                  : viewMode === 'wizard'
                  ? 'Wizard'
                  : 'Hub'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setViewMode('hub')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                viewMode === 'hub'
                  ? 'bg-slate-900 text-amber-300 border-slate-900'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Matches Hub</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('wizard')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-black flex items-center space-x-1.5 transition-colors cursor-pointer ${
                viewMode === 'wizard'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Schedule Match</span>
            </button>

            {viewMode === 'scoring' && (
              <button
                type="button"
                onClick={() => setIsNewMatchModalOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center space-x-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-5xl mx-auto px-3 sm:px-4 pt-4 space-y-3">
        {/* VIEW 1: MATCH SCHEDULING WIZARD */}
        {viewMode === 'wizard' && (
          <MatchSchedulingWizard
            onCancel={() => setViewMode(matchesList.length > 0 ? 'hub' : 'scoring')}
            onMatchCreated={(newM) => {
              syncMatchToDb(newM);
              setMatchesList((prev) => {
                const updated = [newM, ...prev.filter((m) => m.id !== newM.id)];
                saveMatchesList(updated);
                return updated;
              });
              setMatch(newM);
              saveMatchToStorage(newM);
              // If match is scheduled as upcoming, exit cleanly back to Match Hub
              if (newM.status === 'upcoming') {
                setViewMode('hub');
              } else {
                setViewMode('scoring');
              }
            }}
            nextMatchNumber={matchesList.length + 1}
          />
        )}

        {/* VIEW 2: MATCH HUB */}
        {viewMode === 'hub' && (
          <MatchHub
            matches={matchesList}
            activeMatchId={match.id}
            onSelectMatch={(selected) => {
              const matchToLoad =
                selected.status === 'upcoming'
                  ? { ...selected, status: 'live' as const }
                  : selected;
              setMatch(matchToLoad);
              syncMatchToDb(matchToLoad);
              setViewMode('scoring');
            }}
            onOpenScheduleWizard={() => setViewMode('wizard')}
            onResetMatch={handleResetSingleMatch}
            onDeleteMatch={handleDeleteMatch}
          />
        )}

        {/* VIEW 3: LIVE BALL-BY-BALL SCORER */}
        {viewMode === 'scoring' && (
          <>
            {/* Match Header with Live Scoreboard */}
            <ScorerHeader
              match={match}
              onBackToHome={() => setViewMode('hub')}
              onOpenNewMatchModal={() => setIsNewMatchModalOpen(true)}
              onSwitchInnings={handleSwitchInnings}
              onManualEndMatch={handleManualEndMatch}
              onCancelMatch={handleCancelMatch}
            />

            {/* Match Completed Victory / Result Announcement Banner */}
            {match.status === 'completed' && (
              <div className="bg-gradient-to-r from-amber-50 via-emerald-50 to-amber-50 border-2 border-emerald-500/50 rounded-2xl p-4 sm:p-5 shadow-xs text-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs shrink-0">
                    <Trophy className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-600 text-white">
                        Match Completed
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        Official Result
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-950 mt-0.5">
                      {match.resultSummary || 'Match Finished'}
                    </h2>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {match.teamA.shortName}: {match.innings1.totalRuns}/{match.innings1.totalWickets} ({formatOvers(match.innings1.legalBallsBowled)} ov)
                      {match.innings2 && (
                        <> • {match.teamB.shortName}: {match.innings2.totalRuns}/{match.innings2.totalWickets} ({formatOvers(match.innings2.legalBallsBowled)} ov)</>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('scorecard')}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>View Scorecard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Reopen match scoring in live mode?')) {
                        setMatch((prev) => ({ ...prev, status: 'live' }));
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
                    title="Resume live scoring if concluded prematurely"
                  >
                    <span>Reopen Match</span>
                  </button>
                </div>
              </div>
            )}

            {/* View Switcher: Scorer Keypad vs Scorecard vs Ball Log */}
        <div className="flex rounded-xl bg-white border border-slate-200 p-1 text-xs font-bold text-slate-600 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('scorer')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'scorer'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live Scorer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scorecard')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'scorecard'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Full Scorecard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('log')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'log'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Ball Log ({currentInnings.balls.length})</span>
          </button>
        </div>

        {/* Tab 1: Live Scorer Console */}
        {activeTab === 'scorer' && (
          <div className="space-y-3">
            {/* Active Batsmen and Bowler Figures */}
            <CreaseCard
              striker={striker}
              nonStriker={nonStriker}
              activeBowler={activeBowler}
              onRotateStrike={handleRotateStrike}
              onOpenChangeBowlerModal={() => {
                setIsOverEndPrompt(false);
                setIsChangeBowlerOpen(true);
              }}
              onOpenChangeBatsmanModal={(target) => {
                setChangeBatsmanTarget(target);
                setIsChangeBatsmanOpen(true);
              }}
            />

            {/* Over Delivery Strip */}
            <OverTimeline
              currentOverBalls={currentInnings.currentOverBalls}
              legalBallsBowled={currentInnings.legalBallsBowled}
            />

            {/* Rapid Scoring Keypad or Match Concluded Card */}
            {match.status === 'completed' ? (
              <div className="bg-white rounded-2xl border-2 border-emerald-500/40 p-6 text-center shadow-xs space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
                  <Trophy className="w-7 h-7 stroke-[2.5]" />
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] uppercase tracking-wider">
                    Match Concluded
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                    {match.resultSummary || 'Match Finished'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                    Target was {match.target || (match.innings1 ? match.innings1.totalRuns + 1 : 0)} runs • {battingTeam.name} scored {currentInnings.totalRuns}/{currentInnings.totalWickets} in {formatOvers(currentInnings.legalBallsBowled)} overs
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('scorecard')}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-amber-300 font-extrabold text-xs flex items-center space-x-2 shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>View Full Scorecard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('hub')}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center space-x-2 shadow-xs hover:bg-amber-600 transition-colors cursor-pointer"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span>Matches Hub</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Reopen match to continue live scoring?')) {
                        setMatch((prev) => ({ ...prev, status: 'live' }));
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
                  >
                    <span>Reopen Match</span>
                  </button>
                </div>
              </div>
            ) : (
              <ScorerKeypad
                onScoreRun={(runs) =>
                  recordBallDelivery({ runsOffBat: runs, isLegalDelivery: true })
                }
                onQuickExtra={(type, extraRuns = 1) =>
                  recordBallDelivery({
                    isExtra: true,
                    extraType: type,
                    extraRuns,
                    isLegalDelivery: type === 'bye' || type === 'legbye',
                  })
                }
                onOpenWicketModal={() => setIsWicketModalOpen(true)}
                onUndoLastBall={handleUndoLastBall}
                onRotateStrike={handleRotateStrike}
                canUndo={currentInnings.balls.length > 0}
              />
            )}
          </div>
        )}

        {/* Tab 2: Full Scorecard */}
        {activeTab === 'scorecard' && <MatchScorecardView match={match} />}

        {/* Tab 3: Delivery Audit Log */}
        {activeTab === 'log' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
              Delivery Audit Trail
            </h3>
            {currentInnings.balls.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No deliveries recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {currentInnings.balls.map((b) => (
                  <div key={b.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono font-bold text-slate-400 w-10">
                        {b.overNumber}.{b.ballInOver}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {b.bowlerName} to {b.strikerName}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-slate-600 font-medium">{b.commentary}</span>
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-slate-100 text-slate-800">
                        +{b.totalBallRuns}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </>
    )}
  </main>

      {/* Wicket Dismissal Modal */}
      <WicketModal
        isOpen={isWicketModalOpen}
        onClose={() => setIsWicketModalOpen(false)}
        striker={{ id: striker?.playerId || '', name: striker?.name || 'Striker' }}
        nonStriker={{ id: nonStriker?.playerId || '', name: nonStriker?.name || 'Non-Striker' }}
        availableBatsmen={availableBatsmen}
        fieldingPlayers={bowlingTeam.players}
        onConfirmWicket={({ wicketType, dismissedPlayerId, fielderName, newBatsmanId, runsScored }) => {
          setIsWicketModalOpen(false);
          const dismissedName =
            dismissedPlayerId === striker?.playerId ? striker?.name : nonStriker?.name;
          recordBallDelivery({
            runsOffBat: runsScored,
            isWicket: true,
            wicketType,
            dismissedPlayerId,
            dismissedPlayerName: dismissedName,
            fielderName,
            newBatsmanId,
            isLegalDelivery: true,
          });
        }}
      />

      {/* Bowler Selection Modal */}
      <ChangeBowlerModal
        isOpen={isChangeBowlerOpen}
        onClose={() => {
          setIsChangeBowlerOpen(false);
          setIsOverEndPrompt(false);
        }}
        bowlingTeamPlayers={bowlingTeam.players}
        currentBowlerId={currentInnings.activeBowlerId}
        previousBowlerId={activeBowler?.playerId}
        bowlerRecords={currentInnings.bowlers}
        isOverEndPrompt={isOverEndPrompt}
        onSelectBowler={(bowlerId) => {
          setIsChangeBowlerOpen(false);
          setIsOverEndPrompt(false);

          setMatch((prev) => {
            const innKey = prev.currentInningsNumber === 1 ? 'innings1' : 'innings2';
            const inn = { ...prev[innKey]! };
            inn.activeBowlerId = bowlerId;

            if (!inn.bowlers.some((b) => b.playerId === bowlerId)) {
              const bowlerPlayer = bowlingTeam.players.find((p) => p.id === bowlerId);
              if (bowlerPlayer) {
                inn.bowlers.push({
                  playerId: bowlerPlayer.id,
                  name: bowlerPlayer.name,
                  legalBalls: 0,
                  maidens: 0,
                  runsConceded: 0,
                  wickets: 0,
                  economy: 0,
                  wides: 0,
                  noballs: 0,
                });
              }
            }

            return {
              ...prev,
              [innKey]: inn,
            };
          });
        }}
      />

      {/* Batsman Selection / Substitution Modal */}
      <ChangeBatsmanModal
        isOpen={isChangeBatsmanOpen}
        onClose={() => setIsChangeBatsmanOpen(false)}
        battingTeamPlayers={battingTeam.players}
        currentStriker={striker}
        currentNonStriker={nonStriker}
        initialTarget={changeBatsmanTarget}
        onSelectBatsman={handleSelectBatsman}
      />

      {/* Match Config Modal */}
      <NewMatchModal
        isOpen={isNewMatchModalOpen}
        onClose={() => setIsNewMatchModalOpen(false)}
        onStartNewMatch={(newM) => {
          setIsNewMatchModalOpen(false);
          setMatch(newM);
          saveMatchToStorage(newM);
        }}
        onResetMatch={() => {
          setIsNewMatchModalOpen(false);
          const fresh = resetMatchInStorage();
          setMatch(fresh);
        }}
        onDeleteMatch={() => {
          setIsNewMatchModalOpen(false);
          handleDeleteMatch(match.id);
          setViewMode('hub');
        }}
      />
    </div>
  );
};
