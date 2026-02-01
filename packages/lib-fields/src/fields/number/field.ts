import type { Field, NumberField } from 'payload';
import { deepMerge } from 'payload';

import type { NumberFieldConfig } from './types.js';

export type { NumberFieldConfig };

export type NumberFieldOverrides = Partial<Omit<NumberField, 'type'>>;

/**
 * Props for the number field.
 */
export interface NumberFieldProps {
  /** Configuration for number formatting and validation */
  config?: NumberFieldConfig;
  /** Overrides for the Payload field */
  overrides?: NumberFieldOverrides;
}

/**
 * Creates a Payload field for numbers with formatting support.
 *
 * @param props Configuration options
 * @returns An array containing the configured Payload field
 */
export function numberField({ config = {}, overrides = {} }: NumberFieldProps = {}): Field[] {
  const {
    type = 'number',
    currency,
    decimalScale = 2,
    max,
    min,
    scaling = false,
    ...restConfig
  } = config;

  let componentConfig: NumberFieldConfig = { ...restConfig, decimalScale };

  // Default scaling to true for percentage and currency if not explicitly set
  // The user wants scaling by default for these types
  const shouldScale =
    scaling !== undefined ? scaling : type === 'currency' || type === 'percentage';

  // Set defaults based on type
  if (type === 'currency') {
    componentConfig = {
      fixedDecimalScale: true,
      prefix: currency ? `${currency} ` : '$ ',
      thousandSeparator: ',',
      ...componentConfig,
    };
  } else if (type === 'percentage') {
    componentConfig = {
      fixedDecimalScale: true,
      suffix: ' %',
      ...componentConfig,
    };
  }

  // Ensure scaling is passed to the client component
  componentConfig = { ...componentConfig, scaling: shouldScale };

  const field = deepMerge<NumberField, NumberFieldOverrides>(
    {
      name: 'number',
      type: 'number',
      admin: {
        components: {
          Field: {
            clientProps: {
              config: componentConfig,
            },
            path: '@x3m-industries/lib-fields/client#NumberComponent',
          },
        },
      },
      max,
      min,
    } satisfies NumberField,
    overrides
  );

  return [field];
}
