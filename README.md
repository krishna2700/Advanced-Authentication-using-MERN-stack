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
│   └── capture-diff.js        # Git diff capture utility
└── package.json
```

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start the server with nodemon (hot-reload) |
| `npm run capture-diff` | Snapshot all uncommitted git changes to a local log file |

## Capture-Diff Utility

A helper script that preserves git diffs so they don't get lost after task completion or file cleanup.

### Why

During development workflows (especially with AI-assisted coding), uncommitted diffs can disappear after a task is marked complete and temporary files are cleaned up. This utility captures a full snapshot of the current working-tree state before that happens.

### What It Captures

- `git status --porcelain` — list of changed files
- `git diff HEAD` — full diff of all uncommitted changes
- `git diff --staged` — diff of staged-only changes
- Last 5 commit messages for context

### Usage

```bash
# Basic capture
npm run capture-diff

# With a descriptive label
npm run capture-diff -- --label "signup feature"

# Or directly
node scripts/capture-diff.js --label "refactor auth"
```

Output is saved to `.task-diffs/diff-<timestamp>.log` (or `diff-<timestamp>--<label>.log`). This directory is gitignored so logs stay local-only.