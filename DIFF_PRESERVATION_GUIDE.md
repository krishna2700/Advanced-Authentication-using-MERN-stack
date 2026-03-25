# Git Diff Preservation - Complete Guide

This guide explains all the mechanisms in place to **automatically preserve git diffs** and prevent them from disappearing after task completion.

## Problem

Git diffs can disappear after:
- Completing tasks
- Committing changes
- Switching branches
- Stashing changes
- Resetting changes

## Solutions Implemented

We've implemented **multiple layers** of automatic diff preservation:

### 1. Git Hooks (Automatic on Git Operations)

Git hooks automatically save diffs during git operations.

#### Pre-Commit Hook
Located at: `.git/hooks/pre-commit`

Automatically saves the current diff **before** each commit:
```bash
# Triggered automatically when you run: git commit
node backend/utils/diffCli.js save "pre-commit-<timestamp>"
```

#### Post-Commit Hook
Located at: `.git/hooks/post-commit`

Automatically saves the diff **after** each commit:
```bash
# Triggered automatically after commit completes
node backend/utils/diffCli.js save "post-commit-<hash>"
```

**No action required** - these hooks run automatically when you use git.

### 2. Automatic Background Watcher

A background service that continuously monitors and saves diffs.

#### How It Works
- Runs automatically when the server starts
- Checks for changes every 5 minutes (configurable)
- Only saves if the diff has changed
- Prevents duplicate saves

#### Starting the Server
```bash
npm run dev
```

The watcher starts automatically and logs:
```
[DiffWatcher] Starting (checking every 5 minutes)
[DiffWatcher] Diff saved: /path/to/diff.json
```

#### Configuration

Environment variables in `.env`:

```env
# Enable/disable automatic watcher (default: enabled)
DIFF_WATCH_ENABLED=true

# Check interval in minutes (default: 5)
DIFF_WATCH_INTERVAL=5
```

To disable automatic watching:
```env
DIFF_WATCH_ENABLED=false
```

#### Manual Control via API

**Start Watcher:**
```bash
curl -X POST http://localhost:5000/api/git-diff/watcher/start
```

**Stop Watcher:**
```bash
curl -X POST http://localhost:5000/api/git-diff/watcher/stop
```

**Check Status:**
```bash
curl http://localhost:5000/api/git-diff/watcher/status
```

**Save Immediately:**
```bash
curl -X POST http://localhost:5000/api/git-diff/watcher/save-now
```

### 3. NPM Scripts (Manual Quick Access)

Convenient npm commands for manual diff management:

```bash
# Save current diff manually
npm run diff:save

# View current diff
npm run diff:current

# View diff history
npm run diff:history

# View last saved diff
npm run diff:last

# Compare current with previous
npm run diff:compare

# Export all history to JSON
npm run diff:export

# Start watcher manually
npm run diff:watch

# Save once and exit
npm run diff:watch:once
```

### 4. CLI Access (Advanced)

Direct CLI access for scripting and automation:

```bash
# Save with custom task ID
node backend/utils/diffCli.js save my-task-123

# View current diff
node backend/utils/diffCli.js current

# View history (default: 10 entries)
node backend/utils/diffCli.js history

# View more history
node backend/utils/diffCli.js history 50

# View last saved diff
node backend/utils/diffCli.js last

# Compare current with previous
node backend/utils/diffCli.js compare

# Export to custom location
node backend/utils/diffCli.js export ./backups/my-diffs.json
```

### 5. Programmatic API

Use in your own scripts:

```javascript
import gitDiffTracker from './backend/utils/gitDiffTracker.js';

// Get current diff
const current = await gitDiffTracker.getCurrentDiff();

// Save diff
const filepath = await gitDiffTracker.saveDiff('task-123');

// Get history
const history = await gitDiffTracker.getDiffHistory(10);

// Get last diff
const last = await gitDiffTracker.getLastDiff();

// Compare with previous
const comparison = await gitDiffTracker.compareWithPrevious();
```

## Recommended Workflow

### Before Starting Work
The watcher is already running in the background (if server is running).

### During Development
1. **Automatic**: Watcher saves diffs every 5 minutes
2. **Automatic**: Git hooks save on every commit
3. **Manual** (optional): `npm run diff:save` for critical moments

### After Task Completion
```bash
# View what changed
npm run diff:last

# Compare with previous state
npm run diff:compare

# View full history
npm run diff:history
```

### If Diff Disappears
```bash
# Get the last saved diff
npm run diff:last

# Or view all recent diffs
npm run diff:history
```

## Storage Details

### Location
All diffs are stored in: `.git/diff-history/`

### File Format
```
diff-<timestamp>-task-<taskId>.json
```

