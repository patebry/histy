import { describe, it, expect } from 'vitest';
import { parseFish } from '../../src/utils/parseFish.js';

describe('parseFish', () => {
  it('parses standard format', () => {
    const content = `- cmd: git push
  when: 1700000000
- cmd: npm install
  when: 1700000100
`;
    const entries = parseFish(content);
    expect(entries).toHaveLength(2);
    expect(entries[0]).toEqual({ command: 'git push', timestamp: 1700000000, count: 1 });
    expect(entries[1]).toEqual({ command: 'npm install', timestamp: 1700000100, count: 1 });
  });

  it('handles commands without timestamps', () => {
    const content = `- cmd: git push
- cmd: npm install
`;
    const entries = parseFish(content);
    expect(entries).toHaveLength(2);
    expect(entries[0].timestamp).toBeNull();
  });

  it('handles multiline commands with escaped newlines', () => {
    const content = `- cmd: echo hello\\nworld
  when: 1700000000
`;
    const entries = parseFish(content);
    expect(entries).toHaveLength(1);
    expect(entries[0].command).toBe('echo hello\nworld');
  });

  it('returns empty for empty content', () => {
    expect(parseFish('')).toEqual([]);
  });

  it('handles single entry without trailing newline', () => {
    const content = '- cmd: git push\n  when: 1700000000';
    const entries = parseFish(content);
    expect(entries).toHaveLength(1);
  });
});
