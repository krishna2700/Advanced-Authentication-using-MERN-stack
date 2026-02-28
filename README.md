# Advanced-Authentication-using-MERN-stack

A MERN-stack application with advanced authentication features including signup, login, logout, email verification, and password reset.

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 5
- **Database:** MongoDB (Mongoose ODM)
- **Auth:** bcryptjs, JSON Web Tokens
- **Email:** Mailtrap

## Getting Started

```bash
npm install
```

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<db>
JWT_SECRET=your_jwt_secret
```

Start the development server:

```bash
npm run dev
```

## API Routes

All routes are prefixed with `/api/auth`.

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/auth/signup` | Register a new user |
| GET | `/api/auth/login` | Log in an existing user |
| GET | `/api/auth/logout` | Log out the current user |

## Project Structure

```
├── backend/
│   ├── index.js              # Express server entry point
│   ├── controllers/
│   │   └── auth.controller.js # Auth route handlers
│   ├── db/
│   │   └── connectDB.js       # MongoDB connection
│   ├── models/
│   │   └── user.model.js      # Mongoose User schema
│   └── routes/
│       └── auth.route.js      # Auth route definitions
├── scripts/
│   ├── capture-diff.js        # Manual git diff capture utility
│   ├── auto-capture-diff.js   # Automatic diff capture (called by git hooks)
│   └── install-hooks.js       # Installs pre-commit & post-commit git hooks
└── package.json
```

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start the server with nodemon (hot-reload) |
| `npm run capture-diff` | Manually snapshot all uncommitted git changes to a local log file |
| `npm run install-hooks` | Install pre-commit & post-commit git hooks for automatic diff capture |
| `npm run prepare` | Runs automatically after `npm install` — installs git hooks |

## Automatic Diff Capture (Git Hooks)

Git hooks are installed automatically when you run `npm install` (via the `prepare` script). They ensure diffs are **never lost** — no manual action required.

### How It Works

- **Pre-commit hook** — Right before a commit is created, the hook snapshots `git diff --staged` (what's about to be committed) and `git diff` (unstaged changes). This is the diff that normally "disappears" once the commit is made.
- **Post-commit hook** — Right after a commit, the hook captures `git diff HEAD~1..HEAD` (the full diff of the commit that was just created). This gives you a permanent local record of every commit's changes.

Both hooks write timestamped `.log` files to `.task-diffs/` (gitignored). They are silent and non-blocking — if anything fails, the commit still proceeds normally.

### Manual Setup

Hooks are installed automatically after `npm install`. To reinstall manually:

```bash
npm run install-hooks
```

### Log Retention

The `.task-diffs/` directory is capped at 50 log files. Oldest logs are pruned automatically.

---

## Manual Capture-Diff Utility

A helper script that preserves git diffs so they don't get lost after task completion or file cleanup.

### Why

During development workflows (especially with AI-assisted coding), uncommitted diffs can disappear after a task is marked complete and temporary files are cleaned up. Once changes are **committed**, `git diff HEAD` returns nothing — the diff is effectively invisible unless you know the exact commit hashes to compare. This utility captures a full snapshot of **both** uncommitted and recently committed changes so you always have a record.

### What It Captures

- `git status --porcelain` — list of changed files
- `git diff HEAD` — full diff of all uncommitted changes
- `git diff --staged` — diff of staged-only changes
- `git diff HEAD~N..HEAD` — diff of the last N commits (default: 1)
- Recent commit log for context

### Usage

```bash
# Basic capture (includes uncommitted + last commit diff)
npm run capture-diff

# With a descriptive label
npm run capture-diff -- --label "signup feature"

# Include diffs from the last 3 commits
npm run capture-diff -- --commits 3

# Skip committed diffs, only capture uncommitted changes
npm run capture-diff -- --no-last-commit

# Combine flags
npm run capture-diff -- --label "auth refactor" --commits 2
```

### Flags

| Flag | Default | Description |
| ---- | ------- | ----------- |
| `--label <text>` | _(none)_ | Add a descriptive label to the log filename |
| `--commits <n>` | `1` | Number of recent commit diffs to include |
| `--no-last-commit` | _(off)_ | Skip the committed diff section entirely |

Output is saved to `.task-diffs/diff-<timestamp>.log` (or `diff-<timestamp>--<label>.log`). This directory is gitignored so logs stay local-only.