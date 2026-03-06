<h1 align="center">histy</h1>

<p align="center">
  Interactive TUI for browsing, searching, and re-running your shell history.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/histy-cli"><img src="https://img.shields.io/npm/v/histy-cli.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/histy-cli"><img src="https://img.shields.io/npm/dm/histy-cli.svg" alt="monthly downloads"></a>
  <a href="https://github.com/patebry/histy/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg" alt="node version"></a>
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Linux-lightgrey.svg" alt="platform">
  <img src="https://img.shields.io/badge/coverage-95%25+-brightgreen.svg" alt="coverage">
</p>

---

## Demo

<p align="center">
  <img src="https://raw.githubusercontent.com/patebry/histy/main/demo.gif" alt="histy demo" width="800">
</p>

## Quick Start

Run it directly with npx -- no install required:

```sh
npx histy-cli
```

Or install globally:

```sh
npm install -g histy-cli
```

Then run:

```sh
histy
```

## Features

- **Shell history browser** -- full-screen TUI for your zsh, bash, or fish history
- **Interactive search** -- fuzzy filter by typing any part of a command
- **Re-run commands** -- press Enter to execute the selected command in your shell (aliases work)
- **Copy to clipboard** -- press `c` to copy without leaving the TUI
- **Three views** -- switch between recent, frequent, and unique with Tab
- **Vim-style navigation** -- `j`/`k` to move, `g`/`G` to jump to first/last
- **Viewport scrolling** -- adapts to terminal height, keeps selection visible
- **Frequency tracking** -- see how often you run each command
- **Time display** -- relative timestamps ("2m ago", "yesterday", "Mar 3")
- **Shell integration** -- bind to `Ctrl+R` for instant access (run `histy --setup`)
- **Help overlay** -- press `?` for a full keybinding reference
- **Zero config** -- auto-detects your shell and history file

## Keybindings

| Key            | Action                         |
| -------------- | ------------------------------ |
| `↑` / `k`      | Move selection up              |
| `↓` / `j`      | Move selection down            |
| `g` / `G`      | Jump to first / last           |
| `Enter`        | Run selected command and exit  |
| `c`            | Copy to clipboard (stay in TUI)|
| `Tab`          | Cycle view: recent / frequent / unique |
| `/`            | Enter search mode              |
| `ESC`          | Clear search / cancel          |
| `r`            | Refresh history from file      |
| `?`            | Toggle help overlay            |
| `q` / `Ctrl+C` | Quit                          |

## Options

```
histy --help, -h       Show help
histy --version, -v    Show version
histy -n NUM           Limit to most recent NUM entries
histy --print          Print selected command to stdout (for shell integration)
histy --setup          Print shell integration snippet for your shell
```

## Shell Integration

Bind histy to `Ctrl+R` for a drop-in replacement for reverse history search:

```sh
histy --setup
```

This prints a snippet for your detected shell (zsh, bash, or fish). Add it to your rc file and `Ctrl+R` will launch histy, placing the selected command on your command line ready to run or edit.

## How It Works

histy reads your shell's history file directly -- `~/.zsh_history` for zsh, `~/.bash_history` for bash, or `~/.local/share/fish/fish_history` for fish. It respects `$HISTFILE` if set. Entries are parsed, deduplicated, and counted for frequency. The result is rendered as a full-screen terminal UI using [Ink](https://github.com/vadimdemedes/ink), a React renderer for the terminal. When you press Enter, the selected command is executed in an interactive shell (`-i` flag) so aliases and functions from your rc files work as expected.

## Supported Shells

| Shell | History File | Timestamps | Frequency |
|-------|-------------|------------|-----------|
| zsh   | `~/.zsh_history` | Yes | Yes |
| bash  | `~/.bash_history` | When available | Yes |
| fish  | `~/.local/share/fish/fish_history` | Yes | Yes |

## Requirements

- **macOS or Linux**
- **Node.js >= 18**

## Contributing

```sh
git clone https://github.com/patebry/histy.git
cd histy
npm install
```

Development commands:

```sh
npm run build        # Compile to dist/histy.js
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint
npm test             # Run test suite (106 tests)
npm run coverage     # Run tests with coverage report
```

Built with TypeScript, React 18, Ink 4, esbuild, and Vitest.

## License

[MIT](LICENSE)
