import type { Field, TextField } from 'payload';
import { deepMerge } from 'payload';
import { text } from 'payload/shared';

import { type Country, checkVAT, countries } from 'jsvat';

import { normalizeString } from '../../utils/normalization.js';
import { validateWithHasMany } from '../../utils/validation.js';

const CLEAN_REGEX = /[\s.]/g;

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
  /** Configuration for VAT validation logic */
  config?: VatFieldConfig;
  /** Overrides for the underlying Payload text field */
  overrides?: VatFieldOverrides;
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
export function vatField({ config = {}, overrides = {} }: VatFieldProps = {}): Field[] {
  type VatTextField = TextField;
  const vatTextField = deepMerge<VatTextField, VatFieldOverrides>(
    {
      name: 'vat',
      type: 'text',
      hooks: {
        beforeValidate: [
          ({ value }) => {
            const clean = (val: unknown) =>
              normalizeString(val).toUpperCase().replace(CLEAN_REGEX, '');

            if (Array.isArray(value)) {
              return value.map(clean);
            }
            return clean(value);
          },
        ],
      },
      label: 'VAT Number',
      validate: validateWithHasMany((value, args) => {
        const result = text(value, args);
        if (result !== true) {
          return result;
        }

        if (!value) {
          return true;
        }

        const checkResult = checkVAT(value as string, config.countries || countries);
        if (!checkResult.isValid) {
          return 'Invalid VAT number';
        }

        return true;
      }),
    } satisfies VatTextField,
    overrides
  );

  return [vatTextField];
}
