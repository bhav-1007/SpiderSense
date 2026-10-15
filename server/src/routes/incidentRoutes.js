import express from 'express';
import {
  createIncident,
  updateIncidentStatus,
  assignUnits,
} from '../controllers/incidentController.js';

const router = express.Router();

// POST /api/incidents — report a new incident (triggers AI auto-dispatch if enabled)
router.post('/incidents', createIncident);

// PATCH /api/incidents/:id/status — update the status of an incident
router.patch('/incidents/:id/status', updateIncidentStatus);

// PATCH /api/incidents/:id/assign — assign/reassign hero units to an incident
router.patch('/incidents/:id/assign', assignUnits);

export default router;
