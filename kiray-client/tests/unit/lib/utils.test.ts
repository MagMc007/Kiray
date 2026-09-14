import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('Utils (Step 5)', () => {
  it('combines class names with cn', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('handles conditional falsy values', () => {
    expect(cn('base', false && 'hidden', null, undefined, 'active')).toBe('base active');
  });

  it('resolves conflicting Tailwind utilities properly', () => {
    expect(cn('p-4', 'p-6')).toBe('p-6');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });
});
