import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});

// MongoDB Connection
const atlasUrl = process.env.ATLAS_URL;
if (!atlasUrl) {
  console.error("Missing ATLAS_URL in environment variables!");
  process.exit(1);
}



// Schemas
const locationSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  label: String
}, { _id: false });

const heroSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  callSign: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatarUrl: String,
  type: { type: String, enum: ['fire', 'medical', 'hazmat', 'tactical', 'air'], required: true },
  members: Number,
  battery: Number,
  status: { type: String, enum: ['available', 'dispatched', 'en-route', 'on-scene', 'offline'], default: 'available' },
  isActive: { type: Boolean, default: true },
  location: locationSchema
});

const incidentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  code: String,
  title: { type: String, required: true },
  type: String,
  severity: { type: String, enum: ['critical', 'high', 'moderate', 'low'], required: true },
  status: { type: String, enum: ['unassigned', 'dispatched', 'en-route', 'on-scene', 'resolved'], default: 'unassigned' },
  assignedUnitIds: [String],
  suggestedUnitIds: [String],
  aiReasoning: String,
  assignmentSource: { type: String, enum: ['ai-auto', 'commander-override', 'manual', null], default: null },
  location: { type: locationSchema, required: true },
  reportedAt: Date,
  updatedAt: Date,
  reporter: String
});

const Hero = mongoose.model('Hero', heroSchema);
const Incident = mongoose.model('Incident', incidentSchema);

// Initial Seed Data
const INITIAL_HEROES = [
  { id: 'h-1', name: 'Peter Parker', username: 'spidey', password: 'password', callSign: 'Spider-Man', avatarUrl: 'https://ui-avatars.com/api/?name=Spider+Man&background=E63C2F&color=fff', type: 'tactical', members: 1, battery: 98, status: 'available', isActive: true, location: { lat: 40.7128, lng: -74.006 } },
  { id: 'h-2', name: 'Tony Stark', username: 'ironman', password: 'password', callSign: 'Iron Man', avatarUrl: 'https://ui-avatars.com/api/?name=Iron+Man&background=F07B1D&color=fff', type: 'air', members: 1, battery: 100, status: 'available', isActive: true, location: { lat: 40.72, lng: -73.99 } },
  { id: 'h-3', name: 'Steve Rogers', username: 'cap', password: 'password', callSign: 'Captain America', avatarUrl: 'https://ui-avatars.com/api/?name=Captain+America&background=1C4FA6&color=fff', type: 'tactical', members: 4, battery: 100, status: 'available', isActive: true, location: { lat: 40.73, lng: -74.01 } },
  { id: 'h-4', name: 'Natasha Romanoff', username: 'widow', password: 'password', callSign: 'Black Widow', avatarUrl: 'https://ui-avatars.com/api/?name=Black+Widow&background=6B6259&color=fff', type: 'tactical', members: 2, battery: 95, status: 'available', isActive: true, location: { lat: 40.71, lng: -74.02 } },
  { id: 'h-5', name: 'Thor Odinson', username: 'thor', password: 'password', callSign: 'Thor', avatarUrl: 'https://ui-avatars.com/api/?name=Thor&background=2AA8D8&color=fff', type: 'air', members: 1, battery: 100, status: 'available', isActive: true, location: { lat: 40.74, lng: -73.98 } },
  { id: 'h-6', name: 'Bruce Banner', username: 'hulk', password: 'password', callSign: 'Hulk', avatarUrl: 'https://ui-avatars.com/api/?name=Hulk&background=2E9E4F&color=fff', type: 'hazmat', members: 1, battery: 100, status: 'available', isActive: true, location: { lat: 40.70, lng: -74.01 } },
  { id: 'h-7', name: 'Clint Barton', username: 'hawkeye', password: 'password', callSign: 'Hawkeye', avatarUrl: 'https://ui-avatars.com/api/?name=Hawkeye&background=8C5CD6&color=fff', type: 'tactical', members: 1, battery: 92, status: 'available', isActive: true, location: { lat: 40.75, lng: -74.00 } },
  { id: 'h-8', name: 'Stephen Strange', username: 'strange', password: 'password', callSign: 'Doctor Strange', avatarUrl: 'https://ui-avatars.com/api/?name=Doctor+Strange&background=FFCF5C&color=fff', type: 'medical', members: 1, battery: 100, status: 'available', isActive: true, location: { lat: 40.72, lng: -74.00 } },
  { id: 'h-9', name: 'TChalla', username: 'panther', password: 'password', callSign: 'Black Panther', avatarUrl: 'https://ui-avatars.com/api/?name=Black+Panther&background=05070A&color=fff', type: 'tactical', members: 3, battery: 99, status: 'available', isActive: true, location: { lat: 40.76, lng: -73.99 } }
];

