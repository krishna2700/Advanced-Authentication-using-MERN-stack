#!/usr/bin/env node

import gitDiffTracker from './gitDiffTracker.js';

const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  switch (command) {
    case 'save':
      const taskId = args[0];
      const filepath = await gitDiffTracker.saveDiff(taskId);
      console.log(`✓ Diff saved to: ${filepath}`);
      break;

    case 'current':
      const current = await gitDiffTracker.getCurrentDiff();
      if (current) {
        console.log('\n=== Current Git Diff ===');
        console.log(`Branch: ${current.branch}`);
        console.log(`Last Commit: ${current.lastCommit}`);
        console.log(`Timestamp: ${current.timestamp}\n`);
        console.log('--- Staged Changes ---');
        console.log(current.stagedDiff);
        console.log('\n--- Unstaged Changes ---');
        console.log(current.unstagedDiff);
      }
      break;

    case 'history':
      const limit = parseInt(args[0]) || 10;
      const history = await gitDiffTracker.getDiffHistory(limit);
      console.log(`\n=== Diff History (${history.length} entries) ===\n`);
      history.forEach((diff, index) => {
        console.log(`${index + 1}. [${diff.timestamp}] ${diff.branch} - ${diff.lastCommit}`);
      });
      break;

    case 'last':
      const last = await gitDiffTracker.getLastDiff();
      if (last) {
        console.log('\n=== Last Saved Diff ===');
        console.log(`Branch: ${last.branch}`);
        console.log(`Last Commit: ${last.lastCommit}`);
        console.log(`Timestamp: ${last.timestamp}\n`);
        console.log('--- Staged Changes ---');
        console.log(last.stagedDiff);
        console.log('\n--- Unstaged Changes ---');
        console.log(last.unstagedDiff);
      } else {
        console.log('No saved diffs found');
      }
      break;

    case 'compare':
      const comparison = await gitDiffTracker.compareWithPrevious();
      if (comparison.message) {
        console.log(comparison.message);
      } else {
        console.log('\n=== Comparison ===');
        console.log(`\nCurrent: [${comparison.current.timestamp}] ${comparison.current.branch}`);
        console.log(`Previous: [${comparison.previous.timestamp}] ${comparison.previous.branch}`);
        console.log(`Time difference: ${Math.round(comparison.timeDifference / 1000)}s`);
      }
      break;

    case 'export':
      const outputPath = args[0] || './diff-export.json';
      await gitDiffTracker.exportDiffHistory(outputPath);
      console.log(`✓ History exported to: ${outputPath}`);
      break;

    default:
      console.log(`
Git Diff Tracker CLI

Usage:
  node diffCli.js <command> [options]

Commands:
  save [taskId]       Save current git diff with optional task ID
  current             Show current git diff
  history [limit]     Show diff history (default: 10)
  last                Show last saved diff
  compare             Compare current and previous diff
  export [path]       Export diff history to JSON file

Examples:
  node diffCli.js save task-123
  node diffCli.js history 20
  node diffCli.js export ./my-diffs.json
      `);
  }
}

main().catch(console.error);
