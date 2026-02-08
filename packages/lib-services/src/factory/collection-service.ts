import type { CollectionSlug, DataFromCollectionSlug, PaginatedDocs, Payload } from 'payload';

import {
  type CacheConfig,
  type CacheableCollectionMethod,
  getCacheOptions,
  isCacheEnabled,
} from '../cache/cache-types.js';
import { cachedFn } from '../cache/cache-wrapper.js';

// =============================================================================
// Default Method Parameters
// =============================================================================

/**
 * Parameters for creating a single document.
 * Enforces `data` to match the specific collection's schema.
 */
type CreateOneParams<TSlug extends CollectionSlug> = {
  data: Partial<DataFromCollectionSlug<TSlug>>;
} & Omit<Parameters<Payload['create']>[0], 'collection' | 'data'>;

/**
 * Parameters for counting documents.
 * Standard Payload `count` options with optional cache bypass.
 */
type CountManyParams = { cache?: boolean } & Omit<Parameters<Payload['count']>[0], 'collection'>;

/**
 * Parameters for finding multiple documents.
 * Standard Payload `find` options with optional cache bypass.
 */
type FindManyParams = { cache?: boolean } & Omit<Parameters<Payload['find']>[0], 'collection'>;

/**
 * Parameters for finding a single document by ID.
 * Standard Payload `findByID` options with optional cache bypass.
 */
type FindOneByIdParams = { cache?: boolean } & Omit<
  Parameters<Payload['findByID']>[0],
  'collection'
>;

/**
 * Parameters for checking if a document exists by ID.
 */
type ExistsByIdParams = {
  cache?: boolean;
  id: number | string;
};

/**
 * Parameters for updating a single document.
 * Enforces `data` to match the specific collection's schema.
 */
type UpdateOneByIdParams<TSlug extends CollectionSlug> = {
  data: Partial<DataFromCollectionSlug<TSlug>>;
  id: number | string;
} & Omit<Parameters<Payload['update']>[0], 'collection' | 'data' | 'id' | 'where'>;

/**
 * Parameters for deleting a single document.
 */
type DeleteOneByIdParams = {
  id: number | string;
} & Omit<Parameters<Payload['delete']>[0], 'collection' | 'id' | 'where'>;

// =============================================================================
// Default Service Type
// =============================================================================

/**
 * Default methods provided by the collection service.
 * These methods are strictly typed to the collection slug.
 */
export type DefaultCollectionService<TSlug extends CollectionSlug> = {
  countMany: (params?: CountManyParams) => Promise<{ totalDocs: number }>;
  createOne: (params: CreateOneParams<TSlug>) => Promise<DataFromCollectionSlug<TSlug>>;
  deleteOneById: (params: DeleteOneByIdParams) => Promise<DataFromCollectionSlug<TSlug>>;
  existsById: (params: ExistsByIdParams) => Promise<boolean>;
  findMany: (params?: FindManyParams) => Promise<PaginatedDocs<DataFromCollectionSlug<TSlug>>>;
  findOneById: (params: FindOneByIdParams) => Promise<DataFromCollectionSlug<TSlug>>;
  updateOneById: (params: UpdateOneByIdParams<TSlug>) => Promise<DataFromCollectionSlug<TSlug>>;
};

// =============================================================================
// Extensions
// =============================================================================

type ExtensionContext<TSlug extends CollectionSlug> = {
  collection: TSlug;
  getPayload: () => Promise<Payload>;
};

type ExtensionFunction<TSlug extends CollectionSlug, TExtensions = object> = (
  context: ExtensionContext<TSlug>
) => TExtensions;

// =============================================================================
// Service Props & Factory
// =============================================================================

/**
 * Props for creating a collection service.
 */
export interface CollectionServiceProps<
  TSlug extends CollectionSlug,
  TExtensions = object,
  TOmit extends keyof DefaultCollectionService<TSlug> = never,
> {
  /** Enable caching for read methods (findMany, findOneById, countMany, existsById) */
  cache?: CacheConfig<CacheableCollectionMethod>;
  /** The slug of the collection this service manages */
  collection: TSlug;
  /** Optional list of default methods to disable/omit from the returned service */
  disable?: TOmit[];
  /** Optional function to extend the service with custom methods */
  extensions?: ExtensionFunction<TSlug, TExtensions>;
  /** A function that returns the Payload instance (for lazy loading) */
  getPayload: () => Promise<Payload>;
}

