# AI Agent Integration Guide

## Problem: Agent Getting Stuck in Plan Mode

This guide solves the issue where AI agents (like Claude, ChatGPT, or Blackbox) get stuck in "plan mode" instead of executing tasks and returning results with git diffs.

## Root Cause

Agents get stuck in plan mode when:
1. They don't receive clear execution results
2. Git diff is not included in the response
3. The response format doesn't clearly indicate execution completion
4. There's ambiguity about whether the task is in planning vs. execution phase

## Solution

We've added **agent-friendly endpoints** that always return:
- ✅ Execution result
- ✅ Git diff
- ✅ Clear mode indicator (EXECUTE, not PLAN)
- ✅ Status information

---

## Quick Start for Agents

### Option 1: Use the Agent Helper Utility (Recommended)

```javascript
import agentHelper from './backend/utils/agentHelper.js';

// Execute task and get results with diff
const result = await agentHelper.executeWithDiff({
  taskId: 'my-task-123',
  action: 'implement-feature',
  save: true
});

console.log(result);
// {
//   success: true,
//   mode: 'execute',        // ← Prevents plan mode!
//   result: { ... },
//   gitDiff: { ... },
//   metadata: { ... }
// }
```

### Option 2: Use REST API Endpoints

#### Execute with Diff
```bash
POST /api/git-diff/agent/execute
{
  "taskId": "task-123",
  "action": "implement-feature"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "action": "implement-feature",
    "taskId": "task-123",
    "savedPath": "/path/to/diff.json",
    "timestamp": "2026-03-25T14:00:00.000Z"
  },
  "gitDiff": {
    "timestamp": "2026-03-25T14:00:00.000Z",
    "branch": "main",
    "lastCommit": "abc1234",
    "stagedDiff": "...",
    "unstagedDiff": "...",
    "combinedDiff": "..."
  }
}
```

---

## All Agent Endpoints

### 1. **Execute and Get Diff** (Primary Endpoint)
```
POST /api/git-diff/agent/execute
```
Use this to execute a task and get both result and git diff.

**Request:**
```json
{
  "taskId": "optional-task-id",
  "action": "optional-action-description"
}
```

**Response includes:**
- `success` - Execution status
- `result` - Task execution result
- `gitDiff` - Current git diff

---

### 2. **Get Status with Diff** (Non-Saving)
```
GET /api/git-diff/agent/status
```
Check status without saving. Returns current and last saved diff.

**Response:**
```json
{
  "success": true,
  "mode": "execute",
  "status": {
    "hasChanges": true,
    "branch": "main",
    "lastCommit": "abc1234",
    "timestamp": "2026-03-25T14:00:00.000Z"
  },
  "currentDiff": { ... },
  "lastSaved": { ... }
}
```

---

### 3. **Compare with Previous**
```
GET /api/git-diff/agent/compare
```
Compare current state with last saved state.

**Response:**
```json
{
  "success": true,
  "mode": "execute",
  "comparison": {
    "current": { ... },
    "previous": { ... },
    "timeDifference": 123456
  },
  "currentDiff": { ... }
}
```

---

### 4. **Save Snapshot**
```
POST /api/git-diff/agent/snapshot
```
Save current state and return confirmation with diff.

**Request:**
```json
{
  "taskId": "snapshot-123"
}
```

---

### 5. **Get Execution Summary**
```
POST /api/git-diff/agent/summary
```
Get comprehensive execution summary with explicit mode indicator.

**Response:**
```json
{
  "success": true,
  "mode": "execute",
  "result": { ... },
  "gitDiff": { ... },
  "summary": {
    "mode": "EXECUTE",
    "status": "COMPLETED",
    "hasChanges": true,
    "branch": "main",
    "timestamp": "2026-03-25T14:00:00.000Z"
  }
}
```

---

## Agent Helper Methods

### executeWithDiff(options)
Primary method - execute and get results with diff.

```javascript
const result = await agentHelper.executeWithDiff({
  taskId: 'task-123',     // Optional
  action: 'my-action',    // Optional
  save: true              // Optional (default: true)
});
```

### getStatus()
Get status without saving.

```javascript
const status = await agentHelper.getStatus();
```

### compareWithPrevious()
Compare current with previous state.

```javascript
const comparison = await agentHelper.compareWithPrevious();
```

### saveSnapshot(taskId)
Save current state.

```javascript
const snapshot = await agentHelper.saveSnapshot('snapshot-123');
```

### getExecutionSummary(taskId)
Get comprehensive summary with explicit mode.

```javascript
const summary = await agentHelper.getExecutionSummary('task-123');
```

---

## How This Prevents Plan Mode Lockup

### Problem Pattern:
```
Agent: "I'm planning to implement X..."
Agent: "Let me plan the steps..."
Agent: "Creating a plan..."
[STUCK IN PLAN MODE - Never executes]
```

### Solution Pattern:
```javascript
// Agent calls execute endpoint
const result = await agentHelper.executeWithDiff({
  taskId: 'implement-x',
  action: 'execute'
});

// Response clearly indicates execution mode
// {
//   mode: 'execute',      ← Clear signal
//   result: { ... },      ← Execution result
//   gitDiff: { ... }      ← Changes made
// }

// Agent receives both result and diff
// Agent knows execution completed
// Agent provides result to user
// [NO PLAN MODE LOCKUP]
```

