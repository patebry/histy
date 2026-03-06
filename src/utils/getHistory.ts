import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { HistoryEntry } from '../types.js';
import { parseZsh } from './parseZsh.js';
import { parseBash } from './parseBash.js';
import { parseFish } from './parseFish.js';

type ShellType = 'zsh' | 'bash' | 'fish';

interface ShellInfo {
  shell: ShellType;
  path: string;
}

function detectShell(): ShellInfo | null {
  const home = homedir();

  // 1. Check $HISTFILE (user override)
  const histfile = process.env.HISTFILE;
  if (histfile && existsSync(histfile)) {
    // Infer shell from path or fall back to $SHELL
    if (histfile.includes('zsh')) return { shell: 'zsh', path: histfile };
    if (histfile.includes('bash')) return { shell: 'bash', path: histfile };
    if (histfile.includes('fish')) return { shell: 'fish', path: histfile };

    // Fall back to $SHELL to determine parser
    const shellEnv = process.env.SHELL ?? '';
    if (shellEnv.endsWith('/zsh')) return { shell: 'zsh', path: histfile };
    if (shellEnv.endsWith('/fish')) return { shell: 'fish', path: histfile };
    return { shell: 'bash', path: histfile };
  }

  // 2. Check $SHELL env var → default paths
  const shellEnv = process.env.SHELL ?? '';
  if (shellEnv.endsWith('/zsh')) {
    const p = join(home, '.zsh_history');
    if (existsSync(p)) return { shell: 'zsh', path: p };
  }
  if (shellEnv.endsWith('/bash')) {
    const p = join(home, '.bash_history');
    if (existsSync(p)) return { shell: 'bash', path: p };
  }
  if (shellEnv.endsWith('/fish')) {
    const p = join(home, '.local', 'share', 'fish', 'fish_history');
    if (existsSync(p)) return { shell: 'fish', path: p };
  }

  // 3. Fall back to file existence checks
  const candidates: ShellInfo[] = [
    { shell: 'zsh', path: join(home, '.zsh_history') },
    { shell: 'bash', path: join(home, '.bash_history') },
    { shell: 'fish', path: join(home, '.local', 'share', 'fish', 'fish_history') },
  ];

  for (const c of candidates) {
    if (existsSync(c.path)) return c;
  }

  return null;
}

function parse(shell: ShellType, content: string): HistoryEntry[] {
  switch (shell) {
    case 'zsh': return parseZsh(content);
    case 'bash': return parseBash(content);
    case 'fish': return parseFish(content);
  }
}

export interface DeduplicatedEntry extends HistoryEntry {
  count: number;
}

/**
 * Reads and parses shell history.
 * Returns deduplicated entries with frequency counts and most recent timestamps.
 * Sorted by most recent first.
 */
export function getHistory(limit?: number): HistoryEntry[] {
  const info = detectShell();
  if (!info) return [];

  let content: string;
  try {
    content = readFileSync(info.path, 'utf-8');
  } catch {
    return [];
  }

  const raw = parse(info.shell, content);

  // Deduplicate: keep most recent timestamp and count occurrences
  const map = new Map<string, HistoryEntry>();
  for (const entry of raw) {
    const existing = map.get(entry.command);
    if (existing) {
      existing.count++;
      if (entry.timestamp !== null) {
        if (existing.timestamp === null || entry.timestamp > existing.timestamp) {
          existing.timestamp = entry.timestamp;
        }
      }
    } else {
      map.set(entry.command, { ...entry });
    }
  }

  let entries = Array.from(map.values());

  // Sort by most recent first (null timestamps last)
  entries.sort((a, b) => {
    if (a.timestamp === null && b.timestamp === null) return 0;
    if (a.timestamp === null) return 1;
    if (b.timestamp === null) return -1;
    return b.timestamp - a.timestamp;
  });

  if (limit && limit > 0) {
    entries = entries.slice(0, limit);
  }

  return entries;
}

// Exported for testing
export { detectShell, parse };
