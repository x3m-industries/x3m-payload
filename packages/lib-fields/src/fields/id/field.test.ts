import type {
  FieldAccess,
  FieldHook,
  FieldHookArgs,
  PayloadRequest,
  TextField,
  ValidateOptions,
} from 'payload';

import { describe, expect, it } from 'vitest';

import { idField } from './field.js';

type FieldAccessArgs = Parameters<FieldAccess>[0];
type SingleTextField = Extract<TextField, { hasMany?: false | undefined }>;

const mockArgs = {
  req: {
    payload: {
      config: {
        i18n: {
          fallbackLng: 'en',
        },
      },
    },
    t: ((key: string) => key) as unknown as PayloadRequest['t'],
  } as unknown as PayloadRequest,
  required: true,
} as unknown as ValidateOptions<unknown, unknown, TextField, string>;

describe('idField', () => {
  it('should use defaults (uuid, managed, immutable)', () => {
    const fields = idField();
    const field = fields[0] as SingleTextField;

    expect(field.name).toBe('id');
    expect(field.label).toBe('ID');
    expect(field.admin?.readOnly).toBe(true);
    expect(typeof field.defaultValue).toBe('function');

    // Test access control logic
    expect(field.access?.create?.({} as unknown as FieldAccessArgs)).toBe(false); // managed=true prevents manual create
    expect(field.access?.update?.({} as unknown as FieldAccessArgs)).toBe(false); // managed=true prevents update
  });

  it('should allow overriding label and name', () => {
    const fields = idField({ overrides: { name: 'customId', label: 'Custom ID' } });
    const field = fields[0] as SingleTextField;
    expect(field.name).toBe('customId');
    expect(field.label).toBe('Custom ID');
  });

  describe('Managed & Immutable Logic', () => {
    it('should allow manual input when managed is false', () => {
      const fields = idField({ config: { managed: false } });
      const field = fields[0] as SingleTextField;

      expect(field.access?.create?.({} as unknown as FieldAccessArgs)).toBe(true);
      expect(field.defaultValue).toBeUndefined();
    });

    it('should allow updates when immutable is false and managed is false', () => {
      const fields = idField({ config: { immutable: false, managed: false } });
      const field = fields[0] as SingleTextField;

      expect(field.access?.update?.({} as unknown as FieldAccessArgs)).toBe(true);
      expect(field.admin?.readOnly).toBe(false);
    });

    it('should remain readOnly if managed is true even if immutable is false', () => {
      const fields = idField({ config: { immutable: false, managed: true } });
      const field = fields[0] as SingleTextField;

      expect(field.admin?.readOnly).toBe(true);
      expect(field.access?.update?.({} as unknown as FieldAccessArgs)).toBe(false);
    });
  });

  describe('Validation', () => {
    it('should validate UUID v4 by default', async () => {
      const fields = idField();
      const field = fields[0] as SingleTextField;
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';

      expect(await field.validate!(validUUID, mockArgs)).toBe(true);
      expect(typeof (await field.validate!('not-a-uuid', mockArgs))).toBe('string');
    });

    it('should validate UUID v7', async () => {
      const fields = idField({ config: { type: 'uuidv7' } });
      const field = fields[0] as SingleTextField;
      // Example v7 UUID
      const validV7 = '018b2f19-e33e-7ccf-8704-9cd081394784';

      expect(await field.validate!(validV7, mockArgs)).toBe(true);
      expect(typeof (await field.validate!('550e8400-e29b-41d4-a716-446655440000', mockArgs))).toBe(
        'string'
      ); // v4 fails v7 check
    });

    it('should validate ULID', async () => {
      const fields = idField({ config: { type: 'ulid' } });
      const field = fields[0] as SingleTextField;
      // Valid ULID: 26 chars, Crockford's Base32 (no I, L, O, U)
      const validULID = '01H7X7J7X7J7X7J7X7J7X7J7X7';

      expect(await field.validate!(validULID, mockArgs)).toBe(true);
      expect(typeof (await field.validate!('short', mockArgs))).toBe('string');
    });

    it('should validate NanoID', async () => {
      const fields = idField({ config: { type: 'nanoid' } });
      const field = fields[0] as SingleTextField;

      expect(await field.validate!('V1StGXR8_Z5jdHi6B-myT', mockArgs)).toBe(true);
      expect(typeof (await field.validate!('invalid@character', mockArgs))).toBe('string');
    });

    it('should validate CUID2', async () => {
      const fields = idField({ config: { type: 'cuid2' } });
      const field = fields[0] as SingleTextField;

      expect(await field.validate!('tz4a98xxat96iws9zmbrgj3a', mockArgs)).toBe(true);
      expect(typeof (await field.validate!('123cannot-start-with-number', mockArgs))).toBe(
        'string'
      );
    });
  });

  describe('Hooks', () => {
    it('should generate an ID in beforeChange if missing on create', async () => {
      const fields = idField({ config: { type: 'nanoid', count: 12 } });
      const field = fields[0] as SingleTextField;
      const beforeChange = field.hooks?.beforeChange?.[0] as FieldHook;

      const result = await beforeChange({
        operation: 'create',
        value: undefined,
      } as unknown as FieldHookArgs);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      // For nanoid with count 12
      expect(result.length).toBe(12);
    });

    it('should not overwrite existing ID in beforeChange', async () => {
      const fields = idField();
      const field = fields[0] as SingleTextField;
      const beforeChange = field.hooks?.beforeChange?.[0] as FieldHook;

      const existingId = 'existing-id';
      const result = await beforeChange({
        operation: 'create',
        value: existingId,
      } as unknown as FieldHookArgs);

      expect(result).toBe(existingId);
    });

    it('should not generate ID on update', async () => {
      const fields = idField();
      const field = fields[0] as SingleTextField;
      const beforeChange = field.hooks?.beforeChange?.[0] as FieldHook;

      const result = await beforeChange({
        operation: 'update',
        value: undefined,
      } as unknown as FieldHookArgs);

      expect(result).toBeUndefined();
    });
  });
});
