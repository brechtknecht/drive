# Drive

A terminal utility to bookmark and quickly navigate to frequently used directories.

## Features

- **Park directories**: Bookmark any directory with a simple command
- **Interactive TUI**: Navigate through your bookmarked directories with an intuitive keyboard-driven interface
- **Quick navigation**: Jump to bookmarked directories instantly
- **Editor integration**: Open bookmarked directories in your favorite editor
- **Persistent storage**: Your bookmarks are saved in `~/.config/drive/paths.json`

## Installation

### Prerequisites

- Node.js 20+ (recommended, but may work with Node.js 18+)

### Install

1. Clone or download this repository
2. Navigate to the drive directory:
   ```bash
   cd /path/to/drive
   ```

3. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```

4. Link the CLI globally:
   ```bash
   npm link
   ```

5. **Important**: Add the shell wrapper to your shell config:

   For **bash**, add to `~/.bashrc`:
   ```bash
   source /Users/felixtesche/Downloads/Documents/github.nosync/drive/drive.sh
   ```

   For **zsh**, add to `~/.zshrc`:
   ```bash
   source /Users/felixtesche/Downloads/Documents/github.nosync/drive/drive.sh
   ```

6. Reload your shell or run:
   ```bash
   source ~/.bashrc  # or source ~/.zshrc
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
2. Unlink the CLI:
   ```bash
   npm unlink -g drive-cli
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

ISC
