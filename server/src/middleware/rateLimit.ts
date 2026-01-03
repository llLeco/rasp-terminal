import rateLimit from 'express-rate-limit';
import { config } from '../config.js';

export const loginRateLimiter = rateLimit({
  windowMs: config.loginRateLimitWindowMs,
  max: config.loginRateLimitMax,
  message: {
    error: 'Too many login attempts. Please try again later.',
    retryAfter: Math.ceil(config.loginRateLimitWindowMs / 1000 / 60),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
