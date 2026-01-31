import type { Payload, Where } from 'payload';

import slugify from 'slugify';

/**
 * Generates a URL-friendly slug from a string.
 *
 * @param value - The string to slugify
 * @returns The generated slug
 */
export const generateSlug = (value: string): string => {
  if (!value) {
    return '';
  }
  return slugify(value, {
    lower: true,
    strict: true,
    trim: true,
  });
};

/**
 * Creates a slug from a set of field values.
 */
export const createSlugFromFields = (
  sourceFields: string[],
  data: Record<string, unknown>,
  locale?: string
): string => {
  const values = sourceFields.map((field) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validData = data as Record<string, any>;
    const value = validData[field];

    if (value && typeof value === 'object' && locale && value[locale]) {
      return value[locale];
    }

    return value;
  });

  const slugString = values.filter((val) => typeof val === 'string' && val.length > 0).join(' ');

  return generateSlug(slugString);
};

/**
 * Generates a unique slug by appending a number if necessary.
 */
export const generateUniqueSlug = async ({
  baseSlug,
  collectionSlug,
  currentDocId,
  fieldName = 'slug',
  payload,
}: {
  baseSlug: string;
  collectionSlug: string;
  currentDocId?: number | string;
  fieldName?: string;
  payload: Payload;
}): Promise<string> => {
  let slug = baseSlug;
  let count = 0;

  while (true) {
    const query: Where = {
      [fieldName]: {
        equals: slug,
      },
    };

    if (currentDocId) {
      query.id = {
        not_equals: currentDocId,
      };
    }

    const result = await payload.find({
      collection: collectionSlug,
      where: query,
    });

    if (result.totalDocs === 0) {
      return slug;
    }

    count += 1;
    slug = `${baseSlug}-${count}`;
  }
};
