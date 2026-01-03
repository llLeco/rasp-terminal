import { Router, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import * as dockerService from '../services/docker.js';

const execAsync = promisify(exec);
const router = Router();

router.use(authMiddleware);

// System Actions
router.post('/system/reboot', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ success: true, message: 'System will reboot in 5 seconds...' });
    setTimeout(() => {
      exec('sudo reboot');
    }, 5000);
  } catch (error) {
    res.status(500).json({ error: 'Failed to initiate reboot' });
  }
});

router.post('/system/shutdown', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ success: true, message: 'System will shutdown in 5 seconds...' });
    setTimeout(() => {
      exec('sudo shutdown -h now');
    }, 5000);
  } catch (error) {
    res.status(500).json({ error: 'Failed to initiate shutdown' });
  }
});

router.post('/system/service/:action/:service', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action, service } = req.params;
    const allowedActions = ['start', 'stop', 'restart', 'status'];
    const serviceRegex = /^[a-zA-Z0-9_-]+$/;

    if (!allowedActions.includes(action)) {
      res.status(400).json({ error: 'Invalid action' });
      return;
    }

    if (!serviceRegex.test(service)) {
      res.status(400).json({ error: 'Invalid service name' });
      return;
    }

    const { stdout, stderr } = await execAsync(`sudo systemctl ${action} ${service}`);
    res.json({
      success: true,
      output: stdout || stderr || `Service ${service} ${action} completed`,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    res.status(500).json({ error: err.message || 'Failed to execute service command' });
  }
});

router.post('/system/clear-cache', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    await execAsync('sudo sync && sudo sh -c "echo 3 > /proc/sys/vm/drop_caches"');
    res.json({ success: true, message: 'System cache cleared' });
  } catch (error: unknown) {
    const err = error as { message?: string };
    res.status(500).json({ error: err.message || 'Failed to clear cache' });
  }
});

router.post('/system/update', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { stdout } = await execAsync('sudo apt update && sudo apt upgrade -y', {
      timeout: 600000, // 10 minute timeout
    });
    res.json({ success: true, output: stdout });
  } catch (error: unknown) {
    const err = error as { message?: string };
    res.status(500).json({ error: err.message || 'Failed to update system' });
  }
});

// Docker Actions
router.get('/docker/info', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const info = await dockerService.getDockerInfo();
    res.json(info);
  } catch (error: unknown) {
    const err = error as { message?: string };
    res.status(500).json({ error: err.message || 'Failed to get Docker info' });
  }
});

router.get('/docker/containers', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const containers = await dockerService.listContainers();
    res.json(containers);
  } catch (error: unknown) {
    const err = error as { message?: string };
    res.status(500).json({ error: err.message || 'Failed to list containers' });
  }
});

router.post('/docker/containers/:id/start', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await dockerService.startContainer(req.params.id);
    res.json({ success: true, message: 'Container started' });
  } catch (error: unknown) {
    const err = error as { message?: string };
    res.status(500).json({ error: err.message || 'Failed to start container' });
  }
});

router.post('/docker/containers/:id/stop', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await dockerService.stopContainer(req.params.id);
    res.json({ success: true, message: 'Container stopped' });
  } catch (error: unknown) {
    const err = error as { message?: string };
    res.status(500).json({ error: err.message || 'Failed to stop container' });
  }
});

router.post('/docker/containers/:id/restart', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await dockerService.restartContainer(req.params.id);
    res.json({ success: true, message: 'Container restarted' });
  } catch (error: unknown) {
    const err = error as { message?: string };
    res.status(500).json({ error: err.message || 'Failed to restart container' });
  }
});

router.get('/docker/containers/:id/logs', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tail = parseInt(req.query.tail as string, 10) || 100;
    const logs = await dockerService.getContainerLogs(req.params.id, tail);
    res.json({ logs });
  } catch (error: unknown) {
    const err = error as { message?: string };
    res.status(500).json({ error: err.message || 'Failed to get container logs' });
  }
});

router.post('/docker/prune', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await dockerService.pruneSystem();
    res.json({
      success: true,
      message: 'Docker system pruned',
      ...result,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    res.status(500).json({ error: err.message || 'Failed to prune Docker' });
  }
});

export { router as actionsRouter };
