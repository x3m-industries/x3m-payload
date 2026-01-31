import { Field, TextField, deepMerge } from 'payload';
import { text } from 'payload/shared';

import { Country, checkVAT, countries } from 'jsvat';

export type VatFieldOverrides = Partial<Omit<TextField, 'type'>>;

export interface VatFieldConfig {
  /**
   * Optional list of country codes to restrict validation to.
   * If provided, the field will only accept VAT numbers from these countries.
   * Uses ISO 3166-1 alpha-2 codes (e.g., 'DE', 'FR').
   */
  countries?: Country[];
}

/**
 * Props for the VAT number field.
 */
export interface VatFieldProps {
  /** Overrides for the underlying Payload text field */
  overrides?: VatFieldOverrides;
  /** Configuration for VAT validation logic */
  config?: VatFieldConfig;
}

/**
 * Creates a Payload field for storing and validating European VAT numbers.
 *
 * - Validates format and checksum using `jsvat`.
 * - Automatically normalizes input (uppercase, trims whitespace/dots).
 * - Stores as a clean string (e.g., "DE123456789").
 *
 * @param props Configuration options
 * @returns An array containing the configured Payload field
 */
export function vatField({ overrides = {}, config = {} }: VatFieldProps): Field[] {
  type VatTextField = TextField;
  const vatTextField = deepMerge<VatTextField, VatFieldOverrides>(
    {
      type: 'text',
      name: 'vat',
      label: 'VAT Number',
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (!value) {
              return value;
            }

            // Simple cleanup: uppercase and trim and remove dots
            return value.trim().toUpperCase().replace(/\./g, '');
          },
        ],
      },
      validate: (value, args) => {
        const result = text(value, args);
        if (result !== true) {
          return result;
        }

        if (!value) {
          return true;
        }

        const checkResult = checkVAT(value, config.countries || countries);
        if (!checkResult.isValid) {
          return 'Invalid VAT number';
        }

        return true;
      },
    } satisfies VatTextField,
    overrides
  );

  return [vatTextField];
}
