import type { CheckboxField, Field, TextField } from 'payload';
import { deepMerge } from 'payload';
import { text } from 'payload/shared';

import { createSlugFromFields, generateUniqueSlug } from '../../utils/slug.js';
import { validateWithHasMany } from '../../utils/validation.js';

export type SlugFieldOverrides = Partial<Omit<TextField, 'type'>>;

/**
 * Configuration for the slug field.
 */
export interface SlugFieldConfig {
  /**
   * Whether the slug should be immutable after creation (when locked).
   * If true, the slug will only be auto-generated on create.
   * If false (default), the slug will be auto-generated on create and update (when locked).
   * @default false
   */
  immutable?: boolean;

  /**
   * Whether to automatically lock the slug after creation.
   * If true (default), the slug will be locked and won't update when the tracking field changes.
   * If false, the slug will remain unlocked and update when the tracking field changes.
   * @default true
   */
  lockOnCreate?: boolean;

  /**
   * The field name(s) to track for auto-generating the slug.
   * @default 'title'
   */
  trackingField?: string | string[];
}

/**
 * Props for the slug field.
 */
export interface SlugFieldProps {
  /** Configuration options */
  config?: SlugFieldConfig;
  /** Overrides for the Payload field */
  overrides?: SlugFieldOverrides;
}

/**
 * Creates a Payload field for slugs that auto-generates from a tracking field.
 *
 * @param props Configuration options
 * @returns An array containing the configured Payload field
 */
export function slugField({ config = {}, overrides = {} }: SlugFieldProps = {}): Field[] {
  const { immutable = false, lockOnCreate = true, trackingField = 'title' } = config;
  const trackingFields = Array.isArray(trackingField) ? trackingField : [trackingField];

  const slugName = overrides.name ?? 'slug';
  const checkboxName = `${slugName}Locked`;

  const checkboxField: CheckboxField = {
    name: checkboxName,
    type: 'checkbox',
    admin: {
      hidden: true,
    },
    defaultValue: lockOnCreate,
  };

  const slugField = deepMerge<TextField, SlugFieldOverrides>(
    {
      name: slugName,
      type: 'text',
      admin: {
        components: {
          Field: {
            path: '@x3m-industries/lib-fields/client#SlugComponent',
          },
        },
      },
      hooks: {
        beforeValidate: [
          async ({ collection, data, operation, originalDoc, req, siblingData, value }) => {
            // Check if locked (synced). Default to true if not found (e.g. on create)
            const isLocked = siblingData?.[checkboxName] !== false;

            // If value is an array (hasMany), we skip auto-generation logic as it assumes a single string relationship.
            // We treat hasMany slugs as manually managed lists.
            if (Array.isArray(value)) {
              return value;
            }

            // If unlocked (manual), bypass auto-generation completely.
            // User decides the value.
            if (!isLocked) {
              return value;
            }

            // If locked:
            // If immutable and updating, do not regenerate.
            if (immutable && operation === 'update' && value) {
              return value;
            }

            // Otherwise (Create OR (Update + Mutable)), generate slug from tracking field
            const baseSlug = createSlugFromFields(
              trackingFields,
              data || {},
              req.locale || undefined
            );

            // If we can't generate a slug (e.g. no title yet), return current value or empty
            if (!baseSlug) {
              return value || '';
            }

            // Check for uniqueness
            const finalSlug = await generateUniqueSlug({
              baseSlug,
              collectionSlug: collection?.slug || '',
              currentDocId:
                operation === 'update'
                  ? (data && data.id) || (originalDoc && originalDoc.id)
                  : undefined,
              fieldName: slugName,
              payload: req.payload,
            });

            return finalSlug;
          },
        ],
      },
      index: true,
      label: 'Slug',
      validate: validateWithHasMany((val, args) => text(val, args)),
    } satisfies TextField,
    overrides
  );

  return [checkboxField, slugField];
}
