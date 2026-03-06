import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { SearchBar } from '../../src/components/SearchBar.js';

describe('SearchBar', () => {
  it('shows "to search" hint when inactive and empty', () => {
    const { lastFrame } = render(<SearchBar value="" isActive={false} viewMode="recent" />);
    expect(lastFrame()).toContain('to search');
  });

  it('shows query when inactive with value', () => {
    const { lastFrame } = render(<SearchBar value="git" isActive={false} viewMode="recent" />);
    expect(lastFrame()).toContain('git');
  });

  it('shows cursor and prompt when active and empty', () => {
    const { lastFrame } = render(<SearchBar value="" isActive={true} viewMode="recent" />);
    expect(lastFrame()).toContain('type to filter');
  });

  it('shows query and cursor when active with value', () => {
    const { lastFrame } = render(<SearchBar value="git" isActive={true} viewMode="recent" />);
    expect(lastFrame()).toContain('git');
  });

  it('displays view mode', () => {
    const { lastFrame } = render(<SearchBar value="" isActive={false} viewMode="frequent" />);
    expect(lastFrame()).toContain('[frequent]');
  });

  it('displays histy title', () => {
    const { lastFrame } = render(<SearchBar value="" isActive={false} viewMode="recent" />);
    expect(lastFrame()).toContain('histy');
  });
});
