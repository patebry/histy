import { describe, it, expect } from 'vitest';
import { parseBash } from '../../src/utils/parseBash.js';

describe('parseBash', () => {
  it('parses timestamped format', () => {
    const content = '#1700000000\ngit push\n#1700000100\nnpm install\n';
    const entries = parseBash(content);
    expect(entries).toHaveLength(2);
    expect(entries[0]).toEqual({ command: 'git push', timestamp: 1700000000, count: 1 });
    expect(entries[1]).toEqual({ command: 'npm install', timestamp: 1700000100, count: 1 });
  });

  it('parses plain format (no timestamps)', () => {
    const content = 'git push\nnpm install\n';
    const entries = parseBash(content);
    expect(entries).toHaveLength(2);
    expect(entries[0]).toEqual({ command: 'git push', timestamp: null, count: 1 });
  });

  it('handles mixed timestamped and plain', () => {
    const content = '#1700000000\ngit push\nplain command\n';
    const entries = parseBash(content);
    expect(entries).toHaveLength(2);
  });

  it('skips empty lines', () => {
    const content = '\n\ngit push\n\n';
    const entries = parseBash(content);
    expect(entries).toHaveLength(1);
  });

  it('returns empty for empty content', () => {
    expect(parseBash('')).toEqual([]);
  });

  it('skips timestamp with no following command', () => {
    const content = '#1700000000\n';
    const entries = parseBash(content);
    expect(entries).toHaveLength(0);
  });
});
