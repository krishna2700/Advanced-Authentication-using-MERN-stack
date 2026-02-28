#!/usr/bin/env node

/**
 * save-diff.js
 *
 * Captures the current git diff (staged + unstaged) and git status,
 * then persists them to .diffs/<timestamp>.diff so the change context
 * is never lost — even after task-completion cleanup or a commit.
 *
 * Usage:
 *   node scripts/save-diff.js            # auto-generated filename
 *   node scripts/save-diff.js my-feature # custom label in filename
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

function main() {
  const label = process.argv[2] || "";

  // Gather git information
  const status = run("git status");
  const statusShort = run("git status --porcelain");
  const diffHead = run("git diff HEAD");
  const diffStaged = run("git diff --staged");
  const diffStat = run("git diff HEAD --stat");
  const log = run("git log --oneline -1");

  // If there is absolutely nothing to save, let the user know
  if (!statusShort && !diffHead && !diffStaged) {
    console.log("✓ Working tree is clean — nothing to save.");
    process.exit(0);
  }

  // Build the report
  const sections = [
    `# Git Diff Snapshot`,
    `# Saved at: ${new Date().toISOString()}`,
    `# Latest commit: ${log}`,
    "",
    "## ── git status ──────────────────────────────────────────",
    status,
    "",
    "## ── git diff HEAD --stat ────────────────────────────────",
    diffStat || "(no changes)",
    "",
    "## ── git diff HEAD (full) ────────────────────────────────",
    diffHead || "(no unstaged/staged changes against HEAD)",
    "",
  ];

  // Include staged diff separately only when it differs from the full diff
  if (diffStaged && diffStaged !== diffHead) {
    sections.push(
      "## ── git diff --staged ─────────────────────────────────",
      diffStaged,
      ""
    );
  }

  const content = sections.join("\n");

  // Ensure output directory exists and write the file
  mkdirSync(DIFFS_DIR, { recursive: true });
  const filename = buildFilename(label);
  const filepath = join(DIFFS_DIR, filename);
  writeFileSync(filepath, content, "utf-8");

  console.log(`✓ Diff saved → .diffs/${filename}`);
  console.log(`  Files changed: ${statusShort.split("\n").filter(Boolean).length}`);
  if (diffStat) {
    const lastLine = diffStat.split("\n").pop();
    console.log(`  Summary: ${lastLine}`);
  }
}

main();
