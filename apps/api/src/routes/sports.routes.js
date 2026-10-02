import { Router } from 'express';
import db, { RPL_DB } from '../config/db.js';

const router = Router();

// 1. Get all active sports
router.get('/sports', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT id, name FROM ${RPL_DB}.rpl_sports WHERE is_active = TRUE`);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching sports:', error);
    res.status(500).json({ error: 'Failed to fetch sports' });
  }
});

// 2. Get all registration fields (dynamic questions configuration)
router.get('/registration-fields', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM ${RPL_DB}.rpl_registration_fields ORDER BY sort_order ASC`);
    const fields = rows.map((field) => ({
      ...field,
      options: typeof field.options === 'string' ? JSON.parse(field.options) : field.options,
      validation_rules: typeof field.validation_rules === 'string' ? JSON.parse(field.validation_rules) : field.validation_rules,
    }));
    res.json(fields);
  } catch (error) {
    console.error('Error fetching registration fields:', error);
    res.status(500).json({ error: 'Failed to fetch registration fields' });
  }
});

export default router;
