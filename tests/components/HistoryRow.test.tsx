import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { HistoryRow } from '../../src/components/HistoryRow.js';

describe('HistoryRow', () => {
  const entry = { command: 'git push', timestamp: null, count: 5 };

  it('shows arrow when selected', () => {
    const { lastFrame } = render(<HistoryRow entry={entry} isSelected={true} colCommand={40} />);
    const frame = lastFrame() ?? '';
    expect(frame).toContain('▶');
    expect(frame).toContain('git push');
  });

  it('shows no arrow when not selected', () => {
    const { lastFrame } = render(<HistoryRow entry={entry} isSelected={false} colCommand={40} />);
    const frame = lastFrame() ?? '';
    expect(frame).not.toContain('▶');
    expect(frame).toContain('git push');
  });

  it('shows frequency count', () => {
    const { lastFrame } = render(<HistoryRow entry={entry} isSelected={false} colCommand={40} />);
    expect(lastFrame()).toContain('5');
  });

  it('truncates long commands to colCommand width', () => {
    const longEntry = { command: 'a'.repeat(100), timestamp: null, count: 1 };
    const { lastFrame } = render(<HistoryRow entry={longEntry} isSelected={false} colCommand={20} />);
    const frame = lastFrame() ?? '';
    // Should be truncated to 20 'a' chars, not the full 100
    expect(frame).toContain('a'.repeat(20));
    expect(frame).not.toContain('a'.repeat(21));
  });

  it('replaces newlines with visible marker', () => {
    const multilineEntry = { command: 'echo hello\nworld', timestamp: null, count: 1 };
    const { lastFrame } = render(<HistoryRow entry={multilineEntry} isSelected={false} colCommand={40} />);
    expect(lastFrame()).toContain('↵');
  });
});
