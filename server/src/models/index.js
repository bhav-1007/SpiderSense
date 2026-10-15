import mongoose from 'mongoose';

// ── Sub-schema: reusable lat/lng/label object ──────────────────────────────
const locationSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    label: String,
  },
  { _id: false }
);

// ── Hero (Responder Unit) ──────────────────────────────────────────────────
const heroSchema = new mongoose.Schema({
  id:        { type: String, required: true, unique: true },
  name:      { type: String, required: true },
  callSign:  { type: String, required: true },
  username:  { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  avatarUrl: String,
  type: {
    type: String,
    enum: ['fire', 'medical', 'hazmat', 'tactical', 'air'],
    required: true,
  },
  members:  Number,
  battery:  Number,
  status: {
    type: String,
    enum: ['available', 'dispatched', 'en-route', 'on-scene', 'offline'],
    default: 'available',
  },
  isActive: { type: Boolean, default: true },
  location: locationSchema,
});

// ── Incident ───────────────────────────────────────────────────────────────
const incidentSchema = new mongoose.Schema({
  id:       { type: String, required: true, unique: true },
  code:     String,
  title:    { type: String, required: true },
  type:     String,
  severity: {
    type: String,
    enum: ['critical', 'high', 'moderate', 'low'],
    required: true,
  },
  status: {
    type: String,
    enum: ['unassigned', 'dispatched', 'en-route', 'on-scene', 'resolved'],
    default: 'unassigned',
  },
  assignedUnitIds:  { type: [String], default: [] },
  suggestedUnitIds: { type: [String], default: [] },
  aiReasoning:      String,
  assignmentSource: {
    type: String,
    enum: ['ai-auto', 'commander-override', 'manual', null],
    default: null,
  },
  location:   { type: locationSchema, required: true },
  reportedAt: { type: Date, default: Date.now },
  updatedAt:  { type: Date, default: Date.now },
  reporter:   String,
});

export const Hero     = mongoose.model('Hero', heroSchema);
export const Incident = mongoose.model('Incident', incidentSchema);
