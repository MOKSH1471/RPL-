import { Router } from 'express';
import { randomUUID } from 'crypto';
import db, { RPL_DB } from '../config/db.js';
import logger from '../config/logger.js';
import { verifyAuth, requireAnyPermission } from '../middleware/auth.js';
import { feedbackRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// ── Feedback Window & Expiry Configuration (DB-backed with Admin Flexibility) ──
const DEFAULT_RPL_EVENT_CLOSE_MESSAGE = 
  'Feedback collection for RPL Season 9 has now concluded. The organizing committee sincerely thanks every player, captain, and volunteer who shared their thoughts. See you in Season 10!';

const DEFAULT_AUCTION_CLOSE_MESSAGE = 
  'Feedback collection for the RPL Season 9 Auction Ceremony has now concluded. The organizing committee sincerely thanks every attendee who shared their inputs. See you in Season 10!';

const DEFAULT_CLOSE_MESSAGE = DEFAULT_RPL_EVENT_CLOSE_MESSAGE;

let settingsCache = null;
let settingsCacheExpiresAt = 0;

async function getSettingsFromDb() {
  const now = Date.now();
  if (settingsCache && now < settingsCacheExpiresAt) {
    return settingsCache;
  }

  try {
    // Ensure settings table exists safely
    await db.query(`
      CREATE TABLE IF NOT EXISTS ${RPL_DB}.rpl_feedback_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const [rows] = await db.query(
      `SELECT setting_key, setting_value FROM ${RPL_DB}.rpl_feedback_settings`
    );
    const map = {};
    if (Array.isArray(rows)) {
      rows.forEach((r) => {
        map[r.setting_key] = r.setting_value;
      });
    }
    settingsCache = map;
    settingsCacheExpiresAt = now + 30000; // 30 sec in-memory TTL
    return map;
  } catch (err) {
    logger.warn('[FEEDBACK SETTINGS] Failed to read settings from DB, falling back to env:', err.message);
    return {};
  }
}

function invalidateSettingsCache() {
  settingsCache = null;
  settingsCacheExpiresAt = 0;
}

async function getFeedbackWindowConfig(form_type = 'rpl_event') {
  const dbSettings = await getSettingsFromDb();
  const formKey = form_type === 'auction_day' ? 'auction_day' : 'rpl_event';

  // 1. Status: 'open' | 'closed' | 'scheduled'
  const status = dbSettings[`${formKey}_status`] || 'open';

  // 2. Expiry date: DB takes priority over ENV
  let expiresAt = dbSettings[`${formKey}_expires_at`];
  if (expiresAt === undefined) {
    expiresAt = formKey === 'auction_day'
      ? (process.env.AUCTION_FEEDBACK_EXPIRES_AT || process.env.FEEDBACK_EXPIRES_AT || null)
      : (process.env.FEEDBACK_EXPIRES_AT || null);
  }

  // 3. Close message: per-form DB setting takes priority over shared DB/ENV setting
  const closeMessage = form_type === 'auction_day'
    ? (dbSettings['auction_day_close_message'] || process.env.AUCTION_FEEDBACK_CLOSE_MESSAGE || dbSettings['close_message'] || process.env.FEEDBACK_CLOSE_MESSAGE || DEFAULT_AUCTION_CLOSE_MESSAGE)
    : (dbSettings['rpl_event_close_message'] || dbSettings['close_message'] || process.env.FEEDBACK_CLOSE_MESSAGE || DEFAULT_RPL_EVENT_CLOSE_MESSAGE);

  // 4. Calculate closed state
  let isClosed = false;
  if (status === 'closed') {
    isClosed = true;
  } else if (status === 'open' && !expiresAt) {
    isClosed = false;
  } else if (expiresAt) {
    const expiryTime = new Date(expiresAt).getTime();
    if (!isNaN(expiryTime) && Date.now() > expiryTime) {
      isClosed = true;
    }
  }

  return {
    is_closed: isClosed,
    status,
    expires_at: expiresAt || null,
    close_message: closeMessage,
  };
}

/**
 * Public Endpoint: Get Public Feedback Status (Open / Closed / Scheduled)
 * Used by web clients on initial page load to immediately display if feedback is closed
 * without requiring the user to type their mobile number first.
 */
router.get('/feedback/status', async (req, res, next) => {
  try {
    const { form_type = 'rpl_event' } = req.query;
    const windowConfig = await getFeedbackWindowConfig(form_type);
    return res.json({
      success: true,
      ...windowConfig,
    });
  } catch (error) {
    logger.error('[FEEDBACK STATUS ERROR]:', error);
    next(error);
  }
});

/**
 * Public Endpoint: Check Existing Feedback
 * Queries if a mobile number has already submitted feedback for the given form_type.
 * If so, returns their existing submission so they can review or update it.
 */
router.get('/feedback/check', async (req, res, next) => {
  try {
    const { mobile, form_type = 'rpl_event' } = req.query;

    const windowConfig = await getFeedbackWindowConfig(form_type);
    const isClosed = windowConfig.is_closed;
    const closeMessage = windowConfig.close_message;

    const cleanMobile = String(mobile || '').replace(/\D/g, '').slice(-10);

    if (cleanMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        is_closed: isClosed,
        close_message: closeMessage,
        error: 'Valid 10-digit mobile number is required.',
      });
    }

    // Enforce registered player & approved payment check
    const [regRows] = await db.query(
      `SELECT id, full_name, payment_status FROM ${RPL_DB}.rpl_registrations 
       WHERE (mobile = ? OR mobile LIKE ? OR REPLACE(REPLACE(mobile, ' ', ''), '+', '') LIKE ?) 
       ORDER BY submitted_at DESC LIMIT 1`,
      [cleanMobile, `%${cleanMobile}%`, `%${cleanMobile}`]
    );

    if (!regRows || regRows.length === 0) {
      return res.status(403).json({
        success: false,
        code: 'REGISTRATION_REQUIRED',
        error: 'Only registered RPL Season 9 players can submit feedback.',
      });
    }

    const reg = regRows[0];
    const isPaymentApproved = String(reg.payment_status || '').toLowerCase() === 'approved';
    if (!isPaymentApproved) {
      return res.status(403).json({
        success: false,
        code: 'PAYMENT_NOT_APPROVED',
        payment_status: reg.payment_status || 'pending',
        error: `Payment verification is currently ${reg.payment_status || 'pending'}. Only participants with approved payment can submit feedback.`,
      });
    }

    const [rows] = await db.query(
      `SELECT id, form_type, mobile, full_name, ratings, overall_rating, feedback_text, wow_moment, metadata, created_at 
       FROM ${RPL_DB}.rpl_feedbacks 
       WHERE form_type = ? AND mobile = ? 
       ORDER BY created_at DESC LIMIT 1`,
      [form_type, cleanMobile]
    );

    if (!rows || rows.length === 0) {
      return res.json({ success: true, exists: false, is_closed: isClosed, close_message: closeMessage });
    }

    const item = rows[0];
    return res.json({
      success: true,
      exists: true,
      is_closed: isClosed,
      close_message: closeMessage,
      feedback: {
        id: item.id,
        form_type: item.form_type,
        mobile: item.mobile,
        full_name: item.full_name,
        ratings: typeof item.ratings === 'string' ? JSON.parse(item.ratings || '{}') : (item.ratings || {}),
        overall_rating: item.overall_rating,
        feedback_text: item.feedback_text,
        wow_moment: item.wow_moment,
        metadata: typeof item.metadata === 'string' ? JSON.parse(item.metadata || '{}') : (item.metadata || {}),
        created_at: item.created_at
          ? (typeof item.created_at === 'string' && !item.created_at.endsWith('Z')
              ? item.created_at.replace(' ', 'T') + 'Z'
              : item.created_at)
          : null,
      },
    });
  } catch (error) {
    logger.error('[FEEDBACK CHECK ERROR]:', error);
    next(error);
  }
});

/**
 * Public Endpoint: Submit Feedback
 * Accepts feedback for either Form 1 ('rpl_event') or Form 2 ('auction_day')
 */
router.post('/feedback', feedbackRateLimiter, async (req, res, next) => {
  try {
    const {
      form_type,
      mobile,
      full_name,
      ratings,
      overall_rating,
      feedback_text,
      wow_moment,
      metadata,
      allow_update = false,
    } = req.body;

    // Basic validation
    if (!form_type || !['rpl_event', 'auction_day'].includes(form_type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing form_type. Must be "rpl_event" or "auction_day".',
      });
    }

    const windowConfig = await getFeedbackWindowConfig(form_type);
    if (windowConfig.is_closed) {
      return res.status(403).json({
        success: false,
        code: 'FEEDBACK_CLOSED',
        error: windowConfig.close_message || DEFAULT_CLOSE_MESSAGE,
      });
    }

    const cleanMobile = String(mobile || '').replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        error: 'Valid 10-digit mobile number is required.',
      });
    }

    const cleanName = String(full_name || '').trim().slice(0, 100);
    if (!cleanName) {
      return res.status(400).json({
        success: false,
        error: 'Full name is required.',
      });
    }

    // 1. Enforce registered player & approved payment rule
    const [regRows] = await db.query(
      `SELECT id, full_name, payment_status FROM ${RPL_DB}.rpl_registrations 
       WHERE (mobile = ? OR mobile LIKE ? OR REPLACE(REPLACE(mobile, ' ', ''), '+', '') LIKE ?) 
       ORDER BY submitted_at DESC LIMIT 1`,
      [cleanMobile, `%${cleanMobile}%`, `%${cleanMobile}`]
    );

    if (!regRows || regRows.length === 0) {
      return res.status(403).json({
        success: false,
        code: 'REGISTRATION_REQUIRED',
        error: 'Only registered RPL Season 9 players can submit feedback.',
      });
    }

    const reg = regRows[0];
    const isPaymentApproved = String(reg.payment_status || '').toLowerCase() === 'approved';
    if (!isPaymentApproved) {
      return res.status(403).json({
        success: false,
        code: 'PAYMENT_NOT_APPROVED',
        payment_status: reg.payment_status || 'pending',
        error: `Payment verification is currently ${reg.payment_status || 'pending'}. Only participants with approved payment can submit feedback.`,
      });
    }

    // 2. Check for existing submission for this form type & mobile
    const [existingRows] = await db.query(
      `SELECT id FROM ${RPL_DB}.rpl_feedbacks WHERE form_type = ? AND mobile = ? LIMIT 1`,
      [form_type, cleanMobile]
    );
    const existing = existingRows && existingRows[0];

    if (existing && !allow_update) {
      return res.status(409).json({
        success: false,
        code: 'ALREADY_SUBMITTED',
        can_update: true,
        error: 'Feedback has already been recorded for this mobile number. You can review or update your feedback below.',
      });
    }

    // 3. Range check overall rating (must be 1-5)
    let cleanOverall = null;
    if (overall_rating !== undefined && overall_rating !== null && overall_rating !== '') {
      const parsed = Number(overall_rating);
      if (isNaN(parsed) || parsed < 1 || parsed > 5) {
        return res.status(400).json({
          success: false,
          error: 'Overall rating must be between 1 and 5 stars.',
        });
      }
      cleanOverall = Math.round(parsed);
    }

    const ratingsJson = JSON.stringify(ratings || {});
    const metadataJson = metadata ? JSON.stringify(metadata) : null;
    const cleanFeedback = String(feedback_text || '').trim().slice(0, 3000) || null;
    const cleanWow = String(wow_moment || '').trim().slice(0, 2000) || null;

    if (existing && allow_update) {
      await db.query(
        `UPDATE ${RPL_DB}.rpl_feedbacks 
         SET full_name = ?, ratings = ?, overall_rating = ?, feedback_text = ?, wow_moment = ?, metadata = ?
         WHERE id = ?`,
        [
          cleanName,
          ratingsJson,
          cleanOverall,
          cleanFeedback,
          cleanWow,
          metadataJson,
          existing.id,
        ]
      );

      logger.info(`[FEEDBACK] Updated ${form_type} feedback from "${cleanName}" (${cleanMobile}) [id: ${existing.id}]`);

      return res.status(200).json({
        success: true,
        id: existing.id,
        is_update: true,
        message: 'Feedback updated successfully.',
      });
    }

    const id = randomUUID();
    await db.query(
      `INSERT INTO ${RPL_DB}.rpl_feedbacks 
        (id, form_type, mobile, full_name, ratings, overall_rating, feedback_text, wow_moment, metadata) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        form_type,
        cleanMobile,
        cleanName,
        ratingsJson,
        cleanOverall,
        cleanFeedback,
        cleanWow,
        metadataJson,
      ]
    );

    logger.info(`[FEEDBACK] Saved ${form_type} feedback from "${cleanName}" (${cleanMobile}) [id: ${id}]`);

    return res.status(201).json({
      success: true,
      id,
      is_update: false,
      message: 'Feedback submitted successfully.',
    });
  } catch (error) {
    logger.error('[FEEDBACK ERROR] Failed to submit feedback:', error);
    next(error);
  }
});

