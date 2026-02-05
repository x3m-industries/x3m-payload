/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig, Config, Payload } from 'payload';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { servicesPlugin } from './index.js';
import type { CollectionServiceConfig } from './types.js';

// Helper type for collection config with service
type CollectionConfigWithService = {
  service?: CollectionServiceConfig;
} & CollectionConfig;

describe('servicesPlugin', () => {
  const createMockPayload = () =>
    ({
      count: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      find: vi.fn(),
      findByID: vi.fn(),
      update: vi.fn(),
    }) as unknown as Payload;

  let mockPayload: Payload;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPayload = createMockPayload();
  });

  describe('Plugin Initialization', () => {
    it('should attach services to payload instance', async () => {
      const config = {
        collections: [
          { slug: 'orders', fields: [] } as CollectionConfig,
          { slug: 'customers', fields: [] } as CollectionConfig,
        ],
      } as unknown as Config;

      const pluginFn = servicesPlugin();
      const modifiedConfig = pluginFn(config);

      // Simulate Payload calling onInit
      await modifiedConfig.onInit?.(mockPayload);

      expect((mockPayload as any).services).toBeDefined();
    });

    it('should preserve existing onInit hooks', async () => {
      const existingOnInit = vi.fn();
      const config = {
        collections: [{ slug: 'orders', fields: [] } as CollectionConfig],
        onInit: existingOnInit,
      } as unknown as Config;

      const pluginFn = servicesPlugin();
      const modifiedConfig = pluginFn(config);

      await modifiedConfig.onInit?.(mockPayload);

      expect(existingOnInit).toHaveBeenCalledWith(mockPayload);
      expect((mockPayload as any).services).toBeDefined();
    });

    it('should create services for all collections', async () => {
      const config = {
        collections: [
          { slug: 'orders', fields: [] } as CollectionConfig,
          { slug: 'customers', fields: [] } as CollectionConfig,
          { slug: 'products', fields: [] } as CollectionConfig,
        ],
      } as unknown as Config;

      const pluginFn = servicesPlugin();
      const modifiedConfig = pluginFn(config);
      await modifiedConfig.onInit?.(mockPayload);

      const services = (mockPayload as any).services;
      expect(services.orders).toBeDefined();
      expect(services.customers).toBeDefined();
      expect(services.products).toBeDefined();
    });
  });

  describe('Default Methods', () => {
    it('should provide all default methods on services', async () => {
      const config = {
        collections: [{ slug: 'orders', fields: [] } as CollectionConfig],
      } as unknown as Config;

      const pluginFn = servicesPlugin();
      const modifiedConfig = pluginFn(config);
      await modifiedConfig.onInit?.(mockPayload);

      const ordersService = (mockPayload as any).services.orders;

      expect(ordersService.createOne).toBeTypeOf('function');
      expect(ordersService.countMany).toBeTypeOf('function');
      expect(ordersService.findMany).toBeTypeOf('function');
      expect(ordersService.findOneById).toBeTypeOf('function');
      expect(ordersService.existsById).toBeTypeOf('function');
      expect(ordersService.updateOneById).toBeTypeOf('function');
      expect(ordersService.deleteOneById).toBeTypeOf('function');
    });

    it('should call correct Payload API methods', async () => {
      const config = {
        collections: [{ slug: 'orders', fields: [] } as CollectionConfig],
      } as unknown as Config;

      const pluginFn = servicesPlugin();
      const modifiedConfig = pluginFn(config);
      await modifiedConfig.onInit?.(mockPayload);

      const ordersService = (mockPayload as any).services.orders;

      // Test findMany
      vi.mocked(mockPayload.find).mockResolvedValue({ docs: [], totalDocs: 0 } as any);
      await ordersService.findMany({ where: { status: { equals: 'pending' } } });
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'orders',
        where: { status: { equals: 'pending' } },
      });

      // Test countMany
      vi.mocked(mockPayload.count).mockResolvedValue({ totalDocs: 5 });
      await ordersService.countMany();
      expect(mockPayload.count).toHaveBeenCalledWith({ collection: 'orders' });

      // Test findOneById
      vi.mocked(mockPayload.findByID).mockResolvedValue({ id: '123' });
      await ordersService.findOneById({ id: '123' });
      expect(mockPayload.findByID).toHaveBeenCalledWith({ id: '123', collection: 'orders' });
    });
  });

  describe('Disable Feature', () => {
    it('should omit disabled methods from service', async () => {
      const collectionWithService: CollectionConfigWithService = {
        slug: 'audit-logs',
        fields: [],
        service: {
          disable: ['createOne', 'updateOneById', 'deleteOneById'],
        },
      };

      const config = {
        collections: [collectionWithService as CollectionConfig],
      } as unknown as Config;

      const pluginFn = servicesPlugin();
      const modifiedConfig = pluginFn(config);
      await modifiedConfig.onInit?.(mockPayload);

      const auditService = (mockPayload as any).services['audit-logs'];

      expect(auditService.createOne).toBeUndefined();
      expect(auditService.updateOneById).toBeUndefined();
      expect(auditService.deleteOneById).toBeUndefined();

      // Read methods should still work
      expect(auditService.findMany).toBeTypeOf('function');
      expect(auditService.findOneById).toBeTypeOf('function');
      expect(auditService.countMany).toBeTypeOf('function');
      expect(auditService.existsById).toBeTypeOf('function');
    });
  });

  describe('Extensions', () => {
    it('should include extension methods on service', async () => {
      const toggleFinished = vi.fn().mockResolvedValue({ id: '123', finished: true });

      const collectionWithService: CollectionConfigWithService = {
        slug: 'orders',
        fields: [],
        service: {
          extensions: () => ({
            toggleFinished,
          }),
        },
      };

      const config = {
        collections: [collectionWithService as CollectionConfig],
      } as unknown as Config;

      const pluginFn = servicesPlugin();
      const modifiedConfig = pluginFn(config);
      await modifiedConfig.onInit?.(mockPayload);

      const ordersService = (mockPayload as any).services.orders;

      expect(ordersService.toggleFinished).toBe(toggleFinished);
    });

    it('should provide correct context to extensions', async () => {
      let receivedContext: any;

      const collectionWithService: CollectionConfigWithService = {
        slug: 'orders',
        fields: [],
        service: {
          extensions: (context) => {
            receivedContext = context;
            return {};
          },
        },
      };

      const config = {
        collections: [collectionWithService as CollectionConfig],
      } as unknown as Config;

      const pluginFn = servicesPlugin();
      const modifiedConfig = pluginFn(config);
      await modifiedConfig.onInit?.(mockPayload);

      expect(receivedContext.collection).toBe('orders');
      expect(receivedContext.getPayload).toBeTypeOf('function');

      // getPayload should return the payload instance
      const result = await receivedContext.getPayload();
      expect(result).toBe(mockPayload);
    });

    it('should allow extensions to override default methods', async () => {
      const customFindMany = vi.fn().mockResolvedValue({ docs: [{ custom: true }] });

      const collectionWithService: CollectionConfigWithService = {
        slug: 'orders',
        fields: [],
        service: {
          extensions: () => ({
            findMany: customFindMany,
          }),
        },
      };

      const config = {
        collections: [collectionWithService as CollectionConfig],
      } as unknown as Config;

      const pluginFn = servicesPlugin();
      const modifiedConfig = pluginFn(config);
      await modifiedConfig.onInit?.(mockPayload);

      const ordersService = (mockPayload as any).services.orders;
      await ordersService.findMany();

      expect(customFindMany).toHaveBeenCalled();
      expect(mockPayload.find).not.toHaveBeenCalled();
    });
  });

  describe('Dual Access Pattern', () => {
    it('should support property access: payload.services.orders', async () => {
      const config = {
        collections: [{ slug: 'orders', fields: [] } as CollectionConfig],
      } as unknown as Config;

      const pluginFn = servicesPlugin();
      const modifiedConfig = pluginFn(config);
      await modifiedConfig.onInit?.(mockPayload);

      const services = (mockPayload as any).services;
      expect(services.orders).toBeDefined();
      expect(services.orders.findMany).toBeTypeOf('function');
    });

    it('should support function call: payload.services("orders")', async () => {
      const config = {
        collections: [{ slug: 'orders', fields: [] } as CollectionConfig],
      } as unknown as Config;

      const pluginFn = servicesPlugin();
      const modifiedConfig = pluginFn(config);
      await modifiedConfig.onInit?.(mockPayload);

      const services = (mockPayload as any).services;
      const ordersService = services('orders');

      expect(ordersService).toBeDefined();
      expect(ordersService.findMany).toBeTypeOf('function');
    });

    it('should return same service instance for both access patterns', async () => {
      const config = {
        collections: [{ slug: 'orders', fields: [] } as CollectionConfig],
      } as unknown as Config;

      const pluginFn = servicesPlugin();
      const modifiedConfig = pluginFn(config);
      await modifiedConfig.onInit?.(mockPayload);

      const services = (mockPayload as any).services;

      expect(services.orders).toBe(services('orders'));
    });

    it('should return undefined for invalid slug', async () => {
      const config = {
        collections: [{ slug: 'orders', fields: [] } as CollectionConfig],
      } as unknown as Config;

      const pluginFn = servicesPlugin();
      const modifiedConfig = pluginFn(config);
      await modifiedConfig.onInit?.(mockPayload);

      const services = (mockPayload as any).services;

      expect(services.nonexistent).toBeUndefined();
      expect(services('nonexistent')).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should propagate errors from Payload API calls', async () => {
      const config = {
        collections: [{ slug: 'orders', fields: [] } as CollectionConfig],
      } as unknown as Config;

      const pluginFn = servicesPlugin();
      const modifiedConfig = pluginFn(config);
      await modifiedConfig.onInit?.(mockPayload);

      const ordersService = (mockPayload as any).services.orders;

      const error = new Error('Database connection failed');
      vi.mocked(mockPayload.find).mockRejectedValue(error);

      await expect(ordersService.findMany()).rejects.toThrow('Database connection failed');
    });

    it('should propagate errors from extension methods', async () => {
      const collectionWithService: CollectionConfigWithService = {
        slug: 'orders',
        fields: [],
        service: {
          extensions: () => ({
            failingMethod() {
              return Promise.reject(new Error('Extension error'));
            },
          }),
        },
      };

      const config = {
        collections: [collectionWithService as CollectionConfig],
      } as unknown as Config;

      const pluginFn = servicesPlugin();
      const modifiedConfig = pluginFn(config);
      await modifiedConfig.onInit?.(mockPayload);

      const ordersService = (mockPayload as any).services.orders;

      await expect(ordersService.failingMethod()).rejects.toThrow('Extension error');
    });
  });

  // ==========================================================================
  // Global Services Tests
  // ==========================================================================

  describe('Global Services', () => {
    const createMockPayloadWithGlobals = () =>
      ({
        count: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        find: vi.fn(),
        findByID: vi.fn(),
        findGlobal: vi.fn(),
        update: vi.fn(),
        updateGlobal: vi.fn(),
      }) as unknown as Payload;

    it('should create services for globals', async () => {
      const globalMockPayload = createMockPayloadWithGlobals();

      const config = {
        collections: [],
        globals: [
          { slug: 'settings', fields: [] },
          { slug: 'navigation', fields: [] },
        ],
      } as unknown as Config;

      const pluginFn = servicesPlugin();
      const modifiedConfig = pluginFn(config);
      await modifiedConfig.onInit?.(globalMockPayload);

      const services = (globalMockPayload as any).services;
      expect(services.settings).toBeDefined();
      expect(services.navigation).toBeDefined();
    });

    it('should provide default methods on global services', async () => {
      const globalMockPayload = createMockPayloadWithGlobals();

      const config = {
        collections: [],
        globals: [{ slug: 'settings', fields: [] }],
      } as unknown as Config;

      const pluginFn = servicesPlugin();
      const modifiedConfig = pluginFn(config);
      await modifiedConfig.onInit?.(globalMockPayload);

      const settingsService = (globalMockPayload as any).services.settings;

      expect(settingsService.findOne).toBeTypeOf('function');
      expect(settingsService.updateOne).toBeTypeOf('function');
    });

    it('should call correct Payload API methods for globals', async () => {
      const globalMockPayload = createMockPayloadWithGlobals();

      const config = {
        collections: [],
        globals: [{ slug: 'settings', fields: [] }],
      } as unknown as Config;

      const pluginFn = servicesPlugin();
      const modifiedConfig = pluginFn(config);
      await modifiedConfig.onInit?.(globalMockPayload);

      const settingsService = (globalMockPayload as any).services.settings;

      // Test findOne
      vi.mocked(globalMockPayload.findGlobal).mockResolvedValue({ theme: 'dark' });
      await settingsService.findOne();
      expect(globalMockPayload.findGlobal).toHaveBeenCalledWith({ slug: 'settings' });

      // Test updateOne
      vi.mocked(globalMockPayload.updateGlobal).mockResolvedValue({ theme: 'light' });
      await settingsService.updateOne({ data: { theme: 'light' } });
      expect(globalMockPayload.updateGlobal).toHaveBeenCalledWith({
        slug: 'settings',
        data: { theme: 'light' },
      });
    });

    it('should support extensions on global services', async () => {
      const globalMockPayload = createMockPayloadWithGlobals();

      const resetSettings = vi.fn().mockResolvedValue({ theme: 'default' });

      const config = {
        collections: [],
        globals: [
          {
            slug: 'settings',
            fields: [],
            service: {
              extensions: () => ({
                resetSettings,
              }),
            },
          },
        ],
      } as unknown as Config;

      const pluginFn = servicesPlugin();
      const modifiedConfig = pluginFn(config);
      await modifiedConfig.onInit?.(globalMockPayload);

      const settingsService = (globalMockPayload as any).services.settings;

      expect(settingsService.resetSettings).toBe(resetSettings);
      expect(settingsService.findOne).toBeTypeOf('function');
    });

    it('should support disable on global services', async () => {
      const globalMockPayload = createMockPayloadWithGlobals();

      const config = {
        collections: [],
        globals: [
          {
            slug: 'settings',
            fields: [],
            service: {
              disable: ['updateOne'],
            },
          },
        ],
      } as unknown as Config;

      const pluginFn = servicesPlugin();
      const modifiedConfig = pluginFn(config);
      await modifiedConfig.onInit?.(globalMockPayload);

      const settingsService = (globalMockPayload as any).services.settings;

      expect(settingsService.updateOne).toBeUndefined();
      expect(settingsService.findOne).toBeTypeOf('function');
    });

    it('should combine collections and globals in services map', async () => {
      const globalMockPayload = createMockPayloadWithGlobals();

      const config = {
        collections: [{ slug: 'orders', fields: [] } as CollectionConfig],
        globals: [{ slug: 'settings', fields: [] }],
      } as unknown as Config;

      const pluginFn = servicesPlugin();
      const modifiedConfig = pluginFn(config);
      await modifiedConfig.onInit?.(globalMockPayload);

      const services = (globalMockPayload as any).services;

      // Collection service
      expect(services.orders).toBeDefined();
      expect(services.orders.findMany).toBeTypeOf('function');

      // Global service
      expect(services.settings).toBeDefined();
      expect(services.settings.findOne).toBeTypeOf('function');

      // Both accessible via function call
      expect(services('orders')).toBe(services.orders);
      expect(services('settings')).toBe(services.settings);
    });
  });
});
