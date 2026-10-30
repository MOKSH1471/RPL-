import { CricketMatch, CricketTeam } from '@/types/cricket';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const rawBase = isLocalhost
  ? 'http://localhost:5005/api'
  : (import.meta.env.VITE_API_URL || 'https://rpl-api-w3x1.onrender.com/api');
const cleanBase = String(rawBase).trim().replace(/\/+$/, '');
const API_BASE_URL = cleanBase.endsWith('/api') ? cleanBase : `${cleanBase}/api`;

/**
 * Fetch all cricket teams and rosters directly from MySQL Database
 */
export async function fetchCricketTeamsFromDb(): Promise<CricketTeam[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/cricket/teams`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('⚠️ [CRICKET API] Backend teams API unreachable, falling back to local cache:', err);
    return [];
  }
}

/**
 * Save or create a cricket team directly in MySQL Database
 */
export async function saveCricketTeamToDb(team: CricketTeam): Promise<CricketTeam | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/cricket/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(team),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('⚠️ [CRICKET API] Error saving team to database:', err);
    return null;
  }
}

/**
 * Delete a cricket team from MySQL Database
 */
export async function deleteCricketTeamFromDb(teamId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/cricket/teams/${teamId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('⚠️ [CRICKET API] Error deleting team from database:', err);
    return false;
  }
}

/**
 * Fetch all matches directly from MySQL Database
 */
export async function fetchCricketMatchesFromDb(): Promise<CricketMatch[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/cricket/matches`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('⚠️ [CRICKET API] Backend matches API unreachable, falling back to local cache:', err);
    return [];
  }
}

/**
 * Save or update match state (live ball delivery, status, scores) into MySQL
 */
export async function syncMatchToDb(match: CricketMatch): Promise<CricketMatch | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/cricket/matches/${match.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(match),
    });

    if (res.ok) {
      const data = await res.json();
      if (data) return data;
    }

    // Create if PUT did not find/update record
    const createRes = await fetch(`${API_BASE_URL}/cricket/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(match),
    });
    if (createRes.ok) return await createRes.json();
    return null;
  } catch (err) {
    // Non-blocking catch to ensure offline scoring continues smoothly
    console.warn('⚠️ [CRICKET API] Match background sync skipped:', err);
    return null;
  }
}

/**
 * Delete a match directly from MySQL Database
 */
export async function deleteMatchFromDb(matchId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/cricket/matches/${matchId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('⚠️ [CRICKET API] Failed to delete match from DB:', err);
    return false;
  }
}
