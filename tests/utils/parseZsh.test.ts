import { describe, it, expect } from 'vitest';
import { parseZsh } from '../../src/utils/parseZsh.js';

describe('parseZsh', () => {
  it('parses extended format', () => {
    const content = ': 1700000000:0;git push\n: 1700000100:0;npm install\n';
    const entries = parseZsh(content);
    expect(entries).toHaveLength(2);
    expect(entries[0]).toEqual({ command: 'git push', timestamp: 1700000000, count: 1 });
    expect(entries[1]).toEqual({ command: 'npm install', timestamp: 1700000100, count: 1 });
  });

  it('parses plain format', () => {
    const content = 'git push\nnpm install\n';
    const entries = parseZsh(content);
    expect(entries).toHaveLength(2);
    expect(entries[0]).toEqual({ command: 'git push', timestamp: null, count: 1 });
  });

  it('handles multiline commands with backslash continuation', () => {
    const content = ': 1700000000:0;echo hello \\\nworld\n';
    const entries = parseZsh(content);
    expect(entries).toHaveLength(1);
    expect(entries[0].command).toBe('echo hello \nworld');
  });

  it('skips empty lines', () => {
    const content = '\n\n: 1700000000:0;git push\n\n';
    const entries = parseZsh(content);
    expect(entries).toHaveLength(1);
  });

  it('handles mixed formats', () => {
    const content = ': 1700000000:0;git push\nplain command\n';
    const entries = parseZsh(content);
    expect(entries).toHaveLength(2);
    expect(entries[0].timestamp).toBe(1700000000);
    expect(entries[1].timestamp).toBeNull();
  });

  it('returns empty for empty content', () => {
    expect(parseZsh('')).toEqual([]);
  });
});
