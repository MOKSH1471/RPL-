import { Router } from 'express';
import db from '../config/db.js';

const router = Router();

// Root health probe (for Render load-balancer & ping probes)
router.all('/', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'rpl-api', timestamp: new Date().toISOString() });
});

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
