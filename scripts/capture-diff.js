#!/usr/bin/env node

/**
 * capture-diff.js
 *
 * Captures the current git diff state — both uncommitted AND recently committed
 * changes — and persists everything to a timestamped log file in .task-diffs/.
 *
 * This solves the problem where diffs "disappear" after task completion: once
 * changes are committed the working tree is clean, so a plain `git diff HEAD`
 * returns nothing.  This script also records the last N commit diffs so you
 * always have a full record of what changed.
 *
 * Usage:
 *   node scripts/capture-diff.js
 *   npm run capture-diff
 *   npm run capture-diff -- --label "my feature work"
 *   npm run capture-diff -- --commits 3          # include last 3 commit diffs
 *   npm run capture-diff -- --no-last-commit     # skip committed diff section
 */

import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const DIFF_DIR = join(ROOT, ".task-diffs");

// ── helpers ──────────────────────────────────────────────────────────────

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

/** Parse a simple CLI flag value:  --flag value  →  value */
function flagValue(flag, fallback) {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 && process.argv[idx + 1]
    ? process.argv[idx + 1]
    : fallback;
}

/** Check if a boolean flag is present:  --no-last-commit  →  true */
function hasFlag(flag) {
  return process.argv.includes(flag);
}

// ── main ─────────────────────────────────────────────────────────────────

function main() {
  const label = flagValue("--label", "");
  const commitCount = Math.max(1, parseInt(flagValue("--commits", "1"), 10));
  const includeLastCommit = !hasFlag("--no-last-commit");

  const separator = "=".repeat(72);
  const thinSep = "-".repeat(72);
  const sections = [];

  // Header
  sections.push(
    "TASK DIFF CAPTURE",
    `Timestamp : ${new Date().toISOString()}`,
    label ? `Label     : ${label}` : null,
    ""
  );

  // ── 1. Recent commit log ──────────────────────────────────────────────
  const logRecent = git("log --oneline -10");
  sections.push(separator, "RECENT COMMITS", separator);
  sections.push(logRecent || "(no commits)", "");

  // ── 2. Uncommitted changes ────────────────────────────────────────────
  const status = git("status --porcelain");
  const diffAll = git("diff HEAD");
  const diffStaged = git("diff --staged");

  const hasUncommitted = !!(status.trim() || diffAll.trim() || diffStaged.trim());

  sections.push(separator, "CHANGED FILES  (git status --porcelain)", separator);
  sections.push(status || "(clean working tree)", "");

  sections.push(separator, "UNCOMMITTED DIFF  (git diff HEAD)", separator);
  sections.push(diffAll || "(no uncommitted changes)", "");

  sections.push(separator, "STAGED DIFF  (git diff --staged)", separator);
  sections.push(diffStaged || "(no staged changes)", "");

  // ── 3. Last N committed diffs (the key addition) ──────────────────────
  let hasCommitDiffs = false;

  if (includeLastCommit) {
    sections.push(
      separator,
      `LAST ${commitCount} COMMIT DIFF${commitCount > 1 ? "S" : ""}`,
      separator,
      ""
    );

    for (let i = 0; i < commitCount; i++) {
      const ref = `HEAD~${i}`;
      const parentRef = `HEAD~${i + 1}`;

      // Show commit metadata
      const commitInfo = git(`log -1 --format="%H%n%an <%ae>%n%ai%n%s" ${ref}`);
      if (!commitInfo.trim()) break; // no more commits

      const commitDiff = git(`diff ${parentRef}..${ref}`);
      const commitStat = git(`diff --stat ${parentRef}..${ref}`);

      if (commitDiff.trim()) hasCommitDiffs = true;

      sections.push(
        thinSep,
        `Commit ${i + 1}: ${ref}`,
        thinSep,
        commitInfo.trim(),
        "",
        "Files changed:",
        commitStat || "  (none)",
        "",
        "Diff:",
        commitDiff || "(empty commit or root commit)",
        ""
      );
    }
  }

  // ── Bail out only if there is truly nothing at all ────────────────────
  if (!hasUncommitted && !hasCommitDiffs) {
    console.log("ℹ  No uncommitted or recent committed changes to capture.");
    process.exit(0);
  }

  // ── Write log file ────────────────────────────────────────────────────
  mkdirSync(DIFF_DIR, { recursive: true });

  const ts = timestamp();
  const filename = label
    ? `diff-${ts}--${label.replace(/[^a-zA-Z0-9_-]/g, "_")}.log`
    : `diff-${ts}.log`;
  const filepath = join(DIFF_DIR, filename);

  writeFileSync(
    filepath,
    sections.filter((line) => line !== null).join("\n") + "\n",
    "utf-8"
  );

  // ── Summary to stdout ─────────────────────────────────────────────────
  console.log(`✅ Diff captured → ${filepath}`);
  console.log();

  if (hasUncommitted) {
    const changedFiles = status
      .split("\n")
      .filter(Boolean)
      .map((l) => `  ${l}`)
      .join("\n");
    console.log("Uncommitted files:");
    console.log(changedFiles || "  (none)");
    console.log(
      `Uncommitted diff: ${diffAll.length} chars (all) / ${diffStaged.length} chars (staged)`
    );
  } else {
    console.log("Working tree is clean (no uncommitted changes).");
  }

  if (hasCommitDiffs) {
    console.log(
      `Last ${commitCount} commit diff${commitCount > 1 ? "s" : ""}: included ✓`
    );
  }
}

main();
