import type { EmailField } from 'payload';

import { describe, expect, it, vi } from 'vitest';

import { emailField } from './field.js';

vi.mock('payload/shared', () => ({
  deepMerge: (target: unknown, source: unknown) => ({
    ...(target as object),
    ...(source as object),
  }),
  email: vi.fn((val) => {
    if (typeof val === 'string' && val.includes('@') && !val.includes('invalid')) {
      return true;
    }
    return 'Invalid email';
  }),
}));

describe('emailField', () => {
  it('should create an email field with default configuration', () => {
    const [field] = emailField();
    const emailF = field as EmailField;

    expect(emailF.name).toBe('email');
    expect(emailF.type).toBe('email');
  });

  it('should respect overrides', () => {
    const [field] = emailField({
      overrides: {
        name: 'contactEmail',
        required: true,
      },
    });
    const emailF = field as EmailField;

    expect(emailF.name).toBe('contactEmail');
    expect(emailF.required).toBe(true);
  });

  describe('validation', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockOptions = {} as any;

    it('should validate standard emails if no domains allowed', () => {
      const [field] = emailField();
      const emailF = field as EmailField;
      const validate = emailF.validate;

      if (!validate) {
        throw new Error('Validate function missing');
      }

      expect(validate('test@example.com', mockOptions)).toBe(true);
      expect(typeof validate('invalid-email', mockOptions)).toBe('string');
    });

    it('should normalize (lower case and trim) email before validation', async () => {
      const [field] = emailField();
      const emailF = field as EmailField;
      const hook = emailF.hooks?.beforeValidate?.[0];

      if (!hook) {
        throw new Error('Hook missing');
      }

      const result = await hook({
        value: '  TEST@Example.com  ',
      } as unknown as Parameters<typeof hook>[0]);

      expect(result).toBe('test@example.com');
    });

    it('should accept emails from allowed domains', () => {
      const [field] = emailField({
        config: { allowedDomains: ['example.com', 'test.org'] },
      });
      const emailF = field as EmailField;
      const validate = emailF.validate;

      if (!validate) {
        throw new Error('Validate function missing');
      }

      expect(validate('user@example.com', mockOptions)).toBe(true);
      expect(validate('user@test.org', mockOptions)).toBe(true);
    });

    it('should reject emails from disallowed domains', () => {
      const [field] = emailField({
        config: { allowedDomains: ['example.com'] },
      });
      const emailF = field as EmailField;
      const validate = emailF.validate;

      if (!validate) {
        throw new Error('Validate function missing');
      }

      // Valid email format but wrong domain
      const result = validate('user@other.com', mockOptions);
      expect(typeof result).toBe('string');
      expect(result).toContain('example.com');
    });
  });
});
