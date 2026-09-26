# SPIDERSENSE — Avengers Command Network

A real-time emergency detection, coordination and response network connecting citizens, command centers and responders. Built with a cinematic Marvel/Avengers-inspired visual identity.

## Architecture

```
src/
  context/
    StoreContext.jsx      — Centralized state (users, incidents, units)
    SocketContext.jsx     — Real-time transport wrapper
  components/
    MapView.jsx           — Live tactical map (react-leaflet)
    UnitCard.jsx          — Responder unit tile (telemetry, stats)
    IncidentForm.jsx      — Citizen threat reporting form
    DispatchPanel.jsx     — Iron Man-style holographic diagnostic dispatch
    AnalyticsChart.jsx    — Multi-dimensional operational intelligence
    Navigation.jsx        — Global command bar & auth status
  pages/
    Home.jsx              — Cinematic landing page / system overview
    Login.jsx             — Command access and role selection
    Dashboard.jsx         — Avengers Command Center
    ReporterView.jsx      — Citizen threat reporting interface
    ResponderView.jsx     — Field-unit high-impact console
    AnalyticsPage.jsx     — Doctor Strange-style analytical view
  styles/theme.css        — Design tokens, fonts, HUD effects
```

## Features
- **Avengers Command Center**: Full tactical oversight with live map, dispatch controls, responder roster, and system health.
- **Spider-Sense Alert System**: When critical incidents are detected, a signature Spider-Sense red pulse and screen-edge warning activates.
- **Role-based Authentication**: Roles for Dispatcher, Responder, and Citizen, plus a persistent Demo Mode.
- **Centralized State**: All actions (reporting, dispatching, arriving on scene) propagate globally in real time via React Context.
- **Cinematic Styling**: Dark backgrounds, glassmorphism panels, glowing tactical borders, and purposeful Framer Motion animations.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Deployment Prep
See `.env.example` for environment variable templates when connecting to a real backend.
`VITE_API_BASE_URL`
`VITE_SOCKET_URL`
`VITE_MAP_TILE_URL`
