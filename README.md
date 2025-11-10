# Drive

A terminal utility to bookmark and quickly navigate to frequently used directories.

**Note**: The npm package is called `@brechtknecht/drive` (install with `npm install -g @brechtknecht/drive`), but the command you use is just `drive`.

## Features

- **Bookmark & Select**: Park frequently-used directories with `drive park`, then navigate via interactive TUI with keyboard shortcuts (↑/↓ to browse, Enter to select, `d` to delete, Esc to cancel)
- **Flexible Actions**: Jump to directories (`drive`), execute commands in them (`drive npm test`), open in editor (`drive -e`), or quickly go home (`drive home`) - all from one selector interface
- **Persistent & Reliable**: Bookmarks stored in `~/.config/drive/paths.json`, automatically filters invalid paths, works via shell wrapper for seamless directory changing

## Installation

Install globally via npm:

```bash
npm install -g @brechtknecht/drive
```

**Important**: After installation, you'll see instructions to add a shell wrapper to your `~/.bashrc` or `~/.zshrc`. This is required for the `cd` functionality to work. Copy the `source` line shown in the postinstall output and add it to your shell config, then reload your shell.

Example for zsh:
```bash
# Add to ~/.zshrc:
source /path/to/global/node_modules/@brechtknecht/drive/drive.sh

# Then reload:
source ~/.zshrc
```

## Usage

### Park a directory
Bookmark the current directory:
```bash
drive park
```

### Navigate to a bookmarked directory
Launch the interactive TUI selector:
```bash
drive
```

**Keyboard shortcuts:**
- **↑/↓ arrows** - Navigate through the list
- **Enter** - Navigate to the selected directory
- **d** - Delete the currently highlighted bookmark
- **Esc** - Cancel and exit

Pressing 'd' will immediately delete the highlighted directory from your bookmarks and refresh the list, allowing you to delete multiple bookmarks in one session.

### Quick navigation to home
Jump to your home directory quickly:
```bash
drive home
```

### List all bookmarked directories
```bash
drive list
```

### Remove a bookmark
You can remove bookmarks in two ways:

1. **From the main selector**: Run `drive`, navigate to a directory with arrow keys, and press `d` to delete it
2. **Using the unpark command**:
   ```bash
   drive unpark
   ```
   This will show an interactive selector to choose which bookmark to remove.

### Open in editor
Open a bookmarked directory in your editor (uses `$EDITOR`, `$VISUAL`, or defaults to `code`):
```bash
drive --editor
# or
drive -e
```

### Execute commands in selected directories
Run any command in a directory you select from your bookmarks:
```bash
drive <command>
```

**Examples:**
```bash
# Launch claude in a selected project
drive claude

# Install dependencies in a selected project
drive npm install

# Run tests in a selected project
drive npm test

# Open VS Code in a selected directory
drive code .

# Complex commands work too
drive npm install && npm start
```

**How it works:**
1. Shows the directory selector
2. After you select a directory, it changes to that directory
3. Then executes your command in that directory

This is perfect for quickly running commands in your frequently used projects without navigating there first.

## How it works

The `drive` command uses a shell wrapper function to enable directory changing. When you select a directory:

1. The Node.js CLI outputs the selected path
2. The shell wrapper function reads this output
3. It then executes `cd` to change to that directory

For commands like `park`, `list`, and `unpark`, the wrapper passes them directly to the CLI without any `cd` magic.

## Configuration

Bookmarks are stored in: `~/.config/drive/paths.json`

The config file is a simple JSON array of absolute paths:
```json
{
  "paths": [
    "/Users/you/projects/important-project",
    "/Users/you/Documents"
  ]
}
```

## Uninstall

1. Remove the source line from your shell config (`~/.bashrc` or `~/.zshrc`)
2. Uninstall the package:
   ```bash
   npm uninstall -g @brechtknecht/drive
   ```
3. Optionally, remove your bookmarks:
   ```bash
   rm -rf ~/.config/drive
   ```

## Development

### Run without building
```bash
npm run dev park
```

### Build
```bash
npm run build
```

### Tech Stack
- TypeScript
- Node.js
- [enquirer](https://github.com/enquirer/enquirer) - TUI components with custom key bindings
- [commander](https://github.com/tj/commander.js) - CLI argument parsing

## License

MIT
