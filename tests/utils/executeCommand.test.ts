import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node:child_process', () => ({
  spawnSync: vi.fn(),
}));

import { executeCommand } from '../../src/utils/executeCommand.js';
import { spawnSync } from 'node:child_process';

const mockSpawnSync = vi.mocked(spawnSync);

describe('executeCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('spawns interactive shell with -i -c flags', () => {
    const orig = process.env.SHELL;
    process.env.SHELL = '/bin/zsh';
    executeCommand('gst');
    expect(mockSpawnSync).toHaveBeenCalledWith('/bin/zsh', ['-i', '-c', 'gst'], {
      stdio: 'inherit',
    });
    process.env.SHELL = orig;
  });

  it('falls back to /bin/sh when SHELL is not set', () => {
    const orig = process.env.SHELL;
    delete process.env.SHELL;
    executeCommand('echo hello');
    expect(mockSpawnSync).toHaveBeenCalledWith('/bin/sh', ['-i', '-c', 'echo hello'], {
      stdio: 'inherit',
    });
    process.env.SHELL = orig;
  });

  it('does not throw on command failure', () => {
    mockSpawnSync.mockImplementation(() => { throw new Error('exit code 1'); });
    expect(() => executeCommand('false')).not.toThrow();
  });
});