---

## Integration Examples

### Example 1: Claude Agent Integration

```javascript
// When Claude wants to execute a task
async function executeTask(taskDescription) {
  // Instead of entering plan mode, directly execute
  const result = await agentHelper.executeWithDiff({
    taskId: taskDescription,
    action: 'execute',
    save: true
  });

  // Result includes both execution status and git diff
  return {
    completed: result.success,
    changes: result.gitDiff,
    details: result.result
  };
}
```

### Example 2: Blackbox Agent Integration

```javascript
// Blackbox agent workflow
async function blackboxExecute(task) {
  // Get current status first
  const status = await agentHelper.getStatus();

  // Execute the task
  const execution = await agentHelper.executeWithDiff({
    taskId: task.id,
    action: task.type
  });

  // Compare with previous
  const comparison = await agentHelper.compareWithPrevious();

  // Return comprehensive result
  return {
    status: execution.mode,  // 'execute'
    result: execution.result,
    diff: execution.gitDiff,
    comparison: comparison
  };
}
```

### Example 3: Generic Agent Workflow

```javascript
async function agentWorkflow(userRequest) {
  // 1. Check current status
  const initialStatus = await agentHelper.getStatus();

  // 2. Execute the work
  // ... do actual implementation ...

  // 3. Get execution summary with diff
  const summary = await agentHelper.getExecutionSummary(userRequest.id);

  // 4. Return to user
  return {
    message: "Task completed",
    mode: summary.summary.mode,        // 'EXECUTE'
    status: summary.summary.status,    // 'COMPLETED'
    changes: summary.gitDiff
  };
}
```

---

## Key Differences from Standard Endpoints

| Standard Endpoint | Agent Endpoint | Benefit |
|------------------|----------------|---------|
| `/current` | `/agent/status` | Includes mode indicator |
| `/save` | `/agent/execute` | Returns both result and diff |
| `/compare` | `/agent/compare` | Includes mode and current diff |
| N/A | `/agent/summary` | Explicit execution summary |

---

## Troubleshooting Agent Issues

### Issue: Agent stuck in plan mode

**Solution:** Use `/agent/execute` or `agentHelper.executeWithDiff()`
- Always returns execution mode
- Includes clear status indicators
- Provides both result and diff

### Issue: Agent doesn't return git diff

**Solution:** All agent endpoints return git diff automatically
```javascript
// Old way (might forget diff)
const result = doSomething();
// Missing: git diff

// New way (always includes diff)
const result = await agentHelper.executeWithDiff({...});
// result.gitDiff is always present
```

### Issue: Unclear if task completed

**Solution:** Use `getExecutionSummary()`
```javascript
const summary = await agentHelper.getExecutionSummary('task-123');
// summary.summary.status = 'COMPLETED' or 'FAILED'
// summary.summary.mode = 'EXECUTE'
```

---

## Configuration

No special configuration needed. All agent endpoints are automatically available when the server starts.

Optional: Set environment variables
```env
DIFF_WATCH_ENABLED=true
DIFF_WATCH_INTERVAL=5
```

---

## Testing Agent Integration

### Test 1: Basic Execution
```bash
curl -X POST http://localhost:5000/api/git-diff/agent/execute \
  -H "Content-Type: application/json" \
  -d '{"taskId": "test-task", "action": "test"}'
```

Expected: JSON with `success`, `result`, and `gitDiff`

### Test 2: Status Check
```bash
curl http://localhost:5000/api/git-diff/agent/status
```

Expected: JSON with `mode: 'execute'` and current diff

### Test 3: Execution Summary
```bash
curl -X POST http://localhost:5000/api/git-diff/agent/summary \
  -H "Content-Type: application/json" \
  -d '{"taskId": "summary-test"}'
```

Expected: JSON with `summary.mode: 'EXECUTE'` and `summary.status: 'COMPLETED'`

---

## Migration Guide

### Before (Plan Mode Issues)
```javascript
// Agent workflow (problematic)
1. Agent: "Planning to do X"
2. Agent: "Creating plan for Y"
3. Agent: "Let me think about Z"
4. [Stuck in planning - never executes]
```

### After (Execution Mode)
```javascript
// Agent workflow (fixed)
1. const result = await agentHelper.executeWithDiff({
     taskId: 'do-x',
     action: 'execute'
   });
2. // result.mode = 'execute'
3. // result.gitDiff = {...}
4. // Agent provides result to user
5. [Task completed successfully]
```

---

## Best Practices for Agent Developers

1. **Always use agent endpoints** instead of standard endpoints
2. **Check `mode` field** in responses (should be 'execute')
3. **Include git diff** in agent responses to users
4. **Save important checkpoints** using `saveSnapshot()`
5. **Compare states** before/after using `compareWithPrevious()`

---

## Summary

The agent integration system ensures:
- ✅ No plan mode lockup
- ✅ Clear execution indicators
- ✅ Automatic git diff inclusion
- ✅ Status transparency
- ✅ Result + diff in single response

**For agents:** Use `/api/git-diff/agent/*` endpoints or `agentHelper` utility.

**For users:** Agents will now execute tasks and provide results with diffs instead of getting stuck in plan mode.
