import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatTimeAgo } from '../../src/utils/formatTimeAgo.js';

describe('formatTimeAgo', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns -- for null timestamp', () => {
    expect(formatTimeAgo(null)).toBe('--');
  });

  it('returns -- for future timestamp', () => {
    const future = Date.now() / 1000 + 3600;
    expect(formatTimeAgo(future)).toBe('--');
  });

  it('returns seconds ago', () => {
    const now = Date.now() / 1000;
    expect(formatTimeAgo(now - 30)).toBe('30s ago');
  });

  it('returns minutes ago', () => {
    const now = Date.now() / 1000;
    expect(formatTimeAgo(now - 120)).toBe('2m ago');
  });

  it('returns hours ago', () => {
    const now = Date.now() / 1000;
    expect(formatTimeAgo(now - 7200)).toBe('2h ago');
  });

  it('returns yesterday', () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(12, 0, 0, 0);
    expect(formatTimeAgo(yesterday.getTime() / 1000)).toBe('yesterday');
  });

  it('returns month and day for older dates', () => {
    // Use a date that's definitely more than 2 days ago
    const old = new Date(2024, 0, 15, 12, 0, 0); // Jan 15, 2024
    expect(formatTimeAgo(old.getTime() / 1000)).toBe('Jan 15');
  });
});
