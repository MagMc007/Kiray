import { describe, it, expect } from 'vitest';
import { validateEthiopianPhone } from '@/lib/validation/phoneValidation';

describe('validateEthiopianPhone', () => {
  it('accepts valid 12-digit numbers with +251 prefix', () => {
    const result = validateEthiopianPhone('+251966204556');
    expect(result.isValid).toBe(true);
    expect(result.normalized).toBe('+251966204556');
    expect(result.error).toBeUndefined();
  });

  it('normalizes numbers with spaces or hyphens to +251XXXXXXXXX', () => {
    const result = validateEthiopianPhone('+251 966 204 556');
    expect(result.isValid).toBe(true);
    expect(result.normalized).toBe('+251966204556');
  });

  it('normalizes local 10-digit numbers starting with 0', () => {
    const result = validateEthiopianPhone('0966204556');
    expect(result.isValid).toBe(true);
    expect(result.normalized).toBe('+251966204556');
  });

  it('normalizes 9-digit numbers without prefix', () => {
    const result = validateEthiopianPhone('966204556');
    expect(result.isValid).toBe(true);
    expect(result.normalized).toBe('+251966204556');
  });

  it('rejects numbers with fewer than 9 digits after +251', () => {
    const result = validateEthiopianPhone('+25196620');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('must have exactly 9 digits after +251');
  });

  it('rejects numbers with more than 9 digits after +251', () => {
    const result = validateEthiopianPhone('+25196620455699');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('must have exactly 9 digits after +251');
  });

  it('handles empty optional values as valid', () => {
    const result = validateEthiopianPhone('');
    expect(result.isValid).toBe(true);
    expect(result.normalized).toBe('');
  });

  it('rejects empty values when required is true', () => {
    const result = validateEthiopianPhone('', { required: true, fieldName: 'Primary phone' });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Primary phone is required.');
  });
});
