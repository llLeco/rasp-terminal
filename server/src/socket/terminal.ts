import { Socket } from 'socket.io';
import {
  createTerminal,
  writeTerminal,
  resizeTerminal,
  killTerminal,
  getTerminal,
} from '../services/terminal.js';

export const setupTerminalHandlers = (socket: Socket): void => {
  const sessionId = socket.id;

  socket.on('terminal:start', (options?: { cols?: number; rows?: number }) => {
    const cols = options?.cols || 80;
    const rows = options?.rows || 24;

    const session = createTerminal(sessionId, cols, rows);

    // Forward PTY output to client
    session.pty.onData((data: string) => {
      socket.emit('terminal:data', data);
    });

    // Handle PTY exit
    session.pty.onExit(({ exitCode, signal }) => {
      socket.emit('terminal:exit', { exitCode, signal });
      console.log(`[Terminal] Session ${sessionId} exited (code: ${exitCode}, signal: ${signal})`);
    });

    socket.emit('terminal:ready');
    console.log(`[Terminal] Started for socket: ${sessionId}`);
  });

  socket.on('terminal:data', (data: string) => {
    writeTerminal(sessionId, data);
  });

  socket.on('terminal:resize', (size: { cols: number; rows: number }) => {
    if (size.cols > 0 && size.rows > 0) {
      resizeTerminal(sessionId, size.cols, size.rows);
    }
  });

  socket.on('terminal:stop', () => {
    killTerminal(sessionId);
    socket.emit('terminal:stopped');
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    const session = getTerminal(sessionId);
    if (session) {
      killTerminal(sessionId);
    }
  });
};
