import type { NumberField } from 'payload';

import { describe, expect, it } from 'vitest';

import { numberField } from './field.js';

describe('numberField', () => {
  it('should create a number field with default configuration', () => {
    const [field] = numberField();
    const numberF = field as NumberField;

    expect(numberF.name).toBe('number');
    expect(numberF.type).toBe('number');
  });

  it('should pass min and max to Payload field config', () => {
    const [field] = numberField({
      config: { max: 100, min: 0 },
    });
    const numberF = field as NumberField;

    expect(numberF.min).toBe(0);
    expect(numberF.max).toBe(100);
  });

  it('should configure client component path', () => {
    const [field] = numberField();
    const numberF = field as NumberField;

    expect(numberF.admin?.components?.Field).toMatchObject({
      path: '@x3m-industries/lib-fields/client#NumberComponent',
    });
  });

  it('should pass client formatting props to clientProps', () => {
    const [field] = numberField({
      config: {
        min: 10,
        prefix: '$',
        suffix: ' USD',
        thousandSeparator: ',',
      },
    });
    const numberF = field as NumberField;
    const fieldComponent = numberF.admin?.components?.Field as {
      clientProps?: { config: Record<string, unknown> };
    };
    const clientProps = fieldComponent?.clientProps;

    expect(clientProps).toBeDefined();
    expect(clientProps?.config).toMatchObject({
      prefix: '$',
      suffix: ' USD',
      thousandSeparator: ',',
    });

    // min should be extracted and put on field, not in clientProps config
    expect(clientProps?.config.min).toBeUndefined();
    expect(numberF.min).toBe(10);
  });

  it('should respect overrides', () => {
    const [field] = numberField({
      overrides: {
        name: 'price',
        required: true,
      },
    });
    const numberF = field as NumberField;

    expect(numberF.name).toBe('price');
    expect(numberF.required).toBe(true);
  });

  it('should support currency type configuration', () => {
    const [field] = numberField({
      config: {
        type: 'currency',
        currency: '€',
      },
    });

    const numberF = field as NumberField;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clientProps = (numberF.admin?.components?.Field as any)?.clientProps;
    expect(clientProps?.config).toMatchObject({
      fixedDecimalScale: true,
      prefix: '€ ',
      thousandSeparator: ',',
    });
  });

  it('should support percentage type configuration', () => {
    const [field] = numberField({
      config: {
        type: 'percentage',
      },
    });

    const numberF = field as NumberField;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clientProps = (numberF.admin?.components?.Field as any)?.clientProps;
    expect(clientProps?.config).toMatchObject({
      fixedDecimalScale: true,
      suffix: ' %',
    });
  });

  it('should pass scaling config to clientProps', () => {
    const [field] = numberField({ config: { scaling: true } });
    const numberF = field as NumberField;

    expect(numberF.admin?.components?.Field).toMatchObject({
      clientProps: {
        config: {
          scaling: true,
        },
      },
    });
  });
});
