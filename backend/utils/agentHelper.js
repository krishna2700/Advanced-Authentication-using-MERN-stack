import gitDiffTracker from './gitDiffTracker.js';

/**
 * Agent Helper Utility
 *
 * This utility helps AI agents (like Claude, ChatGPT, etc.) interact with
 * the git diff tracking system without getting stuck in plan mode.
 *
 * Key features:
 * - Always returns both result and git diff
 * - Non-blocking execution
 * - Prevents plan mode lockup
 */

class AgentHelper {
  /**
   * Execute a task and get results with git diff
   * This is the primary method agents should use to avoid getting stuck
   *
   * @param {Object} options - Execution options
   * @param {string} options.taskId - Optional task identifier
   * @param {string} options.action - Optional action description
   * @param {boolean} options.save - Whether to save the diff (default: true)
   * @returns {Promise<Object>} Result with git diff
   */
  async executeWithDiff(options = {}) {
    const { taskId = null, action = 'execute', save = true } = options;

    try {
      // Get current diff immediately
      const currentDiff = await gitDiffTracker.getCurrentDiff();

      // Save if requested
      let savedPath = null;
      if (save && currentDiff) {
        savedPath = await gitDiffTracker.saveDiff(taskId);
      }

      // Return comprehensive result
      return {
        success: true,
        mode: 'execute', // Not 'plan' - this prevents plan mode lockup
        result: {
          action,
          taskId,
          savedPath,
          timestamp: new Date().toISOString(),
          hasChanges: this._hasActualChanges(currentDiff)
        },
        gitDiff: currentDiff,
        metadata: {
          branch: currentDiff?.branch,
          lastCommit: currentDiff?.lastCommit
        }
      };
    } catch (error) {
      return {
        success: false,
        mode: 'execute',
        error: error.message,
        gitDiff: null
      };
    }
  }

  /**
   * Get status without saving (lightweight query)
   * Use this when you just need to check status without persisting
   *
   * @returns {Promise<Object>} Current status with diff
   */
  async getStatus() {
    try {
      const currentDiff = await gitDiffTracker.getCurrentDiff();
      const lastSaved = await gitDiffTracker.getLastDiff();

      return {
        success: true,
        mode: 'execute',
        status: {
          hasChanges: this._hasActualChanges(currentDiff),
          branch: currentDiff?.branch,
          lastCommit: currentDiff?.lastCommit,
          timestamp: new Date().toISOString()
        },
        currentDiff,
        lastSaved
      };
    } catch (error) {
      return {
        success: false,
        mode: 'execute',
        error: error.message
      };
    }
  }

  /**
   * Compare current state with previous saved state
   * Useful for agents to understand what changed since last checkpoint
   *
   * @returns {Promise<Object>} Comparison result
   */
  async compareWithPrevious() {
    try {
      const comparison = await gitDiffTracker.compareWithPrevious();
      const currentDiff = await gitDiffTracker.getCurrentDiff();

      return {
        success: true,
        mode: 'execute',
        comparison,
        currentDiff
      };
    } catch (error) {
      return {
        success: false,
        mode: 'execute',
        error: error.message
      };
    }
  }

  /**
   * Save current state and return confirmation with diff
   *
   * @param {string} taskId - Optional task identifier
   * @returns {Promise<Object>} Save result with diff
   */
  async saveSnapshot(taskId = null) {
    return this.executeWithDiff({ taskId, action: 'snapshot', save: true });
  }

  /**
   * Check if there are actual changes (not just "no changes" placeholders)
   *
   * @private
   * @param {Object} diff - Diff object to check
   * @returns {boolean} True if there are actual changes
   */
  _hasActualChanges(diff) {
    if (!diff) return false;
    return diff.stagedDiff !== '(no staged changes)' ||
           diff.unstagedDiff !== '(no unstaged changes)';
  }

  /**
   * Get execution summary for agents
   * Returns a formatted summary that prevents plan mode confusion
   *
   * @param {string} taskId - Optional task identifier
   * @returns {Promise<Object>} Execution summary
   */
  async getExecutionSummary(taskId = null) {
    const result = await this.executeWithDiff({ taskId, save: true });

    return {
      ...result,
      summary: {
        mode: 'EXECUTE', // Explicit mode indicator
        status: result.success ? 'COMPLETED' : 'FAILED',
        hasChanges: result.result?.hasChanges || false,
        branch: result.metadata?.branch,
        timestamp: result.result?.timestamp
      }
    };
  }
}

export default new AgentHelper();
