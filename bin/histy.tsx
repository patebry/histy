import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
histy - Interactive TUI for shell history

Usage: histy [options]

Options:
  -h, --help     Show this help message
  -v, --version  Show version
  -n NUM         Limit to most recent NUM entries
  --print        Print selected command to stdout (for shell integration)
  --setup        Print shell integration snippet
`);
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));
  console.log(pkg.version);
  process.exit(0);
}

if (args.includes('--setup')) {
  const shell = process.env.SHELL ?? '';
  if (shell.endsWith('/zsh')) {
    console.log(`# Add to ~/.zshrc:
histy-run() {
  local cmd
  cmd="$(histy --print)"
  if [[ -n "$cmd" ]]; then
    BUFFER="$cmd"
    CURSOR=$#BUFFER
    zle redisplay
  fi
}
zle -N histy-run
bindkey '^R' histy-run`);
  } else if (shell.endsWith('/bash')) {
    console.log(`# Add to ~/.bashrc:
histy-run() {
  local cmd
  cmd="$(histy --print)"
  if [[ -n "$cmd" ]]; then
    READLINE_LINE="$cmd"
    READLINE_POINT=\${#cmd}
  fi
}
bind -x '"\\C-r": histy-run'`);
  } else if (shell.endsWith('/fish')) {
    console.log(`# Add to ~/.config/fish/config.fish:
function histy-run
  set cmd (histy --print)
  if test -n "$cmd"
    commandline -r $cmd
    commandline -f repaint
  end
end
bind \\cr histy-run`);
  } else {
    console.log('# Could not detect shell. Set $SHELL and try again.');
  }
  process.exit(0);
}

// Parse -n flag
let limit: number | undefined;
const nIdx = args.indexOf('-n');
if (nIdx !== -1 && args[nIdx + 1]) {
  const n = parseInt(args[nIdx + 1], 10);
  if (!isNaN(n) && n > 0) limit = n;
}

const printMode = args.includes('--print');

// Dynamic imports to avoid loading React/Ink for --help/--version
const { render } = await import('ink');
const { default: React } = await import('react');
const { App } = await import('../src/app.js');
const { executeCommand } = await import('../src/utils/executeCommand.js');

// Capture command selection, execute after TUI is fully torn down
let selectedCommand: string | undefined;

const instance = render(
  React.createElement(App, {
    limit,
    printMode,
    onCommand: (cmd: string) => { selectedCommand = cmd; },
  })
);

await instance.waitUntilExit();

if (selectedCommand) {
  executeCommand(selectedCommand);
}
