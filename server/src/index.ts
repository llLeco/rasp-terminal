import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { config } from './config.js';
import { authRouter } from './routes/auth.js';
import { statsRouter } from './routes/stats.js';
import { actionsRouter } from './routes/actions.js';
import { scriptsRouter } from './routes/scripts.js';
import { setupSocketHandlers } from './socket/index.js';
import { initDatabase } from './services/database.js';
import { startStatsCollection } from './services/stats.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: config.nodeEnv === 'production' ? undefined : config.clientUrl,
    credentials: true,
  },
});

// Middleware
if (config.nodeEnv !== 'production') {
  app.use(cors({
    origin: config.clientUrl,
    credentials: true,
  }));
}
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/stats', statsRouter);
app.use('/api/actions', actionsRouter);
app.use('/api/scripts', scriptsRouter);

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (config.nodeEnv === 'production') {
  const publicPath = path.resolve(__dirname, '../public');
  app.use(express.static(publicPath));

  // Handle client-side routing
  app.get('*', (_, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// Initialize database
initDatabase();

// Setup WebSocket handlers
setupSocketHandlers(io);

// Start stats collection
startStatsCollection(io);

// Start server
httpServer.listen(config.port, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║          RASPTERMINAL SERVER v1.0            ║
╠══════════════════════════════════════════════╣
║  Status: ONLINE                              ║
║  Port: ${config.port.toString().padEnd(38)}║
║  Environment: ${config.nodeEnv.padEnd(30)}║
╚══════════════════════════════════════════════╝
  `);
});

export { io };
