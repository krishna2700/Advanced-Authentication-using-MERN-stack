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
- Track and preserve git diff information across development tasks
- CLI and REST API access to diff history
- Automatic cleanup of old diffs
- Compare changes across different points in time
- Export diff history to JSON

## Project Structure

```
.
├── backend/
│   ├── controllers/
│   │   └── auth.controller.js    # Authentication logic
│   ├── db/
│   │   └── connectDB.js          # MongoDB connection
│   ├── models/
│   │   └── user.model.js         # User schema
│   ├── routes/
│   │   ├── auth.route.js         # Auth endpoints
│   │   └── gitDiff.route.js      # Git diff endpoints
│   ├── utils/
│   │   ├── gitDiffTracker.js     # Core diff tracking logic
│   │   └── diffCli.js            # CLI interface
│   └── index.js                  # Server entry point
├── package.json
├── .gitignore
├── README.md
└── GIT_DIFF_TRACKER.md           # Detailed git diff tracker docs
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
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication Routes (`/api/auth`)

The authentication endpoints handle user registration, login, and session management.

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

For detailed information about the Git Diff Tracker, see [GIT_DIFF_TRACKER.md](./GIT_DIFF_TRACKER.md)

## Contributing

This project is part of an advanced authentication system. Contributions should maintain the security standards and follow the existing code structure.
