import { Hero, Incident } from '../models/index.js';

/**
 * getState
 * GET /api/state
 * Returns all incidents (newest first) and all hero units.
 */
export async function getState(req, res) {
  try {
    const incidents = await Incident.find().sort({ reportedAt: -1 }).lean();
    const units     = await Hero.find().lean();
    res.json({ incidents, units });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * getSettings
 * GET /api/settings
 * Returns current application-level settings (AI auto-dispatch toggle).
 */
export function getSettings(req, res) {
  // req.app.locals.aiAutoDispatchEnabled is set in app.js
  res.json({ aiAutoDispatchEnabled: req.app.locals.aiAutoDispatchEnabled });
}

/**
 * updateAiAutoDispatch
 * PATCH /api/settings/ai-auto-dispatch
 * Body: { enabled: boolean }
 * Toggles the AI auto-dispatch flag and broadcasts the change via Socket.io.
 */
export function updateAiAutoDispatch(req, res) {
  const io = req.app.locals.io;
  req.app.locals.aiAutoDispatchEnabled = !!req.body.enabled;

  io.emit('settings:ai-auto-dispatch', {
    enabled: req.app.locals.aiAutoDispatchEnabled,
  });

  res.json({ enabled: req.app.locals.aiAutoDispatchEnabled });
}
