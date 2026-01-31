import type { CollectionSlug, DataFromCollectionSlug, PaginatedDocs, Payload } from 'payload';

// Default method props

/**
 * Parameters for creating a single document.
 * Enforces `data` to match the specific collection's schema.
 */
type CreateOneParams<TSlug extends CollectionSlug> = {
  data: DataFromCollectionSlug<TSlug>;
} & Omit<Parameters<Payload['create']>[0], 'collection' | 'data'>;

/**
 * Parameters for finding multiple documents.
 * Standard Payload `find` options.
 */
type FindManyParams = Omit<Parameters<Payload['find']>[0], 'collection'>;

/**
 * Parameters for finding a single document by ID.
 * Standard Payload `findByID` options.
 */
type FindOneByIDParams = Omit<Parameters<Payload['findByID']>[0], 'collection'>;

/**
 * Default methods provided by the collection service.
 * These methods are strictly typed to the collection slug.
 */
export type DefaultCollectionService<TSlug extends CollectionSlug> = {
  createOne: (params: CreateOneParams<TSlug>) => Promise<DataFromCollectionSlug<TSlug>>;
  findMany: (params: FindManyParams) => Promise<PaginatedDocs<DataFromCollectionSlug<TSlug>>>;
  findOneByID: (params: FindOneByIDParams) => Promise<DataFromCollectionSlug<TSlug>>;
};

// Extensions

type ExtensionContext<TSlug extends CollectionSlug> = {
  collection: TSlug;
  getPayload: () => Promise<Payload>;
};

type ExtensionFunction<TSlug extends CollectionSlug, TExtensions = Record<string, unknown>> = (
  context: ExtensionContext<TSlug>
) => TExtensions;

// Service

/**
 * Props for creating a collection service.
 */
export interface CollectionServiceProps<
  TSlug extends CollectionSlug,
  TExtensions = Record<string, unknown>,
> {
  /** The slug of the collection this service manages */
  collection: TSlug;
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
  TExtensions extends Record<string, unknown> = Record<string, unknown>,
>(
  props: CollectionServiceProps<TSlug, TExtensions>
): DefaultCollectionService<TSlug> & TExtensions {
  const defaultMethods: DefaultCollectionService<TSlug> = {
    createOne: async ({ data, ...rest }: CreateOneParams<TSlug>) => {
      const payload = await props.getPayload();
      const result = await payload.create({
        collection: props.collection,
        data,
        ...rest,
      });

      return result;
    },
    findMany: async (params: FindManyParams) => {
      const payload = await props.getPayload();
      const result = await payload.find({
        collection: props.collection,
        ...params,
      });

      return result;
    },
    findOneByID: async (params: FindOneByIDParams) => {
      const payload = await props.getPayload();
      const result = await payload.findByID({
        collection: props.collection,
        ...params,
      });

      return result;
    },
  };

  if (!props.extensions) {
    return defaultMethods as DefaultCollectionService<TSlug> & TExtensions;
  }

  // Extensions

  const extensionContext: ExtensionContext<TSlug> = {
    collection: props.collection,
    getPayload: props.getPayload,
  };

  return {
    ...defaultMethods,
    ...props.extensions(extensionContext),
  };
}