/**
 * Admin Endpoint: List, Filter & Export Feedbacks
 * Supports filtering by form_type ('rpl_event' | 'auction_day') and search
 */
router.get('/admin/feedbacks', verifyAuth, requireAnyPermission(['dashboard', 'registrations']), async (req, res, next) => {
  try {
    const { form_type, search, page = 1, limit = 50 } = req.query;

    const offset = Math.max(0, (parseInt(page, 10) - 1) * parseInt(limit, 10));
    const safeLimit = Math.min(200, Math.max(1, parseInt(limit, 10)));

    const conditions = [];
    const params = [];

    if (form_type === 'critical') {
      conditions.push(`(overall_rating <= 2 OR ratings LIKE '%":1%' OR ratings LIKE '%": 1%')`);
    } else if (form_type && form_type !== 'all') {
      conditions.push('form_type = ?');
      params.push(form_type);
    }

    if (search && String(search).trim()) {
      const q = `%${String(search).trim()}%`;
      conditions.push('(full_name LIKE ? OR mobile LIKE ?)');
      params.push(q, q);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 1. Fetch total count
    const [countRows] = await db.query(
      `SELECT COUNT(*) as total FROM ${RPL_DB}.rpl_feedbacks ${whereClause}`,
      params
    );
    const total = countRows[0]?.total || 0;

    // 2. Fetch paginated records
    const [rows] = await db.query(
      `SELECT id, form_type, mobile, full_name, ratings, overall_rating, feedback_text, wow_moment, metadata, created_at 
       FROM ${RPL_DB}.rpl_feedbacks 
       ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    // 3. Aggregate comprehensive statistics
    const [statsRows] = await db.query(
      `SELECT 
         form_type, 
         COUNT(*) as count, 
         ROUND(AVG(overall_rating), 1) as avg_rating 
       FROM ${RPL_DB}.rpl_feedbacks 
       GROUP BY form_type`
    );

    // Turnout calculations
    let approvedPlayers = 0;
    let uniqueSubmitters = 0;
    try {
      const [approvedCountRows] = await db.query(
        `SELECT COUNT(*) as count FROM ${RPL_DB}.rpl_registrations WHERE LOWER(payment_status) = 'approved' AND (is_archived IS NULL OR is_archived = 0)`
      );
      const [uniqueSubmittersRows] = await db.query(
        `SELECT COUNT(DISTINCT mobile) as count FROM ${RPL_DB}.rpl_feedbacks`
      );
      approvedPlayers = approvedCountRows[0]?.count || 0;
      uniqueSubmitters = uniqueSubmittersRows[0]?.count || 0;
    } catch (e) {
      logger.warn('[FEEDBACK STATS] Could not query turnout:', e.message);
    }
    const turnoutPercent = approvedPlayers > 0 ? Math.round((uniqueSubmitters / approvedPlayers) * 100) : 0;

    // Star distribution breakdown (1-5 stars)
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    try {
      const [ratingDistRows] = await db.query(
        `SELECT overall_rating, COUNT(*) as count 
         FROM ${RPL_DB}.rpl_feedbacks 
         WHERE overall_rating IS NOT NULL 
         GROUP BY overall_rating`
      );
      if (Array.isArray(ratingDistRows)) {
        ratingDistRows.forEach((r) => {
          if (r.overall_rating && ratingDistribution[r.overall_rating] !== undefined) {
            ratingDistribution[r.overall_rating] = r.count;
          }
        });
      }
    } catch (e) {
      logger.warn('[FEEDBACK STATS] Could not query rating distribution:', e.message);
    }

    const stats = {
      rpl_event: 0,
      rpl_event_avg: 0,
      auction_day: 0,
      auction_day_avg: 0,
      total_submissions: 0,
      approved_players: approvedPlayers,
      unique_submitters: uniqueSubmitters,
      turnout_percent: turnoutPercent,
      rating_distribution: ratingDistribution,
    };

    statsRows.forEach((s) => {
      if (s.form_type === 'rpl_event') {
        stats.rpl_event = s.count;
        stats.rpl_event_avg = s.avg_rating || 0;
      } else if (s.form_type === 'auction_day') {
        stats.auction_day = s.count;
        stats.auction_day_avg = s.avg_rating || 0;
      }
      stats.total_submissions += s.count;
    });

    return res.json({
      success: true,
      total,
      page: parseInt(page, 10),
      limit: safeLimit,
      stats,
      data: rows.map((r) => {
        const ratings = typeof r.ratings === 'string' ? JSON.parse(r.ratings || '{}') : (r.ratings || {});
        const metadata = typeof r.metadata === 'string' ? JSON.parse(r.metadata || '{}') : (r.metadata || {});

        let hasOneStar = false;
        const checkOneStar = (obj) => {
          if (!obj || typeof obj !== 'object') return;
          Object.values(obj).forEach((v) => {
            if (v === 1) hasOneStar = true;
            else if (v && typeof v === 'object') checkOneStar(v);
          });
        };
        checkOneStar(ratings);

        const isCritical = (typeof r.overall_rating === 'number' && r.overall_rating <= 2) || hasOneStar;
        const hasWow = Boolean(r.wow_moment && String(r.wow_moment).trim().length > 0);

        const createdAt = r.created_at
          ? (typeof r.created_at === 'string' && !r.created_at.endsWith('Z')
              ? r.created_at.replace(' ', 'T') + 'Z'
              : r.created_at)
          : null;

        return {
          ...r,
          created_at: createdAt,
          ratings,
          metadata,
          is_critical: isCritical,
          has_wow_moment: hasWow,
        };
      }),
    });
  } catch (error) {
    logger.error('[ADMIN FEEDBACKS ERROR]:', error);
    next(error);
  }
});

/**
 * Admin Endpoint: List Approved Participants who Haven't Submitted Feedback (Non-Respondents)
 */
router.get('/admin/feedback/non-respondents', verifyAuth, requireAnyPermission(['dashboard', 'registrations']), async (req, res, next) => {
  try {
    const { form_type = 'rpl_event', search, page = 1, limit = 50 } = req.query;

    const offset = Math.max(0, (parseInt(page, 10) - 1) * parseInt(limit, 10));
    const safeLimit = Math.min(200, Math.max(1, parseInt(limit, 10)));

    const conditions = [
      "LOWER(r.payment_status) = 'approved'",
      "(r.is_archived IS NULL OR r.is_archived = 0)",
    ];
    const params = [];

    // Filter out players who already submitted for this form_type
    conditions.push(`NOT EXISTS (
      SELECT 1 FROM ${RPL_DB}.rpl_feedbacks f 
      WHERE (f.form_type = ? OR ? = 'all')
      AND (
        f.mobile = r.mobile 
        OR r.mobile LIKE CONCAT('%', f.mobile, '%')
        OR f.mobile LIKE CONCAT('%', RIGHT(REPLACE(REPLACE(r.mobile, ' ', ''), '+', ''), 10))
      )
    )`);
    params.push(form_type, form_type);

    if (search && String(search).trim()) {
      const q = `%${String(search).trim()}%`;
      conditions.push('(r.full_name LIKE ? OR r.mobile LIKE ?)');
      params.push(q, q);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const [countRows] = await db.query(
      `SELECT COUNT(*) as total FROM ${RPL_DB}.rpl_registrations r ${whereClause}`,
      params
    );
    const total = countRows[0]?.total || 0;

    const [rows] = await db.query(
      `SELECT r.id, r.full_name, r.mobile, r.general_details, r.submitted_at 
       FROM ${RPL_DB}.rpl_registrations r 
       ${whereClause} 
       ORDER BY r.full_name ASC 
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    return res.json({
      success: true,
      total,
      page: parseInt(page, 10),
      limit: safeLimit,
      data: rows.map((r) => {
        let sportsLabel = 'Player';
        try {
          const gen = typeof r.general_details === 'string' ? JSON.parse(r.general_details || '{}') : (r.general_details || {});
          if (Array.isArray(gen.selectedSports) && gen.selectedSports.length > 0) {
            sportsLabel = gen.selectedSports.join(', ');
          } else if (gen.registrationType) {
            sportsLabel = gen.registrationType;
          }
        } catch {}

        const submittedAt = r.submitted_at
          ? (typeof r.submitted_at === 'string' && !r.submitted_at.endsWith('Z')
              ? r.submitted_at.replace(' ', 'T') + 'Z'
              : r.submitted_at)
          : null;

        return {
          id: r.id,
          full_name: r.full_name,
          mobile: r.mobile,
          sport_id: sportsLabel,
          submitted_at: submittedAt,
        };
      }),
    });
  } catch (error) {
    logger.error('[ADMIN NON-RESPONDENTS ERROR]:', error);
    next(error);
  }
});

/**
 * Admin Endpoint: Get Feedback Window & Expiry Settings
 */
router.get('/admin/feedback/settings', verifyAuth, requireAnyPermission(['dashboard', 'registrations']), async (req, res, next) => {
  try {
    const [rplConfig, auctionConfig] = await Promise.all([
      getFeedbackWindowConfig('rpl_event'),
      getFeedbackWindowConfig('auction_day'),
    ]);

    return res.json({
      success: true,
      settings: {
        rpl_event: rplConfig,
        auction_day: auctionConfig,
        rpl_event_close_message: rplConfig.close_message,
        auction_day_close_message: auctionConfig.close_message,
        close_message: rplConfig.close_message,
      },
    });
  } catch (error) {
    logger.error('[ADMIN FEEDBACK SETTINGS GET ERROR]:', error);
    next(error);
  }
});

/**
 * Admin Endpoint: Update Feedback Window & Expiry Settings
 */
router.put('/admin/feedback/settings', verifyAuth, requireAnyPermission(['dashboard', 'registrations']), async (req, res, next) => {
  try {
    const {
      rpl_event_status,
      rpl_event_expires_at,
      rpl_event_close_message,
      auction_day_status,
      auction_day_expires_at,
      auction_day_close_message,
      close_message,
    } = req.body;

    // Ensure settings table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS ${RPL_DB}.rpl_feedback_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const updates = [];
    if (rpl_event_status !== undefined) {
      updates.push(['rpl_event_status', String(rpl_event_status)]);
    }
    if (rpl_event_expires_at !== undefined) {
      updates.push(['rpl_event_expires_at', rpl_event_expires_at ? String(rpl_event_expires_at) : null]);
    }
    if (rpl_event_close_message !== undefined) {
      updates.push(['rpl_event_close_message', String(rpl_event_close_message).trim() || DEFAULT_RPL_EVENT_CLOSE_MESSAGE]);
    }
    if (auction_day_status !== undefined) {
      updates.push(['auction_day_status', String(auction_day_status)]);
    }
    if (auction_day_expires_at !== undefined) {
      updates.push(['auction_day_expires_at', auction_day_expires_at ? String(auction_day_expires_at) : null]);
    }
    if (auction_day_close_message !== undefined) {
      updates.push(['auction_day_close_message', String(auction_day_close_message).trim() || DEFAULT_AUCTION_CLOSE_MESSAGE]);
    }
    if (close_message !== undefined) {
      updates.push(['close_message', String(close_message).trim() || DEFAULT_CLOSE_MESSAGE]);
    }

    for (const [key, val] of updates) {
      await db.query(
        `INSERT INTO ${RPL_DB}.rpl_feedback_settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        [key, val, val]
      );
    }

    invalidateSettingsCache();

    logger.info(`[FEEDBACK SETTINGS] Updated settings by admin (${req.user?.username || req.user?.id || 'admin'})`);

    const [rplConfig, auctionConfig] = await Promise.all([
      getFeedbackWindowConfig('rpl_event'),
      getFeedbackWindowConfig('auction_day'),
    ]);

    return res.json({
      success: true,
      message: 'Feedback settings updated successfully.',
      settings: {
        rpl_event: rplConfig,
        auction_day: auctionConfig,
        rpl_event_close_message: rplConfig.close_message,
        auction_day_close_message: auctionConfig.close_message,
        close_message: rplConfig.close_message,
      },
    });
  } catch (error) {
    logger.error('[ADMIN FEEDBACK SETTINGS PUT ERROR]:', error);
    next(error);
  }
});

export default router;

