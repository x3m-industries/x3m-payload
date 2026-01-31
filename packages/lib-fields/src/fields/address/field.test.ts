import type { GroupField, TextField } from 'payload';

import { describe, expect, it, vi } from 'vitest';

import { addressField } from './field.js';

vi.mock('.../country/field.js', () => ({
  countryField: vi.fn().mockReturnValue([{ name: 'country', type: 'text' }]),
}));

describe('addressField', () => {
  it('should create a group field with default structure', () => {
    const [field] = addressField();
    const group = field as { name: string } & GroupField;
    expect(group.name).toBe('address');
    expect(group.type).toBe('group');
    expect(group.fields).toHaveLength(6);

    const fieldNames = group.fields.map((f) => (f as { name: string }).name);
    expect(fieldNames).toContain('line1');
    expect(fieldNames).toContain('line2');
    expect(fieldNames).toContain('city');
    expect(fieldNames).toContain('state');
    expect(fieldNames).toContain('zip');
    expect(fieldNames).toContain('country');
  });

  it('should respect subfield overrides', () => {
    const [field] = addressField({
      overrides: {
        city: { required: false },
        line1: { label: 'Street Address' },
      },
    });
    const group = field as { name: string } & GroupField;
    const fields = group.fields as Array<{ label?: string; name: string; required?: boolean }>;

    const line1 = fields.find((f) => f.name === 'line1');
    const city = fields.find((f) => f.name === 'city');

    expect(line1?.label).toBe('Street Address');
    expect(city?.required).toBe(false);
  });

  it('should respect group level overrides', () => {
    const [field] = addressField({
      overrides: {
        address: { name: 'billingAddress', label: 'Billing Address' },
      },
    });
    const group = field as { label: string; name: string } & GroupField;

    expect(group.name).toBe('billingAddress');
    expect(group.label).toBe('Billing Address');
  });

  describe('Subfield Validations', () => {
    it('should normalize (trim) subfield values', () => {
      const [field] = addressField();
      const group = field as { fields: TextField[] } & GroupField;
      group.fields.forEach((f) => {
        if ((f as { name: string }).name === 'country') {
          return;
        }
        const textField = f;
        const hook = textField.hooks?.beforeValidate?.[0];
        if (hook) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          expect(hook({ value: '  test  ' } as any)).toBe('test');
        } else {
          throw new Error(`Hook missing for field ${(f as { name: string }).name}`);
        }
      });
    });

    it('should have standard validation for subfields', () => {
      const [field] = addressField();
      const group = field as { fields: TextField[] } & GroupField;
      group.fields.forEach((f) => {
        if ((f as { name: string }).name === 'country') {
          return;
        }
        expect(f.validate).toBeDefined();
      });
    });
  });
});
