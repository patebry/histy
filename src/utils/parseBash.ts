import type { HistoryEntry } from '../types.js';

/**
 * Parses bash history file format.
 * Timestamped format: `#EPOCH` line followed by command line
 * Plain format: one command per line (no timestamps)
 */
export function parseBash(content: string): HistoryEntry[] {
  const entries: HistoryEntry[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Timestamp line: `#EPOCH`
    const tsMatch = line.match(/^#(\d{10,})$/);
    if (tsMatch && i + 1 < lines.length) {
      const timestamp = parseInt(tsMatch[1], 10);
      const command = lines[i + 1]?.trim();
      if (command && !command.startsWith('#')) {
        entries.push({ command, timestamp, count: 1 });
        i++; // Skip the command line since we consumed it
        continue;
      }
    }

    // Plain command line (no preceding timestamp)
    if (!line.startsWith('#')) {
      const command = line.trim();
      if (command) {
        entries.push({ command, timestamp: null, count: 1 });
      }
    }
  }

  return entries;
}
