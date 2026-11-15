import { Router } from 'express';
import { randomUUID } from 'crypto';
import db, { RPL_DB } from '../config/db.js';
import logger from '../config/logger.js';
import { verifyAuth, requireAnyPermission } from '../middleware/auth.js';
import { feedbackRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * Public Endpoint: Check Existing Feedback
 * Queries if a mobile number has already submitted feedback for the given form_type.
 * If so, returns their existing submission so they can review or update it.
 */
router.get('/feedback/check', async (req, res, next) => {
  try {
    const { mobile, form_type = 'rpl_event' } = req.query;
    const cleanMobile = String(mobile || '').replace(/\D/g, '').slice(-10);

    if (cleanMobile.length !== 10) {
      return res.status(400).json({ success: false, error: 'Valid 10-digit mobile number is required.' });
    }

    const [rows] = await db.query(
      `SELECT id, form_type, mobile, full_name, ratings, overall_rating, feedback_text, wow_moment, metadata, created_at 
       FROM ${RPL_DB}.rpl_feedbacks 
       WHERE form_type = ? AND mobile = ? 
       ORDER BY created_at DESC LIMIT 1`,
      [form_type, cleanMobile]
    );

    if (!rows || rows.length === 0) {
      return res.json({ success: true, exists: false });
    }

    const item = rows[0];
    return res.json({
      success: true,
      exists: true,
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
        created_at: item.created_at,
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

    // 1. Enforce registered player rule for Main Tournament Event
    if (form_type === 'rpl_event') {
      const [regRows] = await db.query(
        `SELECT id, full_name FROM ${RPL_DB}.rpl_registrations 
         WHERE mobile = ? OR mobile LIKE ? OR REPLACE(REPLACE(mobile, ' ', ''), '+', '') LIKE ? LIMIT 1`,
        [cleanMobile, `%${cleanMobile}%`, `%${cleanMobile}`]
      );
      if (!regRows || regRows.length === 0) {
        return res.status(403).json({
          success: false,
          code: 'REGISTRATION_REQUIRED',
          error: 'Only registered RPL Season 9 players can submit tournament feedback.',
        });
      }
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

    if (form_type && form_type !== 'all') {
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

    // 3. Aggregate quick statistics
    const [statsRows] = await db.query(
      `SELECT 
         form_type, 
         COUNT(*) as count, 
         ROUND(AVG(overall_rating), 1) as avg_rating 
       FROM ${RPL_DB}.rpl_feedbacks 
       GROUP BY form_type`
    );

    const stats = {
      rpl_event: 0,
      rpl_event_avg: 0,
      auction_day: 0,
      auction_day_avg: 0,
      total_submissions: 0,
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
      data: rows.map((r) => ({
        ...r,
        ratings: typeof r.ratings === 'string' ? JSON.parse(r.ratings || '{}') : r.ratings,
        metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata || '{}') : r.metadata,
      })),
    });
  } catch (error) {
    logger.error('[ADMIN FEEDBACKS ERROR]:', error);
    next(error);
  }
});

export default router;

