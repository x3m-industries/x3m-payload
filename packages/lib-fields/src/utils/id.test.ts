import { describe, expect, it } from 'vitest';

import { ID_PATTERNS, generateId } from './id.js';

describe('generateId utility', () => {
  describe('UUID v4', () => {
    it('should generate valid UUID v4', () => {
      const id = generateId({ type: 'uuid' });
      expect(id).toMatch(ID_PATTERNS.uuid);
    });

    it('should generate different UUIDs', () => {
      const id1 = generateId({ type: 'uuid' });
      const id2 = generateId({ type: 'uuid' });
      expect(id1).not.toBe(id2);
    });
  });

  describe('UUID v7', () => {
    it('should generate valid UUID v7', () => {
      const id = generateId({ type: 'uuidv7' });
      expect(id).toMatch(ID_PATTERNS.uuidv7);
    });

    it('should be time-ordered', () => {
      const id1 = generateId({ type: 'uuidv7' });
      const id2 = generateId({ type: 'uuidv7' });
      expect(id2 > id1).toBe(true);
    });
  });

  describe('ULID', () => {
    it('should generate valid ULID', () => {
      const id = generateId({ type: 'ulid' });
      expect(id).toMatch(ID_PATTERNS.ulid);
      expect(id).toHaveLength(26);
    });
  });

  describe('NanoID', () => {
    it('should generate valid NanoID with default length', () => {
      const id = generateId({ type: 'nanoid' });
      expect(id).toMatch(ID_PATTERNS.nanoid);
      expect(id).toHaveLength(21); // default nanoid length
    });

    it('should generate NanoID with custom length', () => {
      const id = generateId({ type: 'nanoid', count: 12 });
      expect(id).toHaveLength(12);
    });
  });

  describe('CUID2', () => {
    it('should generate valid CUID2', () => {
      const id = generateId({ type: 'cuid2' });
      expect(id).toMatch(ID_PATTERNS.cuid2);
    });

    it('should generate different CUID2s', () => {
      const id1 = generateId({ type: 'cuid2' });
      const id2 = generateId({ type: 'cuid2' });
      expect(id1).not.toBe(id2);
    });
  });

  describe('uppercase support', () => {
    it('should generate uppercase UUIDs', () => {
      const id = generateId({ type: 'uuid', uppercase: true });
      expect(id).toMatch(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/);
    });

    it('should generate uppercase custom IDs', () => {
      const id = generateId({ type: 'custom', count: 10, uppercase: true });
      expect(id).toMatch(/^[A-Z0-9]{10}$/);
    });
  });

  describe('prefix and suffix support', () => {
    it('should add prefix and suffix to UUID', () => {
      const id = generateId({ type: 'uuid', prefix: 'PRE-', suffix: '-SUF' });
      expect(id).toMatch(/^PRE-[0-9a-f-]{36}-SUF$/);
    });

    it('should add prefix and suffix to custom ID', () => {
      const id = generateId({ type: 'custom', count: 5, prefix: 'A-', suffix: '-Z' });
      expect(id).toMatch(/^A-[a-zA-Z0-9]{5}-Z$/);
    });

    it('should support uppercase with prefix and suffix', () => {
      const id = generateId({ type: 'uuid', prefix: 'PRE-', suffix: '-SUF', uppercase: true });
      expect(id).toMatch(/^PRE-[0-9A-F-]{36}-SUF$/);
    });
  });

  describe('Custom', () => {
    it('should generate custom ID with default length', () => {
      const id = generateId({ type: 'custom' });
      expect(id).toHaveLength(10);
    });

    it('should generate custom ID with specified length', () => {
      const id = generateId({ type: 'custom', count: 16 });
      expect(id).toHaveLength(16);
    });

    it('should support prefix', () => {
      const id = generateId({ type: 'custom', count: 10, prefix: 'user_' });
      expect(id).toMatch(/^user_[A-Za-z0-9]+$/);
      expect(id).toHaveLength(15); // prefix (5) + random (10)
    });

    it('should support suffix', () => {
      const id = generateId({ type: 'custom', count: 10, suffix: '_test' });
      expect(id).toMatch(/^[A-Za-z0-9]+_test$/);
      expect(id).toHaveLength(15); // random (10) + suffix (5)
    });

    it('should support prefix and suffix', () => {
      const id = generateId({
        type: 'custom',
        count: 8,
        prefix: 'id_',
        suffix: '_end',
      });
      expect(id).toMatch(/^id_[A-Za-z0-9]+_end$/);
      expect(id).toHaveLength(15); // prefix (3) + random (8) + suffix (4)
    });

    it('should avoid confusing characters by default', () => {
      const ids = Array.from({ length: 100 }, () => generateId({ type: 'custom', count: 20 }));
      const hasConfusing = ids.some((id) => /[O0I1Ll]/.test(id));
      expect(hasConfusing).toBe(false);
    });

    it('should include confusing characters when configured', () => {
      const id = generateId({
        type: 'custom',
        avoidConfusingChars: false,
        count: 100,
      });
      // With 100 characters, very likely to hit at least one confusing char
      expect(id).toHaveLength(100);
    });

    it('should only use alphanumeric characters', () => {
      const ids = Array.from({ length: 50 }, () => generateId({ type: 'custom', count: 20 }));
      ids.forEach((id) => {
        expect(id).toMatch(/^[A-Z0-9]+$/i);
      });
    });
  });
});

describe('ID_PATTERNS', () => {
  it('should match valid UUID v4', () => {
    expect('550e8400-e29b-41d4-a716-446655440000').toMatch(ID_PATTERNS.uuid);
  });

  it('should not match UUID v7 as UUID v4', () => {
    expect('018b2f19-e33e-7ccf-8704-9cd081394784').not.toMatch(ID_PATTERNS.uuid);
  });

  it('should match valid UUID v7', () => {
    expect('018b2f19-e33e-7ccf-8704-9cd081394784').toMatch(ID_PATTERNS.uuidv7);
  });

  it('should match valid ULID', () => {
    expect('01H7X7J7X7J7X7J7X7J7X7J7X7').toMatch(ID_PATTERNS.ulid);
    expect('01KGASQB6BS8BHGND1KPZX5WEA').toMatch(ID_PATTERNS.ulid);
  });

  it('should match valid NanoID', () => {
    expect('V1StGXR8_Z5jdHi6B-myT').toMatch(ID_PATTERNS.nanoid);
  });

  it('should match valid CUID2', () => {
    expect('tz4a98xxat96iws9zmbrgj3a').toMatch(ID_PATTERNS.cuid2);
  });

  it('should not match invalid UUID', () => {
    expect('not-a-uuid').not.toMatch(ID_PATTERNS.uuid);
    expect('123-456').not.toMatch(ID_PATTERNS.uuid);
  });

  it('should not match invalid ULID', () => {
    expect('too-short').not.toMatch(ID_PATTERNS.ulid);
    expect('01H7X7J7X7J7X7J7X7J7X7J7X7X').not.toMatch(ID_PATTERNS.ulid); // too long
  });
});
