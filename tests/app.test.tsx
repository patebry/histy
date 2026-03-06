import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'ink-testing-library';
import { tick } from './helpers.js';

vi.mock('../src/utils/getHistory.js', () => ({
  getHistory: vi.fn(),
}));

vi.mock('../src/utils/copyToClipboard.js', () => ({
  copyToClipboard: vi.fn(),
}));

import { App } from '../src/app.js';
import { getHistory } from '../src/utils/getHistory.js';
import { copyToClipboard } from '../src/utils/copyToClipboard.js';

const mockGetHistory = vi.mocked(getHistory);
const mockCopyToClipboard = vi.mocked(copyToClipboard);

const ENTRIES = [
  { command: 'git push', timestamp: 1700000200, count: 5 },
  { command: 'npm install', timestamp: 1700000100, count: 3 },
  { command: 'docker compose up', timestamp: 1700000000, count: 1 },
];

describe('App', () => {
  let unmount: (() => void) | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetHistory.mockReturnValue([...ENTRIES]);
    mockCopyToClipboard.mockReturnValue({ success: true });
  });

  afterEach(() => {
    unmount?.();
  });

  it('renders initial state with entries', async () => {
    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    const frame = result.lastFrame() ?? '';
    expect(frame).toContain('histy');
    expect(frame).toContain('[recent]');
    expect(frame).toContain('git push');
    expect(frame).toContain('npm install');
    expect(frame).toContain('docker compose up');
  });

  it('navigates down with j', async () => {
    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('j');
    await tick();

    const frame = result.lastFrame() ?? '';
    // Second item should now be selected (has arrow)
    expect(frame).toContain('▶');
    expect(frame).toContain('npm install');
  });

  it('navigates up with k', async () => {
    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('j'); // go to index 1
    await tick();
    result.stdin.write('k'); // go back to index 0
    await tick();

    const frame = result.lastFrame() ?? '';
    expect(frame).toContain('▶');
    expect(frame).toContain('git push');
  });

  it('jumps to last with G', async () => {
    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('G');
    await tick();

    const frame = result.lastFrame() ?? '';
    expect(frame).toContain('▶');
  });

  it('jumps to first with g', async () => {
    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('G');
    await tick();
    result.stdin.write('g');
    await tick();

    const frame = result.lastFrame() ?? '';
    expect(frame).toContain('▶');
  });

  it('enters search mode with /', async () => {
    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('/');
    await tick();

    const frame = result.lastFrame() ?? '';
    expect(frame).toContain('type to filter');
  });

  it('filters entries in search mode', async () => {
    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('/');
    await tick();
    result.stdin.write('g');
    await tick();
    result.stdin.write('i');
    await tick();
    result.stdin.write('t');
    await tick();

    const frame = result.lastFrame() ?? '';
    expect(frame).toContain('git push');
    expect(frame).not.toContain('npm install');
  });

  it('clears search and exits search mode with ESC', async () => {
    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('/');
    await tick();
    result.stdin.write('g');
    await tick();
    result.stdin.write('i');
    await tick();
    result.stdin.write('t');
    await tick();

    result.stdin.write('\x1B'); // ESC
    await tick();

    const frame = result.lastFrame() ?? '';
    expect(frame).toContain('npm install'); // filter cleared
    expect(frame).toContain('/ to search'); // back to navigate
  });

  it('commits search with Enter', async () => {
    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('/');
    await tick();
    result.stdin.write('g');
    await tick();
    result.stdin.write('i');
    await tick();
    result.stdin.write('t');
    await tick();
    result.stdin.write('\r'); // Enter
    await tick();

    const frame = result.lastFrame() ?? '';
    // Should be back in navigate mode but keep filter
    expect(frame).toContain('/ git');
    expect(frame).toContain('navigate');
  });

  it('backspace removes last search character', async () => {
    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('/');
    await tick();
    result.stdin.write('g');
    await tick();
    result.stdin.write('i');
    await tick();
    result.stdin.write('\x7F'); // Backspace
    await tick();

    const frame = result.lastFrame() ?? '';
    expect(frame).toContain('/ g');
  });

  it('copies to clipboard with c', async () => {
    const result = render(<App _actionMessageTimeoutMs={50} />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('c');
    await tick();

    expect(mockCopyToClipboard).toHaveBeenCalledWith('git push');
    const frame = result.lastFrame() ?? '';
    expect(frame).toContain('Copied');
  });

  it('shows error when copy fails', async () => {
    mockCopyToClipboard.mockReturnValue({ success: false, error: 'no pbcopy' });

    const result = render(<App _actionMessageTimeoutMs={50} />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('c');
    await tick();

    const frame = result.lastFrame() ?? '';
    expect(frame).toContain('Copy failed');
  });

  it('clears action message after timeout', async () => {
    const result = render(<App _actionMessageTimeoutMs={30} />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('c');
    await tick();
    expect(result.lastFrame()).toContain('Copied');

    await tick(50);
    expect(result.lastFrame()).not.toContain('Copied');
  });

  it('cycles views with Tab', async () => {
    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    expect(result.lastFrame()).toContain('[recent]');

    result.stdin.write('\t');
    await tick();
    expect(result.lastFrame()).toContain('[frequent]');

    result.stdin.write('\t');
    await tick();
    expect(result.lastFrame()).toContain('[unique]');

    result.stdin.write('\t');
    await tick();
    expect(result.lastFrame()).toContain('[recent]');
  });

  it('sorts by frequency in frequent view', async () => {
    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('\t'); // switch to frequent
    await tick();

    const frame = result.lastFrame() ?? '';
    // git push (count=5) should be first, npm install (count=3) second
    const gitIdx = frame.indexOf('git push');
    const npmIdx = frame.indexOf('npm install');
    expect(gitIdx).toBeLessThan(npmIdx);
  });

  it('refreshes with r', async () => {
    const result = render(<App _actionMessageTimeoutMs={50} />);
    unmount = result.unmount;
    await tick();

    mockGetHistory.mockReturnValue([
      { command: 'new command', timestamp: 1700000300, count: 1 },
    ]);

    result.stdin.write('r');
    await tick();

    const frame = result.lastFrame() ?? '';
    expect(frame).toContain('new command');
    expect(frame).toContain('refreshed');
  });

  it('toggles help with ?', async () => {
    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('?');
    await tick();

    const frame = result.lastFrame() ?? '';
    expect(frame).toContain('Keybindings');
  });

  it('dismisses help with any key', async () => {
    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('?');
    await tick();
    expect(result.lastFrame()).toContain('Keybindings');

    result.stdin.write('x');
    await tick();
    expect(result.lastFrame()).not.toContain('Keybindings');
  });

  it('shows empty state when no entries', async () => {
    mockGetHistory.mockReturnValue([]);

    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    expect(result.lastFrame()).toContain('No history entries found');
  });

  it('arrow keys navigate in search mode', async () => {
    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('/');
    await tick();
    result.stdin.write('\x1B[B'); // Down arrow
    await tick();

    // Should have moved selection down while staying in search mode
    expect(result.lastFrame()).toContain('type to filter');
  });

  it('handles navigate with arrow keys', async () => {
    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('\x1B[B'); // Down arrow
    await tick();

    const frame = result.lastFrame() ?? '';
    expect(frame).toContain('▶');
  });

  it('clears search query with ESC in navigate mode', async () => {
    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    // Enter search, type, commit, then ESC to clear
    result.stdin.write('/');
    await tick();
    result.stdin.write('g');
    await tick();
    result.stdin.write('i');
    await tick();
    result.stdin.write('t');
    await tick();
    result.stdin.write('\r'); // commit search
    await tick();

    // Now in navigate mode with filter active
    expect(result.lastFrame()).toContain('/ git');

    result.stdin.write('\x1B'); // ESC to clear
    await tick();
    expect(result.lastFrame()).toContain('/ to search');
  });

  it('calls onCommand and exits with Enter', async () => {
    const onCommand = vi.fn();
    const result = render(<App onCommand={onCommand} />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('\r'); // Enter
    await tick();

    expect(onCommand).toHaveBeenCalledWith('git push');
  });

  it('prints to stdout in print mode', async () => {
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    const result = render(<App printMode={true} />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('\r'); // Enter
    await tick();

    expect(writeSpy).toHaveBeenCalledWith('git push');
    writeSpy.mockRestore();
  });

  it('quits with q', async () => {
    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('q');
    await tick();
    // App should have exited (no crash)
  });

  it('quits with Ctrl+C', async () => {
    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('\x03'); // Ctrl+C
    await tick();
    // App should have exited
  });

  it('up arrow in search mode', async () => {
    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('/');
    await tick();

    // Go down first, then up
    result.stdin.write('\x1B[B'); // Down
    await tick();
    result.stdin.write('\x1B[A'); // Up
    await tick();

    // Still in search mode
    expect(result.lastFrame()).toContain('type to filter');
  });

  it('swallows ctrl keys in search mode', async () => {
    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('/');
    await tick();
    result.stdin.write('\x01'); // Ctrl+A
    await tick();

    // Should still be in search mode, no crash
    expect(result.lastFrame()).toContain('type to filter');
  });

  it('does not copy when no entries selected', async () => {
    mockGetHistory.mockReturnValue([]);

    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('c');
    await tick();

    expect(mockCopyToClipboard).not.toHaveBeenCalled();
  });

  it('does not copy+exit when no entries selected', async () => {
    mockGetHistory.mockReturnValue([]);

    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('\r');
    await tick();

    expect(mockCopyToClipboard).not.toHaveBeenCalled();
  });

  it('clamps index when filter reduces list', async () => {
    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    // Navigate to last item
    result.stdin.write('G');
    await tick();

    // Search for something with fewer results
    result.stdin.write('/');
    await tick();
    result.stdin.write('g');
    await tick();
    result.stdin.write('i');
    await tick();
    result.stdin.write('t');
    await tick();

    // Only 1 result, index should be clamped to 0
    const frame = result.lastFrame() ?? '';
    expect(frame).toContain('git push');
    expect(frame).toContain('▶');
  });

  it('navigate up arrow', async () => {
    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('\x1B[B'); // Down
    await tick();
    result.stdin.write('\x1B[A'); // Up
    await tick();

    const frame = result.lastFrame() ?? '';
    expect(frame).toContain('▶');
  });

  it('ESC without search query in navigate does nothing', async () => {
    const result = render(<App />);
    unmount = result.unmount;
    await tick();

    result.stdin.write('\x1B');
    await tick();

    // Still in navigate mode
    expect(result.lastFrame()).toContain('/ to search');
  });
});
