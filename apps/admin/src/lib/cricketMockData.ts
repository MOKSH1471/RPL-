import { CricketMatch, CricketTeam, InningsState } from '@/types/cricket';

export const DEFAULT_TEAMS: CricketTeam[] = [
  {
    id: 'team-raj-tigers',
    name: 'Raj Tigers',
    shortName: 'RT',
    colorCode: '#D97706',
    players: [
      { id: 'rt-1', name: 'Rohit Sharma (C)', role: 'Batter', battingStyle: 'Right Hand Bat', jerseyNumber: 45 },
      { id: 'rt-2', name: 'Virat Kohli', role: 'Batter', battingStyle: 'Right Hand Bat', jerseyNumber: 18 },
      { id: 'rt-3', name: 'Suryakumar Yadav', role: 'Batter', battingStyle: 'Right Hand Bat', jerseyNumber: 63 },
      { id: 'rt-4', name: 'Rishabh Pant (WK)', role: 'Wicketkeeper', battingStyle: 'Left Hand Bat', jerseyNumber: 17 },
      { id: 'rt-5', name: 'Hardik Pandya', role: 'All-rounder', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Fast Medium', jerseyNumber: 33 },
      { id: 'rt-6', name: 'Ravindra Jadeja', role: 'All-rounder', battingStyle: 'Left Hand Bat', bowlingStyle: 'Left Arm Orthodox', jerseyNumber: 8 },
      { id: 'rt-7', name: 'Axar Patel', role: 'All-rounder', battingStyle: 'Left Hand Bat', bowlingStyle: 'Left Arm Orthodox', jerseyNumber: 20 },
      { id: 'rt-8', name: 'Jasprit Bumrah', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Fast', jerseyNumber: 93 },
      { id: 'rt-9', name: 'Mohammed Shami', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Fast', jerseyNumber: 11 },
      { id: 'rt-10', name: 'Kuldeep Yadav', role: 'Bowler', battingStyle: 'Left Hand Bat', bowlingStyle: 'Left Arm Wrist Spin', jerseyNumber: 23 },
      { id: 'rt-11', name: 'Arshdeep Singh', role: 'Bowler', battingStyle: 'Left Hand Bat', bowlingStyle: 'Left Arm Fast Medium', jerseyNumber: 2 },
      { id: 'rt-12', name: 'Sanju Samson', role: 'Batter', battingStyle: 'Right Hand Bat', jerseyNumber: 9 },
    ],
  },
  {
    id: 'team-patan-panthers',
    name: 'Patan Panthers',
    shortName: 'PP',
    colorCode: '#0891B2',
    players: [
      { id: 'pp-1', name: 'Shubman Gill (C)', role: 'Batter', battingStyle: 'Right Hand Bat', jerseyNumber: 77 },
      { id: 'pp-2', name: 'KL Rahul (WK)', role: 'Wicketkeeper', battingStyle: 'Right Hand Bat', jerseyNumber: 1 },
      { id: 'pp-3', name: 'Shreyas Iyer', role: 'Batter', battingStyle: 'Right Hand Bat', jerseyNumber: 96 },
      { id: 'pp-4', name: 'Shivam Dube', role: 'All-rounder', battingStyle: 'Left Hand Bat', bowlingStyle: 'Right Arm Medium', jerseyNumber: 25 },
      { id: 'pp-5', name: 'Rinku Singh', role: 'Batter', battingStyle: 'Left Hand Bat', jerseyNumber: 35 },
      { id: 'pp-6', name: 'Washington Sundar', role: 'All-rounder', battingStyle: 'Left Hand Bat', bowlingStyle: 'Right Arm Off Spin', jerseyNumber: 5 },
      { id: 'pp-7', name: 'Nitish Kumar Reddy', role: 'All-rounder', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Medium Fast', jerseyNumber: 27 },
      { id: 'pp-8', name: 'Bhuvneshwar Kumar', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Medium Fast', jerseyNumber: 15 },
      { id: 'pp-9', name: 'Mohammed Siraj', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Fast', jerseyNumber: 73 },
      { id: 'pp-10', name: 'Yuzvendra Chahal', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Leg Spin', jerseyNumber: 3 },
      { id: 'pp-11', name: 'Avesh Khan', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Fast', jerseyNumber: 6 },
      { id: 'pp-12', name: 'Jitesh Sharma', role: 'Wicketkeeper', battingStyle: 'Right Hand Bat', jerseyNumber: 99 },
    ],
  },
  {
    id: 'team-aravalli-eagles',
    name: 'Aravalli Eagles',
    shortName: 'AE',
    colorCode: '#059669',
    players: [
      { id: 'ae-1', name: 'Ruturaj Gaikwad (C)', role: 'Batter', battingStyle: 'Right Hand Bat', jerseyNumber: 31 },
      { id: 'ae-2', name: 'Yashasvi Jaiswal', role: 'Batter', battingStyle: 'Left Hand Bat', jerseyNumber: 64 },
      { id: 'ae-3', name: 'Tilak Varma', role: 'Batter', battingStyle: 'Left Hand Bat', jerseyNumber: 72 },
      { id: 'ae-4', name: 'Ishan Kishan (WK)', role: 'Wicketkeeper', battingStyle: 'Left Hand Bat', jerseyNumber: 32 },
      { id: 'ae-5', name: 'Deepak Hooda', role: 'All-rounder', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Off Spin', jerseyNumber: 57 },
      { id: 'ae-6', name: 'Shardul Thakur', role: 'All-rounder', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Medium Fast', jerseyNumber: 54 },
      { id: 'ae-7', name: 'Harshit Rana', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Fast', jerseyNumber: 22 },
      { id: 'ae-8', name: 'Ravi Bishnoi', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Leg Spin', jerseyNumber: 56 },
      { id: 'ae-9', name: 'Prasidh Krishna', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Fast', jerseyNumber: 24 },
      { id: 'ae-10', name: 'Mukesh Kumar', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Medium Fast', jerseyNumber: 49 },
      { id: 'ae-11', name: 'Mayank Yadav', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Express Fast', jerseyNumber: 14 },
    ],
  },
  {
    id: 'team-royal-strikers',
    name: 'Mewar Strikers',
    shortName: 'MS',
    colorCode: '#7C3AED',
    players: [
      { id: 'ms-1', name: 'Devdutt Padikkal', role: 'Batter', battingStyle: 'Left Hand Bat', jerseyNumber: 37 },
      { id: 'ms-2', name: 'Abhishek Sharma', role: 'All-rounder', battingStyle: 'Left Hand Bat', bowlingStyle: 'Slow Left Arm', jerseyNumber: 4 },
      { id: 'ms-3', name: 'Sai Sudharsan', role: 'Batter', battingStyle: 'Left Hand Bat', jerseyNumber: 21 },
      { id: 'ms-4', name: 'Dhruv Jurel (WK)', role: 'Wicketkeeper', battingStyle: 'Right Hand Bat', jerseyNumber: 16 },
      { id: 'ms-5', name: 'Rahul Tewatia', role: 'All-rounder', battingStyle: 'Left Hand Bat', bowlingStyle: 'Right Arm Leg Spin', jerseyNumber: 92 },
      { id: 'ms-6', name: 'Shahbaz Ahmed', role: 'All-rounder', battingStyle: 'Left Hand Bat', bowlingStyle: 'Slow Left Arm', jerseyNumber: 29 },
      { id: 'ms-7', name: 'Deepak Chahar', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Medium', jerseyNumber: 90 },
      { id: 'ms-8', name: 'Umran Malik', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Express Fast', jerseyNumber: 28 },
      { id: 'ms-9', name: 'Varun Chakaravarthy', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Mystery Spin', jerseyNumber: 26 },
      { id: 'ms-10', name: 'Khaleel Ahmed', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Left Arm Fast Medium', jerseyNumber: 71 },
      { id: 'ms-11', name: 'T Natarajan', role: 'Bowler', battingStyle: 'Left Hand Bat', bowlingStyle: 'Left Arm Medium Fast', jerseyNumber: 44 },
    ],
  },
];

export function formatOvers(legalBalls: number): string {
  const overs = Math.floor(legalBalls / 6);
  const balls = legalBalls % 6;
  return `${overs}.${balls}`;
}

export function calculateRunRate(runs: number, legalBalls: number): string {
  if (legalBalls === 0) return '0.00';
  const overs = legalBalls / 6;
  return (runs / overs).toFixed(2);
}

export function createInitialMatch(): CricketMatch {
  const teamA = DEFAULT_TEAMS[0];
  const teamB = DEFAULT_TEAMS[1];

  const innings1: InningsState = {
    inningsNumber: 1,
    battingTeamId: teamA.id,
    bowlingTeamId: teamB.id,
    totalRuns: 0,
    totalWickets: 0,
    legalBallsBowled: 0,
    extras: { wides: 0, noballs: 0, byes: 0, legbyes: 0, total: 0 },
    activeStrikerId: teamA.players[0].id,
    activeNonStrikerId: teamA.players[1].id,
    activeBowlerId: teamB.players[8].id, // Bhuvneshwar Kumar opening
    batsmen: [
      {
        playerId: teamA.players[0].id,
        name: teamA.players[0].name,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0,
        isStriker: true,
        isOut: false,
      },
      {
        playerId: teamA.players[1].id,
        name: teamA.players[1].name,
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
        playerId: teamB.players[8].id,
        name: teamB.players[8].name,
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

  return {
    id: 'match-rpl-s9-01',
    tournamentName: 'RPL Season 9 Premier Cup',
    matchNumber: 1,
    stage: 'League Match 1',
    venue: 'RPL Main Stadium (Under Floodlights)',
    oversPerSide: 10,
    teamA,
    teamB,
    tossWinnerId: teamA.id,
    tossDecision: 'bat',
    status: 'live',
    currentInningsNumber: 1,
    innings1,
    streamOverlayToken: 'rpl_obs_live_89f41b2c',
  };
}

const STORAGE_KEY = 'rpl_cricket_active_match';

export function loadSavedMatch(): CricketMatch {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id && parsed.innings1) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load saved match:', e);
  }
  return createInitialMatch();
}

export function saveMatchToStorage(match: CricketMatch) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(match));
  } catch (e) {
    console.error('Failed to save match:', e);
  }
}

export function createConfiguredMatch({
  tournamentName = 'RPL Season 9 Premier Cup',
  matchNumber = 1,
  stage = 'League Match 1',
  venue = 'RPL Main Stadium (Under Floodlights)',
  oversPerSide = 10,
  teamA,
  teamB,
  tossWinnerId,
  tossDecision = 'bat',
  strikerId,
  nonStrikerId,
  openingBowlerId,
}: {
  tournamentName?: string;
  matchNumber?: number;
  stage?: string;
  venue?: string;
  oversPerSide: number;
  teamA: CricketTeam;
  teamB: CricketTeam;
  tossWinnerId: string;
  tossDecision: 'bat' | 'bowl';
  strikerId?: string;
  nonStrikerId?: string;
  openingBowlerId?: string;
}): CricketMatch {
  // Determine who bats first based on toss winner & decision
  const isTeamABattingFirst =
    (tossWinnerId === teamA.id && tossDecision === 'bat') ||
    (tossWinnerId === teamB.id && tossDecision === 'bowl');

  const battingTeam = isTeamABattingFirst ? teamA : teamB;
  const bowlingTeam = isTeamABattingFirst ? teamB : teamA;

  const actualStrikerId = strikerId || battingTeam.players[0]?.id || 'p-1';
  const actualNonStrikerId = nonStrikerId || battingTeam.players[1]?.id || 'p-2';
  const actualBowlerId = openingBowlerId || bowlingTeam.players[7]?.id || bowlingTeam.players[0]?.id;

  const strikerPlayer = battingTeam.players.find((p) => p.id === actualStrikerId) || battingTeam.players[0];
  const nonStrikerPlayer = battingTeam.players.find((p) => p.id === actualNonStrikerId) || battingTeam.players[1];
  const bowlerPlayer = bowlingTeam.players.find((p) => p.id === actualBowlerId) || bowlingTeam.players[0];

  const innings1: InningsState = {
    inningsNumber: 1,
    battingTeamId: battingTeam.id,
    bowlingTeamId: bowlingTeam.id,
    totalRuns: 0,
    totalWickets: 0,
    legalBallsBowled: 0,
    extras: { wides: 0, noballs: 0, byes: 0, legbyes: 0, total: 0 },
    activeStrikerId: actualStrikerId,
    activeNonStrikerId: actualNonStrikerId,
    activeBowlerId: actualBowlerId,
    batsmen: [
      {
        playerId: strikerPlayer.id,
        name: strikerPlayer.name,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0,
        isStriker: true,
        isOut: false,
      },
      {
        playerId: nonStrikerPlayer.id,
        name: nonStrikerPlayer.name,
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
        playerId: bowlerPlayer.id,
        name: bowlerPlayer.name,
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

  return {
    id: `match-rpl-${Date.now()}`,
    tournamentName,
    matchNumber,
    stage,
    venue,
    oversPerSide,
    teamA,
    teamB,
    tossWinnerId,
    tossDecision,
    status: 'live',
    currentInningsNumber: 1,
    innings1,
    streamOverlayToken: `rpl_obs_${Math.random().toString(36).substring(2, 10)}`,
  };
}

const MATCHES_LIST_STORAGE_KEY = 'rpl_cricket_matches_list';

export function getInitialMatchList(): CricketMatch[] {
  const match1 = createInitialMatch();
  return [match1];
}

export function loadMatchesList(): CricketMatch[] {
  try {
    const raw = localStorage.getItem(MATCHES_LIST_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load matches list:', e);
  }
  const defaults = getInitialMatchList();
  saveMatchesList(defaults);
  return defaults;
}

export function saveMatchesList(matches: CricketMatch[]) {
  try {
    localStorage.setItem(MATCHES_LIST_STORAGE_KEY, JSON.stringify(matches));
  } catch (e) {
    console.error('Failed to save matches list:', e);
  }
}

export function resetMatchInStorage(): CricketMatch {
  const fresh = createInitialMatch();
  saveMatchToStorage(fresh);
  return fresh;
}
