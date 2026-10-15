import express from 'express';
import { getState, getSettings, updateAiAutoDispatch } from '../controllers/settingsController.js';

const router = express.Router();

// GET /api/state — returns all incidents and units
router.get('/state', getState);

// GET /api/settings — returns current app settings
router.get('/settings', getSettings);

// PATCH /api/settings/ai-auto-dispatch — toggle AI auto-dispatch
router.patch('/settings/ai-auto-dispatch', updateAiAutoDispatch);

export default router;
