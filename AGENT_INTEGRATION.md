# Agent Integration Guide

## Problem: Blackbox Agent Getting Stuck in Plan Mode

This guide explains how the system prevents AI agents (Blackbox, Claude, Cursor, etc.) from getting stuck in plan mode and ensures they provide proper responses with git diffs.

## Solution Overview

The system now includes:

1. **Agent Configuration** - Controls agent behavior and prevents plan mode loops
2. **Agent Routes** - Endpoints to guide agents into execution mode
3. **Agent Middleware** - Automatic enforcement of execution mode
4. **Git Diff Integration** - Ensures all responses include git diffs

## Agent Endpoints

### Base URL
```
http://localhost:5000/api/agent
```

### 1. Get Agent Configuration

**Endpoint:** `GET /api/agent/config/:agentName`

Get configuration for a specific agent (blackbox, claude, cursor, etc.)

**Example:**
```bash
curl http://localhost:5000/api/agent/config/blackbox
```

**Response:**
```json
{
  "success": true,
  "agent": "blackbox",
  "config": {
    "behavior": {
      "mode": "execute",
      "maxPlanIterations": 1,
      "requireResponse": true,
      "includeGitDiff": true,
      "autoExecute": true
    }
  },
  "instructions": {
    "mode": "execute",
    "behavior": "Skip plan mode and execute immediately",
    "response": "Always provide response with git diff",
    "planMode": "disabled"
  }
}
```

### 2. Execute Task

**Endpoint:** `POST /api/agent/execute`

Execute a task in execution mode (not plan mode) with automatic git diff.

**Request:**
```bash
curl -X POST http://localhost:5000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Fix authentication bug",
    "agentName": "blackbox",
    "skipPlan": true
  }'
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2026-03-25T10:30:00.000Z",
  "mode": "execute",
  "message": "Task ready for execution",
  "gitDiff": {
    "timestamp": "2026-03-25T10:30:00.000Z",
    "branch": "main",
    "lastCommit": "abc1234 Previous commit",
    "stagedDiff": "...",
    "unstagedDiff": "...",
    "combinedDiff": "..."
  },
  "config": {
    "mode": "execute",
    "skipPlanMode": true,
    "autoExecute": true,
    "requireResponse": true
  }
}
```

### 3. Validate Agent State

**Endpoint:** `POST /api/agent/validate`

Check if an agent is stuck in plan mode.

**Request:**
```bash
curl -X POST http://localhost:5000/api/agent/validate \
  -H "Content-Type: application/json" \
  -d '{
    "state": {
      "mode": "plan",
      "iterations": 5,
      "hasResponse": false,
      "elapsed": 45000,
      "inPlanMode": true
    }
  }'
```

**Response:**
```json
{
  "success": false,
  "validation": {
    "valid": false,
    "warnings": [
      "Agent stuck in plan mode - forcing execution",
      "Plan mode timeout - switching to execution"
    ],
    "shouldForceExecution": true
  },
  "recommendation": "Force execution mode immediately"
}
```

### 4. Force Execute

**Endpoint:** `POST /api/agent/force-execute`

Force an agent out of plan mode into execution mode.

**Request:**
```bash
curl -X POST http://localhost:5000/api/agent/force-execute \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "blackbox",
    "task": "Current task"
  }'
```

**Response:**
```json
{
  "success": true,
  "action": "forced_execution",
  "message": "blackbox agent has been forced out of plan mode",
  "gitDiff": {
    "current": "...",
    "saved": true
  },
  "config": {
    "mode": "execute",
    "planMode": "disabled",
    "requireResponse": true,
    "includeGitDiff": true
  },
  "nextSteps": [
    "Execute task immediately",
    "Return results with git diff",
    "Do not enter plan mode again"
  ]
}
```

### 5. Get Response Template

**Endpoint:** `GET /api/agent/response-template`

Get the required response format with git diff.

**Example:**
```bash
curl http://localhost:5000/api/agent/response-template
```

**Response:**
```json
{
  "success": true,
  "template": {
    "success": true,
    "timestamp": "2026-03-25T10:30:00.000Z",
    "mode": "execute",
    "message": "Task completed successfully",
    "gitDiff": {
      "current": "...",
      "changes": "..."
    },
    "status": "success"
  },
  "usage": "Use this template structure for all agent responses",
  "requirements": [
    "Always include message",
    "Always include gitDiff",
    "Always include status",
    "Never stay in plan mode",
    "Always execute and return results"
  ]
}
```

### 6. Submit Result

**Endpoint:** `POST /api/agent/result`

Submit task result with git diff comparison.

**Request:**
```bash
curl -X POST http://localhost:5000/api/agent/result \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Fixed authentication bug",
    "success": true,
    "taskId": "fix-auth-bug"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Fixed authentication bug",
  "timestamp": "2026-03-25T10:30:00.000Z",
  "gitDiff": {
    "current": {
      "stagedDiff": "...",
      "unstagedDiff": "..."
    },
    "previous": {
      "stagedDiff": "...",
      "unstagedDiff": "..."
    },
    "comparison": {
      "current": "...",
      "previous": "...",
      "timeDifference": 123456
    },
    "saved": "/path/to/diff-file.json"
  },
  "mode": "execute",
  "planMode": "disabled",
  "executionComplete": true
}
```

### 7. Health Check

**Endpoint:** `GET /api/agent/health`

Check agent system status.

