/**
 * Date & Time Utilities for Indian Standard Time (IST / Asia/Kolkata)
 * Ensures all UTC timestamps from MySQL database display accurately in IST.
 */

/**
 * Parses any database timestamp safely as UTC and returns a JavaScript Date object.
 * Automatically handles MySQL raw strings ("YYYY-MM-DD HH:mm:ss") by appending 'Z'
 * so browsers parse them as UTC rather than naive local time.
 */
export function parseDbDate(dateStr?: string | number | Date | null): Date | null {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;
  if (typeof dateStr === 'number') {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }
  const clean = String(dateStr).trim();
  if (!clean) return null;

  // If no timezone specifier, treat MySQL UTC string as UTC
  const iso = clean.endsWith('Z') || clean.includes('+') ? clean : clean.replace(' ', 'T') + 'Z';
  const parsed = new Date(iso);
  return isNaN(parsed.getTime()) ? new Date(clean) : parsed;
}

/**
 * Formats a date & time in Indian Standard Time (IST).
 * Example: "16 Nov 2026, 11:58 am"
 */
export function formatDateTimeIST(
  dateStr?: string | number | Date | null,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = parseDbDate(dateStr);
  if (!d || isNaN(d.getTime())) return '—';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options,
  };

  return d.toLocaleString('en-IN', defaultOptions);
}

/**
 * Formats full date, time, and seconds in Indian Standard Time (IST).
 * Example: "16/11/2026, 11:58:12 am" (ideal for detail modals & audit records)
 */
export function formatFullDateTimeIST(dateStr?: string | number | Date | null): string {
  const d = parseDbDate(dateStr);
  if (!d || isNaN(d.getTime())) return '—';

  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

/**
 * Formats date only in Indian Standard Time (IST).
 * Example: "16 Nov 2026"
 */
export function formatDateIST(
  dateStr?: string | number | Date | null,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = parseDbDate(dateStr);
  if (!d || isNaN(d.getTime())) return '—';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  };

  return d.toLocaleDateString('en-IN', defaultOptions);
}
