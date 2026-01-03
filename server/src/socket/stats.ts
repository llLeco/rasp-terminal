import { Socket } from 'socket.io';
import { getSystemStats } from '../services/stats.js';

export const setupStatsHandlers = (socket: Socket): void => {
  // Client can request immediate stats update
  socket.on('stats:request', async () => {
    try {
      const stats = await getSystemStats();
      socket.emit('stats:update', stats);
    } catch (error) {
      console.error('[Stats] Error on request:', error);
      socket.emit('stats:error', { message: 'Failed to get stats' });
    }
  });

  // Client subscribes to stats updates
  socket.on('stats:subscribe', () => {
    socket.join('stats-subscribers');
    console.log(`[Stats] Socket ${socket.id} subscribed to stats`);
  });

  socket.on('stats:unsubscribe', () => {
    socket.leave('stats-subscribers');
    console.log(`[Stats] Socket ${socket.id} unsubscribed from stats`);
  });
};
