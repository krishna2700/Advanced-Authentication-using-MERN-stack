# Advanced Authentication using MERN Stack

A full-stack authentication application built with MongoDB, Express, React, and Node.js, featuring advanced user authentication capabilities and a Git Diff Tracker utility for development workflow management.

## Features

### Authentication System
- User registration and login
- Secure password hashing with bcryptjs
- JWT-based authentication with cookies
- MongoDB database integration
- RESTful API architecture

### Git Diff Tracker
- **Automatic preservation** of git diffs (no manual intervention needed)
- **Git hooks** save diffs on every commit
- **Background watcher** auto-saves every 5 minutes
- CLI and REST API access to diff history
- Automatic cleanup of old diffs
- Compare changes across different points in time
- Export diff history to JSON

### AI Agent Integration
- **Prevents plan mode loops** - Agents never get stuck in planning
- **Automatic git diff inclusion** - All responses include current diffs
- **Force execution mode** - Ensures agents execute tasks immediately
- **Multiple agent support** - Works with Blackbox, Claude, Cursor, Copilot
- **Timeout protection** - Prevents agents from hanging
- **State validation** - Detects and corrects stuck agents

## Project Structure

```
.
├── backend/
│   ├── config/
│   │   └── agent.config.js       # Agent behavior configuration
│   ├── controllers/
│   │   └── auth.controller.js    # Authentication logic
│   ├── db/
│   │   └── connectDB.js          # MongoDB connection
│   ├── middleware/
│   │   └── agentMode.middleware.js # Agent plan mode prevention
│   ├── models/
│   │   └── user.model.js         # User schema
│   ├── routes/
│   │   ├── auth.route.js         # Auth endpoints
│   │   ├── gitDiff.route.js      # Git diff endpoints
│   │   └── agent.route.js        # Agent control endpoints
│   ├── utils/
│   │   ├── gitDiffTracker.js     # Core diff tracking logic
│   │   └── diffCli.js            # CLI interface
│   └── index.js                  # Server entry point
├── package.json
├── .gitignore
├── README.md
├── GIT_DIFF_TRACKER.md           # Detailed git diff tracker docs
└── AGENT_INTEGRATION.md          # Agent integration guide
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd advanced-authentication-using-mern-stack
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# Optional: Configure diff watcher (defaults shown)
DIFF_WATCH_ENABLED=true
DIFF_WATCH_INTERVAL=5
```

4. Start the development server:
```bash
npm run dev
```

**The Git Diff Tracker will automatically start and preserve your changes!**

## Quick Start - Diff Preservation

Once the server is running, your git diffs are automatically preserved through:

1. **Automatic watcher** - Saves every 5 minutes
2. **Git hooks** - Saves on every commit
3. **Manual saves** - Use `npm run diff:save` anytime

### Recover Lost Diffs

```bash
# View your last saved diff
npm run diff:last

# View all recent diffs
npm run diff:history

# Compare current vs previous
npm run diff:compare
```

See [DIFF_PRESERVATION_GUIDE.md](./DIFF_PRESERVATION_GUIDE.md) for complete documentation.

## API Endpoints

### Authentication Routes (`/api/auth`)

The authentication endpoints handle user registration, login, and session management.

### Agent Control Routes (`/api/agent`)

Prevent AI agents from getting stuck in plan mode and ensure proper responses with git diffs.

#### `GET /api/agent/config/:agentName`
Get configuration for specific agent (blackbox, claude, cursor, etc.)

**Response:**
```json
{
  "success": true,
  "agent": "blackbox",
  "config": {
    "mode": "execute",
    "skipPlanMode": true,
    "includeGitDiff": true
  },
  "instructions": {
    "mode": "execute",
    "planMode": "disabled"
  }
}
```

#### `POST /api/agent/execute`
Execute task with automatic git diff inclusion

**Request:**
```json
{
  "task": "Fix authentication bug",
  "agentName": "blackbox",
  "skipPlan": true
}
```

#### `POST /api/agent/force-execute`
Force agent out of plan mode into execution mode

#### `POST /api/agent/result`
Submit task results with git diff comparison

#### `GET /api/agent/health`
Check agent system status

See [AGENT_INTEGRATION.md](./AGENT_INTEGRATION.md) for complete documentation.

### Git Diff Routes (`/api/git-diff`)

