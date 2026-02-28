#!/usr/bin/env node

/**
 * install-hooks.js
 *
 * Installs git hooks (pre-commit & post-commit) that automatically capture
 * diffs so they are never lost after task completion.
 *
 * Safe to run multiple times — overwrites existing hook files.
 * Runs automatically via the "prepare" npm script after `npm install`.
 */

import { writeFileSync, chmodSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const HOOKS_DIR = join(ROOT, ".git", "hooks");

if (!existsSync(join(ROOT, ".git"))) {
  console.log("⚠  Not a git repository — skipping hook installation.");
  process.exit(0);
}

mkdirSync(HOOKS_DIR, { recursive: true });

const hooks = {
  "pre-commit": `#!/bin/sh
# Auto-capture diff before commit (installed by scripts/install-hooks.js)
node scripts/auto-capture-diff.js pre-commit 2>/dev/null || true
`,
  "post-commit": `#!/bin/sh
# Auto-capture diff after commit (installed by scripts/install-hooks.js)
node scripts/auto-capture-diff.js post-commit 2>/dev/null || true
`,
};

for (const [name, content] of Object.entries(hooks)) {
  const hookPath = join(HOOKS_DIR, name);
  writeFileSync(hookPath, content, "utf-8");
  chmodSync(hookPath, 0o755);
  console.log(`✅ Installed ${name} hook → ${hookPath}`);
}
