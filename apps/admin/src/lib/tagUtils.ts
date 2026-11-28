export const PRESET_PLAYER_TAGS = ['Owner', 'Player', 'RC Staff', 'School'] as const;

/**
 * Safely extract deduplicated admin tags from a registration record.
 */
export function getPlayerTags(record: any): string[] {
  const raw = record?.general_details?.tags;
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of raw) {
    const clean = String(item || '').trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(clean);
  }
  return result;
}

/**
 * Collect all unique tags across preset tags and all registrations (case-insensitive).
 */
export function getAllKnownTags(registrations: any[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  const push = (tag: string) => {
    const clean = String(tag || '').trim();
    if (!clean) return;
    const key = clean.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    result.push(clean);
  };
  PRESET_PLAYER_TAGS.forEach(push);
  (registrations || []).forEach((r) => getPlayerTags(r).forEach(push));
  return result;
}

/**
 * Return Tailwind badge classes for preset and custom player tags.
 */
export function getTagBadgeClass(tag: string): string {
  switch (tag.toLowerCase()) {
    case 'owner':
      return 'bg-amber-100 text-amber-900 border-amber-300';
    case 'player':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'rc staff':
      return 'bg-sky-100 text-sky-800 border-sky-300';
    case 'school':
      return 'bg-violet-100 text-violet-800 border-violet-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
}
