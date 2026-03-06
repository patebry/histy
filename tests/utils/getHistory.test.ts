import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node:fs', () => ({
  readFileSync: vi.fn(),
  existsSync: vi.fn(),
}));

vi.mock('node:os', () => ({
  homedir: vi.fn(() => '/home/testuser'),
}));

import { getHistory } from '../../src/utils/getHistory.js';
import { readFileSync, existsSync } from 'node:fs';

const mockReadFileSync = vi.mocked(readFileSync);
const mockExistsSync = vi.mocked(existsSync);

describe('getHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.HISTFILE;
  });

  it('returns empty array when no shell detected', () => {
    mockExistsSync.mockReturnValue(false);
    const orig = process.env.SHELL;
    process.env.SHELL = '';
    const result = getHistory();
    expect(result).toEqual([]);
    process.env.SHELL = orig;
  });

  it('reads zsh history when SHELL is zsh', () => {
    const orig = process.env.SHELL;
    process.env.SHELL = '/bin/zsh';
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(': 1700000100:0;git push\n: 1700000000:0;npm install\n');

    const result = getHistory();
    expect(result).toHaveLength(2);
    expect(result[0].command).toBe('git push');
    expect(result[1].command).toBe('npm install');
    process.env.SHELL = orig;
  });

  it('deduplicates entries keeping most recent timestamp', () => {
    const orig = process.env.SHELL;
    process.env.SHELL = '/bin/zsh';
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(
      ': 1700000000:0;git push\n: 1700000100:0;git push\n: 1700000050:0;npm install\n'
    );

    const result = getHistory();
    expect(result).toHaveLength(2);
    const gitPush = result.find((e) => e.command === 'git push');
    expect(gitPush?.count).toBe(2);
    expect(gitPush?.timestamp).toBe(1700000100);
    process.env.SHELL = orig;
  });

  it('respects limit parameter', () => {
    const orig = process.env.SHELL;
    process.env.SHELL = '/bin/zsh';
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(
      ': 1700000300:0;cmd1\n: 1700000200:0;cmd2\n: 1700000100:0;cmd3\n'
    );

    const result = getHistory(2);
    expect(result).toHaveLength(2);
    process.env.SHELL = orig;
  });

  it('returns empty array when file read fails', () => {
    const orig = process.env.SHELL;
    process.env.SHELL = '/bin/zsh';
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockImplementation(() => { throw new Error('ENOENT'); });

    const result = getHistory();
    expect(result).toEqual([]);
    process.env.SHELL = orig;
  });

  it('uses HISTFILE when set', () => {
    process.env.HISTFILE = '/custom/zsh_history';
    mockExistsSync.mockImplementation((p) => p === '/custom/zsh_history');
    mockReadFileSync.mockReturnValue(': 1700000000:0;custom cmd\n');

    const result = getHistory();
    expect(result).toHaveLength(1);
    expect(result[0].command).toBe('custom cmd');
  });

  it('sorts null timestamps last', () => {
    const orig = process.env.SHELL;
    process.env.SHELL = '/bin/zsh';
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue('plain cmd\n: 1700000000:0;timestamped cmd\n');

    const result = getHistory();
    expect(result[0].command).toBe('timestamped cmd');
    expect(result[1].command).toBe('plain cmd');
    process.env.SHELL = orig;
  });

  it('reads bash history when SHELL is bash', () => {
    const orig = process.env.SHELL;
    process.env.SHELL = '/bin/bash';
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue('#1700000000\ngit push\n');

    const result = getHistory();
    expect(result).toHaveLength(1);
    expect(result[0].command).toBe('git push');
    process.env.SHELL = orig;
  });

  it('reads fish history when SHELL is fish', () => {
    const orig = process.env.SHELL;
    process.env.SHELL = '/usr/bin/fish';
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue('- cmd: git push\n  when: 1700000000\n');

    const result = getHistory();
    expect(result).toHaveLength(1);
    expect(result[0].command).toBe('git push');
    process.env.SHELL = orig;
  });

  it('uses HISTFILE with bash in filename', () => {
    process.env.HISTFILE = '/custom/bash_history';
    mockExistsSync.mockImplementation((p) => p === '/custom/bash_history');
    mockReadFileSync.mockReturnValue('git push\n');

    const result = getHistory();
    expect(result).toHaveLength(1);
  });

  it('uses HISTFILE with fish in filename', () => {
    process.env.HISTFILE = '/custom/fish_history';
    mockExistsSync.mockImplementation((p) => p === '/custom/fish_history');
    mockReadFileSync.mockReturnValue('- cmd: git push\n  when: 1700000000\n');

    const result = getHistory();
    expect(result).toHaveLength(1);
  });

  it('uses HISTFILE falling back to SHELL for zsh', () => {
    const orig = process.env.SHELL;
    process.env.HISTFILE = '/custom/history';
    process.env.SHELL = '/bin/zsh';
    mockExistsSync.mockImplementation((p) => p === '/custom/history');
    mockReadFileSync.mockReturnValue(': 1700000000:0;git push\n');

    const result = getHistory();
    expect(result).toHaveLength(1);
    process.env.SHELL = orig;
  });

  it('uses HISTFILE falling back to SHELL for fish', () => {
    const orig = process.env.SHELL;
    process.env.HISTFILE = '/custom/history';
    process.env.SHELL = '/usr/bin/fish';
    mockExistsSync.mockImplementation((p) => p === '/custom/history');
    mockReadFileSync.mockReturnValue('- cmd: git push\n  when: 1700000000\n');

    const result = getHistory();
    expect(result).toHaveLength(1);
    process.env.SHELL = orig;
  });

  it('uses HISTFILE falling back to bash as default', () => {
    const orig = process.env.SHELL;
    process.env.HISTFILE = '/custom/history';
    process.env.SHELL = '/bin/sh';
    mockExistsSync.mockImplementation((p) => p === '/custom/history');
    mockReadFileSync.mockReturnValue('git push\n');

    const result = getHistory();
    expect(result).toHaveLength(1);
    process.env.SHELL = orig;
  });

  it('falls back to file existence when SHELL does not match', () => {
    const orig = process.env.SHELL;
    process.env.SHELL = '/bin/sh';
    // Only bash_history exists
    mockExistsSync.mockImplementation((p) => String(p).includes('.bash_history'));
    mockReadFileSync.mockReturnValue('git push\n');

    const result = getHistory();
    expect(result).toHaveLength(1);
    process.env.SHELL = orig;
  });
});