/**
 * Creates a type-safe service for interacting with a specific Payload collection.
 *
 * @param props Configuration properties for the service.
 * @returns A service object with default CRUD methods and any extensions.
 *
 * @example
 * const todoService = createCollectionService({
 *   collection: 'todos',
 *   getPayload,
 *   cache: { findMany: { life: 'seconds', tags: ['todos'] } },
 *   extensions: (ctx) => ({
 *     findDone: () => ctx.getPayload().then(p => p.find({
 *       collection: ctx.collection,
 *       where: { completed: { equals: true } }
 *     }))
 *   })
 * });
 */
export function createCollectionService<
  TSlug extends CollectionSlug,
  TExtensions extends object = object,
  TOmit extends keyof DefaultCollectionService<TSlug> = never,
>(
  props: CollectionServiceProps<TSlug, TExtensions, TOmit>
): Omit<DefaultCollectionService<TSlug>, TOmit> & TExtensions {
  // Cache helper
  const wrapWithCache = <T>(
    method: CacheableCollectionMethod,
    fn: () => Promise<T>,
    bypassCache?: boolean
  ): Promise<T> => {
    if (bypassCache === false || !isCacheEnabled(props.cache, method)) {
      return fn();
    }
    const cacheOptions = getCacheOptions(props.cache, method);
    return cachedFn(fn, cacheOptions);
  };

  const defaultMethods: DefaultCollectionService<TSlug> = {
    countMany: async (params?: CountManyParams) => {
      const { cache: bypassCache, ...rest } = params ?? {};
      const fn = async () => {
        const payload = await props.getPayload();
        return payload.count({
          collection: props.collection,
          ...rest,
        });
      };
      return wrapWithCache('countMany', fn, bypassCache);
    },

    createOne: async ({ data, ...rest }: CreateOneParams<TSlug>) => {
      const payload = await props.getPayload();
      return payload.create({
        collection: props.collection,
        data,
        ...rest,
      });
    },

    deleteOneById: async ({ id, ...rest }: DeleteOneByIdParams) => {
      const payload = await props.getPayload();
      return payload.delete({
        id,
        collection: props.collection,
        ...rest,
      });
    },

    existsById: async ({ id, cache: bypassCache }: ExistsByIdParams) => {
      const fn = async () => {
        const payload = await props.getPayload();
        const { totalDocs } = await payload.count({
          collection: props.collection,
          where: {
            id: {
              equals: id,
            },
          },
        });
        return totalDocs > 0;
      };
      return wrapWithCache('existsById', fn, bypassCache);
    },

    findMany: async (params?: FindManyParams) => {
      const { cache: bypassCache, ...rest } = params ?? {};
      const fn = async () => {
        const payload = await props.getPayload();
        return payload.find({
          collection: props.collection,
          ...rest,
        });
      };
      return wrapWithCache('findMany', fn, bypassCache);
    },

    findOneById: async (params: FindOneByIdParams) => {
      const { cache: bypassCache, ...rest } = params;
      const fn = async () => {
        const payload = await props.getPayload();
        return payload.findByID({
          collection: props.collection,
          ...rest,
        });
      };
      return wrapWithCache('findOneById', fn, bypassCache);
    },

    updateOneById: async ({ id, data, ...rest }: UpdateOneByIdParams<TSlug>) => {
      const payload = await props.getPayload();
      return payload.update({
        id,
        collection: props.collection,
        data,
        ...rest,
      });
    },
  };

  const methods: Partial<DefaultCollectionService<TSlug>> = { ...defaultMethods };

  if (props.disable) {
    props.disable.forEach((key) => {
      delete methods[key];
    });
  }

  if (!props.extensions) {
    return methods as Omit<DefaultCollectionService<TSlug>, TOmit> & TExtensions;
  }

  // Extensions
  const extensionContext: ExtensionContext<TSlug> = {
    collection: props.collection,
    getPayload: props.getPayload,
  };

  return {
    ...methods,
    ...props.extensions(extensionContext),
  } as Omit<DefaultCollectionService<TSlug>, TOmit> & TExtensions;
}
