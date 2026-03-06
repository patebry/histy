import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}));

import { copyToClipboard } from '../../src/utils/copyToClipboard.js';
import { execSync } from 'node:child_process';

const mockExecSync = vi.mocked(execSync);

describe('copyToClipboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses pbcopy on macOS', () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    copyToClipboard('test');
    expect(mockExecSync).toHaveBeenCalledWith('pbcopy', { input: 'test', timeout: 3000 });
    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });

  it('uses xclip on Linux', () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'linux' });
    copyToClipboard('test');
    expect(mockExecSync).toHaveBeenCalledWith('xclip -selection clipboard', { input: 'test', timeout: 3000 });
    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });

  it('returns success on success', () => {
    const result = copyToClipboard('test');
    expect(result).toEqual({ success: true });
  });

  it('returns error on failure', () => {
    mockExecSync.mockImplementation(() => { throw new Error('fail'); });
    const result = copyToClipboard('test');
    expect(result).toEqual({ success: false, error: 'fail' });
  });
});
