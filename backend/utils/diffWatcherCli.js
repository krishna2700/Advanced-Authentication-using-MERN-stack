#!/usr/bin/env node

import DiffWatcher from './diffWatcher.js';

const command = process.argv[2];
const interval = parseInt(process.argv[3]) || 5;

const watcher = new DiffWatcher(interval);

async function main() {
  switch (command) {
    case 'start':
      console.log(`Starting diff watcher (interval: ${interval} minutes)`);
      console.log('Press Ctrl+C to stop');
      watcher.start();

      // Keep process alive
      process.on('SIGINT', () => {
        watcher.stop();
        process.exit(0);
      });
      break;

    case 'once':
      console.log('Saving diff once...');
      await watcher.saveNow();
      process.exit(0);
      break;

    default:
      console.log(`
Diff Watcher CLI

Usage:
  node diffWatcherCli.js <command> [interval]

Commands:
  start [interval]    Start watching for changes (default interval: 5 minutes)
  once                Save diff once and exit

Examples:
  node diffWatcherCli.js start 5
  node diffWatcherCli.js start 10
  node diffWatcherCli.js once
      `);
  }
}

main().catch(console.error);
