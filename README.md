# SpiderSense

## Overview

**SpiderSense** is an autonomous emergency‑response platform that combines real‑time WebSocket communication with Generative AI to instantly dispatch the most suitable responders to an incident. The system eliminates the latency inherent in traditional dispatch workflows, delivering sub‑50 ms reaction times.

---

## Features

- **AI‑Powered Dispatch** – Google Gemini analyses each incident and recommends optimal units.
- **Instant Real‑Time Updates** – Socket.io broadcasts state changes to all clients.
- **Live Geospatial Map** – Leaflet visualises unit locations and incident markers.
- **Analytics Dashboard** – Recharts provides live metrics on incident severity, response times, and unit availability.
- **Rich UI/UX** – Framer Motion delivers smooth micro‑animations; Lucide‑React supplies modern icons.
- **Secure Backend** – Express, Mongoose, and MongoDB Atlas ensure data integrity.

---

## Technical Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Framer Motion, Lucide‑React, React‑Leaflet, Recharts |
| Backend  | Node.js, Express, Socket.io, Mongoose |
| Database | MongoDB Atlas |
| AI       | Google Gemini (generative‑ai SDK) |
| Dev Tools| ESLint, Prettier |

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/your-org/spidersense.git
cd spidersense

# Install dependencies
npm install

# Configure environment variables (copy from .env.example)
cp .env.example .env

# Run the development servers (frontend on 5173, backend on 4000)
npm run dev
```

The application will be available at **http://localhost:5173**.

---

## Usage Guide

1. **Report an Incident** – Citizens submit incident details via the reporting form.
2. **AI Dispatch** – The backend AI evaluates severity, location, and unit availability, then auto‑assigns responders.
3. **Command Center** – View live incident list, unit status, and analytics.
4. **Responder Terminal** – Field units receive mission details and can update their status.
