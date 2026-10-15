import express from 'express';
import {
  createHeroValidation,
  createHero,
  loginHero,
  updateUnitStatus,
} from '../controllers/heroController.js';

const router = express.Router();

// POST /api/heroes — register a new hero/responder
router.post('/heroes', createHeroValidation, createHero);

// POST /api/login — hero login (demo mode, no password check)
router.post('/login', loginHero);

// PATCH /api/units/:id/status — update a hero's status or isActive flag
router.patch('/units/:id/status', updateUnitStatus);

export default router;
