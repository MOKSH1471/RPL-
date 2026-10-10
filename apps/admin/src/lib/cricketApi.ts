import { CricketMatch, CricketTeam } from '@/types/cricket';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const defaultApiUrl = isLocalhost ? 'http://localhost:5005/api' : 'https://rpl-api-w3x1.onrender.com/api';
const rawBase = import.meta.env.VITE_API_URL || defaultApiUrl;
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

    if (res.status === 404) {
      // Create if it doesn't exist in DB yet
      const createRes = await fetch(`${API_BASE_URL}/cricket/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(match),
      });
      if (createRes.ok) return await createRes.json();
    }

    if (res.ok) return await res.json();
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
