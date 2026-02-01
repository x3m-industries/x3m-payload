import type { EmailField, FieldHookArgs } from 'payload';

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

    it('should validate standard emails if no domains allowed', async () => {
      const [field] = emailField();
      const emailF = field as EmailField;
      const validate = emailF.validate;

      if (!validate) {
        throw new Error('Validate function missing');
      }

      expect(await validate('test@example.com', mockOptions)).toBe(true);
      expect(typeof (await validate('invalid-email', mockOptions))).toBe('string');
    });

    it('should normalize (lower case and trim) email before validation', async () => {
      const field = emailField()[0] as EmailField;
      const hook = field.hooks?.beforeValidate?.[0];
      if (hook) {
        expect(await hook({ value: '  TEST@Example.com  ' } as FieldHookArgs)).toBe(
          'test@example.com'
        );
      }
    });

    it('should accept emails from allowed domains', async () => {
      const [field] = emailField({
        config: { allowedDomains: ['example.com', 'test.org'] },
      });
      // @ts-expect-error - accessing internal validate
      const validate = field.validate;

      if (!validate) {
        throw new Error('Validate function missing');
      }

      expect(await validate('user@example.com', mockOptions)).toBe(true);
      expect(await validate('user@test.org', mockOptions)).toBe(true);
    });

    it('should reject emails from disallowed domains', async () => {
      const [field] = emailField({
        config: { allowedDomains: ['example.com'] },
      });
      // @ts-expect-error - accessing internal validate
      const validate = field.validate;

      if (!validate) {
        throw new Error('Validate function missing');
      }

      // Valid email format but wrong domain
      const result = await validate('user@other.com', mockOptions);
      expect(typeof result).toBe('string');
      expect(result).toContain('example.com');
    });

    describe('hasMany support', () => {
      it('should validate array of emails', async () => {
        const [field] = emailField();
        // @ts-expect-error - accessing internal validate
        const validate = field.validate;

        expect(await validate(['test1@example.com', 'test2@example.com'], mockOptions)).toBe(true);
      });

      it('should return error if any email in array is invalid', async () => {
        const [field] = emailField();
        // @ts-expect-error - accessing internal validate
        const validate = field.validate;

        const result = await validate(['test@example.com', 'invalid-email'], mockOptions);
        expect(typeof result).toBe('string');
      });

      it('should normalize array of emails', async () => {
        const field = emailField()[0] as EmailField;
        const hook = field.hooks?.beforeValidate?.[0];
        if (hook) {
          const result = await hook({ value: [' A@A.com ', ' B@B.com '] } as FieldHookArgs);
          expect(result).toEqual(['a@a.com', 'b@b.com']);
        }
      });
    });
  });
});
