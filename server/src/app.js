import express    from 'express';
import cors       from 'cors';
import rateLimit  from 'express-rate-limit';
import path       from 'path';
import fs         from 'fs';
import { fileURLToPath } from 'url';

import settingsRoutes from './routes/settingsRoutes.js';
import heroRoutes     from './routes/heroRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js';
import chatRoutes     from './routes/chatRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Create Express app ─────────────────────────────────────────────────────
const app = express();

// ── Core middleware ────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*' }));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));
app.use(express.json());

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api', settingsRoutes);
app.use('/api', heroRoutes);
app.use('/api', incidentRoutes);
app.use('/api', chatRoutes);

// ── Serve React frontend in production ────────────────────────────────────
// Both frontend and backend are hosted together on one service (e.g. Render).
// In development, Vite's dev server handles the frontend separately.
const buildPath = path.resolve(__dirname, '../../dist');
if (process.env.NODE_ENV === 'production' || fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  // In Express 5, wildcard routing uses '{*splat}' instead of '*'
  app.get('{*splat}', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// ── Error handling (must be registered AFTER all routes) ──────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
