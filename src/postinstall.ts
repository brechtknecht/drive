#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import os from 'os';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the path to drive.sh relative to this script
const shellWrapperPath = join(__dirname, '..', 'drive.sh');

const shell = process.env.SHELL || '';
const isZsh = shell.includes('zsh');
const isBash = shell.includes('bash');

console.log('\n✨ @brechtknecht/drive installed successfully!\n');
console.log('📦 Package name: @brechtknecht/drive');
console.log('🚀 Command: drive\n');

console.log('⚠️  IMPORTANT: One more step to enable directory changing:\n');
console.log('Run the setup command to automatically configure your shell:');
console.log('  drive setup\n');

console.log('Or manually add this line to your shell config:\n');

if (isZsh) {
  console.log('  ~/.zshrc:');
  console.log(`  source ${shellWrapperPath}\n`);
} else if (isBash) {
  console.log('  ~/.bashrc:');
  console.log(`  source ${shellWrapperPath}\n`);
} else {
  console.log(`  source ${shellWrapperPath}\n`);
}

console.log('Without this step, the CLI will work but cannot change your directory.\n');
console.log('Usage:');
console.log('  drive park       - Bookmark current directory');
console.log('  drive            - Navigate to bookmarked directory');
console.log('  drive <command>  - Run command in selected directory');
console.log('  drive home       - Go to home directory\n');
