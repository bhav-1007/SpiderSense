import 'dotenv/config';
import { createServer } from 'http';
import { Server }       from 'socket.io';
import app              from './app.js';
import { connectDB }    from './config/db.js';
import { seedData }     from './config/seed.js';

const PORT = process.env.PORT || 4000;

// ── HTTP + Socket.io setup ─────────────────────────────────────────────────
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_ORIGIN || '*' },
});

// Share the io instance and global settings flag with all controllers
// via app.locals so there's no need for module-level globals.
app.locals.io                    = io;
app.locals.aiAutoDispatchEnabled = true;

// ── Socket.io connection logging ───────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌  Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔌  Client disconnected: ${socket.id}`);
  });
});

// ── Boot sequence ──────────────────────────────────────────────────────────
(async () => {
  try {
    await connectDB();
    await seedData();

    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀  SpiderSense server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌  Failed to start server:', err);
    process.exit(1);
  }
})();
