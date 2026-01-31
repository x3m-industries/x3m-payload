import type { Field, TextField } from 'payload';
import { deepMerge } from 'payload';
import { text } from 'payload/shared';

import { normalizeString } from '../../utils/normalization.js';
import { type URLType, getURLConfig } from './defaults.js';

export type URLFieldOverrides = Partial<Omit<TextField, 'type'>>;

/**
 * Configuration for the URL field behavior.
 */
export interface URLFieldConfig {
  /**
   * Enforce https protocol
   * @default true
   */
  https?: boolean;
  /**
   * Whether the URL should be specifically for an account/profile.
   * Only applies to select social platforms.
   * @default false
   */
  isAccount?: boolean;
  /** Custom regex for validation */
  regex?: RegExp;
  /**
   * The type of URL field to create
   * @default 'url'
   */
  type?: URLType;
}

/**
 * Props for the URL field.
 */
export interface URLFieldProps {
  /** Configuration for the field behavior */
  config?: URLFieldConfig;
  /** Overrides for the Payload field */
  overrides?: URLFieldOverrides;
}

/**
 * Creates a Payload field for URLs or social media accounts.
 *
 * @param props Configuration options and overrides
 * @returns An array containing the configured Payload field
 */
export function urlField({ config = {}, overrides = {} }: URLFieldProps = {}): Field[] {
  const { type = 'url', https = true, isAccount = false, regex } = config;
  const resolvedConfig = getURLConfig(type, isAccount);
  const finalRegex = regex || resolvedConfig.regex;

  const field: TextField = deepMerge<TextField, URLFieldOverrides>(
    {
      name: resolvedConfig.name,
      type: 'text',
      admin: {
        placeholder: resolvedConfig.placeholder,
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            let normalized = normalizeString(value);

            if (normalized && !normalized.startsWith('http')) {
              normalized = `${https ? 'https' : 'http'}://${normalized}`;
            }

            return normalized;
          },
        ],
      },
      label: resolvedConfig.label,
      validate: async (val, args) => {
        // Run standard Payload text validation first
        const result = await text(val, args);
        if (result !== true) {
          return result;
        }

        const stringVal = normalizeString(val);
        if (!stringVal) {
          return true;
        }

        if (finalRegex && !finalRegex.test(stringVal)) {
          return `Please enter a valid ${resolvedConfig.label.toLowerCase()}`;
        }

        if (https && !stringVal.startsWith('https://')) {
          return 'Protocol must be https://';
        }

        return true;
      },
    } satisfies TextField,
    overrides
  );

  return [field];
}
