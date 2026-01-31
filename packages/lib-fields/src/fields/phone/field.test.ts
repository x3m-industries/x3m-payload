import type { FieldHookArgs, PayloadRequest, TextField, ValidateOptions } from 'payload';

import { describe, expect, it } from 'vitest';

import { phoneField } from './field.js';

type SingleTextField = Extract<TextField, { hasMany?: false | undefined }>;

const mockArgs = {
  req: {
    payload: {
      config: {
        i18n: {
          fallbackLng: 'en',
        },
      },
    },
    t: ((key: string) => key) as unknown as PayloadRequest['t'],
  },
  required: true,
} as unknown as ValidateOptions<unknown, unknown, TextField, string>;

describe('phoneField', () => {
  it('should use default configuration', () => {
    const fields = phoneField({});
    const field = fields[0] as SingleTextField;

    expect(field.name).toBe('phone');
    expect(field.label).toBe('Phone');
    expect(field.type).toBe('text');
  });

  it('should allow overriding name and label', () => {
    const fields = phoneField({
      overrides: { name: 'mobile', label: 'Mobile Number', required: true },
    });
    const field = fields[0] as SingleTextField;

    expect(field.name).toBe('mobile');
    expect(field.label).toBe('Mobile Number');
    expect(field.required).toBe(true);
  });

  it('should validate international phone numbers', async () => {
    const fields = phoneField({});
    const field = fields[0] as SingleTextField;

    // Use actually valid phone number formats
    expect(await field.validate!('+12125551234', mockArgs)).toBe(true);
    expect(await field.validate!('+442079460958', mockArgs)).toBe(true);
    expect(await field.validate!('+33142868200', mockArgs)).toBe(true);
  });

  it('should reject invalid phone numbers', async () => {
    const fields = phoneField({});
    const field = fields[0] as SingleTextField;

    expect(typeof (await field.validate!('123', mockArgs))).toBe('string');
    expect(typeof (await field.validate!('not-a-phone', mockArgs))).toBe('string');
    expect(typeof (await field.validate!('123-456', mockArgs))).toBe('string');
  });

  it('should format phone numbers to international format', async () => {
    const fields = phoneField({ config: { defaultCountry: 'US' } });
    const field = fields[0] as SingleTextField;
    const hook = field.hooks?.beforeValidate?.[0];

    expect(hook).toBeDefined();
    if (hook) {
      const result = await hook({ value: '(555) 123-4567' } as unknown as FieldHookArgs);
      expect(result).toContain('+1');
    }
  });

  it('should handle 00 prefix', async () => {
    const fields = phoneField({});
    const field = fields[0] as SingleTextField;
    const hook = field.hooks?.beforeValidate?.[0];

    if (hook) {
      const result = await hook({ value: '0033142868200' } as unknown as FieldHookArgs);
      expect(result).toMatch(/^\+/);
    }
  });

  it('should use default country for national format', async () => {
    const fields = phoneField({ config: { defaultCountry: 'FR' } });
    const field = fields[0] as SingleTextField;

    // Should accept French national format
    expect(await field.validate!('01 42 86 82 00', mockArgs)).toBe(true);
  });

  it('should handle empty values', async () => {
    const fields = phoneField({});
    const field = fields[0] as SingleTextField;
    const hook = field.hooks?.beforeValidate?.[0];

    if (hook) {
      expect(await hook({ value: '' } as unknown as FieldHookArgs)).toBe('');
      expect(await hook({ value: null } as unknown as FieldHookArgs)).toBe('');
      expect(await hook({ value: undefined } as unknown as FieldHookArgs)).toBe('');
    }
  });
});
