import { Router } from 'express';
import { randomUUID } from 'crypto';
import db, { RPL_DB } from '../config/db.js';
import logger from '../config/logger.js';
import { verifyAuth, requireAnyPermission } from '../middleware/auth.js';

const router = Router();

/**
 * Public Endpoint: Submit Feedback
 * Accepts feedback for either Form 1 ('rpl_event') or Form 2 ('auction_day')
 */
router.post('/feedback', async (req, res, next) => {
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

    const cleanName = String(full_name || '').trim();
    if (!cleanName) {
      return res.status(400).json({
        success: false,
        error: 'Full name is required.',
      });
    }

    const id = randomUUID();
    const ratingsJson = JSON.stringify(ratings || {});
    const metadataJson = metadata ? JSON.stringify(metadata) : null;
    const cleanOverall = Number(overall_rating) || null;
    const cleanFeedback = String(feedback_text || '').trim() || null;
    const cleanWow = String(wow_moment || '').trim() || null;

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
      message: 'Feedback submitted successfully',
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

