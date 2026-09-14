import { describe, it, expect } from 'vitest';
import { formatPrice, formatArea, formatDate, formatRelativeTime } from '@/lib/format';

describe('Format Utilities (Step 5)', () => {
  it('formats prices correctly', () => {
    expect(formatPrice(25000)).toBe('ETB 25,000 / mo');
    expect(formatPrice(1200, 'USD')).toBe('USD 1,200 / mo');
    expect(formatPrice(0)).toBe('ETB 0 / mo');
  });

  it('formats area with sqm and sqft units', () => {
    expect(formatArea(120, 'sqm')).toBe('120 m²');
    expect(formatArea(1500, 'sqft')).toBe('1,500 sqft');
    expect(formatArea(undefined)).toBe('—');
    expect(formatArea(0)).toBe('—');
  });

  it('formats ISO dates into readable date strings', () => {
    const formatted = formatDate('2026-09-14T22:00:00Z');
    expect(formatted).toMatch(/Sep 14, 2026/);
    expect(formatDate('')).toBe('—');
    expect(formatDate('invalid-date')).toBe('—');
  });

  it('formats relative time ago', () => {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
    const twoHoursAgo = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();
    const threeDaysAgo = new Date(now.getTime() - 3 * 86400 * 1000).toISOString();

    expect(formatRelativeTime(now.toISOString())).toBe('just now');
    expect(formatRelativeTime(tenMinutesAgo)).toBe('10m ago');
    expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');
    expect(formatRelativeTime(threeDaysAgo)).toBe('3d ago');
    expect(formatRelativeTime('')).toBe('—');
  });
});
