import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { StatusBar } from '../../src/components/StatusBar.js';

const ENTRY = { command: 'git push', timestamp: 1700000000, count: 3 };

describe('StatusBar', () => {
  it('shows navigate mode hints', () => {
    const { lastFrame } = render(
      <StatusBar mode="navigate" actionMessage={null} selectedEntry={ENTRY} entryCount={42} />
    );
    const frame = lastFrame() ?? '';
    expect(frame).toContain('navigate');
    expect(frame).toContain('42 commands');
  });

  it('shows search mode hints', () => {
    const { lastFrame } = render(
      <StatusBar mode="search" actionMessage={null} selectedEntry={ENTRY} entryCount={42} />
    );
    expect(lastFrame()).toContain('ESC');
  });

  it('shows success action message', () => {
    const { lastFrame } = render(
      <StatusBar mode="navigate" actionMessage={{ type: 'success', text: 'Copied' }} selectedEntry={ENTRY} entryCount={42} />
    );
    expect(lastFrame()).toContain('Copied');
  });

  it('shows error action message', () => {
    const { lastFrame } = render(
      <StatusBar mode="navigate" actionMessage={{ type: 'error', text: 'Failed' }} selectedEntry={ENTRY} entryCount={42} />
    );
    expect(lastFrame()).toContain('Failed');
  });

  it('shows selected entry info when no action message', () => {
    const { lastFrame } = render(
      <StatusBar mode="navigate" actionMessage={null} selectedEntry={ENTRY} entryCount={42} />
    );
    expect(lastFrame()).toContain('git push');
  });

  it('handles null selected entry', () => {
    const { lastFrame } = render(
      <StatusBar mode="navigate" actionMessage={null} selectedEntry={null} entryCount={0} />
    );
    expect(lastFrame()).toContain('0 commands');
  });
});
