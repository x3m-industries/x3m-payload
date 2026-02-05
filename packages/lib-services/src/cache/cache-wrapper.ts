import { cacheLife, cacheTag } from 'next/cache';

import type { CacheMethodOptions } from './cache-types.js';

/**
 * Cache configuration options.
 */
export type CacheConfig = CacheMethodOptions;

/**
 * Wraps a function with Next.js caching via the "use cache" directive.
 *
 * @param fn - The async function to cache
 * @param config - Optional cache configuration (life, tags)
 * @returns The cached result
 *
 * @example
 * const result = await cachedFn(
 *   () => payload.find({ collection: 'todos' }),
 *   { life: 'seconds', tags: ['todos'] }
 * );
 */
export async function cachedFn<T>(fn: () => Promise<T>, config?: CacheConfig): Promise<T> {
  'use cache';
  if (config?.life) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cacheLife(config.life as any);
  }
  if (config?.tags?.length) {
    cacheTag(...config.tags);
  }
  return fn();
}
