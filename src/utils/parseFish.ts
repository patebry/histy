import type { HistoryEntry } from '../types.js';

/**
 * Parses fish shell history format (YAML-like).
 * Format:
 * ```
 * - cmd: some command
 *   when: EPOCH
 * - cmd: another command
 *   when: EPOCH
 * ```
 *
 * Multiline commands use `\n` literal escape sequences.
 */
export function parseFish(content: string): HistoryEntry[] {
  const entries: HistoryEntry[] = [];
  const lines = content.split('\n');

  let currentCmd: string | null = null;
  let currentWhen: number | null = null;

  for (const line of lines) {
    const cmdMatch = line.match(/^- cmd: (.+)$/);
    if (cmdMatch) {
      // Flush previous entry
      if (currentCmd !== null) {
        entries.push({ command: currentCmd, timestamp: currentWhen, count: 1 });
      }
      // Fish stores multiline commands with literal \n
      currentCmd = cmdMatch[1].replace(/\\n/g, '\n');
      currentWhen = null;
      continue;
    }

    const whenMatch = line.match(/^\s+when: (\d+)$/);
    if (whenMatch && currentCmd !== null) {
      currentWhen = parseInt(whenMatch[1], 10);
      continue;
    }
  }

  // Flush last entry
  if (currentCmd !== null) {
    entries.push({ command: currentCmd, timestamp: currentWhen, count: 1 });
  }

  return entries;
}
