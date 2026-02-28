# Reproduction Guide for Git Diff Disappearing Bug

## Setup
This guide helps reproduce the bug where git diff information disappears after task completion.

## Prerequisites
- Claude Code interface
- Git repository with multiple commits
- Task management system enabled

## Steps to Reproduce

### Step 1: Start with a Repository with Changes
```bash
# Verify you have commits
git log --oneline

# Check current diff
git diff HEAD~1
```

### Step 2: Create a Task List
Use the TodoWrite tool to create multiple tasks:
```
1. Read a file
2. Make a change to the file
3. View git diff
4. Mark task as complete
```

### Step 3: Execute Tasks and Monitor Diff Visibility
1. Start task 1 (in_progress)
2. Complete task 1
3. Start task 2 (in_progress)
4. Make changes to a file
5. Complete task 2
6. Start task 3 (in_progress)
7. View git diff - **DIFF SHOULD BE VISIBLE HERE**
8. Complete task 3
9. **BUG: Check if diff is still visible - it may have disappeared**

### Step 4: Observe Behavior
After marking task 3 as completed:
- Does the git diff remain visible in the interface?
- Is there a way to retrieve the previously displayed diff?
- Does the interface maintain any state about previous diffs?

## Expected vs Actual

### Expected
- Git diff information persists throughout the session
- Users can review changes at any time
- Task completion doesn't affect diff visibility
- Diff history is maintained

### Actual
- Git diff may disappear after task completion
- No way to retrieve the disappeared diff from interface
- State is cleared on task completion
- Users must manually run git commands again

## Test Cases

### Test Case 1: Single Task Completion
1. Display git diff
2. Mark task as complete
3. Verify diff is still visible

### Test Case 2: Multiple Task Completions
1. Display git diff
2. Complete multiple tasks sequentially
3. Verify diff persists after each completion

### Test Case 3: Diff After File Changes
1. Make changes to files
2. Display git diff (should show changes)
3. Complete task
4. Verify diff showing recent changes is still visible

### Test Case 4: Diff of Previous Commits
1. Display git diff of previous commits (e.g., HEAD~1)
2. Complete unrelated task
3. Verify historical diff is still accessible

## Data Collection
When reproducing, collect:
- Screenshot/log before task completion showing diff
- Screenshot/log after task completion
- Task state transitions
- Any console errors or warnings
- Network requests related to diff retrieval

## Notes
- This issue appears to be intermittent ("sometimes" in the bug report)
- May be related to state management in the UI layer
- Could be triggered by specific task completion events
- Might involve cleanup routines that are too aggressive
