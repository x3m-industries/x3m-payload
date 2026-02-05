import type { cacheLife } from 'next/cache';

/**
 * Cacheable read methods for collection services.
 */
export type CacheableCollectionMethod = 'countMany' | 'existsById' | 'findMany' | 'findOneById';

/**
 * Cacheable read methods for global services.
 */
export type CacheableGlobalMethod = 'findOne';

/**
 * Cache options for a single method.
 */
export type CacheMethodOptions = {
  /** Cache lifetime profile or custom configuration */
  life?: Parameters<typeof cacheLife>[0] | string;
  /** Cache tags for invalidation */
  tags?: string[];
};

/**
 * Cache configuration.
 * - `true`: Cache all cacheable methods with defaults
 * - `{ method: true }`: Cache specific method with defaults
 * - `{ method: { life, tags } }`: Cache specific method with options
 */
export type CacheConfig<TMethod extends string> =
  | boolean
  | Partial<Record<TMethod, boolean | CacheMethodOptions>>;

/**
 * Resolves cache options for a specific method from the config.
 */
export function getCacheOptions<TMethod extends string>(
  config: CacheConfig<TMethod> | undefined,
  method: TMethod
): CacheMethodOptions | undefined {
  if (!config) {
    return undefined;
  }
  if (config === true) {
    return {};
  }
  const methodConfig = config[method];
  if (!methodConfig) {
    return undefined;
  }
  if (methodConfig === true) {
    return {};
  }
  return methodConfig;
}

/**
 * Checks if caching is enabled for a specific method.
 */
export function isCacheEnabled<TMethod extends string>(
  config: CacheConfig<TMethod> | undefined,
  method: TMethod
): boolean {
  if (!config) {
    return false;
  }
  if (config === true) {
    return true;
  }
  return !!config[method];
}
