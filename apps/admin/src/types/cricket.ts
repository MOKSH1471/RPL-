// RPL Cricket Types & Interfaces

export type CricketFormat = 'T10' | 'T20' | 'BOX' | 'CUSTOM';
export type MatchStatus = 'upcoming' | 'live' | 'innings_break' | 'completed' | 'abandoned';
export type TossDecision = 'bat' | 'bowl';
export type ExtraType = 'none' | 'wide' | 'noball' | 'bye' | 'legbye';
export type WicketType = 'none' | 'bowled' | 'caught' | 'run_out' | 'lbw' | 'stumped' | 'hit_wicket';

export interface CricketPlayer {
  id: string;
  name: string;
  role: 'Batter' | 'Bowler' | 'All-rounder' | 'Wicketkeeper';
  battingStyle?: string;
  bowlingStyle?: string;
  jerseyNumber?: number;
  avatarUrl?: string;
  registrationId?: string;
}

export interface CricketTeam {
  id: string;
  name: string;
  shortName: string;
  colorCode: string;
  logoUrl?: string;
  players: CricketPlayer[];
}

export interface LiveBatsman {
  playerId: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isStriker: boolean;
  isOut: boolean;
  dismissalText?: string;
  bowlerId?: string;
  fielderId?: string;
}

export interface LiveBowler {
  playerId: string;
  name: string;
  legalBalls: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
  economy: number;
  wides: number;
  noballs: number;
}

export interface BallEvent {
  id: string;
  inningsNumber: 1 | 2;
  overNumber: number; // 0-indexed: Over 0, 1, 2...
  ballInOver: number; // 1, 2, 3...
  legalBallNumber: number;
  isLegalDelivery: boolean;
  bowlerId: string;
  bowlerName: string;
  strikerId: string;
  strikerName: string;
  nonStrikerId: string;
  nonStrikerName: string;
  runsOffBat: number;
  isExtra: boolean;
  extraType: ExtraType;
  extraRuns: number;
  totalBallRuns: number;
  isWicket: boolean;
  wicketType: WicketType;
  dismissedPlayerId?: string;
  dismissedPlayerName?: string;
  fielderName?: string;
  commentary: string;
  timestamp: number;
}

export interface FallOfWicket {
  wicketNumber: number;
  score: number;
  overDisplay: string;
  playerOutName: string;
}

export interface InningsState {
  inningsNumber: 1 | 2;
  battingTeamId: string;
  bowlingTeamId: string;
  totalRuns: number;
  totalWickets: number;
  legalBallsBowled: number;
  extras: {
    wides: number;
    noballs: number;
    byes: number;
    legbyes: number;
    total: number;
  };
  activeStrikerId: string;
  activeNonStrikerId: string;
  activeBowlerId: string;
  batsmen: LiveBatsman[];
  bowlers: LiveBowler[];
  balls: BallEvent[];
  currentOverBalls: BallEvent[];
  fallOfWickets: FallOfWicket[];
  isCompleted: boolean;
}

export interface CricketMatch {
  id: string;
  tournamentName: string;
  matchNumber: number;
  stage: string;
  venue: string;
  oversPerSide: number;
  teamA: CricketTeam;
  teamB: CricketTeam;
  tossWinnerId: string;
  tossDecision: TossDecision;
  status: MatchStatus;
  currentInningsNumber: 1 | 2;
  innings1: InningsState;
  innings2?: InningsState;
  target?: number;
  winnerTeamId?: string;
  resultSummary?: string;
  playerOfTheMatchId?: string;
  streamOverlayToken: string;
}
