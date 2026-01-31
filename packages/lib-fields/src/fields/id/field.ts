import type { Field, TextField } from 'payload';
import { deepMerge } from 'payload';

import { type GenerateIDOptions, type IDType, ID_PATTERNS, generateId } from '../../utils/id.js';

export type IDFieldOverrides = Partial<Omit<TextField, 'type'>>;

/**
 * Configuration for the ID field behavior.
 */
export interface IDFieldConfig extends GenerateIDOptions {
  /**
   * Whether to make the field immutable.
   * If true, prevents updates to the field after creation.
   * @default true
   */
  immutable?: boolean;
  /**
   * Whether the ID is strictly managed by the system.
   * If true, sets the value via defaultValue and restricts both 'create' and 'update' access.
   * @default true
   */
  managed?: boolean;
  /**
   * The type of ID to generate.
   * Supports 'custom', 'uuid', 'uuidv7', 'nanoid', 'ulid', 'cuid2'.
   * @default 'uuid'
   */
  type?: IDType;
  /**
   * Whether to convert the generated ID to uppercase.
   * @default false
   */
  uppercase?: boolean;
}

/**
 * Props for the ID field.
 */
export interface IDFieldProps {
  /** Configuration for the field behavior */
  config?: IDFieldConfig;
  /** Overrides for the Payload field */
  overrides?: IDFieldOverrides;
}

/**
 * Creates a Payload field for unique identifiers.
 * * Features:
 * - Supports UUID v4/v7, ULID, NanoID, CUID2.
 * - Access control for 'managed' and 'immutable' states.
 * - Server-side generation via defaultValue and beforeChange hooks.
 * - Strict validation against the selected ID type.
 */
export function idField({ config = {}, overrides = {} }: IDFieldProps = {}): Field[] {
  const { type = 'uuid', immutable = true, managed = true, ...generationOptions } = config;

  const field: TextField = deepMerge<TextField, IDFieldOverrides>(
    {
      name: 'id',
      type: 'text',
      access: {
        // Managed fields cannot be manually set on creation
        create: () => !managed,
        // Managed or Immutable fields cannot be updated after creation
        update: () => !managed && !immutable,
      },
      admin: {
        description: `Unique identifier (${type})`,
        readOnly: managed || immutable,
      },
      // defaultValue allows the ID to be visible in the UI immediately upon creation
      defaultValue: managed ? () => generateId({ ...generationOptions, type }) : undefined,
      hooks: {
        beforeChange: [
          ({ operation, value }) => {
            // Fallback generation for 'create' operations if defaultValue was bypassed
            if (operation === 'create' && !value) {
              return generateId({ ...generationOptions, type });
            }
            return value;
          },
        ],
      },
      index: true,
      label: 'ID',
      validate: (value) => {
        if (!value) {
          return true;
        }

        // Perform strict format validation against the selected ID type
        // Skip validation if custom prefix/suffix/uppercase is used as it alters the standard format
        if (
          type !== 'custom' &&
          type in ID_PATTERNS &&
          !generationOptions.prefix &&
          !generationOptions.suffix &&
          !generationOptions.uppercase
        ) {
          const pattern = ID_PATTERNS[type];
          if (typeof value === 'string' && !pattern.test(value)) {
            return `Invalid format. This field must be a valid ${type}.`;
          }
        }

        return true;
      },
    } satisfies TextField,
    overrides
  );

  return [field];
}
