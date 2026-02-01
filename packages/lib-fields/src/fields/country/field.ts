import type { Field, TextField } from 'payload';
import { deepMerge } from 'payload';
import { text } from 'payload/shared';

import { type TCountryCode, countries } from 'countries-list';

import { validateWithHasMany } from '../../utils/validation.js';

export type CountryFieldOverrides = Partial<Omit<TextField, 'type'>>;

export interface CountryFieldConfig {
  allowedCountries?: TCountryCode[];
  priorityCountries?: TCountryCode[];
}

/**
 * Props for the country field.
 */
export interface CountryFieldProps {
  /** Configuration for country validation logic */
  config?: CountryFieldConfig;
  /** Overrides for the underlying Payload text field */
  overrides?: CountryFieldOverrides;
}

/**
 * Creates a Payload field for storing and validating countries.
 *
 * @param props Configuration options
 * @returns An array containing the configured Payload field
 */
export function countryField({ config = {}, overrides = {} }: CountryFieldProps = {}): Field[] {
  type CountryTextField = TextField;
  const countryTextField = deepMerge<CountryTextField, CountryFieldOverrides>(
    {
      name: 'country',
      type: 'text',
      admin: {
        components: {
          Field: {
            clientProps: {
              config,
            },
            path: '@x3m-industries/lib-fields/client#CountrySelectComponent',
          },
        },
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            const format = (val: unknown) => {
              if (!val || typeof val !== 'string') {
                return val;
              }
              // Simple cleanup: uppercase and trim.
              return val.trim().toUpperCase();
            };

            if (Array.isArray(value)) {
              return value.map(format);
            }
            return format(value);
          },
        ],
      },
      label: 'Country',
      validate: validateWithHasMany((value, args) => {
        const result = text(value, args);
        if (result !== true) {
          return result;
        }

        if (!value) {
          return true;
        }

        const countryCode = value as TCountryCode;

        if (!(countryCode in countries)) {
          return 'Invalid country code. Please use ISO 3166-1 alpha-2 format.';
        }

        if (config.allowedCountries && !config.allowedCountries.includes(countryCode)) {
          return `Country code ${countryCode} is not allowed. Please use one of: ${config.allowedCountries.join(', ')}`;
        }

        return true;
      }),
    } satisfies CountryTextField,
    overrides
  );

  return [countryTextField];
}
