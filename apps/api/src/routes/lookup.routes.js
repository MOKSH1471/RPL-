import { Router } from 'express';
import { lookupPlayer, lookupReferrer } from '../services/lookup.service.js';

const router = Router();

// Player / Mumukshu Lookup by Mobile Number
export const handlePlayerLookup = async (req, res, next) => {
  const { mobile, cardno, query: searchParam } = req.query;
  const input = String(mobile || cardno || searchParam || '').trim();

  if (!input) {
    return res.status(400).json({ error: 'Mobile number or Card number is required' });
  }

  try {
    const result = await lookupPlayer(input);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Ashram Member Referrer Lookup
export const handleReferrerLookup = async (req, res, next) => {
  const { mobile, phone } = req.query;
  const input = String(mobile || phone || '').trim();

  if (!input) {
    return res.status(400).json({ error: 'Referrer mobile number is required' });
  }

  try {
    const result = await lookupReferrer(input);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Route definitions with aliases
router.get('/player-lookup', handlePlayerLookup);
router.get('/mumukshu-lookup', handlePlayerLookup);
router.get('/card/lookup', handlePlayerLookup);

router.get('/referrer-lookup', handleReferrerLookup);
router.get('/reference-lookup', handleReferrerLookup);

export default router;