const INITIAL_INCIDENTS = [
  { id: 'inc-1001', code: 'SENS-1001', title: 'Chitauri Tech Smuggling', type: 'security', severity: 'critical', status: 'dispatched', assignedUnitIds: ['h-1'], location: { lat: 40.715, lng: -74.01, label: 'Sector Alpha' }, reportedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), updatedAt: new Date().toISOString(), reporter: 'Citizen App' },
  { id: 'inc-1002', code: 'SENS-1002', title: 'Stark Tower Breach Attempt', type: 'security', severity: 'high', status: 'unassigned', assignedUnitIds: [], location: { lat: 40.75, lng: -73.97, label: 'Midtown' }, reportedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), updatedAt: new Date().toISOString(), reporter: 'JARVIS' },
  { id: 'inc-1003', code: 'SENS-1003', title: 'Bridge Collapse', type: 'rescue', severity: 'critical', status: 'on-scene', assignedUnitIds: ['h-6', 'h-2'], location: { lat: 40.705, lng: -73.99, label: 'Brooklyn Bridge' }, reportedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), updatedAt: new Date().toISOString(), reporter: 'Drone Patrol' },
];

async function seedData() {
  const heroCount = await Hero.countDocuments();
  if (heroCount === 0) {
    console.log('Seeding Heroes...');
    await Hero.insertMany(INITIAL_HEROES);
  }
  
  const incidentCount = await Incident.countDocuments();
  if (incidentCount === 0) {
    console.log('Seeding Incidents...');
    await Incident.insertMany(INITIAL_INCIDENTS);
  }
}

let globalAiAutoDispatchEnabled = true;

// ======================= REST APIs =======================

app.patch('/api/settings/ai-auto-dispatch', (req, res) => {
  globalAiAutoDispatchEnabled = !!req.body.enabled;
  io.emit('settings:ai-auto-dispatch', { enabled: globalAiAutoDispatchEnabled });
  res.json({ enabled: globalAiAutoDispatchEnabled });
});

app.get('/api/settings', (req, res) => {
  res.json({ aiAutoDispatchEnabled: globalAiAutoDispatchEnabled });
});

// 1. Get initial state (Incidents and Heroes)
app.get('/api/state', async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ reportedAt: -1 }).lean();
    const units = await Hero.find().lean();
    res.json({ incidents, units });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1.5 Create a new Hero
