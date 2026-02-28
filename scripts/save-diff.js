#!/usr/bin/env node

/**
 * save-diff.js
 *
 * Captures BOTH the last commit's diff AND any uncommitted changes,
 * then persists them to .diffs/<timestamp>.diff.
 *
 * This solves the problem where git diffs "disappear" after task
 * completion — the environment auto-commits changes, making
 * `git diff HEAD` empty. The actual diff lives in the last commit
 * and this script always captures it.
 *
 * Usage:
 *   node scripts/save-diff.js              # save full snapshot
 *   node scripts/save-diff.js my-feature   # save with custom label
 *   node scripts/save-diff.js --last       # print last commit diff to stdout (no file)
 */

import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const DIFFS_DIR = join(ROOT, ".diffs");

function run(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: "utf-8" }).trim();
  } catch {
    return "";
  }
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function buildFilename(label) {
  const now = new Date();
  const ts = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    "_",
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");
  const suffix = label ? `-${label}` : "";
  return `${ts}${suffix}.diff`;
}

// Quick mode: just print the last commit diff to stdout
function handleLastFlag() {
  const lastCommitDiff = run("git diff HEAD~1..HEAD");
  const lastCommitLog = run("git log -1 --format='%h %s (%cr)'");
  if (!lastCommitDiff) {
    console.log("No previous commit diff found.");
    process.exit(0);
  }
  console.log(`Last commit: ${lastCommitLog}\n`);
  console.log(lastCommitDiff);
  process.exit(0);
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes("--last")) {
    handleLastFlag();
  }

  const label = args[0] || "";

  // ── 1. Last commit diff (the one that "disappears") ──────────────
  const lastCommitLog = run("git log -1 --format='%H %s'");
  const lastCommitShortLog = run("git log -1 --format='%h %s (%cr)'");
  const lastCommitDiff = run("git diff HEAD~1..HEAD");
  const lastCommitStat = run("git diff HEAD~1..HEAD --stat");

  // ── 2. Uncommitted changes (working tree + staged) ───────────────
  const status = run("git status");
  const statusShort = run("git status --porcelain");
  const diffHead = run("git diff HEAD");
  const diffStaged = run("git diff --staged");
  const diffHeadStat = run("git diff HEAD --stat");

  const hasUncommitted = !!(statusShort || diffHead || diffStaged);
  const hasLastCommit = !!lastCommitDiff;

  if (!hasUncommitted && !hasLastCommit) {
    console.log("✓ No diffs to save (clean tree, no prior commit diff).");
    process.exit(0);
  }

  // ── Build the report ─────────────────────────────────────────────
  const sections = [
    "# Git Diff Snapshot",
    `# Saved at: ${new Date().toISOString()}`,
    "",
  ];

  // Always include the last commit diff — this is the key fix
  if (hasLastCommit) {
    sections.push(
      "═══════════════════════════════════════════════════════════",
      "  LAST COMMIT (previous task changes)",
      "═══════════════════════════════════════════════════════════",
      "",
      `Commit: ${lastCommitShortLog}`,
      "",
      "## ── git diff HEAD~1..HEAD --stat ────────────────────────",
      lastCommitStat || "(empty)",
      "",
      "## ── git diff HEAD~1..HEAD (full) ────────────────────────",
      lastCommitDiff,
      "",
    );
  }

  if (hasUncommitted) {
    sections.push(
      "═══════════════════════════════════════════════════════════",
      "  UNCOMMITTED CHANGES (current working tree)",
      "═══════════════════════════════════════════════════════════",
      "",
      "## ── git status ──────────────────────────────────────────",
      status,
      "",
      "## ── git diff HEAD --stat ────────────────────────────────",
      diffHeadStat || "(no changes)",
      "",
      "## ── git diff HEAD (full) ────────────────────────────────",
      diffHead || "(no unstaged changes against HEAD)",
      "",
    );

    if (diffStaged && diffStaged !== diffHead) {
      sections.push(
        "## ── git diff --staged ─────────────────────────────────",
        diffStaged,
        "",
      );
    }
  }

  const content = sections.join("\n");

  // ── Write to file ────────────────────────────────────────────────
  mkdirSync(DIFFS_DIR, { recursive: true });
  const filename = buildFilename(label);
  const filepath = join(DIFFS_DIR, filename);
  writeFileSync(filepath, content, "utf-8");

  // ── Print summary ────────────────────────────────────────────────
  console.log(`✓ Diff saved → .diffs/${filename}`);

  if (hasLastCommit) {
    console.log(`\n  📌 Last commit: ${lastCommitShortLog}`);
    if (lastCommitStat) {
      const statSummary = lastCommitStat.split("\n").pop();
      console.log(`     ${statSummary}`);
    }
  }

  if (hasUncommitted) {
    const changedCount = statusShort.split("\n").filter(Boolean).length;
    console.log(`\n  📝 Uncommitted: ${changedCount} file(s) changed`);
    if (diffHeadStat) {
      const statSummary = diffHeadStat.split("\n").pop();
      console.log(`     ${statSummary}`);
    }
  }
}

main();
