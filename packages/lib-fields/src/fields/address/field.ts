import type { Field, NamedGroupField, TextField } from 'payload';
import { deepMerge } from 'payload';
import { text } from 'payload/shared';

import { normalizeString } from '../../utils/normalization.js';
import {
  type CountryFieldConfig,
  type CountryFieldOverrides,
  countryField,
} from '../country/field.js';

export type AddressFieldOverridesInternal = Partial<Omit<NamedGroupField, 'type'>>;
export type AddressLine1Overrides = Partial<Omit<TextField, 'type'>>;
export type AddressLine2Overrides = Partial<Omit<TextField, 'type'>>;
export type AddressCityOverrides = Partial<Omit<TextField, 'type'>>;
export type AddressStateOverrides = Partial<Omit<TextField, 'type'>>;
export type AddressZipOverrides = Partial<Omit<TextField, 'type'>>;

/**
 * All possible overrides for the address field group and its subfields.
 */
export interface AddressFieldOverrides {
  address?: AddressFieldOverridesInternal;
  city?: AddressCityOverrides;
  country?: CountryFieldOverrides;
  line1?: AddressLine1Overrides;
  line2?: AddressLine2Overrides;
  state?: AddressStateOverrides;
  zip?: AddressZipOverrides;
}

/**
 * Configuration for the address field behavior.
 */
export interface AddressFieldConfig {
  /** Configuration for subfields (e.g., country dropdown) */
  country?: CountryFieldConfig;
}

/**
 * Props for the address field.
 */
export interface AddressFieldProps {
  /** Configuration for the field behavior */
  config?: AddressFieldConfig;
  /** Overrides for the underlying Payload fields */
  overrides?: AddressFieldOverrides;
}

/**
 * Creates a Payload field group for storing addresses.
 * Reuses the countryField for the country subfield.
 *
 * @param props Configuration options and overrides
 * @returns An array containing the configured Payload field group
 */
export function addressField({ config = {}, overrides = {} }: AddressFieldProps = {}): Field[] {
  const addressGroupField: NamedGroupField = deepMerge<
    NamedGroupField,
    AddressFieldOverridesInternal
  >(
    {
      name: 'address',
      type: 'group',
      fields: [
        deepMerge<TextField, AddressLine1Overrides>(
          {
            name: 'line1',
            type: 'text',
            hooks: {
              beforeValidate: [({ value }) => normalizeString(value)],
            },
            label: 'Street and number',
            required: true,
            validate: (val, args) => text(val, args),
          } satisfies TextField,
          overrides.line1 || {}
        ),
        deepMerge<TextField, AddressLine2Overrides>(
          {
            name: 'line2',
            type: 'text',
            hooks: {
              beforeValidate: [({ value }) => normalizeString(value)],
            },
            label: 'Additional address info',
            validate: (val, args) => text(val, args),
          } satisfies TextField,
          overrides.line2 || {}
        ),
        deepMerge<TextField, AddressCityOverrides>(
          {
            name: 'city',
            type: 'text',
            hooks: {
              beforeValidate: [({ value }) => normalizeString(value)],
            },
            label: 'City',
            required: true,
            validate: (val, args) => text(val, args),
          } satisfies TextField,
          overrides.city || {}
        ),
        deepMerge<TextField, AddressStateOverrides>(
          {
            name: 'state',
            type: 'text',
            hooks: {
              beforeValidate: [({ value }) => normalizeString(value)],
            },
            label: 'State / Province',
            validate: (val, args) => text(val, args),
          } satisfies TextField,
          overrides.state || {}
        ),
        deepMerge<TextField, AddressZipOverrides>(
          {
            name: 'zip',
            type: 'text',
            hooks: {
              beforeValidate: [({ value }) => normalizeString(value)],
            },
            label: 'Zip / Postal Code',
            required: true,
            validate: (val, args) => text(val, args),
          } satisfies TextField,
          overrides.zip || {}
        ),
        ...countryField({
          config: config.country,
          overrides: {
            name: 'country',
            required: true,
            ...overrides.country,
          },
        }),
      ],
      label: 'Address',
    } satisfies NamedGroupField,
    overrides.address || {}
  );

  return [addressGroupField];
}