#### `GET /api/git-diff/current`
Get the current git diff (staged and unstaged changes)

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2026-02-28T17:00:00.000Z",
    "branch": "main",
    "lastCommit": "abc1234 Commit message",
    "stagedDiff": "...",
    "unstagedDiff": "...",
    "combinedDiff": "..."
  }
}
```

#### `POST /api/git-diff/save`
Save the current git diff to history

**Request Body:**
```json
{
  "taskId": "task-123"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Diff saved successfully",
  "filepath": "/path/to/saved/diff.json"
}
```

#### `GET /api/git-diff/history?limit=10`
Get diff history (default: 10 most recent entries)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

#### `GET /api/git-diff/last`
Get the most recently saved diff

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "...",
    "branch": "...",
    "lastCommit": "...",
    "stagedDiff": "...",
    "unstagedDiff": "..."
  }
}
```

#### `GET /api/git-diff/compare`
Compare current diff with the previous saved diff

**Response:**
```json
{
  "success": true,
  "data": {
    "current": {...},
    "previous": {...},
    "timeDifference": 123456
  }
}
```

#### `GET /api/git-diff/export?path=./export.json`
Export all diff history to a JSON file

**Response:**
```json
{
  "success": true,
  "message": "History exported",
  "filepath": "./export.json"
}
```

## Git Diff Tracker CLI

The Git Diff Tracker includes a command-line interface for quick access to diff history.

### CLI Commands

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

### Use Cases

**Before completing a task:**
```bash
node backend/utils/diffCli.js save before-refactor
```

**After making changes:**
```bash
node backend/utils/diffCli.js compare
```

**Review what changed:**
```bash
node backend/utils/diffCli.js last
```

## Programmatic Usage

You can also use the Git Diff Tracker programmatically in your Node.js code:

```javascript
import gitDiffTracker from './backend/utils/gitDiffTracker.js';

// Get current diff
const current = await gitDiffTracker.getCurrentDiff();

// Save current diff
const filepath = await gitDiffTracker.saveDiff('my-task');

// Get history
const history = await gitDiffTracker.getDiffHistory(10);

// Get last diff
const last = await gitDiffTracker.getLastDiff();

// Compare with previous
const comparison = await gitDiffTracker.compareWithPrevious();

// Export history
await gitDiffTracker.exportDiffHistory('./export.json');
```

## Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cookie-parser** - Parse cookies
- **dotenv** - Environment variables
- **mailtrap** - Email service integration

### Development
- **nodemon** - Auto-reload during development

## Storage and Data Management

### Authentication Data
- User credentials are stored in MongoDB
- Passwords are hashed using bcryptjs
- JWTs are used for session management

### Git Diff History
- Diffs are stored in `.git/diff-history/`
- Maximum 50 diffs are kept (automatically cleaned)
- Files are named: `diff-{timestamp}-task-{taskId}.json`
- Directory is excluded from git via `.gitignore`

## Development Workflow

1. Start the development server:
```bash
npm run dev
```

2. The server will run on the port specified in your `.env` file

3. Use the authentication endpoints for user management

4. Use the git diff tracker to preserve change history during development

## Environment Variables

Create a `.env` file with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/auth-db
JWT_SECRET=your-secret-key-here
```

## Git Diff Tracker Benefits

1. **No Lost Changes** - Always have access to previous diffs
2. **Change Tracking** - Track what changed between tasks
3. **Debugging** - Identify when specific changes were made
4. **History** - Review progression of work over time
5. **Recovery** - Retrieve lost information if diff disappears

## Advanced Configuration

### Custom History Size

Modify `maxHistorySize` in `backend/utils/gitDiffTracker.js`:

```javascript
constructor() {
  this.maxHistorySize = 100; // Keep 100 diffs instead of 50
}
```

### Git Hook Integration

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
node backend/utils/diffCli.js save "pre-commit-$(date +%s)"
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

## Troubleshooting

### Authentication Issues
- Ensure MongoDB is running and accessible
- Verify `.env` file contains correct credentials
- Check that JWT_SECRET is set

### Git Diff Tracker Issues

**No diffs saved?**
- Ensure you're in a git repository
- Check that git is installed and accessible

**Can't access history?**
- Verify `.git/diff-history/` directory exists
- Check file permissions

**Too many old diffs?**
- The tracker automatically keeps only the last 50
- You can manually clean: `rm -rf .git/diff-history/*`

## License

ISC

## Additional Documentation

- **[AGENT_INTEGRATION.md](./AGENT_INTEGRATION.md)** - Fix for agents stuck in plan mode (Blackbox AI, etc.)
- **[DIFF_PRESERVATION_GUIDE.md](./DIFF_PRESERVATION_GUIDE.md)** - Complete guide for automatic diff preservation (start here!)
- **[GIT_DIFF_TRACKER.md](./GIT_DIFF_TRACKER.md)** - Git Diff Tracker API reference and details

## Contributing

This project is part of an advanced authentication system. Contributions should maintain the security standards and follow the existing code structure.
