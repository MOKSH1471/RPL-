import db, { RPL_DB } from '../config/db.js';
import logger from '../config/logger.js';

export const DEFAULT_WAITLIST_BANNER_MESSAGE =
  'Player registrations for RPL Season 9 are currently full and accepting Waitlist entries only. Please complete the form below to join the waitlist — we will notify you on WhatsApp with a payment link if a spot opens up.';

export const DEFAULT_REGISTRATION_CLOSED_MESSAGE =
  'Player registrations for RPL Season 9 are now closed.';

export const DEFAULT_SPECTATOR_WAITLIST_BANNER_MESSAGE =
  '90’s Nostalgia Pass (Spectator) registrations for RPL Season 9 are currently full and accepting Waitlist entries only. Please complete the form below to join the waitlist — we will notify you on WhatsApp with a payment link if a spot opens up.';

export const DEFAULT_SPECTATOR_CLOSED_MESSAGE =
  '90’s Nostalgia Pass (Spectator) registrations for RPL Season 9 are now closed.';

let settingsCache = null;
let settingsCacheExpiresAt = 0;

/**
 * Invalidate in-memory registration settings cache immediately on admin update.
 */
export function invalidateRegistrationSettingsCache() {
  settingsCache = null;
  settingsCacheExpiresAt = 0;
}

/**
 * Read live registration mode settings from DB with 30s in-memory cache.
 */
export async function getRegistrationSettings() {
  const now = Date.now();
  if (settingsCache && now < settingsCacheExpiresAt) {
    return settingsCache;
  }

  const defaults = {
    player_registration_mode: 'open', // 'open' | 'waitlist' | 'closed'
    waitlist_banner_message: DEFAULT_WAITLIST_BANNER_MESSAGE,
    closed_message: DEFAULT_REGISTRATION_CLOSED_MESSAGE,
    spectator_registration_mode: 'open', // 'open' | 'waitlist' | 'closed'
    spectator_waitlist_banner_message: DEFAULT_SPECTATOR_WAITLIST_BANNER_MESSAGE,
    spectator_closed_message: DEFAULT_SPECTATOR_CLOSED_MESSAGE,
  };

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS ${RPL_DB}.rpl_registration_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const [rows] = await db.query(
      `SELECT setting_key, setting_value FROM ${RPL_DB}.rpl_registration_settings`
    );

    const map = {};
    if (Array.isArray(rows)) {
      rows.forEach((r) => {
        map[r.setting_key] = r.setting_value;
      });
    }

    const playerMode = ['open', 'waitlist', 'closed'].includes(map.player_registration_mode)
      ? map.player_registration_mode
      : 'open';

    const spectatorMode = ['open', 'waitlist', 'closed'].includes(map.spectator_registration_mode)
      ? map.spectator_registration_mode
      : 'open';

    settingsCache = {
      player_registration_mode: playerMode,
      waitlist_banner_message: map.waitlist_banner_message || defaults.waitlist_banner_message,
      closed_message: map.closed_message || defaults.closed_message,
      spectator_registration_mode: spectatorMode,
      spectator_waitlist_banner_message: map.spectator_waitlist_banner_message || defaults.spectator_waitlist_banner_message,
      spectator_closed_message: map.spectator_closed_message || defaults.spectator_closed_message,
    };
    settingsCacheExpiresAt = now + 30 * 1000;
    return settingsCache;
  } catch (err) {
    logger.warn('[REGISTRATION SETTINGS] DB read failed, using defaults:', err.message);
    return defaults;
  }
}

/**
 * Persist updated registration mode settings and invalidate cache.
 */
export async function updateRegistrationSettings({
  player_registration_mode,
  waitlist_banner_message,
  closed_message,
  spectator_registration_mode,
  spectator_waitlist_banner_message,
  spectator_closed_message,
}) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS ${RPL_DB}.rpl_registration_settings (
      setting_key VARCHAR(100) PRIMARY KEY,
      setting_value TEXT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  const pairs = [];
  if (player_registration_mode !== undefined) {
    if (!['open', 'waitlist', 'closed'].includes(player_registration_mode)) {
      throw new Error('Invalid player_registration_mode. Must be open, waitlist, or closed.');
    }
    pairs.push(['player_registration_mode', player_registration_mode]);
  }
  if (waitlist_banner_message !== undefined) {
    pairs.push(['waitlist_banner_message', String(waitlist_banner_message || DEFAULT_WAITLIST_BANNER_MESSAGE).trim()]);
  }
  if (closed_message !== undefined) {
    pairs.push(['closed_message', String(closed_message || DEFAULT_REGISTRATION_CLOSED_MESSAGE).trim()]);
  }
  if (spectator_registration_mode !== undefined) {
    if (!['open', 'waitlist', 'closed'].includes(spectator_registration_mode)) {
      throw new Error('Invalid spectator_registration_mode. Must be open, waitlist, or closed.');
    }
    pairs.push(['spectator_registration_mode', spectator_registration_mode]);
  }
  if (spectator_waitlist_banner_message !== undefined) {
    pairs.push(['spectator_waitlist_banner_message', String(spectator_waitlist_banner_message || DEFAULT_SPECTATOR_WAITLIST_BANNER_MESSAGE).trim()]);
  }
  if (spectator_closed_message !== undefined) {
    pairs.push(['spectator_closed_message', String(spectator_closed_message || DEFAULT_SPECTATOR_CLOSED_MESSAGE).trim()]);
  }

  for (const [k, v] of pairs) {
    await db.query(
      `INSERT INTO ${RPL_DB}.rpl_registration_settings (setting_key, setting_value)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [k, v]
    );
  }

  invalidateRegistrationSettingsCache();
  return getRegistrationSettings();
}
