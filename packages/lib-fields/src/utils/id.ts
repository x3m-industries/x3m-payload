import { createId as cuid2 } from '@paralleldrive/cuid2';
import crypto from 'crypto';
import { nanoid } from 'nanoid';
import { ulid } from 'ulid';
import { v4 as uuidv4, v7 as uuidv7 } from 'uuid';

/**
 * Supported ID types:
 * - 'custom': Alphanumeric random string with optional prefix/suffix.
 * - 'uuid': Standard RFC 4122 version 4 UUID (Random).
 * - 'uuidv7': Time-ordered UUID (K-sortable), ideal for distributed systems.
 * - 'nanoid': Compact, URL-friendly unique ID.
 * - 'ulid': Universally Unique Lexicographically Sortable Identifier (Base32).
 * - 'cuid2': Secure, collision-resistant, and unpredictable IDs for horizontal scaling.
 */
export type IDType = 'cuid2' | 'custom' | 'nanoid' | 'ulid' | 'uuid' | 'uuidv7';

/**
 * Regular expressions for common ID formats to support validation.
 * These are exported so they can be reused by Payload validation hooks.
 */
export const ID_PATTERNS: Record<Exclude<IDType, 'custom'>, RegExp> = {
  cuid2: /^[a-z][a-z0-9]*$/,
  nanoid: /^[\w-]+$/,
  ulid: /^[0-9A-Z]{26}$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  uuidv7: /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
};

export interface GenerateIDOptions {
  /**
   * Whether to avoid confusing characters (O, 0, I, 1, L, l)
   * Only used for type: 'custom'
   * @default true
   */
  avoidConfusingChars?: boolean;
  /**
   * Number of random characters to generate
   * Used for types: 'custom', 'nanoid'
   * @default 10 (for custom), 21 (for nanoid)
   */
  count?: number;
  /**
   * Prefix for the generated ID (only used for type: 'custom')
   */
  prefix?: string;
  /**
   * Suffix for the generated ID (only used for type: 'custom')
   */
  suffix?: string;
  /**
   * The type of ID to generate
   * @default 'uuid'
   */
  type?: IDType;
  /**
   * Whether to convert the generated ID to uppercase
   * @default false
   */
  uppercase?: boolean;
}

const CONFUSING_CHARS = /[O0I1Ll]/g;

/**
 * Generates a unique ID based on the provided configuration.
 * Leverages standard libraries for reliability and cryptographic security.
 */
export const generateId = (options: GenerateIDOptions = {}): string => {
  const {
    type = 'uuid',
    avoidConfusingChars = true,
    count,
    prefix = '',
    suffix = '',
    uppercase = false,
  } = options;

  let id = '';

  switch (type) {
    case 'cuid2':
      id = cuid2();
      break;

    case 'nanoid':
      id = count ? nanoid(count) : nanoid();
      break;

    case 'ulid':
      id = ulid();
      break;

    case 'uuid':
      id = uuidv4();
      break;

    case 'uuidv7':
      id = uuidv7();
      break;

    case 'custom':
    default: {
      let charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      if (avoidConfusingChars) {
        charset = charset.replace(CONFUSING_CHARS, '');
      }

      const actualCount = count ?? 10;
      let randomPart = '';
      for (let i = 0; i < actualCount; i++) {
        randomPart += charset.charAt(crypto.randomInt(0, charset.length));
      }
      id = randomPart;
      break;
    }
  }

  if (uppercase) {
    id = id.toUpperCase();
  }

  return `${prefix}${id}${suffix}`;
};
