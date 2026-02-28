#!/usr/bin/env node

/**
 * auto-capture-diff.js
 *
 * Automatically captures git diffs so they never disappear after task
 * completion, commits, or file cleanup.
 *
 * Called by git hooks (pre-commit / post-commit) — not meant to be run
 * manually. For manual captures use `npm run capture-diff` instead.
 *
 * Usage (from hooks):
 *   node scripts/auto-capture-diff.js pre-commit
 *   node scripts/auto-capture-diff.js post-commit
 */

import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync, readdirSync, unlinkSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const DIFF_DIR = join(ROOT, ".task-diffs");
const MAX_LOG_FILES = 50;

function git(args) {
  try {
    return execSync(`git ${args}`, {
      cwd: ROOT,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch {
    return "";
  }
}

function ts() {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

function pruneOldLogs() {
  try {
    const files = readdirSync(DIFF_DIR)
      .filter((f) => f.startsWith("diff-") && f.endsWith(".log"))
      .sort();
    while (files.length > MAX_LOG_FILES) {
      unlinkSync(join(DIFF_DIR, files.shift()));
    }
  } catch {
    // non-critical
  }
}

function capturePreCommit() {
  const status = git("status --porcelain");
  const diffStaged = git("diff --staged");
  const diffUnstaged = git("diff");

  if (!status.trim() && !diffStaged.trim()) return;

  mkdirSync(DIFF_DIR, { recursive: true });

  const separator = "=".repeat(72);
  const content = [
    `PRE-COMMIT DIFF CAPTURE`,
    `Timestamp : ${new Date().toISOString()}`,
    ``,
    `${separator}`,
    `CHANGED FILES  (git status --porcelain)`,
    `${separator}`,
    status || "(none)",
    ``,
    `${separator}`,
    `STAGED CHANGES  (git diff --staged)  ← this is what will be committed`,
    `${separator}`,
    diffStaged || "(nothing staged)",
    ``,
    `${separator}`,
    `UNSTAGED CHANGES  (git diff)  ← working-tree changes not in this commit`,
    `${separator}`,
    diffUnstaged || "(none)",
  ].join("\n");

  writeFileSync(join(DIFF_DIR, `diff-${ts()}--pre-commit.log`), content + "\n");
  pruneOldLogs();
}

function capturePostCommit() {
  const commitHash = git("rev-parse --short HEAD").trim();
  const commitMsg = git("log -1 --pretty=%s").trim();
  const commitDiff = git("diff HEAD~1..HEAD");
  const commitStat = git("diff HEAD~1..HEAD --stat");

  if (!commitDiff.trim()) return;

  mkdirSync(DIFF_DIR, { recursive: true });

  const separator = "=".repeat(72);
  const content = [
    `POST-COMMIT DIFF CAPTURE`,
    `Timestamp : ${new Date().toISOString()}`,
    `Commit    : ${commitHash} — ${commitMsg}`,
    ``,
    `${separator}`,
    `COMMIT STAT  (git diff HEAD~1..HEAD --stat)`,
    `${separator}`,
    commitStat || "(empty commit)",
    ``,
    `${separator}`,
    `COMMIT DIFF  (git diff HEAD~1..HEAD)`,
    `${separator}`,
    commitDiff || "(empty commit)",
  ].join("\n");

  writeFileSync(
    join(DIFF_DIR, `diff-${ts()}--post-commit-${commitHash}.log`),
    content + "\n"
  );
  pruneOldLogs();
}

const phase = process.argv[2];

try {
  if (phase === "pre-commit") capturePreCommit();
  else if (phase === "post-commit") capturePostCommit();
  else {
    console.error("Usage: auto-capture-diff.js <pre-commit|post-commit>");
    process.exit(1);
  }
} catch {
  // Hooks must never block a commit
  process.exit(0);
}
