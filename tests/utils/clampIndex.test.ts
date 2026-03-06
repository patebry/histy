import { describe, it, expect } from 'vitest';
import { clampIndex } from '../../src/utils/clampIndex.js';

describe('clampIndex', () => {
  it('returns 0 for negative index', () => {
    expect(clampIndex(-1, 5)).toBe(0);
  });

  it('returns maxIndex when index exceeds it', () => {
    expect(clampIndex(10, 5)).toBe(5);
  });

  it('returns index when within range', () => {
    expect(clampIndex(3, 5)).toBe(3);
  });

  it('returns 0 for empty list (maxIndex = -1)', () => {
    expect(clampIndex(0, -1)).toBe(0);
  });

  it('handles zero index', () => {
    expect(clampIndex(0, 5)).toBe(0);
  });

  it('handles index equal to maxIndex', () => {
    expect(clampIndex(5, 5)).toBe(5);
  });
});
