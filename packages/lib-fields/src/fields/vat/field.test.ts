import type { FieldHookArgs, PayloadRequest, TextField, ValidateOptions } from 'payload';

import { describe, expect, it } from 'vitest';

import { vatField } from './field.js';

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

describe('vatField', () => {
  it('should use default configuration', () => {
    const fields = vatField({});
    const field = fields[0] as SingleTextField;

    expect(field.name).toBe('vat');
    expect(field.label).toBe('VAT Number');
    expect(field.type).toBe('text');
  });

  it('should allow overriding name and label', () => {
    const fields = vatField({
      overrides: { name: 'taxId', label: 'Tax ID', required: true },
    });
    const field = fields[0] as SingleTextField;

    expect(field.name).toBe('taxId');
    expect(field.label).toBe('Tax ID');
    expect(field.required).toBe(true);
  });

  it('should validate German VAT numbers', async () => {
    const fields = vatField({});
    const field = fields[0] as SingleTextField;

    // Real valid German VAT number format
    expect(await field.validate!('DE136695976', mockArgs)).toBe(true);
  });

  it('should validate French VAT numbers', async () => {
    const fields = vatField({});
    const field = fields[0] as SingleTextField;

    // Real valid French VAT number format
    expect(await field.validate!('FR00300076965', mockArgs)).toBe(true);
  });

  it('should validate Dutch VAT numbers', async () => {
    const fields = vatField({});
    const field = fields[0] as SingleTextField;

    // Real valid Dutch VAT number format
    expect(await field.validate!('NL009291477B01', mockArgs)).toBe(true);
  });

  it('should reject invalid VAT numbers', async () => {
    const fields = vatField({});
    const field = fields[0] as SingleTextField;

    expect(typeof (await field.validate!('INVALID123', mockArgs))).toBe('string');
    expect(typeof (await field.validate!('XX123456789', mockArgs))).toBe('string');
  });

  it('should normalize VAT numbers (uppercase, remove dots)', async () => {
    const fields = vatField({});
    const field = fields[0] as SingleTextField;
    const hook = field.hooks?.beforeValidate?.[0];

    expect(hook).toBeDefined();
    if (hook) {
      const result = await hook({ value: '  de.123.456.789  ' } as unknown as FieldHookArgs);
      expect(result).toBe('DE123456789');
    }
  });

  it('should handle empty values', async () => {
    const fields = vatField({});
    const field = fields[0] as SingleTextField;
    const hook = field.hooks?.beforeValidate?.[0];

    if (hook) {
      expect(await hook({ value: '' } as unknown as FieldHookArgs)).toBe('');
      expect(await hook({ value: null } as unknown as FieldHookArgs)).toBe('');
      expect(await hook({ value: undefined } as unknown as FieldHookArgs)).toBe('');
    }
  });

  it('should handle lowercase input', async () => {
    const fields = vatField({});
    const field = fields[0] as SingleTextField;
    const hook = field.hooks?.beforeValidate?.[0];

    if (hook) {
      const result = await hook({ value: 'de123456789' } as unknown as FieldHookArgs);
      expect(result).toBe('DE123456789');
    }
  });

  it('should remove dots and spaces', async () => {
    const fields = vatField({});
    const field = fields[0] as SingleTextField;
    const hook = field.hooks?.beforeValidate?.[0];

    if (hook) {
      const result = await hook({ value: 'DE 123.456.789' } as unknown as FieldHookArgs);
      expect(result).toBe('DE123456789');
    }
  });
});