Examples:
- `diff-1772298261281-pre-commit-1772298261.json`
- `diff-1772298355432-task-my-feature.json`
- `diff-1772298456789-auto-watch-1772298456789.json`

### Data Structure
Each saved diff contains:
```json
{
  "timestamp": "2026-02-28T17:00:00.000Z",
  "branch": "feature/my-feature",
  "lastCommit": "abc1234 My commit message",
  "stagedDiff": "... staged changes ...",
  "unstagedDiff": "... unstaged changes ...",
  "combinedDiff": "... all changes ..."
}
```

### Automatic Cleanup
- Maximum 50 diffs kept automatically
- Oldest diffs are deleted first
- Cleanup runs after each save

### Manual Cleanup
```bash
# Delete all saved diffs
rm -rf .git/diff-history/*

# Delete old diffs (keep last 10)
cd .git/diff-history && ls -t | tail -n +11 | xargs rm -f
```

## Troubleshooting

### Diffs Not Being Saved Automatically?

**Check if server is running:**
```bash
# Server should be running for automatic watcher
npm run dev
```

**Check watcher status:**
```bash
curl http://localhost:5000/api/git-diff/watcher/status
```

**Check environment variables:**
```bash
# Ensure DIFF_WATCH_ENABLED is not set to false
cat .env | grep DIFF_WATCH
```

### Git Hooks Not Working?

**Check if hooks are executable:**
```bash
ls -la .git/hooks/pre-commit
ls -la .git/hooks/post-commit

# If not executable:
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/post-commit
```

**Test hook manually:**
```bash
.git/hooks/pre-commit
```

### No Diffs in History?

**Ensure you're in a git repository:**
```bash
git status
```

**Check if directory exists:**
```bash
ls -la .git/diff-history/
```

**Manually create directory if missing:**
```bash
mkdir -p .git/diff-history
```

### Watcher Not Saving?

**Check if there are actual changes:**
```bash
git status
git diff
```

The watcher only saves when there are actual changes.

**Force save immediately:**
```bash
npm run diff:save
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Save Diff on Push

on: [push]

jobs:
  save-diff:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '22'
      - name: Install dependencies
        run: npm install
      - name: Save diff
        run: npm run diff:save
```

### Pre-Push Hook

Add to `.git/hooks/pre-push`:
```bash
#!/bin/bash
node backend/utils/diffCli.js save "pre-push-$(date +%s)"
```

Make executable:
```bash
chmod +x .git/hooks/pre-push
```

## Advanced Usage

### Custom Watch Interval

In `.env`:
```env
# Check every 2 minutes
DIFF_WATCH_INTERVAL=2

# Check every 10 minutes
DIFF_WATCH_INTERVAL=10
```

### Increase History Size

Edit `backend/utils/gitDiffTracker.js`:
```javascript
constructor() {
  this.maxHistorySize = 100; // Keep 100 diffs instead of 50
}
```

### Standalone Watcher Process

Run the watcher separately from the server:
```bash
# Run in background with custom interval (10 minutes)
node backend/utils/diffWatcherCli.js start 10 &

# Save once and exit
node backend/utils/diffWatcherCli.js once
```

### Export on Schedule (Cron)

Add to crontab:
```bash
# Export diffs daily at midnight
0 0 * * * cd /path/to/project && node backend/utils/diffCli.js export ./backups/diff-$(date +%Y%m%d).json
```

## Recent Enhancement: Commit-Aware Diff Tracking

The DiffWatcher has been enhanced to handle diff persistence across task completion:

- **Detects commits** and resets its internal state
- **Saves clean states** when diffs are cleared
- **Prevents state bugs** that caused diffs to be missed after commits

This means even rapid commit workflows now have complete diff history preserved.

## Summary

You now have **5 layers** of diff preservation:

1. ✅ **Git Hooks** - Automatic on every commit
2. ✅ **Background Watcher** - Automatic every 5 minutes (now commit-aware!)
3. ✅ **NPM Scripts** - Manual quick access
4. ✅ **CLI Tools** - Advanced manual control
5. ✅ **REST API** - Programmatic access

**Your diffs are safe and recoverable at any time!**

## Quick Reference Card

```bash
# View last saved diff
npm run diff:last

# Save manually right now
npm run diff:save

# View history
npm run diff:history

# Compare current vs previous
npm run diff:compare

# Check watcher status
curl http://localhost:5000/api/git-diff/watcher/status
```

## Support

For issues or questions:
1. Check this guide
2. Review `GIT_DIFF_TRACKER.md`
3. Check server logs for watcher activity
4. Verify `.git/diff-history/` directory exists and contains files
