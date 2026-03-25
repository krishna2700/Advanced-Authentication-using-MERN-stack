# Quick Start: Fix Blackbox Agent Plan Mode Issue

## Problem
Blackbox AI agent (or other agents) getting stuck in plan mode and not providing responses or git diffs.

## Solution
Use the new `/api/agent` endpoints that force execution mode and include git diffs automatically.

## Quick Fix (30 seconds)

### 1. Start the Server
```bash
npm run dev
```

### 2. Configure Your Agent
Tell your agent to use this endpoint before executing tasks:

```bash
curl http://localhost:5000/api/agent/config/blackbox
```

Response tells the agent to:
- Skip plan mode
- Execute immediately
- Include git diff in responses

### 3. Force Execute (If Agent Is Stuck)
If agent is already stuck in plan mode:

```bash
curl -X POST http://localhost:5000/api/agent/force-execute \
  -H "Content-Type: application/json" \
  -d '{"agentName": "blackbox"}'
```

This immediately:
- Pulls agent out of plan mode
- Returns current git diff
- Forces execution mode

## Integration

### For Agent Developers

Add this to your agent's initialization:

```javascript
// 1. Get configuration
const config = await fetch('http://localhost:5000/api/agent/config/blackbox');
const { instructions } = await config.json();
// instructions.mode === 'execute'
// instructions.planMode === 'disabled'

// 2. Execute tasks with git diff
const result = await fetch('http://localhost:5000/api/agent/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    task: 'Your task here',
    agentName: 'blackbox',
    skipPlan: true
  })
});

// Result includes git diff automatically
const { gitDiff, config: execConfig } = await result.json();
```

### For API Users

Simple workflow:

```bash
# 1. Execute task (gets git diff automatically)
curl -X POST http://localhost:5000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Fix authentication bug",
    "agentName": "blackbox",
    "skipPlan": true
  }'

# 2. Submit results (compares git diffs)
curl -X POST http://localhost:5000/api/agent/result \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Bug fixed successfully",
    "success": true,
    "taskId": "fix-auth-bug"
  }'
```

## Automatic Protection

The system automatically:

1. **Detects plan mode loops** - Monitors request patterns
2. **Forces execution** - Switches to execute mode after timeouts
3. **Includes git diffs** - Adds to all responses automatically
4. **Validates responses** - Ensures required fields are present
5. **Times out plan mode** - 30-second limit before forcing execution

## Response Headers

All responses include these headers to guide agents:

```
X-Agent-Mode: execute
X-Plan-Mode: disabled
X-Require-Response: true
X-Include-Git-Diff: true
```

Your agent should respect these headers.

## Troubleshooting

### Agent Still Planning?
```bash
curl -X POST http://localhost:5000/api/agent/force-execute \
  -H "Content-Type: application/json" \
  -d '{"agentName": "blackbox"}'
```

### No Git Diff in Response?
```bash
# Check git diff endpoint directly
curl http://localhost:5000/api/git-diff/current
```

### Check System Health
```bash
curl http://localhost:5000/api/agent/health
```

## Supported Agents

- **Blackbox AI** - Full plan mode prevention (skipPlanMode: true)
- **Claude** - Limited planning allowed (maxPlanIterations: 2)
- **Cursor** - Execution mode only
- **GitHub Copilot** - Execution mode only
- **Default** - Standard configuration for unknown agents

## Configuration

Edit `backend/config/agent.config.js` to customize:

```javascript
agents: {
  blackbox: {
    mode: 'execute',
    skipPlanMode: true,        // No planning
    requireResponse: true,      // Must respond
    includeGitDiff: true,      // Always include diff
    autoExecute: true          // Execute immediately
  }
}
```

## Summary

**Before:**
- Agent gets stuck in plan mode
- No response
- No git diff
- Task never completes

**After:**
- Agent executes immediately
- Always provides response
- Includes git diff automatically
- Tasks complete successfully

## Next Steps

1. Start server: `npm run dev`
2. Configure your agent to use `/api/agent` endpoints
3. See [AGENT_INTEGRATION.md](./AGENT_INTEGRATION.md) for full documentation

## Emergency Commands

```bash
# Force execute immediately
curl -X POST http://localhost:5000/api/agent/force-execute -H "Content-Type: application/json" -d '{"agentName": "blackbox"}'

# Get current git diff
curl http://localhost:5000/api/git-diff/current

# Check agent health
curl http://localhost:5000/api/agent/health

# Validate agent state
curl -X POST http://localhost:5000/api/agent/validate -H "Content-Type: application/json" -d '{"state": {"mode": "plan", "iterations": 5}}'
```

That's it! Your agent will never get stuck in plan mode again.
