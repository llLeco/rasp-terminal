import { Router, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import {
  getCustomScripts,
  addCustomScript,
  updateCustomScript,
  deleteCustomScript,
} from '../services/database.js';

const execAsync = promisify(exec);
const router = Router();

router.use(authMiddleware);

// Get all custom scripts
router.get('/', (_req: AuthRequest, res: Response): void => {
  try {
    const scripts = getCustomScripts();
    res.json(scripts);
  } catch (error) {
    console.error('Error getting scripts:', error);
    res.status(500).json({ error: 'Failed to get scripts' });
  }
});

// Add new script
router.post('/', (req: AuthRequest, res: Response): void => {
  try {
    const { name, description, command, icon } = req.body;

    if (!name || !command) {
      res.status(400).json({ error: 'Name and command are required' });
      return;
    }

    const id = addCustomScript({ name, description, command, icon });
    res.json({ success: true, id });
  } catch (error) {
    console.error('Error adding script:', error);
    res.status(500).json({ error: 'Failed to add script' });
  }
});

// Update script
router.put('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, description, command, icon } = req.body;

    if (!name || !command) {
      res.status(400).json({ error: 'Name and command are required' });
      return;
    }

    updateCustomScript(id, { name, description, command, icon });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating script:', error);
    res.status(500).json({ error: 'Failed to update script' });
  }
});

// Delete script
router.delete('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const id = parseInt(req.params.id, 10);
    deleteCustomScript(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting script:', error);
    res.status(500).json({ error: 'Failed to delete script' });
  }
});

// Execute script
router.post('/:id/execute', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const scripts = getCustomScripts();
    const script = scripts.find((s) => s.id === id);

    if (!script) {
      res.status(404).json({ error: 'Script not found' });
      return;
    }

    const { stdout, stderr } = await execAsync(script.command, {
      timeout: 60000, // 1 minute timeout
      maxBuffer: 1024 * 1024, // 1MB buffer
    });

    res.json({
      success: true,
      output: stdout,
      error: stderr || undefined,
    });
  } catch (error: unknown) {
    const err = error as { message?: string; stdout?: string; stderr?: string };
    res.status(500).json({
      error: err.message || 'Script execution failed',
      output: err.stdout,
      stderr: err.stderr,
    });
  }
});

export { router as scriptsRouter };
