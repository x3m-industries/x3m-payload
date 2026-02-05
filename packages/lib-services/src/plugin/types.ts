import type { CollectionSlug, GlobalSlug, Payload } from 'payload';

import type {
  CacheConfig,
  CacheableCollectionMethod,
  CacheableGlobalMethod,
} from '../cache/cache-types.js';
import type { DefaultCollectionService } from '../factory/collection-service.js';
import type { DefaultGlobalService } from '../factory/global-service.js';

// =============================================================================
// Collection Extension Types
// =============================================================================

export type ExtensionContext<TSlug extends CollectionSlug> = {
  collection: TSlug;
  getPayload: () => Promise<Payload>;
};

export type ExtensionFunction<TSlug extends CollectionSlug, TExtensions = object> = (
  context: ExtensionContext<TSlug>
) => TExtensions;

// =============================================================================
// Global Extension Types
// =============================================================================

export type GlobalExtensionContext<TSlug extends GlobalSlug> = {
  getPayload: () => Promise<Payload>;
  global: TSlug;
};

export type GlobalExtensionFunction<
  TSlug extends GlobalSlug,
  TExtensions = Record<string, unknown>,
> = (context: GlobalExtensionContext<TSlug>) => TExtensions;

// =============================================================================
// Collection Service Config
// =============================================================================

/** Default collection method names that can be disabled */
export type DisableableMethod = keyof DefaultCollectionService<CollectionSlug>;

export interface CollectionServiceConfig<
  TSlug extends CollectionSlug = CollectionSlug,
  TExtensions = object,
> {
  /**
   * Enable caching for read methods.
   * - `true`: Cache all read methods (findMany, findOneById, countMany, existsById)
   * - `{ methodName: true }`: Cache specific methods with defaults
   * - `{ methodName: { life, tags } }`: Cache specific methods with custom options
   */
  cache?: CacheConfig<CacheableCollectionMethod>;
  /** Optional list of default methods to disable/omit from the returned service */
  disable?: DisableableMethod[];
  /** Optional function to extend the service with custom methods */
  extensions?: ExtensionFunction<TSlug, TExtensions>;
}

// =============================================================================
// Global Service Config
// =============================================================================

/** Default global method names that can be disabled */
export type DisableableGlobalMethod = keyof DefaultGlobalService<GlobalSlug>;

export interface GlobalServiceConfig<
  TSlug extends GlobalSlug = GlobalSlug,
  TExtensions = Record<string, unknown>,
> {
  /**
   * Enable caching for read methods.
   * - `true`: Cache findOne method
   * - `{ findOne: true }`: Cache with defaults
   * - `{ findOne: { life, tags } }`: Cache with custom options
   */
  cache?: CacheConfig<CacheableGlobalMethod>;
  /** Optional list of default methods to disable/omit from the returned service */
  disable?: DisableableGlobalMethod[];
  /** Optional function to extend the service with custom methods */
  extensions?: GlobalExtensionFunction<TSlug, TExtensions>;
}

// =============================================================================
// Module Augmentation for Payload Config
// =============================================================================

declare module 'payload' {
  /** Augment CollectionConfig to accept `service` property */
  interface CollectionConfigExtension {
    service?: boolean | CollectionServiceConfig;
  }

  /** Augment GlobalConfig to accept `service` property */
  interface GlobalConfigExtension {
    service?: boolean | GlobalServiceConfig;
  }
}

// =============================================================================
// Services Map Types
// =============================================================================

/** Map of collection services by slug */
export type CollectionServicesMap = {
  [K in CollectionSlug]: DefaultCollectionService<K>;
};

/** Map of global services by slug */
export type GlobalServicesMap = {
  [K in GlobalSlug]: DefaultGlobalService<K>;
};

/** Combined services map (collections + globals) */
export type ServicesMap = CollectionServicesMap & GlobalServicesMap;

// =============================================================================
// Payload with Services
// =============================================================================

/** Callable services type (supports both property access and function call) */
export type ServicesProxy<TServices extends Record<string, object> = ServicesMap> = {
  <K extends keyof TServices>(slug: K): TServices[K];
} & TServices;

/** Payload instance with services attached */
export type PayloadWithServices<TServices extends Record<string, object> = ServicesMap> = {
  services: ServicesProxy<TServices>;
} & Payload;
