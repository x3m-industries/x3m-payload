import type { DataFromGlobalSlug, GlobalSlug, Payload } from 'payload';

import {
  type CacheConfig,
  type CacheableGlobalMethod,
  getCacheOptions,
  isCacheEnabled,
} from '../cache/cache-types.js';
import { cachedFn } from '../cache/cache-wrapper.js';

// =============================================================================
// Default Method Parameters
// =============================================================================

/**
 * Parameters for finding a global.
 * Standard Payload `findGlobal` options with optional cache bypass.
 */
type FindOneParams = { cache?: boolean } & Omit<Parameters<Payload['findGlobal']>[0], 'slug'>;

/**
 * Parameters for updating a global.
 * Standard Payload `updateGlobal` options.
 */
type UpdateOneParams<TSlug extends GlobalSlug> = {
  data: DataFromGlobalSlug<TSlug>;
} & Omit<Parameters<Payload['updateGlobal']>[0], 'data' | 'slug'>;

// =============================================================================
// Default Service Type
// =============================================================================

/**
 * Default methods provided by the global service.
 * These methods are strictly typed to the global slug.
 */
export type DefaultGlobalService<TSlug extends GlobalSlug> = {
  findOne: (params?: FindOneParams) => Promise<DataFromGlobalSlug<TSlug>>;
  updateOne: (params: UpdateOneParams<TSlug>) => Promise<DataFromGlobalSlug<TSlug>>;
};

// =============================================================================
// Extensions
// =============================================================================

type ExtensionContext<TSlug extends GlobalSlug> = {
  getPayload: () => Promise<Payload>;
  global: TSlug;
};

type ExtensionFunction<TSlug extends GlobalSlug, TExtensions = Record<string, unknown>> = (
  context: ExtensionContext<TSlug>
) => TExtensions;

// =============================================================================
// Service Props & Factory
// =============================================================================

/** Default method names that can be disabled */
export type DisableableGlobalMethod = keyof DefaultGlobalService<GlobalSlug>;

/**
 * Props for creating a global service.
 */
export interface GlobalServiceProps<
  TSlug extends GlobalSlug,
  TExtensions = Record<string, unknown>,
> {
  /** Enable caching for read methods (findOne) */
  cache?: CacheConfig<CacheableGlobalMethod>;
  /** Optional list of default methods to disable/omit from the returned service */
  disable?: DisableableGlobalMethod[];
  /** Optional function to extend the service with custom methods */
  extensions?: ExtensionFunction<TSlug, TExtensions>;
  /** A function that returns the Payload instance (for lazy loading) */
  getPayload: () => Promise<Payload>;
  /** The slug of the global this service manages */
  global: TSlug;
}

/**
 * Creates a type-safe service for interacting with a specific Payload global.
 *
 * @param props Configuration properties for the service.
 * @returns A service object with default CRUD methods and any extensions.
 *
 * @example
 * const settingsService = createGlobalService({
 *   global: 'settings',
 *   getPayload,
 *   cache: { findOne: { life: 'hours', tags: ['settings'] } },
 *   extensions: (ctx) => ({
 *     reset: () => ctx.getPayload().then(p => p.updateGlobal({
 *       slug: ctx.global,
 *       data: { theme: 'light' }
 *     }))
 *   })
 * });
 */
export function createGlobalService<
  TSlug extends GlobalSlug,
  TExtensions extends Record<string, unknown> = Record<string, unknown>,
>(props: GlobalServiceProps<TSlug, TExtensions>): DefaultGlobalService<TSlug> & TExtensions {
  const disabledMethods = new Set(props.disable ?? []);

  // Cache helper
  const wrapWithCache = <T>(
    method: CacheableGlobalMethod,
    fn: () => Promise<T>,
    bypassCache?: boolean
  ): Promise<T> => {
    if (bypassCache === false || !isCacheEnabled(props.cache, method)) {
      return fn();
    }
    const cacheOptions = getCacheOptions(props.cache, method);
    return cachedFn(fn, cacheOptions);
  };

  // Build default methods, excluding disabled ones
  const defaultMethods: Partial<DefaultGlobalService<TSlug>> = {};

  if (!disabledMethods.has('findOne')) {
    defaultMethods.findOne = async (params?: FindOneParams) => {
      const { cache: bypassCache, ...rest } = params ?? {};
      const fn = async () => {
        const payload = await props.getPayload();
        return payload.findGlobal({
          slug: props.global,
          ...rest,
        });
      };
      return wrapWithCache('findOne', fn, bypassCache);
    };
  }

  if (!disabledMethods.has('updateOne')) {
    defaultMethods.updateOne = async ({ data, ...rest }: UpdateOneParams<TSlug>) => {
      const payload = await props.getPayload();
      return payload.updateGlobal({
        slug: props.global,
        data,
        ...rest,
      });
    };
  }

  if (!props.extensions) {
    return defaultMethods as DefaultGlobalService<TSlug> & TExtensions;
  }

  // Extensions
  const extensionContext: ExtensionContext<TSlug> = {
    getPayload: props.getPayload,
    global: props.global,
  };

  return {
    ...defaultMethods,
    ...props.extensions(extensionContext),
  } as DefaultGlobalService<TSlug> & TExtensions;
}
