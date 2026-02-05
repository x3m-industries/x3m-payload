import type { Config, Payload } from 'payload';

import { createCollectionService } from '../factory/collection-service.js';
import { createGlobalService } from '../factory/global-service.js';
import { createServicesProxy } from './services-proxy.js';
import type { CollectionServiceConfig, GlobalServiceConfig, ServicesMap } from './types.js';

/**
 * Payload plugin that attaches collection and global services to the payload instance.
 *
 * Services are defined on each collection/global via the `service` property:
 * ```typescript
 * export const Orders: CollectionConfig = {
 *   slug: 'orders',
 *   fields: [...],
 *   service: {
 *     extensions: ({ getPayload, collection }) => ({
 *       async toggleFinished({ id }) { ... }
 *     }),
 *     disable: ['deleteOneById'],
 *   },
 * };
 *
 * export const Settings: GlobalConfig = {
 *   slug: 'settings',
 *   fields: [...],
 *   service: {
 *     extensions: ({ getPayload, global }) => ({
 *       async reset() { ... }
 *     }),
 *   },
 * };
 * ```
 *
 * Then access via:
 * ```typescript
 * await payload.services.orders.findMany();
 * await payload.services('orders').toggleFinished({ id: '123' });
 * await payload.services.settings.findOne();
 * ```
 */
export function servicesPlugin() {
  return (config: Config): Config => {
    const incomingOnInit = config.onInit;

    config.onInit = async (payload) => {
      // Execute any existing onInit functions first
      if (incomingOnInit) {
        await incomingOnInit(payload);
      }

      // Build services map from collections and globals
      const servicesMap = buildServicesMap(payload, config);

      // Create proxy that supports both property access and function calls
      const servicesProxy = createServicesProxy(servicesMap);

      // Attach to payload instance
      Object.defineProperty(payload, 'services', {
        configurable: false,
        value: servicesProxy,
        writable: false,
      });
    };

    return config;
  };
}

/**
 * Builds a map of services from collections and globals in the config.
 * Creates a service for each collection/global, with default methods and any extensions.
 */
function buildServicesMap(payload: Payload, config: Config): ServicesMap {
  const servicesMap: Record<string, object> = {};

  // Build collection services
  const collections = config.collections ?? [];
  for (const collectionConfig of collections) {
    const slug = collectionConfig.slug;
    const rawServiceConfig = (collectionConfig as { service?: boolean | CollectionServiceConfig })
      .service;
    const serviceConfig = typeof rawServiceConfig === 'object' ? rawServiceConfig : undefined;

    const service = createCollectionService({
      collection: slug,
      disable: serviceConfig?.disable,
      extensions: serviceConfig?.extensions,
      getPayload: () => Promise.resolve(payload),
    });

    servicesMap[slug] = service;
  }

  // Build global services
  const globals = config.globals ?? [];
  for (const globalConfig of globals) {
    const slug = globalConfig.slug;
    const rawServiceConfig = (globalConfig as { service?: boolean | GlobalServiceConfig }).service;
    const serviceConfig = typeof rawServiceConfig === 'object' ? rawServiceConfig : undefined;

    const service = createGlobalService({
      disable: serviceConfig?.disable,
      extensions: serviceConfig?.extensions,
      getPayload: () => Promise.resolve(payload),
      global: slug,
    });

    servicesMap[slug] = service;
  }

  return servicesMap as ServicesMap;
}

export { getPayloadWithServices } from './get-payload-with-services.js';
export { createServicesProxy } from './services-proxy.js';
// Re-export types
export type {
  CollectionServiceConfig,
  GlobalServiceConfig,
  PayloadWithServices,
  ServicesMap,
  ServicesProxy,
} from './types.js';
