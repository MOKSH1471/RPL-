// Utility to manage pre-auction visibility for Rules & Live Scorecard pages
const PREVIEW_STORAGE_KEY = 'rpl_admin_preview';
const VALID_PASSWORDS = ['rpl2026', 'admin', 'rpladmin'];

export function checkIsAdminPreview(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const searchParams = new URLSearchParams(window.location.search);
    let hashQuery = '';
    if (window.location.hash && window.location.hash.includes('?')) {
      hashQuery = window.location.hash.substring(window.location.hash.indexOf('?'));
    }
    const hashParams = new URLSearchParams(hashQuery);

    const previewParam = (
      searchParams.get('preview') ||
      hashParams.get('preview') ||
      searchParams.get('admin') ||
      hashParams.get('admin') ||
      ''
    ).toLowerCase().trim();

    // Explicit disable/lock: ?preview=false or ?preview=lock or ?preview=0
    if (previewParam === 'false' || previewParam === 'lock' || previewParam === '0') {
      localStorage.removeItem(PREVIEW_STORAGE_KEY);
      return false;
    }

    // Explicit enable via query parameter: ?preview=rpl2026 or ?preview=admin or ?admin=true
    if (
      VALID_PASSWORDS.includes(previewParam) ||
      previewParam === 'true' ||
      previewParam === '1'
    ) {
      localStorage.setItem(PREVIEW_STORAGE_KEY, 'true');
      return true;
    }

    // Check persistent storage
    if (localStorage.getItem(PREVIEW_STORAGE_KEY) === 'true') {
      return true;
    }
  } catch {
    // Graceful fallback if storage fails
  }

  return false;
}

export function unlockAdminPreview(pin: string): boolean {
  const normalized = (pin || '').toLowerCase().trim();
  if (VALID_PASSWORDS.includes(normalized)) {
    try {
      localStorage.setItem(PREVIEW_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
    return true;
  }
  return false;
}

export function lockAdminPreview(): void {
  try {
    localStorage.removeItem(PREVIEW_STORAGE_KEY);
  } catch {
    // ignore
  }
}

