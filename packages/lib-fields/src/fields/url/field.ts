import type { Field, TextField } from 'payload';
import { deepMerge } from 'payload';
import { text } from 'payload/shared';

import { normalizeString } from '../../utils/normalization.js';

export type URLType =
  | 'facebook'
  | 'facebookAccount'
  | 'instagramAccount'
  | 'linkedin'
  | 'linkedinAccount'
  | 'url'
  | 'website'
  | 'xAccount';

export interface URLFieldDefaults {
  isUrl?: boolean;
  label: string;
  name: string;
  placeholder?: string;
  regex?: RegExp;
}

export const URLTypeDefaults: Record<URLType, URLFieldDefaults> = {
  facebook: {
    name: 'facebook',
    isUrl: true,
    label: 'Facebook URL',
    placeholder: 'https://www.facebook.com/username',
    regex: /^https?:\/\/(www\.)?facebook\.com\/.+/i,
  },
  facebookAccount: {
    name: 'facebookAccount',
    label: 'Facebook Account',
    placeholder: 'username',
    regex: /^[a-z0-9.]+$/i,
  },
  instagramAccount: {
    name: 'instagramAccount',
    label: 'Instagram Account',
    placeholder: 'username',
    regex: /^[\w.]+$/,
  },
  linkedin: {
    name: 'linkedin',
    isUrl: true,
    label: 'LinkedIn URL',
    placeholder: 'https://www.linkedin.com/in/username or /company/name',
    regex: /^https?:\/\/(www\.)?linkedin\.com\/(in|company|school)\/.+/i,
  },
  linkedinAccount: {
    name: 'linkedinAccount',
    label: 'LinkedIn Account',
    placeholder: 'username',
    regex: /^[a-z0-9-]+$/i,
  },
  url: {
    name: 'url',
    isUrl: true,
    label: 'URL',
    placeholder: 'https://example.com',
    regex: /^https?:\/\/.+/i,
  },
  website: {
    name: 'website',
    isUrl: true,
    label: 'Website',
    placeholder: 'https://example.com',
    regex: /^https?:\/\/.+/i,
  },
  xAccount: {
    name: 'xAccount',
    label: 'X Account',
    placeholder: '@username',
    regex: /^@?\w{1,15}$/,
  },
};

export const URL_LIKE_TYPES = Object.entries(URLTypeDefaults)
  .filter(([_, d]) => d.isUrl)
  .map(([k]) => k as URLType);

export type URLFieldOverrides = Partial<Omit<TextField, 'type'>>;

/**
 * Configuration for the URL field behavior.
 */
export interface URLFieldConfig {
  /** Enforce https protocol (only applies to URL-like types) */
  https?: boolean;
  /** Custom regex for validation */
  regex?: RegExp;
  /** The type of URL field to create */
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
  const { type = 'url', https = true, regex } = config;
  const defaults = URLTypeDefaults[type];
  const finalRegex = regex || defaults.regex;
  const isUrlLike = URL_LIKE_TYPES.includes(type);

  const field: TextField = deepMerge<TextField, URLFieldOverrides>(
    {
      name: defaults.name,
      type: 'text',
      admin: {
        placeholder: defaults.placeholder,
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            let normalized = normalizeString(value);

            if (https && normalized && !normalized.startsWith('http') && isUrlLike) {
              normalized = `https://${normalized}`;
            }

            return normalized;
          },
        ],
      },
      label: defaults.label,
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
          return `Please enter a valid ${defaults.label.toLowerCase()}`;
        }

        if (https && isUrlLike && !stringVal.startsWith('https://')) {
          return 'Protocol must be https://';
        }

        return true;
      },
    } satisfies TextField,
    overrides
  );

  return [field];
}
