import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execPromise = promisify(exec);

class GitDiffTracker {
  constructor() {
    this.diffHistoryPath = path.join(process.cwd(), '.git', 'diff-history');
    this.maxHistorySize = 50;
  }

  async ensureHistoryDirectory() {
    try {
      await fs.access(this.diffHistoryPath);
    } catch {
      await fs.mkdir(this.diffHistoryPath, { recursive: true });
    }
  }

  async getCurrentDiff() {
    try {
      const { stdout: stagedDiff } = await execPromise('git diff --cached');
      const { stdout: unstagedDiff } = await execPromise('git diff');
      const { stdout: branch } = await execPromise('git rev-parse --abbrev-ref HEAD');
      const { stdout: lastCommit } = await execPromise('git log -1 --oneline');

      return {
        timestamp: new Date().toISOString(),
        branch: branch.trim(),
        lastCommit: lastCommit.trim(),
        stagedDiff: stagedDiff || '(no staged changes)',
        unstagedDiff: unstagedDiff || '(no unstaged changes)',
        combinedDiff: (stagedDiff + unstagedDiff) || '(no changes)'
      };
    } catch (error) {
      console.error('Error getting git diff:', error.message);
      return null;
    }
  }

  async saveDiff(taskId = null) {
    await this.ensureHistoryDirectory();

    const diffData = await this.getCurrentDiff();
    if (!diffData) return null;

    const filename = `diff-${Date.now()}${taskId ? `-task-${taskId}` : ''}.json`;
    const filepath = path.join(this.diffHistoryPath, filename);

    await fs.writeFile(filepath, JSON.stringify(diffData, null, 2));
    await this.cleanupOldDiffs();

    return filepath;
  }

  async getDiffHistory(limit = 10) {
    await this.ensureHistoryDirectory();

    try {
      const files = await fs.readdir(this.diffHistoryPath);
      const diffFiles = files
        .filter(f => f.startsWith('diff-') && f.endsWith('.json'))
        .sort()
        .reverse()
        .slice(0, limit);

      const diffs = await Promise.all(
        diffFiles.map(async (file) => {
          const content = await fs.readFile(path.join(this.diffHistoryPath, file), 'utf-8');
          return JSON.parse(content);
        })
      );

      return diffs;
    } catch (error) {
      console.error('Error reading diff history:', error.message);
      return [];
    }
  }

  async getLastDiff() {
    const history = await this.getDiffHistory(1);
    return history[0] || null;
  }

  async cleanupOldDiffs() {
    try {
      const files = await fs.readdir(this.diffHistoryPath);
      const diffFiles = files
        .filter(f => f.startsWith('diff-') && f.endsWith('.json'))
        .sort();

      if (diffFiles.length > this.maxHistorySize) {
        const filesToDelete = diffFiles.slice(0, diffFiles.length - this.maxHistorySize);
        await Promise.all(
          filesToDelete.map(file =>
            fs.unlink(path.join(this.diffHistoryPath, file))
          )
        );
      }
    } catch (error) {
      console.error('Error cleaning up old diffs:', error.message);
    }
  }

  async compareWithPrevious() {
    const history = await this.getDiffHistory(2);
    if (history.length < 2) {
      return { message: 'Not enough history to compare' };
    }

    return {
      current: history[0],
      previous: history[1],
      timeDifference: new Date(history[0].timestamp) - new Date(history[1].timestamp)
    };
  }

  async exportDiffHistory(outputPath) {
    const history = await this.getDiffHistory(this.maxHistorySize);
    await fs.writeFile(outputPath, JSON.stringify(history, null, 2));
    return outputPath;
  }
}

export default new GitDiffTracker();
