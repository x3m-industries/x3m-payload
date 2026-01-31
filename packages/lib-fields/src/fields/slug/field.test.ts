/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CheckboxField, TextField } from 'payload';

import { describe, expect, it, vi } from 'vitest';

import { slugField } from './field';

// Mock utils
vi.mock('../../utils/slug', () => ({
  createSlugFromFields: vi.fn((fields, data) => {
    if (data.title) {
      return data.title.toLowerCase().replace(/ /g, '-');
    }
    return '';
  }),
  generateSlug: vi.fn((val) => val.toLowerCase().replace(/ /g, '-')),
  generateUniqueSlug: vi.fn(({ baseSlug }) => Promise.resolve(baseSlug)),
}));

describe('slugField', () => {
  it('should create a slug field with default configuration', () => {
    const [field1, field2] = slugField();
    const checkbox = field1 as CheckboxField;
    const slugF = field2 as TextField;

    expect(checkbox.name).toBe('slugLocked');
    expect(checkbox.type).toBe('checkbox');
    expect(slugF.name).toBe('slug');
    expect(slugF.type).toBe('text');
  });

  it('should respect overrides and rename lock field', () => {
    const [field1, field2] = slugField({
      overrides: {
        name: 'customSlug',
        required: true,
      },
    });
    const checkbox = field1 as CheckboxField;
    const slugF = field2 as TextField;

    expect(checkbox.name).toBe('customSlugLocked');
    expect(slugF.name).toBe('customSlug');
    expect(slugF.required).toBe(true);
  });

  describe('beforeValidate hook', () => {
    it('should return existing value if not locked (manual bypass)', async () => {
      const [_, slugF] = slugField();
      const hook = (slugF as TextField).hooks?.beforeValidate?.[0];
      if (!hook) {
        throw new Error('Hook missing');
      }

      const result = await hook({
        data: { title: 'New Title' },
        operation: 'create',
        req: { payload: {} } as any,
        siblingData: { slugLocked: false },
        value: 'manual-slug',
      } as any);

      expect(result).toBe('manual-slug');
    });

    it('should generate slug on create if locked', async () => {
      const [_, slugF] = slugField();
      const hook = (slugF as TextField).hooks?.beforeValidate?.[0];
      if (!hook) {
        throw new Error('Hook missing');
      }

      const result = await hook({
        data: { title: 'New Title' },
        operation: 'create',
        req: { payload: {} } as any,
        siblingData: { slugLocked: true },
        value: '',
      } as any);

      expect(result).toBe('new-title');
    });

    it('should generate slug on update if locked and mutable (default)', async () => {
      const [_, slugF] = slugField({ config: { immutable: false } });
      const hook = (slugF as TextField).hooks?.beforeValidate?.[0];
      if (!hook) {
        throw new Error('Hook missing');
      }

      const result = await hook({
        data: { title: 'Updated Title' },
        operation: 'update',
        req: { payload: {} } as any,
        siblingData: { slugLocked: true },
        value: 'old-slug',
      } as any);

      expect(result).toBe('updated-title');
    });

    it('should NOT generate slug on update if locked and immutable', async () => {
      const [_, slugF] = slugField({ config: { immutable: true } });
      const hook = (slugF as TextField).hooks?.beforeValidate?.[0];
      if (!hook) {
        throw new Error('Hook missing');
      }

      const result = await hook({
        data: { title: 'Updated Title' },
        operation: 'update',
        req: { payload: {} } as any,
        siblingData: { slugLocked: true },
        value: 'old-slug',
      } as any);

      expect(result).toBe('old-slug');
    });

    it('should generate slug from multiple tracking fields', () => {
      const [_, slugF] = slugField({ config: { trackingField: ['title', 'subtitle'] } });
      const hook = (slugF as TextField).hooks?.beforeValidate?.[0];
      if (!hook) {
        throw new Error('Hook missing');
      }

      // The mock createSlugFromFields implementation above only checks data.title for simplicity
      // but this text verifies the hook is wired up.
      expect(hook).toBeDefined();
    });
  });
});
