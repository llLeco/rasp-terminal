import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { getSystemStats } from '../services/stats.js';
import { getStatsHistory } from '../services/database.js';

const router = Router();

router.use(authMiddleware);

router.get('/current', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await getSystemStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting current stats:', error);
    res.status(500).json({ error: 'Failed to get system stats' });
  }
});

router.get('/history/:hours', (req: AuthRequest, res: Response): void => {
  try {
    const hours = parseInt(req.params.hours, 10) || 24;
    const maxHours = 24 * 30; // Max 30 days

    if (hours < 1 || hours > maxHours) {
      res.status(400).json({ error: `Hours must be between 1 and ${maxHours}` });
      return;
    }

    const history = getStatsHistory(hours);
    res.json(history);
  } catch (error) {
    console.error('Error getting stats history:', error);
    res.status(500).json({ error: 'Failed to get stats history' });
  }
});

export { router as statsRouter };
