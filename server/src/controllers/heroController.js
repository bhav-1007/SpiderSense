import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { Hero } from '../models/index.js';

/**
 * createHero
 * POST /api/heroes
 * Body: { name, callSign, username, password, type, isActive? }
 * Creates a new hero/responder and broadcasts the update via Socket.io.
 */

// Validation rules — run these as middleware before the controller
export const createHeroValidation = [
  body('username').isString().notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').isString().notEmpty().withMessage('Name is required'),
  body('callSign').isString().notEmpty().withMessage('Call sign is required'),
];

export async function createHero(req, res) {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const draft = req.body;
    const hashedPassword = await bcrypt.hash(draft.password, 10);

    const newHero = new Hero({
      id:        `h-${Date.now()}`,
      name:      draft.name,
      callSign:  draft.callSign,
      username:  draft.username,
      password:  hashedPassword,
      type:      draft.type || 'tactical',
      avatarUrl: draft.avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(draft.callSign)}&background=1C4FA6&color=fff`,
      members:  1,
      battery:  100,
      status:   'available',
      isActive: draft.isActive !== undefined ? draft.isActive : true,
      location: { lat: 40.75, lng: -74.00 }, // Default NYC location
    });

    await newHero.save();
    const heroObj = newHero.toObject();

    req.app.locals.io.emit('unit:updated', heroObj);
    res.status(201).json(heroObj);
  } catch (err) {
    // Handle duplicate username/id (MongoDB unique index violation)
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    console.error('Error creating hero:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * loginHero
 * POST /api/login
 * Body: { id: string }
 * Demo login — finds hero by custom ID field (no password check, demo mode).
 *
 * NOTE: This is intentionally simplified for a demo/portfolio project.
 * In a production app you would verify the password with bcrypt.compare().
 */
export async function loginHero(req, res) {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Hero ID is required' });
    }

    // Find by the custom string `id` field, not MongoDB's `_id`
    const hero = await Hero.findOne({ id }).lean();
    if (!hero) {
      return res.status(404).json({ error: 'Hero not found' });
    }

    // Return the hero (excluding password)
    const { password: _pw, ...safeHero } = hero;
    res.json(safeHero);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * updateUnitStatus
 * PATCH /api/units/:id/status
 * Body: { status?, isActive? }
 * Updates a hero's operational status and/or active flag.
 */
export async function updateUnitStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, isActive } = req.body;

    // Build update object with only the fields that were provided
    const updateFields = {};
    if (status   !== undefined) updateFields.status   = status;
    if (isActive !== undefined) updateFields.isActive = isActive;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const unit = await Hero.findOneAndUpdate(
      { id },
      updateFields,
      { new: true }
    ).lean();

    if (!unit) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    req.app.locals.io.emit('unit:updated', unit);
    res.json(unit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
