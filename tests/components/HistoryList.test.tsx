import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { HistoryList } from '../../src/components/HistoryList.js';

describe('HistoryList', () => {
  const entries = [
    { command: 'git push', timestamp: 1700000100, count: 3 },
    { command: 'npm install', timestamp: 1700000000, count: 1 },
  ];

  it('renders header and entries', () => {
    const { lastFrame } = render(<HistoryList entries={entries} selectedIndex={0} />);
    const frame = lastFrame() ?? '';
    expect(frame).toContain('COMMAND');
    expect(frame).toContain('TIME');
    expect(frame).toContain('FREQ');
    expect(frame).toContain('git push');
    expect(frame).toContain('npm install');
  });

  it('shows empty message when no entries', () => {
    const { lastFrame } = render(<HistoryList entries={[]} selectedIndex={0} />);
    expect(lastFrame()).toContain('No history entries found');
  });

  it('highlights selected row', () => {
    const { lastFrame } = render(<HistoryList entries={entries} selectedIndex={0} />);
    expect(lastFrame()).toContain('▶');
  });
});
