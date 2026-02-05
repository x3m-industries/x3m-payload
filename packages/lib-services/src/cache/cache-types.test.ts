import { describe, expect, it } from 'vitest';

import { type CacheConfig, getCacheOptions, isCacheEnabled } from '../cache/cache-types.js';

describe('cache-types', () => {
  describe('isCacheEnabled', () => {
    it('returns false when config is undefined', () => {
      expect(isCacheEnabled(undefined, 'findMany')).toBe(false);
    });

    it('returns true for all methods when config is true (easy mode)', () => {
      const config: CacheConfig<'countMany' | 'findMany' | 'findOneById'> = true;
      expect(isCacheEnabled(config, 'findMany')).toBe(true);
      expect(isCacheEnabled(config, 'findOneById')).toBe(true);
      expect(isCacheEnabled(config, 'countMany')).toBe(true);
    });

    it('returns true only for enabled methods (granular mode)', () => {
      const config: CacheConfig<'countMany' | 'findMany' | 'findOneById'> = {
        findMany: true,
        findOneById: { life: 'seconds', tags: ['test'] },
      };
      expect(isCacheEnabled(config, 'findMany')).toBe(true);
      expect(isCacheEnabled(config, 'findOneById')).toBe(true);
      expect(isCacheEnabled(config, 'countMany')).toBe(false);
    });

    it('returns false for disabled methods', () => {
      const config: CacheConfig<'findMany' | 'findOneById'> = {
        findMany: false,
      };
      expect(isCacheEnabled(config, 'findMany')).toBe(false);
      expect(isCacheEnabled(config, 'findOneById')).toBe(false);
    });
  });

  describe('getCacheOptions', () => {
    it('returns undefined when config is undefined', () => {
      expect(getCacheOptions(undefined, 'findMany')).toBeUndefined();
    });

    it('returns empty object when config is true (easy mode)', () => {
      const config: CacheConfig<'findMany'> = true;
      expect(getCacheOptions(config, 'findMany')).toEqual({});
    });

    it('returns empty object when method is true (boolean)', () => {
      const config: CacheConfig<'findMany'> = { findMany: true };
      expect(getCacheOptions(config, 'findMany')).toEqual({});
    });

    it('returns options when method has config object', () => {
      const config: CacheConfig<'findMany'> = {
        findMany: { life: 'seconds', tags: ['todos', 'list'] },
      };
      const options = getCacheOptions(config, 'findMany');
      expect(options).toEqual({ life: 'seconds', tags: ['todos', 'list'] });
    });

    it('returns undefined for unconfigured method', () => {
      const config: CacheConfig<'findMany' | 'findOneById'> = {
        findMany: true,
      };
      expect(getCacheOptions(config, 'findOneById')).toBeUndefined();
    });

    it('returns undefined when method is false', () => {
      const config: CacheConfig<'findMany'> = { findMany: false };
      expect(getCacheOptions(config, 'findMany')).toBeUndefined();
    });
  });
});
