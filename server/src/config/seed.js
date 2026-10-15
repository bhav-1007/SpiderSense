import { Hero, Incident } from '../models/index.js';

// ── Seed data ──────────────────────────────────────────────────────────────
const INITIAL_HEROES = [
  { id: 'h-1', name: 'Peter Parker',     username: 'spidey',   password: 'password', callSign: 'Spider-Man',     avatarUrl: 'https://ui-avatars.com/api/?name=Spider+Man&background=E63C2F&color=fff',      type: 'tactical', members: 1, battery: 98,  status: 'available', isActive: true, location: { lat: 40.7128, lng: -74.006 } },
  { id: 'h-2', name: 'Tony Stark',       username: 'ironman',  password: 'password', callSign: 'Iron Man',       avatarUrl: 'https://ui-avatars.com/api/?name=Iron+Man&background=F07B1D&color=fff',        type: 'air',      members: 1, battery: 100, status: 'available', isActive: true, location: { lat: 40.72,   lng: -73.99  } },
  { id: 'h-3', name: 'Steve Rogers',     username: 'cap',      password: 'password', callSign: 'Captain America', avatarUrl: 'https://ui-avatars.com/api/?name=Captain+America&background=1C4FA6&color=fff',  type: 'tactical', members: 4, battery: 100, status: 'available', isActive: true, location: { lat: 40.73,   lng: -74.01  } },
  { id: 'h-4', name: 'Natasha Romanoff', username: 'widow',    password: 'password', callSign: 'Black Widow',    avatarUrl: 'https://ui-avatars.com/api/?name=Black+Widow&background=6B6259&color=fff',     type: 'tactical', members: 2, battery: 95,  status: 'available', isActive: true, location: { lat: 40.71,   lng: -74.02  } },
  { id: 'h-5', name: 'Thor Odinson',     username: 'thor',     password: 'password', callSign: 'Thor',           avatarUrl: 'https://ui-avatars.com/api/?name=Thor&background=2AA8D8&color=fff',            type: 'air',      members: 1, battery: 100, status: 'available', isActive: true, location: { lat: 40.74,   lng: -73.98  } },
  { id: 'h-6', name: 'Bruce Banner',     username: 'hulk',     password: 'password', callSign: 'Hulk',           avatarUrl: 'https://ui-avatars.com/api/?name=Hulk&background=2E9E4F&color=fff',            type: 'hazmat',   members: 1, battery: 100, status: 'available', isActive: true, location: { lat: 40.70,   lng: -74.01  } },
  { id: 'h-7', name: 'Clint Barton',     username: 'hawkeye',  password: 'password', callSign: 'Hawkeye',        avatarUrl: 'https://ui-avatars.com/api/?name=Hawkeye&background=8C5CD6&color=fff',         type: 'tactical', members: 1, battery: 92,  status: 'available', isActive: true, location: { lat: 40.75,   lng: -74.00  } },
  { id: 'h-8', name: 'Stephen Strange',  username: 'strange',  password: 'password', callSign: 'Doctor Strange',  avatarUrl: 'https://ui-avatars.com/api/?name=Doctor+Strange&background=FFCF5C&color=fff', type: 'medical',  members: 1, battery: 100, status: 'available', isActive: true, location: { lat: 40.72,   lng: -74.00  } },
  { id: 'h-9', name: 'TChalla',          username: 'panther',  password: 'password', callSign: 'Black Panther',  avatarUrl: 'https://ui-avatars.com/api/?name=Black+Panther&background=05070A&color=fff',   type: 'tactical', members: 3, battery: 99,  status: 'available', isActive: true, location: { lat: 40.76,   lng: -73.99  } },
];

const INITIAL_INCIDENTS = [
  {
    id: 'inc-1001', code: 'SENS-1001', title: 'Chitauri Tech Smuggling',
    type: 'security', severity: 'critical', status: 'dispatched',
    assignedUnitIds: ['h-1'],
    location: { lat: 40.715, lng: -74.01, label: 'Sector Alpha' },
    reportedAt: new Date(Date.now() - 1000 * 60 * 5),
    updatedAt: new Date(),
    reporter: 'Citizen App',
  },
  {
    id: 'inc-1002', code: 'SENS-1002', title: 'Stark Tower Breach Attempt',
    type: 'security', severity: 'high', status: 'unassigned',
    assignedUnitIds: [],
    location: { lat: 40.75, lng: -73.97, label: 'Midtown' },
    reportedAt: new Date(Date.now() - 1000 * 60 * 15),
    updatedAt: new Date(),
    reporter: 'JARVIS',
  },
  {
    id: 'inc-1003', code: 'SENS-1003', title: 'Bridge Collapse',
    type: 'rescue', severity: 'critical', status: 'on-scene',
    assignedUnitIds: ['h-6', 'h-2'],
    location: { lat: 40.705, lng: -73.99, label: 'Brooklyn Bridge' },
    reportedAt: new Date(Date.now() - 1000 * 60 * 45),
    updatedAt: new Date(),
    reporter: 'Drone Patrol',
  },
];

/**
 * seedData — inserts default Heroes and Incidents if the collections are empty.
 * Runs once after MongoDB connects.
 */
export async function seedData() {
  const heroCount = await Hero.countDocuments();
  if (heroCount === 0) {
    console.log('🌱  Seeding Heroes...');
    await Hero.insertMany(INITIAL_HEROES);
  }

  const incidentCount = await Incident.countDocuments();
  if (incidentCount === 0) {
    console.log('🌱  Seeding Incidents...');
    await Incident.insertMany(INITIAL_INCIDENTS);
  }
}
