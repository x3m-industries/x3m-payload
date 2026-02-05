export type {
  CacheableCollectionMethod,
  CacheableGlobalMethod,
  CacheConfig as CacheConfigType,
  CacheMethodOptions,
} from './cache-types.js';
export { getCacheOptions, isCacheEnabled } from './cache-types.js';

export type { CacheConfig } from './cache-wrapper.js';
export { cachedFn } from './cache-wrapper.js';
