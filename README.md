# 🕷️ SpiderSense: Avengers Emergency Response Network

> **"There was an idea... to bring together a group of remarkable people, to see if they could become something more."**

SpiderSense is a cutting-edge, real-time emergency dispatch and tactical operations platform built for the Marvel Universe. It acts as a central command system where citizens can report crises, commanders can monitor global threats, and superheroes can receive intelligent, AI-driven dispatch orders.

---

## ✨ Core Features

### 📡 1. Real-Time Operations (WebSockets)
Built entirely on `Socket.io`, SpiderSense operates in true real-time. When a citizen reports a fire, the Commander's map pings instantly, and the assigned Hero's dashboard flashes with their new mission—no page reloads required.

### 🧠 2. AI Auto-Dispatch Engine
Why manually assign heroes when you have AI? Powered by **Google Gemini**, the Auto-Dispatch engine analyzes every incoming incident (type, severity, and exact map coordinates) and cross-references it with available heroes (battery level, specialty, and distance). It then calculates the optimal response unit and dispatches them automatically.
* **Graceful Fallback:** Built-in Mock Mode ensures the system never crashes during a demo, even if API keys expire or rate limits are hit.

### 🤖 3. J.A.R.V.I.S. Tactical Chatbot
A fully integrated, context-aware AI assistant floating right in the dashboard. J.A.R.V.I.S. doesn't just chat; he reads the **live database**. Ask him *"How many critical fires are active?"* or *"Who is available to fight Venom?"* and he will answer using live MongoDB data.

### 🎭 4. Three Distinct User Roles
* **Citizens:** A clean, panic-free interface to drop a pin on a map and report emergencies (Fire, Villain Attack, Medical, etc.).
* **Commanders:** A high-tech, Nick Fury-style briefing room with live analytics charts, global map tracking, and manual override capabilities.
* **Heroes:** A focused tactical readout where heroes (Spider-Man, Iron Man) can accept missions and update their live status (En-route, On-scene, Resolved).

### 🎨 5. Holographic Dark Aesthetic
Designed strictly following a premium design system, the interface uses heavy glassmorphism, deep dark modes, `lucide-react` iconography, and ultra-smooth `framer-motion` micro-animations to feel like a multi-million dollar Stark Industries operating system.

### 🚀 6. Unified Single-Service Deployment
Configured for hackathons and free-tier hosting (like Render). The Express backend automatically serves the compiled Vite React frontend, allowing the entire full-stack application to run on a single web service without sleeping asynchronously.

---

## 🛠️ Tech Stack

* **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, React-Leaflet (Maps), Recharts (Analytics).
* **Backend:** Node.js, Express, Socket.io.
* **Database:** MongoDB Atlas (Mongoose).
* **AI Integration:** Google Gemini SDK (`@google/generative-ai` using `gemini-3.8-flash`).

---

## 🚀 How to Run Locally

### 1. Install Dependencies
This project uses a unified package setup. Run this in the root directory to install both frontend and backend dependencies:
```bash
npm install
cd server && npm install
cd ..
```

### 2. Environment Variables
Create a `.env` file inside the `/server` folder and add the following:
```env
ATLAS_URL=your_mongodb_connection_string
SESSION_SECRET=your_random_secret_string
GEMINI_API_KEY=your_google_ai_studio_key
```

### 3. Start the Application
To run the full-stack app locally for development:
```bash
# Terminal 1 (Frontend)
npm run dev

# Terminal 2 (Backend)
cd server
node index.js
```

---

## 📦 Deployment Guide (Render)

SpiderSense is specifically configured for easy 1-click deployment on platforms like Render.
1. Create a **New Web Service** and connect this GitHub repo.
2. **Root Directory:** Leave blank.
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `npm start`
5. **Environment Variables:** Add `ATLAS_URL`, `SESSION_SECRET`, and `GEMINI_API_KEY`.
6. Deploy! The Node backend will automatically host the React app on the same port.

---
*Built with ❤️ (and AI) for the Hackathon.*
