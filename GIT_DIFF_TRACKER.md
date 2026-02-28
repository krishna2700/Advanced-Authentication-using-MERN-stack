# Git Diff Tracker

A utility to track and preserve git diff information across task completions, preventing the loss of change history.

## Problem Solved

Sometimes git diff information disappears after completing tasks. This utility preserves diff history by:
- Automatically saving git diffs before they're lost
- Maintaining a history of diffs with timestamps
- Providing easy access to previous diffs
- Comparing changes across different points in time

## Features

- **Automatic Diff Storage**: Save current git diffs with timestamps
- **History Management**: Keep track of up to 50 previous diffs
- **Easy Retrieval**: Access current, last, or historical diffs
- **Comparison Tools**: Compare current state with previous diffs
- **Export Functionality**: Export diff history to JSON
- **CLI & API Access**: Use via command line or HTTP endpoints

## Installation

The tracker is already integrated into the backend. Just ensure dependencies are installed:

```bash
npm install
```

## Usage

### CLI Usage

```bash
# Save current diff
node backend/utils/diffCli.js save

# Save diff with task ID
node backend/utils/diffCli.js save task-123

# Show current diff
node backend/utils/diffCli.js current

# Show diff history (default: 10 entries)
node backend/utils/diffCli.js history

# Show more history
node backend/utils/diffCli.js history 20

# Show last saved diff
node backend/utils/diffCli.js last

# Compare current and previous diff
node backend/utils/diffCli.js compare

# Export history to JSON
node backend/utils/diffCli.js export ./my-diffs.json
```

### API Usage

Start the server:
```bash
npm run dev
```

#### Endpoints

**Get Current Diff**
```bash
GET /api/git-diff/current
```

**Save Current Diff**
```bash
POST /api/git-diff/save
Content-Type: application/json

{
  "taskId": "task-123"  // optional
}
```

**Get Diff History**
```bash
GET /api/git-diff/history?limit=10
```

**Get Last Saved Diff**
```bash
GET /api/git-diff/last
```

**Compare with Previous**
```bash
GET /api/git-diff/compare
```

**Export History**
```bash
GET /api/git-diff/export?path=./export.json
```

### Programmatic Usage

```javascript
import gitDiffTracker from './backend/utils/gitDiffTracker.js';

// Get current diff
const current = await gitDiffTracker.getCurrentDiff();

// Save current diff
const filepath = await gitDiffTracker.saveDiff('task-123');

// Get history
const history = await gitDiffTracker.getDiffHistory(10);

// Get last diff
const last = await gitDiffTracker.getLastDiff();

// Compare with previous
const comparison = await gitDiffTracker.compareWithPrevious();

// Export history
await gitDiffTracker.exportDiffHistory('./my-export.json');
```

## Diff Data Structure

Each saved diff contains:

```json
{
  "timestamp": "2026-02-28T17:00:00.000Z",
  "branch": "feature/my-feature",
  "lastCommit": "abc1234 My last commit message",
  "stagedDiff": "... git diff --cached output ...",
  "unstagedDiff": "... git diff output ...",
  "combinedDiff": "... combined diff ..."
}
```

## Storage

- Diffs are stored in `.git/diff-history/`
- Maximum 50 diffs are kept (oldest are automatically cleaned up)
- Files are named: `diff-{timestamp}-task-{taskId}.json`
- The directory is added to `.gitignore`

## Workflow Integration

### Before Task Completion
```bash
# Save current state before completing a task
node backend/utils/diffCli.js save task-123
```

### After Task Completion
```bash
# Check what changed
node backend/utils/diffCli.js last

# Compare with previous state
node backend/utils/diffCli.js compare
```

### Automated Integration

You can integrate this into your workflow hooks or CI/CD:

```bash
# In pre-commit hook
node backend/utils/diffCli.js save "pre-commit-$(date +%s)"

# In task completion script
node backend/utils/diffCli.js save "task-completed"
```

## Benefits

1. **No Lost Changes**: Always have access to previous diffs
2. **Change Tracking**: Track what changed between tasks
3. **Debugging**: Identify when specific changes were made
4. **History**: Review progression of work over time
5. **Recovery**: Retrieve lost information if diff disappears

## Example Scenario

```bash
# Working on feature
git diff  # See changes

# Save before task completion
node backend/utils/diffCli.js save feature-implementation

# Complete task (diff might disappear in UI)

# Later, retrieve the diff
node backend/utils/diffCli.js last

# Or view all history
node backend/utils/diffCli.js history
```

## Maintenance

The tracker automatically:
- Creates the storage directory if needed
- Cleans up old diffs (keeps last 50)
- Handles errors gracefully
- Ignores the history directory in git

## Troubleshooting

**No diffs saved?**
- Ensure you're in a git repository
- Check that git is installed and accessible

**Can't access history?**
- Verify `.git/diff-history/` directory exists
- Check file permissions

**Too many old diffs?**
- The tracker automatically keeps only the last 50
- You can manually clean: `rm -rf .git/diff-history/*`

## Advanced Usage

### Custom History Size

Modify `maxHistorySize` in `gitDiffTracker.js`:

```javascript
constructor() {
  this.maxHistorySize = 100; // Keep 100 diffs instead of 50
}
```

### Integration with Git Hooks

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
node backend/utils/diffCli.js save "pre-commit-$(date +%s)"
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```
