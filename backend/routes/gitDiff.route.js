import express from 'express';
import gitDiffTracker from '../utils/gitDiffTracker.js';
import DiffWatcher from '../utils/diffWatcher.js';

const router = express.Router();

// Shared watcher instance (will be injected from server)
let watcherInstance = null;

export const setWatcherInstance = (watcher) => {
  watcherInstance = watcher;
};

router.get('/current', async (req, res) => {
  try {
    const diff = await gitDiffTracker.getCurrentDiff();
    if (!diff) {
      return res.status(500).json({ success: false, message: 'Failed to get current diff' });
    }
    res.json({ success: true, data: diff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/save', async (req, res) => {
  try {
    const { taskId } = req.body;
    const filepath = await gitDiffTracker.saveDiff(taskId);
    if (!filepath) {
      return res.status(500).json({ success: false, message: 'Failed to save diff' });
    }
    res.json({ success: true, message: 'Diff saved successfully', filepath });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = await gitDiffTracker.getDiffHistory(limit);
    res.json({ success: true, data: history, count: history.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/last', async (req, res) => {
  try {
    const diff = await gitDiffTracker.getLastDiff();
    if (!diff) {
      return res.status(404).json({ success: false, message: 'No diff history found' });
    }
    res.json({ success: true, data: diff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/compare', async (req, res) => {
  try {
    const comparison = await gitDiffTracker.compareWithPrevious();
    res.json({ success: true, data: comparison });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/export', async (req, res) => {
  try {
    const outputPath = req.query.path || './diff-export.json';
    const filepath = await gitDiffTracker.exportDiffHistory(outputPath);
    res.json({ success: true, message: 'History exported', filepath });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Watcher control endpoints
router.post('/watcher/start', (req, res) => {
  try {
    if (!watcherInstance) {
      return res.status(503).json({ success: false, message: 'Watcher not initialized' });
    }
    watcherInstance.start();
    res.json({ success: true, message: 'Diff watcher started' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/watcher/stop', (req, res) => {
  try {
    if (!watcherInstance) {
      return res.status(503).json({ success: false, message: 'Watcher not initialized' });
    }
    watcherInstance.stop();
    res.json({ success: true, message: 'Diff watcher stopped' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/watcher/status', (req, res) => {
  try {
    if (!watcherInstance) {
      return res.status(503).json({ success: false, message: 'Watcher not initialized' });
    }
    res.json({
      success: true,
      data: {
        isRunning: watcherInstance.isRunning,
        intervalMs: watcherInstance.intervalMs
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/watcher/save-now', async (req, res) => {
  try {
    if (!watcherInstance) {
      return res.status(503).json({ success: false, message: 'Watcher not initialized' });
    }
    await watcherInstance.saveNow();
    res.json({ success: true, message: 'Diff saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
