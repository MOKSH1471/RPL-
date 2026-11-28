import historicalStatsData from '@/data/rplHistoricalStats.json';

export interface BattingStats {
  matches: number;
  runs: number;
  avg: number | null;
  sr: number;
  fours: number;
  sixes: number;
}

export interface BowlingStats {
  wickets: number;
  overs: string;
  eco: number;
  sr: number | null;
  avg: number | null;
  dot_balls: number;
}

export interface FieldingStats {
  catches: number;
  caught_behind: number;
  run_outs: number;
  stumpings: number;
  caught_and_bowl: number;
}

export interface HistoricalPlayerRecord {
  statsName: string;
  batting: BattingStats | null;
  bowling: BowlingStats | null;
  fielding: FieldingStats | null;
}

const byRegId = (historicalStatsData as any).byRegistrationId as Record<string, HistoricalPlayerRecord>;
const byStatsName = (historicalStatsData as any).byStatsName as Record<string, HistoricalPlayerRecord>;

function normName(s: string): string {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Look up combined S6–S8 historical cricket stats for a registration by ID or name.
 */
export function getHistoricalCricketStats(
  playerOrId: any,
  fallbackName?: string
): HistoricalPlayerRecord | null {
  if (!playerOrId && !fallbackName) return null;
  const id = typeof playerOrId === 'string' ? playerOrId : playerOrId?.id;
  const rawName = typeof playerOrId === 'string' ? fallbackName : (playerOrId?.full_name || playerOrId?.name || fallbackName);
  if (id && byRegId[id]) return byRegId[id];
  if (rawName) {
    const cleaned = normName(String(rawName).replace(/^RPLGuest-/i, ''));
    if (cleaned && byStatsName[cleaned]) return byStatsName[cleaned];
  }
  return null;
}
