import gitDiffTracker from './gitDiffTracker.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

class DiffWatcher {
  constructor(intervalMinutes = 5) {
    this.intervalMs = intervalMinutes * 60 * 1000;
    this.lastDiff = null;
    this.lastCommitHash = null;
    this.isRunning = false;
    this.intervalId = null;
  }

  async hasChanges() {
    try {
      const { stdout: stagedDiff } = await execPromise('git diff --cached');
      const { stdout: unstagedDiff } = await execPromise('git diff');
      return stagedDiff.length > 0 || unstagedDiff.length > 0;
    } catch (error) {
      return false;
    }
  }

  async getCurrentCommitHash() {
    try {
      const { stdout } = await execPromise('git rev-parse HEAD');
      return stdout.trim();
    } catch (error) {
      return null;
    }
  }

  async checkAndSave() {
    try {
      const currentCommitHash = await this.getCurrentCommitHash();
      const hasChanges = await this.hasChanges();

      // If commit hash changed, reset lastDiff to ensure we save the new state
      if (this.lastCommitHash && currentCommitHash !== this.lastCommitHash) {
        console.log('[DiffWatcher] Commit detected, resetting diff tracking state');
        this.lastDiff = null;
      }
      this.lastCommitHash = currentCommitHash;

      if (hasChanges) {
        const currentDiff = await gitDiffTracker.getCurrentDiff();

        // Only save if diff has changed from last time
        if (!this.lastDiff || currentDiff.combinedDiff !== this.lastDiff.combinedDiff) {
          const filepath = await gitDiffTracker.saveDiff(`auto-watch-${Date.now()}`);
          console.log(`[DiffWatcher] Diff saved: ${filepath}`);
          this.lastDiff = currentDiff;
        }
      } else {
        // If no changes exist but we had a previous diff, save the "clean state" once
        if (this.lastDiff && this.lastDiff.combinedDiff !== '(no changes)') {
          const currentDiff = await gitDiffTracker.getCurrentDiff();
          const filepath = await gitDiffTracker.saveDiff(`auto-watch-clean-${Date.now()}`);
          console.log(`[DiffWatcher] Clean state saved after changes cleared: ${filepath}`);
          this.lastDiff = currentDiff;
        }
      }
    } catch (error) {
      console.error('[DiffWatcher] Error:', error.message);
    }
  }

  start() {
    if (this.isRunning) {
      console.log('[DiffWatcher] Already running');
      return;
    }

    console.log(`[DiffWatcher] Starting (checking every ${this.intervalMs / 60000} minutes)`);
    this.isRunning = true;

    // Check immediately on start
    this.checkAndSave();

    // Then check at regular intervals
    this.intervalId = setInterval(() => {
      this.checkAndSave();
    }, this.intervalMs);
  }

  stop() {
    if (!this.isRunning) {
      console.log('[DiffWatcher] Not running');
      return;
    }

    console.log('[DiffWatcher] Stopping');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async saveNow() {
    console.log('[DiffWatcher] Saving diff now...');
    await this.checkAndSave();
  }
}

export default DiffWatcher;
