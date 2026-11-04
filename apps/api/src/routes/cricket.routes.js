import { Router } from 'express';
import {
  getAllTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  getAllMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch,
} from '../services/cricket.service.js';
import { verifyAuth, requireAnyPermission } from '../middleware/auth.js';

const router = Router();

// GET all cricket teams with squads (Public for match cards & standings)
router.get('/cricket/teams', async (req, res, next) => {
  try {
    const teams = await getAllTeams();
    res.json(teams);
  } catch (error) {
    next(error);
  }
});

// POST create or save a team (Protected)
router.post('/cricket/teams', verifyAuth, requireAnyPermission(['teams', 'scorer']), async (req, res, next) => {
  try {
    const team = await createTeam(req.body);
    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
});

// PUT update a team (Protected)
router.put('/cricket/teams/:id', verifyAuth, requireAnyPermission(['teams', 'scorer']), async (req, res, next) => {
  try {
    const team = await updateTeam(req.params.id, req.body);
    res.json(team);
  } catch (error) {
    next(error);
  }
});

// DELETE a team (Protected)
router.delete('/cricket/teams/:id', verifyAuth, requireAnyPermission(['teams']), async (req, res, next) => {
  try {
    const result = await deleteTeam(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET all cricket matches (Public for live scorecards)
router.get('/cricket/matches', async (req, res, next) => {
  try {
    const matches = await getAllMatches();
    res.json(matches);
  } catch (error) {
    next(error);
  }
});

// GET single cricket match by id (Public)
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

// POST create a new match (Protected)
router.post('/cricket/matches', verifyAuth, requireAnyPermission(['scorer', 'teams']), async (req, res, next) => {
  try {
    const created = await createMatch(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

// PUT update match (scores, live balls, status) (Protected)
router.put('/cricket/matches/:id', verifyAuth, requireAnyPermission(['scorer', 'teams']), async (req, res, next) => {
  try {
    let updated = await updateMatch(req.params.id, req.body);
    if (!updated) {
      updated = await createMatch({ ...req.body, id: req.params.id });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE a match (Protected)
router.delete('/cricket/matches/:id', verifyAuth, requireAnyPermission(['teams', 'scorer']), async (req, res, next) => {
  try {
    const result = await deleteMatch(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
