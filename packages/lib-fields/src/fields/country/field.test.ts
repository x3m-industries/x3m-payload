import type { Payload, TextField } from 'payload';

import { describe, expect, it, vi } from 'vitest';

import { countryField } from './field.js';

vi.mock('payload/shared', () => ({
  text: vi.fn().mockReturnValue(true),
}));

vi.mock('payload', () => ({
  deepMerge: (target: Record<string, unknown>, source: Record<string, unknown>) => ({
    ...target,
    ...source,
  }),
}));

describe('countryField', () => {
  const [field] = countryField({});
  const mockArgs = {
    field: {
      name: 'country',
      type: 'text',
    },
    payload: {} as Payload,
    t: (key: string) => key,
  } as unknown as Record<string, unknown>;
  describe('validate', () => {
    it('should accept valid country codes', async () => {
      const result = await (
        field as { validate: (v: string, o: Record<string, unknown>) => Promise<string | true> }
      ).validate('DE', mockArgs);
      expect(result).toBe(true);
    });

    it('should reject invalid country codes', async () => {
      const result = await (
        field as { validate: (v: string, o: Record<string, unknown>) => Promise<string | true> }
      ).validate('XX', mockArgs);
      expect(result).toBe('Invalid country code. Please use ISO 3166-1 alpha-2 format.');
    });

    it('should accept empty values', async () => {
      const result = await (
        field as { validate: (v: string, o: Record<string, unknown>) => Promise<string | true> }
      ).validate('', mockArgs);
      expect(result).toBe(true);
    });

    it('should respect allowedCountries config', async () => {
      const [restrictedField] = countryField({
        config: { allowedCountries: ['DE', 'FR'] },
      });

      expect(
        await (
          restrictedField as {
            validate: (v: string, o: Record<string, unknown>) => Promise<string | true>;
          }
        ).validate('DE', mockArgs)
      ).toBe(true);
      expect(
        await (
          restrictedField as {
            validate: (v: string, o: Record<string, unknown>) => Promise<string | true>;
          }
        ).validate('FR', mockArgs)
      ).toBe(true);
      expect(
        await (
          restrictedField as {
            validate: (v: string, o: Record<string, unknown>) => Promise<string | true>;
          }
        ).validate('US', mockArgs)
      ).toBe('Country code US is not allowed. Please use one of: DE, FR');
    });
  });

  describe('beforeValidate hook', () => {
    it('should normalize input (trim and uppercase)', () => {
      const textField = field as TextField;
      const hook = textField.hooks?.beforeValidate?.[0];
      if (!hook) {
        throw new Error('Hook not found');
      }
      const result = hook({ value: '  de  ' } as unknown as Parameters<typeof hook>[0]);
      expect(result).toBe('DE');
    });

    it('should return value if not a string', () => {
      const textField = field as TextField;
      const hook = textField.hooks?.beforeValidate?.[0];
      if (!hook) {
        throw new Error('Hook not found');
      }
      const result = hook({ value: null } as unknown as Parameters<typeof hook>[0]);
      expect(result).toBe(null);
    });
  });
});
