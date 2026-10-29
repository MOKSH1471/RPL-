import { CricketMatch, CricketTeam, InningsState, LiveBatsman, LiveBowler } from '@/types';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const rawBase = isLocalhost
  ? 'http://localhost:5005/api'
  : (import.meta.env.VITE_API_URL || 'https://rpl-api-w3x1.onrender.com/api');
const cleanBase = String(rawBase).trim().replace(/\/+$/, '');
export const API_BASE_URL = cleanBase.endsWith('/api') ? cleanBase : `${cleanBase}/api`;

const MATCHES_LIST_STORAGE_KEY = 'rpl_cricket_matches_list';
const ACTIVE_MATCH_STORAGE_KEY = 'rpl_cricket_active_match';

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

export function calculateRequiredRunRate(runsNeeded: number, ballsRemaining: number): string {
  if (ballsRemaining <= 0) return '0.00';
  const overs = ballsRemaining / 6;
  return (runsNeeded / overs).toFixed(2);
}

/**
 * Fetch actual matches directly from MySQL Database and LocalStorage.
 * No dummy / mock data.
 */
export async function fetchScorecardMatches(): Promise<CricketMatch[]> {
  const matchesMap = new Map<string, CricketMatch>();
  let hasApiMatches = false;

  // 1. First attempt: fetch from MySQL API
  try {
    const res = await fetch(`${API_BASE_URL}/cricket/matches`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        for (const m of data) {
          if (m && m.id) matchesMap.set(m.id, m);
        }
        hasApiMatches = true;
      }
    }
  } catch (err) {
    // API not reachable, fallback to localStorage
  }

  // 2. Second source: LocalStorage matches list ONLY when API has no matches
  if (!hasApiMatches) {
    try {
      const cachedList = localStorage.getItem(MATCHES_LIST_STORAGE_KEY);
      if (cachedList) {
        const parsed = JSON.parse(cachedList);
        if (Array.isArray(parsed)) {
          for (const m of parsed) {
            if (m && m.id && !matchesMap.has(m.id)) {
              matchesMap.set(m.id, m);
            }
          }
        }
      }
    } catch (e) {
      // Ignore storage parse errors
    }
  }

  // 3. Third source: Single active match in LocalStorage ONLY when API has no matches (offline fallback)
  if (!hasApiMatches) {
    try {
      const cachedActive = localStorage.getItem(ACTIVE_MATCH_STORAGE_KEY);
      if (cachedActive) {
        const activeMatch = JSON.parse(cachedActive);
        if (activeMatch && activeMatch.id && !matchesMap.has(activeMatch.id)) {
          matchesMap.set(activeMatch.id, activeMatch);
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  return Array.from(matchesMap.values()).sort((a, b) => {
    // Live matches first, then upcoming, then completed
    const order = { live: 0, innings_break: 1, upcoming: 2, completed: 3, abandoned: 4 };
    const statusA = order[a.status] ?? 5;
    const statusB = order[b.status] ?? 5;
    if (statusA !== statusB) return statusA - statusB;
    return (a.matchNumber || 0) - (b.matchNumber || 0);
  });
}

// Points Table calculations dynamically derived from ACTUAL completed/live matches
export interface TeamStanding {
  teamId: string;
  teamName: string;
  shortName: string;
  colorCode: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  nrr: string;
  form: ('W' | 'L' | 'D')[];
}

export function calculateStandings(matches: CricketMatch[]): TeamStanding[] {
  const standingsMap: Record<string, TeamStanding> = {};

  // Register teams from matches
  for (const m of matches) {
    if (m.teamA && !standingsMap[m.teamA.id]) {
      standingsMap[m.teamA.id] = {
        teamId: m.teamA.id,
        teamName: m.teamA.name,
        shortName: m.teamA.shortName,
        colorCode: m.teamA.colorCode || '#D97706',
        played: 0,
        won: 0,
        lost: 0,
        tied: 0,
        noResult: 0,
        points: 0,
        nrr: '+0.00',
        form: [],
      };
    }
    if (m.teamB && !standingsMap[m.teamB.id]) {
      standingsMap[m.teamB.id] = {
        teamId: m.teamB.id,
        teamName: m.teamB.name,
        shortName: m.teamB.shortName,
        colorCode: m.teamB.colorCode || '#0891B2',
        played: 0,
        won: 0,
        lost: 0,
        tied: 0,
        noResult: 0,
        points: 0,
        nrr: '+0.00',
        form: [],
      };
    }
  }

  // Tally actual match results
  for (const m of matches) {
    if (m.status === 'completed' && m.winnerTeamId) {
      const winner = standingsMap[m.winnerTeamId];
      const loserId = m.winnerTeamId === m.teamA.id ? m.teamB.id : m.teamA.id;
      const loser = standingsMap[loserId];

      if (winner) {
        winner.played += 1;
        winner.won += 1;
        winner.points += 2;
        winner.form.push('W');
      }
      if (loser) {
        loser.played += 1;
        loser.lost += 1;
        loser.form.push('L');
      }
    } else if (m.status === 'completed' && !m.winnerTeamId) {
      // Tie
      const tA = standingsMap[m.teamA.id];
      const tB = standingsMap[m.teamB.id];
      if (tA) {
        tA.played += 1;
        tA.tied += 1;
        tA.points += 1;
        tA.form.push('D');
      }
      if (tB) {
        tB.played += 1;
        tB.tied += 1;
        tB.points += 1;
        tB.form.push('D');
      }
    }
  }

  return Object.values(standingsMap).sort((a, b) => b.points - a.points);
}

export interface DynamicLeaderStat {
  rank: number;
  playerName: string;
  teamShort: string;
  statValue: number;
  secondaryStat: string;
}

/**
 * Computes top run-scorers and wicket-takers dynamically from actual innings data.
 */
export function extractTournamentLeaders(matches: CricketMatch[]): {
  topBatsmen: DynamicLeaderStat[];
  topBowlers: DynamicLeaderStat[];
} {
  const batsmenStats: Record<string, { name: string; teamShort: string; runs: number; balls: number; fours: number; sixes: number }> = {};
  const bowlerStats: Record<string, { name: string; teamShort: string; wickets: number; runs: number; legalBalls: number }> = {};

  const processInnings = (inn: InningsState, teamShort: string, oppShort: string) => {
    if (!inn) return;
    for (const b of inn.batsmen || []) {
      if (!batsmenStats[b.name]) {
        batsmenStats[b.name] = { name: b.name, teamShort, runs: 0, balls: 0, fours: 0, sixes: 0 };
      }
      batsmenStats[b.name].runs += b.runs || 0;
      batsmenStats[b.name].balls += b.balls || 0;
      batsmenStats[b.name].fours += b.fours || 0;
      batsmenStats[b.name].sixes += b.sixes || 0;
    }

    for (const bo of inn.bowlers || []) {
      if (!bowlerStats[bo.name]) {
        bowlerStats[bo.name] = { name: bo.name, teamShort: oppShort, wickets: 0, runs: 0, legalBalls: 0 };
      }
      bowlerStats[bo.name].wickets += bo.wickets || 0;
      bowlerStats[bo.name].runs += bo.runsConceded || 0;
      bowlerStats[bo.name].legalBalls += bo.legalBalls || 0;
    }
  };

  for (const m of matches) {
    if (m.innings1) {
      const batTeam = m.innings1.battingTeamId === m.teamA.id ? m.teamA.shortName : m.teamB.shortName;
      const bowlTeam = m.innings1.battingTeamId === m.teamA.id ? m.teamB.shortName : m.teamA.shortName;
      processInnings(m.innings1, batTeam, bowlTeam);
    }
    if (m.innings2) {
      const batTeam = m.innings2.battingTeamId === m.teamA.id ? m.teamA.shortName : m.teamB.shortName;
      const bowlTeam = m.innings2.battingTeamId === m.teamA.id ? m.teamB.shortName : m.teamA.shortName;
      processInnings(m.innings2, batTeam, bowlTeam);
    }
  }

  const topBatsmen: DynamicLeaderStat[] = Object.values(batsmenStats)
    .filter((b) => b.runs > 0)
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 5)
    .map((b, idx) => {
      const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0';
      return {
        rank: idx + 1,
        playerName: b.name,
        teamShort: b.teamShort,
        statValue: b.runs,
        secondaryStat: `${b.balls} balls · SR ${sr} · ${b.fours} 4s · ${b.sixes} 6s`,
      };
    });

  const topBowlers: DynamicLeaderStat[] = Object.values(bowlerStats)
    .filter((bo) => bo.wickets > 0 || bo.legalBalls > 0)
    .sort((a, b) => {
      if (b.wickets !== a.wickets) return b.wickets - a.wickets;
      return a.runs - b.runs;
    })
    .slice(0, 5)
    .map((bo, idx) => {
      const overs = formatOvers(bo.legalBalls);
      const econ = bo.legalBalls > 0 ? ((bo.runs / (bo.legalBalls / 6))).toFixed(2) : '0.00';
      return {
        rank: idx + 1,
        playerName: bo.name,
        teamShort: bo.teamShort,
        statValue: bo.wickets,
        secondaryStat: `${overs} ov · Econ ${econ} · ${bo.runs} runs`,
      };
    });

  return { topBatsmen, topBowlers };
}
