import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Authentication
  accessPassword: process.env.ACCESS_PASSWORD || 'changeme',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiration: parseInt(process.env.JWT_EXPIRATION || '86400', 10),

  // Rate limiting
  loginRateLimitWindowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || '900000', 10),
  loginRateLimitMax: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '5', 10),

  // Stats
  statsInterval: parseInt(process.env.STATS_INTERVAL || '5000', 10),
  statsRetentionDays: parseInt(process.env.STATS_RETENTION_DAYS || '30', 10),

  // Terminal
  terminalShell: process.env.TERMINAL_SHELL || '/bin/bash',

  // CORS
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  // Database
  dbPath: path.resolve(__dirname, '../data/stats.db'),
};
