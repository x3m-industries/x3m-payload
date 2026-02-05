// Import after mocking
import { cacheLife, cacheTag } from 'next/cache';

import { type Mock, describe, expect, it, vi } from 'vitest';

import { cachedFn } from './cache-wrapper.js';

// Mock next/cache before importing the module
vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

describe('cache-wrapper', () => {
  describe('cachedFn', () => {
    it('should execute the provided function and return its result', async () => {
      const mockFn = vi.fn().mockResolvedValue({ data: 'test' });

      const result = await cachedFn(mockFn);

      expect(result).toEqual({ data: 'test' });
      expect(mockFn).toHaveBeenCalledOnce();
    });

    it('should call cacheLife when life option is provided', async () => {
      const mockFn = vi.fn().mockResolvedValue('result');

      await cachedFn(mockFn, { life: 'seconds' });

      expect(cacheLife).toHaveBeenCalledWith('seconds');
    });

    it('should call cacheTag when tags are provided', async () => {
      const mockFn = vi.fn().mockResolvedValue('result');

      await cachedFn(mockFn, { tags: ['tag1', 'tag2'] });

      expect(cacheTag).toHaveBeenCalledWith('tag1', 'tag2');
    });

    it('should call both cacheLife and cacheTag when both are provided', async () => {
      const mockFn = vi.fn().mockResolvedValue('result');

      await cachedFn(mockFn, { life: 'hours', tags: ['todos'] });

      expect(cacheLife).toHaveBeenCalledWith('hours');
      expect(cacheTag).toHaveBeenCalledWith('todos');
    });

    it('should not call cacheLife or cacheTag when no config is provided', async () => {
      // Reset mocks
      (cacheLife as Mock).mockClear();
      (cacheTag as Mock).mockClear();

      const mockFn = vi.fn().mockResolvedValue('result');

      await cachedFn(mockFn);

      expect(cacheLife).not.toHaveBeenCalled();
      expect(cacheTag).not.toHaveBeenCalled();
    });

    it('should not call cacheTag when tags array is empty', async () => {
      (cacheTag as Mock).mockClear();

      const mockFn = vi.fn().mockResolvedValue('result');

      await cachedFn(mockFn, { tags: [] });

      expect(cacheTag).not.toHaveBeenCalled();
    });
  });
});
