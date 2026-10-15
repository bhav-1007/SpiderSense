import { Hero, Incident } from '../models/index.js';
import { suggestHeroesForIncident } from '../services/assignmentAI.js';

/**
 * createIncident
 * POST /api/incidents
 * Body: { title, type, severity, location, reporter? }
 * Creates a new incident, optionally calls AI for auto-dispatch,
 * and broadcasts the result to all connected clients.
 */
export async function createIncident(req, res) {
  try {
    const draft = req.body;

    // Basic validation
    if (!draft.title || !draft.severity || !draft.location) {
      return res.status(400).json({ error: 'title, severity, and location are required' });
    }

    const newIncData = {
      id:               `inc-${Date.now()}`,
      code:             `SENS-${Math.floor(Math.random() * 9000) + 1000}`,
      status:           'unassigned',
      assignedUnitIds:  [],
      suggestedUnitIds: [],
      aiReasoning:      null,
      assignmentSource: null,
      reportedAt:       new Date(),
      updatedAt:        new Date(),
      reporter:         draft.reporter || 'Citizen App',
      title:            draft.title,
      type:             draft.type,
      severity:         draft.severity,
      location:         draft.location,
    };

    const newInc = new Incident(newIncData);
    await newInc.save();
    let incObj = newInc.toObject();

    // ── AI Auto-Dispatch ───────────────────────────────────────────────────
    if (req.app.locals.aiAutoDispatchEnabled) {
      const availableHeroes = await Hero.find({
        status: 'available',
        isActive: { $ne: false },
      }).lean();

      const aiSuggestion = await suggestHeroesForIncident(incObj, availableHeroes);

      if (aiSuggestion) {
        newInc.suggestedUnitIds = aiSuggestion.recommendedUnitIds;
        newInc.aiReasoning      = aiSuggestion.reasoning;
        newInc.assignedUnitIds  = aiSuggestion.recommendedUnitIds;
        newInc.status           = 'dispatched';
        newInc.assignmentSource = 'ai-auto';
        newInc.updatedAt        = new Date();
        await newInc.save();
        incObj = newInc.toObject();

        await Hero.updateMany(
          { id: { $in: aiSuggestion.recommendedUnitIds } },
          { status: 'dispatched' }
        );
      }
    }

    const io = req.app.locals.io;
    io.emit('incident:created', incObj);

    // Full state sync so all clients stay consistent after dispatch
    if (incObj.status === 'dispatched') {
      const [updatedIncidents, updatedUnits] = await Promise.all([
        Incident.find().sort({ reportedAt: -1 }).lean(),
        Hero.find().lean(),
      ]);
      io.emit('sync:state', { incidents: updatedIncidents, units: updatedUnits });
    }

    res.status(201).json(incObj);
  } catch (err) {
    console.error('Error saving incident:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * updateIncidentStatus
 * PATCH /api/incidents/:id/status
 * Body: { status }
 */
export async function updateIncidentStatus(req, res) {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status field is required' });
    }

    const inc = await Incident.findOneAndUpdate(
      { id },
      { status, updatedAt: new Date() },
      { new: true }
    ).lean();

    if (!inc) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    req.app.locals.io.emit('incident:updated', inc);
    res.json(inc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * assignUnits
 * PATCH /api/incidents/:id/assign
 * Body: { unitIds: string[], overriddenByCommander?: boolean }
 * Assigns or re-assigns hero units to an incident.
 * Also frees any heroes that were previously assigned but are no longer.
 */
export async function assignUnits(req, res) {
  try {
    const { id }                               = req.params;
    const { unitIds = [], overriddenByCommander } = req.body;

    const existingInc = await Incident.findOne({ id }).lean();
    if (!existingInc) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    // Determine which heroes were freed (were assigned before, not anymore)
    const oldUnitIds  = existingInc.assignedUnitIds || [];
    const freedUnitIds = oldUnitIds.filter((oldId) => !unitIds.includes(oldId));

    const assignmentSource = overriddenByCommander ? 'commander-override' : 'manual';

    const inc = await Incident.findOneAndUpdate(
      { id },
      {
        assignedUnitIds:  unitIds,
        status:           unitIds.length > 0 ? 'dispatched' : 'unassigned',
        assignmentSource,
        updatedAt:        new Date(),
      },
      { new: true }
    ).lean();

    if (!inc) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    // Update status of assigned and freed heroes
    const updatePromises = [];
    if (unitIds.length > 0) {
      updatePromises.push(
        Hero.updateMany({ id: { $in: unitIds } }, { status: 'dispatched' })
      );
    }
    if (freedUnitIds.length > 0) {
      updatePromises.push(
        Hero.updateMany({ id: { $in: freedUnitIds } }, { status: 'available' })
      );
    }
    await Promise.all(updatePromises);

    // Broadcast full state sync
    const [updatedIncidents, updatedUnits] = await Promise.all([
      Incident.find().sort({ reportedAt: -1 }).lean(),
      Hero.find().lean(),
    ]);
    req.app.locals.io.emit('sync:state', { incidents: updatedIncidents, units: updatedUnits });

    res.json(inc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
