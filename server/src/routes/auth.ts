import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { loginRateLimiter } from '../middleware/rateLimit.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Store hashed password (generated on first run or from env)
let hashedPassword: string | null = null;

const initPassword = async (): Promise<void> => {
  if (!hashedPassword) {
    hashedPassword = await bcrypt.hash(config.accessPassword, 12);
  }
};

initPassword();

router.post('/login', loginRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { password } = req.body;

    if (!password) {
      res.status(400).json({ error: 'Password is required.' });
      return;
    }

    await initPassword();
    const isValid = await bcrypt.compare(password, hashedPassword!);

    if (!isValid) {
      res.status(401).json({ error: 'Invalid password.' });
      return;
    }

    const token = jwt.sign(
      { userId: 'admin', iat: Date.now() },
      config.jwtSecret,
      { expiresIn: config.jwtExpiration }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: config.jwtExpiration * 1000,
    });

    res.json({
      success: true,
      token,
      expiresIn: config.jwtExpiration,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/logout', (_req: Request, res: Response): void => {
  res.clearCookie('token');
  res.json({ success: true });
});

router.get('/verify', authMiddleware, (req: AuthRequest, res: Response): void => {
  res.json({ valid: true, userId: req.userId });
});

router.post('/change-password', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current and new password are required.' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters.' });
      return;
    }

    const isValid = await bcrypt.compare(currentPassword, hashedPassword!);
    if (!isValid) {
      res.status(401).json({ error: 'Current password is incorrect.' });
      return;
    }

    hashedPassword = await bcrypt.hash(newPassword, 12);
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export { router as authRouter };
