import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/connectDB.js";
import authRoutes from "./routes/auth.route.js";
import gitDiffRoutes, { setWatcherInstance } from "./routes/gitDiff.route.js";
import DiffWatcher from "./utils/diffWatcher.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

// Initialize diff watcher (auto-save every 5 minutes by default)
const DIFF_WATCH_INTERVAL = process.env.DIFF_WATCH_INTERVAL || 5;
const diffWatcher = new DiffWatcher(parseInt(DIFF_WATCH_INTERVAL));

// Inject watcher instance into routes
setWatcherInstance(diffWatcher);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/git-diff", gitDiffRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);

  // Start automatic diff watcher
  if (process.env.DIFF_WATCH_ENABLED !== 'false') {
    diffWatcher.start();
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, stopping diff watcher...');
  diffWatcher.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, stopping diff watcher...');
  diffWatcher.stop();
  process.exit(0);
});
