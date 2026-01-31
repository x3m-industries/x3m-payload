import type { DataFromGlobalSlug, GlobalSlug, Payload } from 'payload';

// Default method props

/**
 * Parameters for finding a global.
 * Standard Payload `findGlobal` options.
 */
type FindOneParams = Omit<Parameters<Payload['findGlobal']>[0], 'slug'>;

/**
 * Parameters for updating a global.
 * Standard Payload `updateGlobal` options.
 */
type UpdateOneParams<TSlug extends GlobalSlug> = {
  data: DataFromGlobalSlug<TSlug>;
} & Omit<Parameters<Payload['updateGlobal']>[0], 'data' | 'slug'>;

/**
 * Default methods provided by the global service.
 * These methods are strictly typed to the global slug.
 */
export type DefaultGlobalService<TSlug extends GlobalSlug> = {
  findOne: (params?: FindOneParams) => Promise<DataFromGlobalSlug<TSlug>>;
  updateOne: (params: UpdateOneParams<TSlug>) => Promise<DataFromGlobalSlug<TSlug>>;
};

// Extensions

type ExtensionContext<TSlug extends GlobalSlug> = {
  getPayload: () => Promise<Payload>;
  global: TSlug;
};

type ExtensionFunction<TSlug extends GlobalSlug, TExtensions = Record<string, unknown>> = (
  context: ExtensionContext<TSlug>
) => TExtensions;

// Service

/**
 * Props for creating a global service.
 */
export interface GlobalServiceProps<
  TSlug extends GlobalSlug,
  TExtensions = Record<string, unknown>,
> {
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
  const defaultMethods: DefaultGlobalService<TSlug> = {
    findOne: async (params?: FindOneParams) => {
      const payload = await props.getPayload();
      const result = await payload.findGlobal({
        slug: props.global,
        ...params,
      });

      return result;
    },
    updateOne: async ({ data, ...rest }: UpdateOneParams<TSlug>) => {
      const payload = await props.getPayload();
      const result = await payload.updateGlobal({
        slug: props.global,
        data,
        ...rest,
      });

      return result;
    },
  };

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
  };
}
