import * as pty from 'node-pty';
import { config } from '../config.js';

export interface TerminalSession {
  id: string;
  pty: pty.IPty;
  createdAt: number;
}

const sessions = new Map<string, TerminalSession>();

export const createTerminal = (
  sessionId: string,
  cols = 80,
  rows = 24
): TerminalSession => {
  // Kill existing session if present
  if (sessions.has(sessionId)) {
    killTerminal(sessionId);
  }

  const shell = config.terminalShell;
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-256color',
    cols,
    rows,
    cwd: process.env.HOME || '/home',
    env: {
      ...process.env,
      TERM: 'xterm-256color',
      COLORTERM: 'truecolor',
    },
  });

  const session: TerminalSession = {
    id: sessionId,
    pty: ptyProcess,
    createdAt: Date.now(),
  };

  sessions.set(sessionId, session);
  console.log(`[Terminal] Created session: ${sessionId}`);

  return session;
};

export const getTerminal = (sessionId: string): TerminalSession | undefined => {
  return sessions.get(sessionId);
};

export const writeTerminal = (sessionId: string, data: string): boolean => {
  const session = sessions.get(sessionId);
  if (session) {
    session.pty.write(data);
    return true;
  }
  return false;
};

export const resizeTerminal = (
  sessionId: string,
  cols: number,
  rows: number
): boolean => {
  const session = sessions.get(sessionId);
  if (session) {
    session.pty.resize(cols, rows);
    return true;
  }
  return false;
};

export const killTerminal = (sessionId: string): boolean => {
  const session = sessions.get(sessionId);
  if (session) {
    session.pty.kill();
    sessions.delete(sessionId);
    console.log(`[Terminal] Killed session: ${sessionId}`);
    return true;
  }
  return false;
};

export const getActiveSessions = (): string[] => {
  return Array.from(sessions.keys());
};

// Cleanup stale sessions (older than 1 hour with no activity)
export const cleanupStaleSessions = (): void => {
  const staleThreshold = 60 * 60 * 1000; // 1 hour
  const now = Date.now();

  sessions.forEach((session, id) => {
    if (now - session.createdAt > staleThreshold) {
      killTerminal(id);
      console.log(`[Terminal] Cleaned up stale session: ${id}`);
    }
  });
};

// Run cleanup every 30 minutes
setInterval(cleanupStaleSessions, 30 * 60 * 1000);
