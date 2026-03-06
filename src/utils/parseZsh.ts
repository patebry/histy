import type { HistoryEntry } from '../types.js';

/**
 * Parses zsh history file format.
 * Extended format: `: EPOCH:DURATION;COMMAND`
 * Plain format: `COMMAND` (one per line)
 *
 * Multiline commands use `\` continuation — the backslash-newline
 * is part of the stored format and gets joined here.
 */
export function parseZsh(content: string): HistoryEntry[] {
  const entries: HistoryEntry[] = [];
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    let line = lines[i];
    i++;

    if (!line) continue;

    // Handle multiline commands (backslash continuation)
    while (line.endsWith('\\') && i < lines.length) {
      line = line.slice(0, -1) + '\n' + lines[i];
      i++;
    }

    // Extended format: `: EPOCH:DURATION;COMMAND`
    const extMatch = line.match(/^: (\d+):\d+;(.+)$/s);
    if (extMatch) {
      const timestamp = parseInt(extMatch[1], 10);
      const command = extMatch[2].trim();
      if (command) {
        entries.push({ command, timestamp, count: 1 });
      }
      continue;
    }

    // Plain format: just the command
    const command = line.trim();
    if (command) {
      entries.push({ command, timestamp: null, count: 1 });
    }
  }

  return entries;
}
