import { Router } from 'express';
import { getActiveSports, getRegistrationFields } from '../services/sports.service.js';

const router = Router();

// 1. Get all active sports
router.get('/sports', async (req, res, next) => {
  try {
    const sports = await getActiveSports();
    res.json(sports);
  } catch (error) {
    next(error);
  }
});

// 2. Get all registration fields (dynamic questions configuration)
router.get('/registration-fields', async (req, res, next) => {
  try {
    const fields = await getRegistrationFields();
    res.json(fields);
  } catch (error) {
    next(error);
  }
});

export default router;
