import type {
  CollectionSlug,
  GlobalSlug,
  Payload,
  CollectionConfig as PayloadCollectionConfig,
  GlobalConfig as PayloadGlobalConfig,
} from 'payload';

import type {
  CacheConfig,
  CacheableCollectionMethod,
  CacheableGlobalMethod,
} from '../cache/cache-types.js';
import type { DefaultCollectionService } from '../factory/collection-service.js';
import type { DefaultGlobalService } from '../factory/global-service.js';

export type { DefaultCollectionService, DefaultGlobalService };

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
  extensions?(context: ExtensionContext<TSlug>): TExtensions;
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
  extensions?(context: GlobalExtensionContext<TSlug>): TExtensions;
}

// =============================================================================
// Module Augmentation for Payload Config
// =============================================================================

declare module 'payload' {
  /** Augment CollectionConfig to accept `service` property */
  export interface CollectionConfigExtension {
    service?: boolean | CollectionServiceConfig;
  }

  /** Augment GlobalConfig to accept `service` property */
  export interface GlobalConfigExtension {
    service?: boolean | GlobalServiceConfig;
  }
}

/**
 * Interface for registering services.
 * Consumers should augment this interface to add their own services.
 *
 * @example
 * declare module '@x3m-industries/lib-services' {
 *   export interface ServiceRegistry {
 *     todos: TodosService;
 *   }
 * }
 */

export interface ServiceRegistry {}

/**
 * Extended CollectionConfig that supports the `service` property.
 * Use this instead of Payload's CollectionConfig when defining collections with services.
 */
export type CollectionConfig = {
  service?: boolean | CollectionServiceConfig;
} & PayloadCollectionConfig;

/**
 * Helper to infer the full service type for a collection.
 * Combines default methods with your extensions.
 *
 * @example
 * type TodosService = InferServiceType<'todos', typeof todosExtensions>;
 */
export type InferServiceType<
  TSlug extends CollectionSlug,
  TExtensionsFn extends ExtensionFunction<TSlug, any> | undefined = undefined,
> = DefaultCollectionService<TSlug> & (TExtensionsFn extends (...args: any) => infer R ? R : {});

/**
 * Helper to infer the service type directly from a CollectionConfig object.
 * Requires the config to be defined with `satisfies CollectionConfig` to preserve types.
 *
 * @example
 * const Todos = { slug: 'todos', ... } satisfies CollectionConfig;
 * type TodosService = InferServiceFromConfig<typeof Todos>;
 */
export type InferServiceFromConfig<T extends { service?: any; slug: CollectionSlug }> =
  InferServiceType<
    T['slug'],
    T['service'] extends { extensions: infer E }
      ? E extends ExtensionFunction<T['slug'], any>
        ? E
        : undefined
      : undefined
  >;

/**
 * Extended GlobalConfig that supports the `service` property.
 * Use this instead of Payload's GlobalConfig when defining globals with services.
 */
export type GlobalConfig = {
  service?: boolean | GlobalServiceConfig;
} & PayloadGlobalConfig;

/**
 * Helper to infer the full service type for a global.
 * Combines default methods with your extensions.
 *
 * @example
 * type SettingsService = InferGlobalServiceType<'settings', typeof settingsExtensions>;
 */
export type InferGlobalServiceType<
  TSlug extends GlobalSlug,
  TExtensionsFn extends GlobalExtensionFunction<TSlug, any> | undefined = undefined,
> = DefaultGlobalService<TSlug> & (TExtensionsFn extends (...args: any) => infer R ? R : {});

/**
 * Helper to infer the service type directly from a GlobalConfig object.
 * Requires the config to be defined with `satisfies GlobalConfig` to preserve types.
 *
 * @example
 * const Settings = { slug: 'settings', ... } satisfies GlobalConfig;
 * type SettingsService = InferGlobalServiceFromConfig<typeof Settings>;
 */
export type InferGlobalServiceFromConfig<T extends { service?: any; slug: GlobalSlug }> =
  InferGlobalServiceType<
    T['slug'],
    T['service'] extends { extensions: infer E }
      ? E extends GlobalExtensionFunction<T['slug'], any>
        ? E
        : undefined
      : undefined
  >;

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
export type ServicesMap = keyof ServiceRegistry extends never
  ? CollectionServicesMap & GlobalServicesMap
  : ServiceRegistry;

// =============================================================================
// Payload with Services
// =============================================================================

/** Callable services type (supports both property access and function call) */
export type ServicesProxy<TServices extends object = ServicesMap> = {
  <K extends keyof TServices>(slug: K): TServices[K];
} & TServices;

/** Payload instance with services attached */
export type PayloadWithServices<TServices extends object = ServicesMap> = {
  services: ServicesProxy<TServices>;
} & Payload;
