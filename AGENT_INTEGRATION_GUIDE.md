# Agent Integration Guide

## Problem: Blackbox Agent Getting Stuck in Plan Mode

This guide addresses the issue where AI agents (particularly Blackbox) get stuck in plan mode and fail to:
1. Provide text responses
2. Execute tasks autonomously
3. Include git diff information in completions

## Solution Overview

This project now includes `.clinerules` configuration that enforces proper agent behavior:

- ✅ **No silent execution** - Always provide responses
- ✅ **No plan mode loops** - Execute after brief planning
- ✅ **Git diff integration** - Show what changed
- ✅ **Autonomous execution** - Don't wait for approval

## Quick Start for Agents

### Step 1: Understand the Task
```
Agent: "I'll [describe what you're doing]..."
```

### Step 2: Execute Changes
```
Agent: [Make code changes]
Agent: "Modified files: X, Y, Z"
```

### Step 3: Capture Git Diff
```bash
# Save the diff with a task ID
node backend/utils/diffCli.js save "task-description"
```

### Step 4: Show Results
```
Agent: "Completed! Here's what changed:"
Agent: [Display git diff output]
```

## Integration Examples

### Example 1: Simple Task Completion

**Bad (Gets Stuck):**
```
User: "Fix the authentication bug"
Agent: "Let me analyze this..."
Agent: "I have a plan to fix it..."
Agent: "Should I proceed?"
[STUCK - Waiting forever]
```

**Good (Executes):**
```
User: "Fix the authentication bug"
Agent: "I'll fix the authentication bug by updating the JWT validation..."
Agent: [Makes changes to auth.controller.js]
Agent: "Changes completed. Modified: backend/controllers/auth.controller.js"
Agent: [Runs: node backend/utils/diffCli.js save "fix-auth-bug"]
Agent: "Git diff saved. Here's what changed:"
Agent: [Shows diff output]
```

### Example 2: Multi-Step Task

**Bad (Silent Execution):**
```
User: "Add email verification feature"
[Agent makes changes silently]
[No output]
[User has no idea what happened]
```

**Good (Communicative):**
```
User: "Add email verification feature"
Agent: "I'll add email verification in 3 steps:"
Agent: "Step 1: Creating email verification model..."
Agent: [Creates model]
Agent: "Step 2: Adding verification endpoints..."
Agent: [Creates routes]
Agent: "Step 3: Integrating with auth flow..."
Agent: [Updates auth controller]
Agent: [Runs: node backend/utils/diffCli.js save "add-email-verification"]
Agent: "All steps completed! Modified 3 files. Here's the diff:"
Agent: [Shows diff]
```

## Git Diff Integration Methods

### Method 1: CLI (Recommended for Agents)

```bash
# Save current diff
node backend/utils/diffCli.js save "task-name"

# View last saved diff
node backend/utils/diffCli.js last

# View current diff
node backend/utils/diffCli.js current

# Compare changes
node backend/utils/diffCli.js compare
```

### Method 2: REST API

```bash
# Save diff
curl -X POST http://localhost:5000/api/git-diff/save \
  -H "Content-Type: application/json" \
  -d '{"taskId": "task-name"}'

# Get last diff
curl http://localhost:5000/api/git-diff/last

# Get current diff
curl http://localhost:5000/api/git-diff/current
```

### Method 3: Programmatic (Node.js)

```javascript
import gitDiffTracker from './backend/utils/gitDiffTracker.js';

// Save diff
await gitDiffTracker.saveDiff('task-name');

// Get last diff
const lastDiff = await gitDiffTracker.getLastDiff();
console.log(lastDiff.combinedDiff);
```

## Agent Workflow Template

Use this template for every task:

```
1. ACKNOWLEDGE
   "I'll [describe task]..."

2. ANALYZE (Brief - 30 seconds max)
   "Analyzing the codebase..."
   [Read relevant files]

3. EXECUTE (Don't ask permission)
   "Making changes to [files]..."
   [Make changes]
   "Modified: [list files]"

4. CAPTURE DIFF
   [Run: node backend/utils/diffCli.js save "task-id"]

5. REPORT RESULTS
   "Completed! Here's what changed:"
   [Show diff output]
   "Run: npm run dev to test"
```

## Blackbox Agent Specific Instructions

If you're the Blackbox AI agent, follow these rules:

### Rule 1: Exit Plan Mode Immediately
- Maximum 1-2 planning messages
- Then switch to execution
- Never ask "Should I proceed?"

### Rule 2: Always Respond
- Never produce empty output
- Always acknowledge user messages
- Explain what you're doing

### Rule 3: Show Git Diffs
- After every task completion
- Use: `node backend/utils/diffCli.js save "task"`
- Display the diff output

### Rule 4: Be Autonomous
- Don't wait for approval between steps
- Execute multi-step tasks completely
- Only ask if critical info is missing

### Rule 5: Match Other Agents
- Behave like Cline, Cursor, etc.
- Provide same level of detail
- Use same completion format

## Verification Checklist

After completing a task, verify:

- [ ] Did I provide a text response?
- [ ] Did I execute without getting stuck?
- [ ] Did I save the git diff?
- [ ] Did I show what changed?
- [ ] Did I offer a verification command?

## Common Mistakes to Avoid

### Mistake 1: Infinite Planning Loop
```
❌ "Let me plan..."
❌ "Here's my plan..."
❌ "Should I proceed?"
❌ "Waiting for approval..."
```

**Fix:** Plan briefly, then execute immediately.

### Mistake 2: Silent Execution
```
❌ [Makes changes]
❌ [No output]
```

**Fix:** Always announce what you're doing.

### Mistake 3: No Diff Tracking
```
❌ "Task completed!"
❌ [No diff shown]
```

**Fix:** Always save and show git diff.

### Mistake 4: Asking for Permission
```
❌ "Should I create this file?"
❌ "Can I proceed with step 2?"
❌ "Do you want me to continue?"
```

**Fix:** Just do it. Execute autonomously.

## Testing Agent Behavior

To test if an agent is working correctly:

```bash
# Test 1: Simple greeting
User: "Hello"
Expected: Agent responds with greeting + offer to help

# Test 2: Simple task
User: "Add a comment to index.js"
Expected: Agent executes, shows diff, no questions asked

# Test 3: Multi-step task
User: "Create a new API endpoint for user profile"
Expected: Agent completes all steps, shows final diff

# Test 4: Complex task
User: "Refactor the authentication system"
Expected: Agent analyzes briefly, executes, shows comprehensive diff
```

## Automatic Diff Preservation

This project includes automatic diff preservation:

- **Auto-save**: Every 5 minutes (background watcher)
- **Git hooks**: On every commit
- **Manual**: Via CLI or API anytime

Agents should still manually save diffs at task completion for clarity.

## Support

If an agent continues to get stuck:

1. Check `.clinerules` is present
2. Verify git diff tracker is working: `node backend/utils/diffCli.js current`
3. Ensure agent has access to execute commands
4. Review agent's configuration/prompts

## Summary

**For Blackbox Agent:**
- Don't get stuck in plan mode
- Always provide responses
- Show git diffs
- Execute autonomously
- Match behavior of other agents (Cline, Cursor, etc.)

**The Golden Rule:** ACT, don't just PLAN. Respond. Show diffs. Keep moving forward.
