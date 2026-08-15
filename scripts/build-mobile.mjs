#!/usr/bin/env node

/**
 * Build script for Capacitor + Next.js mobile app
 * Handles building Next.js and syncing with Capacitor
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const command = args[0] || 'build';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(cmd, description) {
  log(`\n▶ ${description}...`, 'blue');
  try {
    execSync(cmd, { stdio: 'inherit' });
    log(`✓ ${description} completed`, 'green');
    return true;
  } catch (error) {
    log(`✗ ${description} failed`, 'red');
    return false;
  }
}

switch (command) {
  case 'build':
    log('\n🚀 Building SASHFLIX Mobile App\n', 'blue');
    
    if (!runCommand('npm run build', 'Building Next.js')) {
      log('\nBuild failed. Run: npm run build', 'red');
      process.exit(1);
    }
    
    if (!runCommand('npx cap sync', 'Syncing with Capacitor')) {
      log('\nSync failed. Run: npx cap sync', 'red');
      process.exit(1);
    }
    
    log('\n✅ Build complete! Run "npm run mobile:ios" or "npm run mobile:android"\n', 'green');
    break;

  case 'dev':
    log('\n📱 Starting development mode\n', 'blue');
    log('\n⚠️  Development Mode Instructions:', 'yellow');
    log('1. Update capacitor.config.ts with your local IP:');
    log('   server: { url: "http://YOUR_IP:3000" }');
    log('\n2. Run "npm run dev" in another terminal');
    log('\n3. Run "npx cap sync"');
    log('\n4. Open iOS or Android project\n');
    break;

  case 'sync':
    if (!runCommand('npx cap sync', 'Syncing with Capacitor')) {
      process.exit(1);
    }
    log('\n✅ Sync complete!\n', 'green');
    break;

  default:
    log(`\nUnknown command: ${command}\n`, 'red');
    log('Available commands:', 'yellow');
    log('  build  - Build Next.js and sync with Capacitor');
    log('  dev    - Start development mode instructions');
    log('  sync   - Sync current build with Capacitor\n');
    process.exit(1);
}
