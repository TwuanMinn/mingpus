import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn() utility', () => {
  it('merges simple class strings', () => {
    const result = cn('foo', 'bar');
    expect(result).toBe('foo bar');
  });

  it('handles conditional classes (false values are omitted)', () => {
    const result = cn('base', false && 'hidden', 'active');
    expect(result).toBe('base active');
  });

  it('handles undefined and null gracefully', () => {
    const result = cn('base', undefined, null, 'end');
    expect(result).toBe('base end');
  });

  it('merges tailwind conflicting classes (last wins)', () => {
    const result = cn('p-4', 'p-8');
    expect(result).toBe('p-8');
  });

  it('merges tailwind text size conflicts', () => {
    const result = cn('text-sm', 'text-lg');
    expect(result).toBe('text-lg');
  });

  it('preserves non-conflicting tailwind classes', () => {
    const result = cn('p-4', 'text-sm', 'bg-red-500');
    expect(result).toContain('p-4');
    expect(result).toContain('text-sm');
    expect(result).toContain('bg-red-500');
  });

  it('returns empty string for no arguments', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('handles array of classes via clsx', () => {
    const result = cn(['foo', 'bar']);
    expect(result).toBe('foo bar');
  });

  it('handles object syntax for conditional classes', () => {
    const result = cn({ active: true, disabled: false, hidden: true });
    expect(result).toContain('active');
    expect(result).toContain('hidden');
    expect(result).not.toContain('disabled');
  });
});
