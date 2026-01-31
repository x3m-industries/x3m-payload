import { describe, expect, it } from 'vitest';

import { normalizeString } from './normalization.js';

describe('normalizeString utility', () => {
  it('should trim whitespace', () => {
    expect(normalizeString('  test  ')).toBe('test');
  });

  it('should return empty string for non-string values', () => {
    expect(normalizeString(null)).toBe('');
    expect(normalizeString(undefined)).toBe('');
    expect(normalizeString(123)).toBe('');
    expect(normalizeString({})).toBe('');
  });

  it('should work with native string methods', () => {
    expect(normalizeString('  test.test  ').toUpperCase()).toBe('TEST.TEST');
    expect(normalizeString('  test.test  ').replace(/\./g, '-')).toBe('test-test');
  });
});
