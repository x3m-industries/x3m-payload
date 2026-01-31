import type { Field, TextField } from 'payload';
import { deepMerge } from 'payload';
import { text } from 'payload/shared';

import parsePhoneNumberFromString, {
  type CountryCode,
  isValidPhoneNumber,
} from 'libphonenumber-js';

import { normalizeString } from '../../utils/normalization.js';

export type PhoneFieldOverrides = Partial<Omit<TextField, 'type'>>;

/**
 * Configuration for the phone number validation.
 */
export interface PhoneFieldConfig {
  /**
   * Default country to use for parsing if the number is entered in national format.
   * Expects an ISO 3166-1 alpha-2 code (e.g., 'US', 'FR').
   */
  defaultCountry?: CountryCode;
}

/**
 * Props for the phone number field.
 */
export interface PhoneFieldProps {
  /** Configuration for phone validation logic */
  config?: PhoneFieldConfig;
  /** Overrides for the underlying Payload text field */
  overrides?: PhoneFieldOverrides;
}

/**
 * Creates a Payload field for storing and validating international phone numbers.
 *
 * - Parses and formats phone numbers to E.164 international format.
 * - Validates using `libphonenumber-js`.
 * - Automatically handles '00' prefix replacement.
 *
 * @param props Configuration options
 * @returns An array containing the configured Payload field
 */
export function phoneField({ config = {}, overrides = {} }: PhoneFieldProps): Field[] {
  type PhoneTextField = TextField;
  const phoneTextField = deepMerge<PhoneTextField, PhoneFieldOverrides>(
    {
      name: 'phone',
      type: 'text',
      hooks: {
        beforeValidate: [
          ({ value }) => {
            const normalizedValue = normalizeString(value).replace(/^00/, '+');
            const phoneNumber = parsePhoneNumberFromString(normalizedValue, config.defaultCountry);
            if (phoneNumber) {
              return phoneNumber.formatInternational();
            }
            return normalizedValue;
          },
        ],
      },
      label: 'Phone',
      validate: (value, args) => {
        const result = text(value, args);
        if (result !== true) {
          return result;
        }

        if (!value) {
          return true;
        }

        if (!isValidPhoneNumber(value, config.defaultCountry)) {
          return 'Invalid phone number';
        }

        return true;
      },
    } satisfies PhoneTextField,
    overrides
  );

  return [phoneTextField];
}
