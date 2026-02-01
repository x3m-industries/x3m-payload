import type { EmailField, Field } from 'payload';
import { deepMerge } from 'payload';
import { email } from 'payload/shared';

import { validateWithHasMany } from '../../utils/validation.js';

export type EmailFieldOverrides = Partial<Omit<EmailField, 'type'>>;

/**
 * Configuration for the email field.
 */
export interface EmailFieldConfig {
  /**
   * List of allowed domains for the email address (e.g., ['example.com']).
   * If not provided, any valid email is allowed.
   */
  allowedDomains?: string[];

  /**
   * valid for single domain check
   */
  requiredDomain?: string;
}

/**
 * Props for the email field.
 */
export interface EmailFieldProps {
  /** Configuration options */
  config?: EmailFieldConfig;
  /** Overrides for the Payload field */
  overrides?: EmailFieldOverrides;
}

/**
 * Creates a Payload field for email addresses with optional domain restriction.
 *
 * @param props Configuration options
 * @returns An array containing the configured Payload field
 */
export function emailField({ config = {}, overrides = {} }: EmailFieldProps = {}): Field[] {
  const { allowedDomains = [], requiredDomain } = config;

  const validDomains = [...allowedDomains].map((d) => d.toLowerCase());
  if (requiredDomain) {
    validDomains.push(requiredDomain.toLowerCase());
  }

  const field = deepMerge<EmailField, EmailFieldOverrides>(
    {
      name: 'email',
      type: 'email',
      admin: {
        placeholder:
          validDomains.length > 0 ? `Allowed domains: ${validDomains.join(', ')}` : undefined,
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (Array.isArray(value)) {
              return value.map((v) => (typeof v === 'string' ? v.toLowerCase().trim() : v));
            }
            if (typeof value === 'string') {
              return value.toLowerCase().trim();
            }
            return value;
          },
        ],
      },
      validate: validateWithHasMany((value, args) => {
        // First run standard email validation
        const isValidEmail = email(value, args);
        if (isValidEmail !== true) {
          return isValidEmail;
        }

        // If no domains are restricted, we are good
        if (validDomains.length === 0) {
          return true;
        }

        if (typeof value === 'string') {
          const domain = value.split('@')[1];
          if (domain && validDomains.includes(domain)) {
            return true;
          }
        }

        return `Email must be from one of the following domains: ${validDomains.join(', ')}`;
      }),
    } satisfies EmailField,
    overrides
  );

  return [field];
}
