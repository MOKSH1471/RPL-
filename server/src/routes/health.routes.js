import { Router } from 'express';
import db from '../config/db.js';

const router = Router();

// Health check endpoint (lightweight, outside rate limits)
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Readiness probe (verifies database connectivity)
router.get('/ready', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({ status: 'ready', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'not_ready', database: 'disconnected' });
  }
});

export default router;
