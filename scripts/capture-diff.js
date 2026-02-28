#!/usr/bin/env node

/**
 * capture-diff.js
 *
 * Captures the current git diff state and persists it to a timestamped log file
 * in .task-diffs/. Run this BEFORE task completion or cleanup to preserve a
 * record of all changes made during a task.
 *
 * Usage:
 *   node scripts/capture-diff.js
 *   npm run capture-diff
 *   npm run capture-diff -- --label "my feature work"
 */

import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const DIFF_DIR = join(ROOT, ".task-diffs");

/** Run a git command and return its stdout (empty string on error). */
function git(args) {
  try {
    return execSync(`git ${args}`, { cwd: ROOT, encoding: "utf-8" });
  } catch {
    return "";
  }
}

/** Build a safe filename-friendly timestamp: 2026-02-28T12-30-00 */
function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

function main() {
  // Optional label from CLI args (--label "something")
  const labelIdx = process.argv.indexOf("--label");
  const label =
    labelIdx !== -1 && process.argv[labelIdx + 1]
      ? process.argv[labelIdx + 1]
      : "";

  // Gather git information
  const status = git("status --porcelain");
  const diffAll = git("diff HEAD");
  const diffStaged = git("diff --staged");
  const logRecent = git("log --oneline -5");

  // If there is nothing to capture, say so and exit
  if (!status.trim() && !diffAll.trim() && !diffStaged.trim()) {
    console.log("ℹ  No uncommitted changes to capture.");
    process.exit(0);
  }

  // Ensure output directory exists
  mkdirSync(DIFF_DIR, { recursive: true });

  const ts = timestamp();
  const filename = label
    ? `diff-${ts}--${label.replace(/[^a-zA-Z0-9_-]/g, "_")}.log`
    : `diff-${ts}.log`;
  const filepath = join(DIFF_DIR, filename);

  // Build the log content
  const separator = "=".repeat(72);
  const sections = [
    `TASK DIFF CAPTURE`,
    `Timestamp : ${new Date().toISOString()}`,
    label ? `Label     : ${label}` : null,
    ``,
    `${separator}`,
    `RECENT COMMITS`,
    `${separator}`,
    logRecent || "(no commits)",
    ``,
    `${separator}`,
    `CHANGED FILES  (git status --porcelain)`,
    `${separator}`,
    status || "(no changes)",
    ``,
    `${separator}`,
    `FULL DIFF  (git diff HEAD)`,
    `${separator}`,
    diffAll || "(no diff)",
    ``,
    `${separator}`,
    `STAGED DIFF  (git diff --staged)`,
    `${separator}`,
    diffStaged || "(no staged changes)",
  ].filter((line) => line !== null);

  writeFileSync(filepath, sections.join("\n") + "\n", "utf-8");

  // Summary to stdout
  const changedFiles = status
    .split("\n")
    .filter(Boolean)
    .map((l) => `  ${l}`)
    .join("\n");

  console.log(`✅ Diff captured → ${filepath}`);
  console.log();
  console.log("Changed files:");
  console.log(changedFiles || "  (none)");
  console.log();
  console.log(
    `Diff size: ${diffAll.length} chars (all) / ${diffStaged.length} chars (staged)`
  );
}

main();