**Example:**
```bash
curl http://localhost:5000/api/agent/health
```

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "agentMode": "execute",
  "planMode": "disabled",
  "gitDiffAvailable": true,
  "hasChanges": true,
  "message": "Agent system operational - execute mode only"
}
```

## Automatic Features

### Middleware Protection

All API requests automatically include agent protection:

1. **Execution Mode Enforcement** - Forces agents into execution mode
2. **Auto Git Diff Inclusion** - Adds git diff to all responses
3. **Response Validation** - Ensures responses have required fields
4. **Plan Mode Timeout Prevention** - Prevents agents from hanging in plan mode

### Response Headers

All responses include these headers to guide agent behavior:

```
X-Agent-Mode: execute
X-Plan-Mode: disabled
X-Require-Response: true
X-Include-Git-Diff: true
```

## Configuration

### Agent-Specific Settings

Located in `backend/config/agent.config.js`:

```javascript
agents: {
  blackbox: {
    mode: 'execute',
    skipPlanMode: true,
    requireResponse: true,
    includeGitDiff: true,
    autoExecute: true
  },
  claude: {
    mode: 'execute',
    skipPlanMode: false,
    maxPlanIterations: 2,
    requireResponse: true,
    includeGitDiff: true
  }
}
```

### Timeout Settings

```javascript
timeout: {
  planMode: 30000,      // 30 seconds max in plan mode
  execution: 300000,    // 5 minutes max for execution
  response: 5000        // 5 seconds max for response
}
```

## Integration Examples

### For Blackbox AI Agent

```javascript
// 1. Get configuration
const config = await fetch('http://localhost:5000/api/agent/config/blackbox');

// 2. Execute task with git diff
const result = await fetch('http://localhost:5000/api/agent/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    task: 'Fix bug in auth controller',
    agentName: 'blackbox',
    skipPlan: true
  })
});

// 3. Submit results
const submission = await fetch('http://localhost:5000/api/agent/result', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Bug fixed successfully',
    success: true,
    taskId: 'fix-auth-bug'
  })
});
```

### For Other Agents

The system supports multiple agents:
- **Blackbox AI** - Full plan mode prevention
- **Claude** - Limited planning allowed
- **Cursor** - Execution mode only
- **GitHub Copilot** - Execution mode only
- **Default** - Standard configuration

## How It Prevents Plan Mode Issues

### Detection

The system detects plan mode loops by:

1. Tracking request frequency per session
2. Monitoring time between requests
3. Counting plan mode iterations
4. Detecting timeout violations

### Prevention

When plan mode is detected:

1. **Force execution mode** - Automatically switches to execute
2. **Return git diff** - Provides current state and changes
3. **Clear plan state** - Resets iteration counters
4. **Send instructions** - Guides agent to execute immediately

### Enforcement

The middleware ensures:

- Maximum 1 plan iteration (configurable)
- 30-second plan mode timeout
- Required response with git diff
- Automatic execution after planning

## Troubleshooting

### Agent Still Stuck in Plan Mode?

1. **Call force-execute endpoint:**
```bash
curl -X POST http://localhost:5000/api/agent/force-execute \
  -H "Content-Type: application/json" \
  -d '{"agentName": "blackbox"}'
```

2. **Check agent configuration:**
```bash
curl http://localhost:5000/api/agent/config/blackbox
```

3. **Validate agent state:**
```bash
curl -X POST http://localhost:5000/api/agent/validate \
  -H "Content-Type: application/json" \
  -d '{"state": {"mode": "plan", "iterations": 3}}'
```

### Git Diff Not Included?

The middleware automatically adds git diff to all responses. If missing:

1. Check middleware is loaded in `backend/index.js`
2. Verify git is available: `git status`
3. Check git diff manually: `curl http://localhost:5000/api/git-diff/current`

### Response Timeout?

If responses are timing out:

1. Increase timeout in `backend/config/agent.config.js`
2. Check server logs for errors
3. Verify server is running: `npm run dev`

## Best Practices

### For Agent Developers

1. **Always use execute mode** - Skip plan mode entirely
2. **Include git diff** - Use the /agent/result endpoint
3. **Follow response template** - Use /agent/response-template
4. **Handle timeouts** - Respect the timeout limits
5. **Check health** - Verify system status before starting

### For API Users

1. **Use /agent/execute** - For all agent tasks
2. **Monitor with /agent/validate** - Check for plan mode issues
3. **Force if needed** - Use /agent/force-execute when stuck
4. **Get results properly** - Use /agent/result for completions

## API Reference Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/agent/config/:agentName` | GET | Get agent configuration |
| `/api/agent/execute` | POST | Execute task with git diff |
| `/api/agent/validate` | POST | Check for plan mode issues |
| `/api/agent/force-execute` | POST | Force execution mode |
| `/api/agent/response-template` | GET | Get response format |
| `/api/agent/result` | POST | Submit results with diff |
| `/api/agent/health` | GET | Check system status |

## Summary

The system now prevents agents from getting stuck in plan mode through:

1. ✅ **Configuration** - Agent-specific behavior settings
2. ✅ **Routes** - Dedicated endpoints for agent control
3. ✅ **Middleware** - Automatic enforcement and protection
4. ✅ **Git Diff Integration** - Automatic inclusion in responses
5. ✅ **Timeout Prevention** - Forced execution after timeouts
6. ✅ **State Validation** - Detection of plan mode loops
7. ✅ **Force Execute** - Emergency recovery from stuck states

**Result:** Agents always execute tasks and return responses with git diffs, never getting stuck in plan mode.
