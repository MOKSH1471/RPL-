import { Router } from 'express';
import {
  getAllTeams,
  getAllMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch,
} from '../services/cricket.service.js';

const router = Router();

// GET all cricket teams with squads
router.get('/cricket/teams', async (req, res, next) => {
  try {
    const teams = await getAllTeams();
    res.json(teams);
  } catch (error) {
    next(error);
  }
});

// GET all cricket matches
router.get('/cricket/matches', async (req, res, next) => {
  try {
    const matches = await getAllMatches();
    res.json(matches);
  } catch (error) {
    next(error);
  }
});

// GET single cricket match by id
router.get('/cricket/matches/:id', async (req, res, next) => {
  try {
    const match = await getMatchById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    res.json(match);
  } catch (error) {
    next(error);
  }
});

// POST create a new match
router.post('/cricket/matches', async (req, res, next) => {
  try {
    const created = await createMatch(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

// PUT update match (scores, live balls, status)
router.put('/cricket/matches/:id', async (req, res, next) => {
  try {
    const updated = await updateMatch(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE a match
router.delete('/cricket/matches/:id', async (req, res, next) => {
  try {
    const result = await deleteMatch(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
