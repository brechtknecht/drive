#!/usr/bin/env node

import { Command } from 'commander';
import Enquirer from 'enquirer';
import { ConfigManager } from './config.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const execAsync = promisify(exec);
const config = new ConfigManager();

const program = new Command();

program
  .name('drive')
  .description('A terminal utility to bookmark and quickly navigate to frequently used directories')
  .version('1.0.0');

// drive park - Add current directory to bookmarks
program
  .command('park')
  .description('Bookmark the current directory')
  .action(() => {
    const cwd = process.cwd();
    try {
      const added = config.addPath(cwd);
      if (added) {
        console.log(`✓ Parked: ${cwd}`);
      } else {
        console.log(`Already parked: ${cwd}`);
      }
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

// drive list - Show all bookmarked directories
program
  .command('list')
  .description('List all parked directories')
  .action(() => {
    const paths = config.getPaths();
    if (paths.length === 0) {
      console.log('No parked directories. Use "drive park" to add the current directory.');
      return;
    }

    console.log('\nParked directories:');
    paths.forEach((p, index) => {
      console.log(`  ${index + 1}. ${p}`);
    });
    console.log('');
  });

// drive home - Navigate to home directory
program
  .command('home')
  .description('Navigate to home directory')
  .action(() => {
    console.log(os.homedir());
  });

// drive unpark - Remove a directory from bookmarks
program
  .command('unpark')
  .description('Remove a directory from bookmarks')
  .action(async () => {
    const paths = config.getPaths();
    if (paths.length === 0) {
      console.log('No parked directories.');
      return;
    }

    try {
      const enquirer = new Enquirer();
      const response: any = await enquirer.prompt({
        type: 'select',
        name: 'path',
        message: 'Select a directory to unpark:',
        choices: paths.map(p => ({
          name: p,
          message: p,
          hint: path.basename(p)
        }))
      });

      const removed = config.removePath(response.path);
      if (removed) {
        console.log(`✓ Unparked: ${response.path}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message === '') {
        console.log('\nCancelled');
      } else {
        console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  });

// drive setup - Configure shell wrapper automatically
program
  .command('setup')
  .description('Automatically configure shell wrapper for cd functionality')
  .action(async () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const shellWrapperPath = path.join(__dirname, '..', 'drive.sh');

    // Check if shell wrapper exists
    if (!fs.existsSync(shellWrapperPath)) {
      console.error(`Error: Shell wrapper not found at ${shellWrapperPath}`);
      process.exit(1);
    }

    const shell = process.env.SHELL || '';
    let configFile: string;
    let shellName: string;

    if (shell.includes('zsh')) {
      configFile = path.join(os.homedir(), '.zshrc');
      shellName = 'zsh';
    } else if (shell.includes('bash')) {
      configFile = path.join(os.homedir(), '.bashrc');
      shellName = 'bash';
    } else {
      console.error('Error: Could not detect shell type. Supported shells: bash, zsh');
      console.log(`\nPlease manually add this line to your shell config file:`);
      console.log(`  source ${shellWrapperPath}`);
      process.exit(1);
    }

    const sourceLine = `source ${shellWrapperPath}`;

    // Check if config file exists
    if (!fs.existsSync(configFile)) {
      console.log(`Creating ${configFile}...`);
      fs.writeFileSync(configFile, '', 'utf-8');
    }

    // Read existing config
    const configContent = fs.readFileSync(configFile, 'utf-8');

    // Check if already configured
    if (configContent.includes(sourceLine)) {
      console.log(`✓ Shell wrapper already configured in ${configFile}`);
      console.log(`\nTo activate, reload your shell:`);
      console.log(`  source ${configFile}`);
      return;
    }

    // Add the source line
    const newContent = configContent.trim() + `\n\n# Drive CLI - Directory navigation tool\n${sourceLine}\n`;

    try {
      fs.writeFileSync(configFile, newContent, 'utf-8');
      console.log(`✓ Successfully added drive shell wrapper to ${configFile}`);
      console.log(`\nTo activate, reload your shell:`);
      console.log(`  source ${configFile}`);
      console.log(`\nOr restart your terminal.`);
    } catch (error) {
      console.error(`Error: Failed to write to ${configFile}`);
      console.error(`${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log(`\nPlease manually add this line to ${configFile}:`);
      console.log(`  ${sourceLine}`);
      process.exit(1);
    }
  });

// Default action - Show TUI selector with custom key handlers
program
  .option('-e, --editor', 'Open selected directory in editor')
  .action(async (options) => {
    let keepRunning = true;

    while (keepRunning) {
      const paths = config.getPaths();

      if (paths.length === 0) {
        console.log('No parked directories. Use "drive park" to add the current directory.');
        return;
      }

      try {
        // Check if a command will be executed after selection
        const commandToRun = process.env.DRIVE_COMMAND;

        // Build message based on whether a command is provided
        let message = 'Select a directory:';
        if (commandToRun) {
          message = `Select a directory to run \x1b[36m${commandToRun}\x1b[0m in:`;
        } else if (options.editor) {
          message = 'Select a directory to open in editor:';
        }

        // Create custom select prompt with key handlers
        const SelectPrompt = (Enquirer as any).Select;
        const prompt = new SelectPrompt({
          name: 'path',
          message: message,
          choices: paths.map(p => ({
            name: p,
            message: p,
            hint: path.basename(p)
          })),
        });

        // Add footer with keyboard shortcuts
        prompt.footer = () => {
          if (commandToRun) {
            return '\n  ↑/↓ Navigate • Enter Select & Run • d Delete • Esc Cancel';
          }
          return '\n  ↑/↓ Navigate • Enter Select • d Delete • Esc Cancel';
        };

        // Add custom key handler for 'd' key to delete
        prompt.on('keypress', async (input: string, key: any) => {
          if (key && key.name === 'd') {
            // Get the currently selected path
            const selectedIndex = prompt.index;
            const selectedPath = paths[selectedIndex];

            // Cancel the current prompt
            prompt.close();

            // Delete the path
            const removed = config.removePath(selectedPath);
            if (removed) {
              console.log(`\n✓ Deleted: ${selectedPath}\n`);
            }

            // If no more paths, exit
            const remainingPaths = config.getPaths();
            if (remainingPaths.length === 0) {
              console.log('No more parked directories.');
              keepRunning = false;
            }
            // Loop will continue to show selector again
          }
        });

        const selectedPath = await prompt.run();

        if (selectedPath) {
          if (options.editor) {
            // Open in editor
            const editor = process.env.EDITOR || process.env.VISUAL || 'code';
            try {
              await execAsync(`${editor} "${selectedPath}"`);
              console.log(`Opened ${selectedPath} in ${editor}`);
              keepRunning = false;
            } catch (error) {
              console.error(`Failed to open editor: ${error instanceof Error ? error.message : 'Unknown error'}`);
              process.exit(1);
            }
          } else {
            // Output path for shell function to cd
            // Write to temp file that shell wrapper will read
            const tmpPath = process.env.DRIVE_OUTPUT_FILE || path.join(os.tmpdir(), `drive-output-${process.pid}`);
            fs.writeFileSync(tmpPath, selectedPath);

            // Also print to stdout for visibility
            console.log(selectedPath);

            keepRunning = false;
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message === '') {
          // User pressed Escape
          process.exit(0);
        } else {
          console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          process.exit(1);
        }
      }
    }
  });

program.parse();
