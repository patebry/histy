import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { HelpOverlay } from '../../src/components/HelpOverlay.js';

describe('HelpOverlay', () => {
  it('renders keyboard shortcuts', () => {
    const { lastFrame } = render(<HelpOverlay />);
    const frame = lastFrame() ?? '';
    expect(frame).toContain('Keybindings');
    expect(frame).toContain('Move down');
    expect(frame).toContain('Run command + exit');
    expect(frame).toContain('Quit');
    expect(frame).toContain('Press any key to close');
  });
});