app.post('/api/heroes', async (req, res) => {
  try {
    const draft = req.body;
    const newHero = new Hero({
      id: `h-${Date.now()}`,
      name: draft.name,
      callSign: draft.callSign,
      username: draft.username,
      password: draft.password,
      type: draft.type || 'tactical',
      avatarUrl: draft.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(draft.callSign)}&background=1C4FA6&color=fff`,
      members: 1,
      battery: 100,
      status: 'available',
      isActive: draft.isActive !== undefined ? draft.isActive : true,
      location: { lat: 40.75, lng: -74.00 } // Default location
    });
    await newHero.save();
    const heroObj = newHero.toObject();
    io.emit('unit:updated', heroObj);
    res.status(201).json(heroObj);
  } catch (err) {
    console.error('Error creating hero:', err);
    res.status(500).json({ error: err.message });
  }
});

// 1.6 Login Hero
app.post('/api/login', async (req, res) => {
  try {
    const { id } = req.body;
    // Hackathon demo mode: Bypass password check entirely, just look up the unit by ID
    const hero = await Hero.findOne({ id, isActive: true }).lean();
    if (hero) {
      res.json(hero);
    } else {
      res.status(401).json({ error: 'Hero not found or is deactivated' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Report a new incident
import { suggestHeroesForIncident } from './assignmentAI.js';

app.post('/api/incidents', async (req, res) => {
  try {
    const draft = req.body;
    console.log('Received incident draft:', draft);
    
    let newIncData = {
      id: `inc-${Date.now()}`,
      code: `SENS-${Math.floor(Math.random() * 9000) + 1000}`,
      status: 'unassigned',
      assignedUnitIds: [],
      suggestedUnitIds: [],
      aiReasoning: null,
      assignmentSource: null,
      reportedAt: new Date(),
      updatedAt: new Date(),
      reporter: draft.reporter || 'Citizen App',
      title: draft.title,
      type: draft.type,
      severity: draft.severity,
      location: draft.location
    };
    
    const newInc = new Incident(newIncData);
    await newInc.save();
    let incObj = newInc.toObject();

    // Call AI in background if enabled, but await it before sending response?
    // User expects fast response. Wait prompt says "within a couple seconds". We'll await it.
    if (globalAiAutoDispatchEnabled) {
      const availableHeroes = await Hero.find({ status: 'available', isActive: { $ne: false } }).lean();
      const aiSuggestion = await suggestHeroesForIncident(incObj, availableHeroes);
      
      if (aiSuggestion) {
        newInc.suggestedUnitIds = aiSuggestion.recommendedUnitIds;
        newInc.aiReasoning = aiSuggestion.reasoning;
        newInc.assignedUnitIds = aiSuggestion.recommendedUnitIds;
        newInc.status = 'dispatched';
        newInc.assignmentSource = 'ai-auto';
        newInc.updatedAt = new Date();
        await newInc.save();
        incObj = newInc.toObject();
        
        await Hero.updateMany(
          { id: { $in: aiSuggestion.recommendedUnitIds } },
          { status: 'dispatched' }
        );
        
        const updatedUnits = await Hero.find().lean();
        io.emit('unit:updated_many', updatedUnits); // Or just sync:state later
      }
    }
    
    console.log('Incident saved successfully:', incObj.id);
    io.emit('incident:created', incObj);
    
    // If it dispatched, global re-sync to ensure everything is correct
    if (incObj.status === 'dispatched') {
      const updatedIncidents = await Incident.find().sort({ reportedAt: -1 }).lean();
      const updatedUnits = await Hero.find().lean();
      io.emit('sync:state', { incidents: updatedIncidents, units: updatedUnits });
    }
    
    res.status(201).json(incObj);
  } catch (err) {
    console.error('Error saving incident:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Update Incident Status
app.patch('/api/incidents/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const inc = await Incident.findOneAndUpdate(
      { id },
      { status, updatedAt: new Date() },
      { new: true }
    ).lean();
    
    if (inc) {
      io.emit('incident:updated', inc);
      res.json(inc);
    } else {
      res.status(404).json({ error: 'Incident not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Assign Units to Incident
app.patch('/api/incidents/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { unitIds, overriddenByCommander } = req.body;
    
    // Check if ALL requested units are actually available or already assigned to THIS incident
    const availableUnits = await Hero.find({ id: { $in: unitIds } }).lean();
    
    const existingInc = await Incident.findOne({ id }).lean();
    if (!existingInc) return res.status(404).json({ error: 'Incident not found' });
    
    // Find freed units
    const oldUnitIds = existingInc.assignedUnitIds || [];
    const freedUnitIds = oldUnitIds.filter(oldId => !unitIds.includes(oldId));
    
    const assignmentSource = overriddenByCommander ? 'commander-override' : 'manual';
    
    const inc = await Incident.findOneAndUpdate(
      { id },
      { assignedUnitIds: unitIds, status: unitIds.length > 0 ? 'dispatched' : 'unassigned', assignmentSource, updatedAt: new Date() },
      { new: true }
    ).lean();
    
    if (inc) {
      if (unitIds.length > 0) {
        await Hero.updateMany(
          { id: { $in: unitIds } },
          { status: 'dispatched' }
        );
      }
      if (freedUnitIds.length > 0) {
        await Hero.updateMany(
          { id: { $in: freedUnitIds }, status: 'dispatched' },
          { status: 'available' }
        );
      }
      
      const updatedIncidents = await Incident.find().sort({ reportedAt: -1 }).lean();
      const updatedUnits = await Hero.find().lean();
      
      io.emit('sync:state', { incidents: updatedIncidents, units: updatedUnits });
      res.json(inc);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Update Unit Status (e.g. Hero resolves or goes available, or activate/deactivate)
app.patch('/api/units/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isActive } = req.body;
    
    let updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (isActive !== undefined) updateFields.isActive = isActive;

    const unit = await Hero.findOneAndUpdate(
      { id },
      updateFields,
      { new: true }
    ).lean();
    
    if (unit) {
      io.emit('unit:updated', unit);
      res.json(unit);
    } else {
      res.status(404).json({ error: 'Unit not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// AI CHATBOT ROUTE
// =========================================================
import { generateChatResponse } from './chatAI.js';

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    // Fetch live system context for the AI
    const incidents = await Incident.find({ status: { $ne: 'resolved' } }).lean();
    const heroes = await Hero.find({}).lean();
    
    const contextData = { incidents, heroes };
    
    const aiResponse = await generateChatResponse(message, history || [], contextData);
    res.json({ response: aiResponse });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Chat service failed' });
  }
});

// =========================================================

// --- SERVE FRONTEND IN PRODUCTION ---
// This allows you to host both the backend and frontend on a single service (like Render)
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app build directory (../dist)
  const buildPath = path.join(__dirname, '../dist');
  app.use(express.static(buildPath));

  // The "catchall" handler: for any request that doesn't match an api route, 
  // send back React's index.html file.
  app.use((req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});

mongoose.connect(atlasUrl).then(async () => {
  console.log('Connected to MongoDB Atlas!');
  await seedData();
  
  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(`JARVIS Server online at port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB Atlas:', err);
});
