import { io, Socket } from 'socket.io-client';
import type { SystemStats } from '../types';

let socket: Socket | null = null;

export const initSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io({
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected');
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error.message);
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Stats
export const subscribeToStats = (callback: (stats: SystemStats) => void): (() => void) => {
  if (!socket) return () => {};

  socket.emit('stats:subscribe');
  socket.on('stats:update', callback);

  return () => {
    socket?.emit('stats:unsubscribe');
    socket?.off('stats:update', callback);
  };
};

export const requestStats = (): void => {
  socket?.emit('stats:request');
};

// Terminal
export const startTerminal = (options?: { cols?: number; rows?: number }): void => {
  socket?.emit('terminal:start', options);
};

export const sendTerminalData = (data: string): void => {
  socket?.emit('terminal:data', data);
};

export const resizeTerminal = (cols: number, rows: number): void => {
  socket?.emit('terminal:resize', { cols, rows });
};

export const stopTerminal = (): void => {
  socket?.emit('terminal:stop');
};

export const onTerminalData = (callback: (data: string) => void): (() => void) => {
  if (!socket) return () => {};

  socket.on('terminal:data', callback);
  return () => socket?.off('terminal:data', callback);
};

export const onTerminalReady = (callback: () => void): (() => void) => {
  if (!socket) return () => {};

  socket.on('terminal:ready', callback);
  return () => socket?.off('terminal:ready', callback);
};

export const onTerminalExit = (
  callback: (data: { exitCode: number; signal: number }) => void
): (() => void) => {
  if (!socket) return () => {};

  socket.on('terminal:exit', callback);
  return () => socket?.off('terminal:exit', callback);
};
