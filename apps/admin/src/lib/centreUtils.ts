/**
 * Normalizes known centre spelling variations and casing typos in the frontend
 * so Overview Dashboard, Registrations table, and CSV exports display clean canonical names.
 */
const CENTRE_ALIAS_MAP: Record<string, string> = {
  'research centre': 'Research Centre',
  'research center': 'Research Centre',
  'reaserch centre': 'Research Centre',
  'reaserch center': 'Research Centre',
  'banglore': 'Bangalore',
  'bangalore': 'Bangalore',
  'bengaluru': 'Bangalore',
  'south bombay': 'South Mumbai',
  'south mumbai': 'South Mumbai',
  'seva': 'Seva Kutir',
  'seva kutir': 'Seva Kutir',
  'raigarh(mh)': 'Raigarh (MH)',
  'raigarh (mh)': 'Raigarh (MH)',
};

export function normalizeCentreName(raw?: string | null, fallback = 'Unspecified'): string {
  const cleaned = String(raw || '').trim().replace(/\s+/g, ' ');
  if (!cleaned) return fallback;
  const key = cleaned.toLowerCase();
  return CENTRE_ALIAS_MAP[key] || cleaned;
}

/**
 * Merges counts from duplicate/misspelled centre keys into canonical names.
 */
export function aggregateCentresCount(rawCounts?: Record<string, number> | null): [string, number][] {
  if (!rawCounts) return [];
  const merged: Record<string, number> = {};
  for (const [centre, count] of Object.entries(rawCounts)) {
    const canonical = normalizeCentreName(centre);
    merged[canonical] = (merged[canonical] || 0) + (Number(count) || 0);
  }
  return Object.entries(merged).sort((a, b) => b[1] - a[1]);
}
