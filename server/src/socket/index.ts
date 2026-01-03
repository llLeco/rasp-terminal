import { Server, Socket } from 'socket.io';
import { verifySocketToken } from '../middleware/auth.js';
import { setupTerminalHandlers } from './terminal.js';
import { setupStatsHandlers } from './stats.js';

export const setupSocketHandlers = (io: Server): void => {
  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token || typeof token !== 'string') {
      return next(new Error('Authentication required'));
    }

    if (!verifySocketToken(token)) {
      return next(new Error('Invalid token'));
    }

    next();
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Setup handlers
    setupTerminalHandlers(socket);
    setupStatsHandlers(socket);

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Client disconnected: ${socket.id} (${reason})`);
    });

    socket.on('error', (error) => {
      console.error(`[Socket] Error for ${socket.id}:`, error);
    });
  });

  console.log('[Socket] WebSocket handlers initialized');
};
