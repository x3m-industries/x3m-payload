/**
 * Integration tests for the services plugin using real Payload.
 *
 * These tests run against a real SQLite in-memory database,
 * ensuring the plugin correctly attaches services to the Payload instance.
 *
 * NOTE: We use a single Payload instance for all tests to avoid conflicts
 * between multiple instances sharing SQLite in-memory state.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Payload } from 'payload';
import { buildConfig, getPayload } from 'payload';

import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { servicesPlugin } from './index.js';
// Import types to bring augmentation into scope (CollectionConfig.service, GlobalConfig.service)
import './types.js';

describe('servicesPlugin (Integration)', () => {
  let payload: Payload;

  beforeAll(async () => {
    // Using type assertion because module augmentation for 'service' property
    // is not recognized in test files - runtime behavior is correct
    const config = await buildConfig({
      admin: { autoLogin: false, user: 'users' },
      collections: [
        { slug: 'users', auth: true, fields: [] },
        // Collection with extensions
        {
          slug: 'tasks',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'completed', type: 'checkbox', defaultValue: false },
          ],
          service: {
            extensions: ({ collection, getPayload }: any) => ({
              async markComplete({ id }: { id: string }) {
                const p = await getPayload();
                return p.update({
                  id,
                  collection,
                  data: { completed: true },
                });
              },
            }),
          },
        },
        // Simple collection without service config
        {
          slug: 'products',
          fields: [{ name: 'name', type: 'text' }],
        },
      ],
      db: sqliteAdapter({
        client: { url: 'file::memory:?cache=shared' },
      }),
      globals: [
        // Global with extensions
        {
          slug: 'site-settings',
          fields: [
            { name: 'siteName', type: 'text', defaultValue: 'My App' },
            { name: 'maintenanceMode', type: 'checkbox', defaultValue: false },
          ],
          service: {
            extensions: ({ getPayload, global }: any) => ({
              async enableMaintenance() {
                const p = await getPayload();
                return p.updateGlobal({
                  slug: global,
                  data: { maintenanceMode: true },
                });
              },
            }),
          },
        },
        // Simple global without service config
        {
          slug: 'store-config',
          fields: [{ name: 'currency', type: 'text' }],
        },
      ],
      plugins: [servicesPlugin()],
      secret: 'test-secret-do-not-use-in-production',
      telemetry: false,
      typescript: { autoGenerate: false },
    } as any);

    payload = await getPayload({ config });
  });

  afterAll(async () => {
    if (payload?.db?.destroy) {
      await payload.db.destroy();
    }
  });

  beforeEach(async () => {
    // Clean up tasks between tests
    const existing = await payload.find({ collection: 'tasks', limit: 1000 });
    for (const doc of existing.docs) {
      await payload.delete({ id: doc.id, collection: 'tasks' });
    }
    // Reset globals
    await payload.updateGlobal({
      slug: 'site-settings',
      data: { maintenanceMode: false, siteName: 'My App' },
    });
  });

  describe('Service Attachment', () => {
    it('should attach services to payload instance', () => {
      expect((payload as any).services).toBeDefined();
    });

    it('should create services for collections', () => {
      expect((payload as any).services.tasks).toBeDefined();
      expect((payload as any).services.products).toBeDefined();
      expect((payload as any).services.users).toBeDefined();
    });

    it('should create services for globals', () => {
      expect((payload as any).services['site-settings']).toBeDefined();
      expect((payload as any).services['store-config']).toBeDefined();
    });
  });

  describe('Collection Services', () => {
    it('should provide default CRUD methods', async () => {
      const tasksService = (payload as any).services.tasks;

      const created = await tasksService.createOne({
        data: { title: 'Plugin Test' },
      });

      expect(created.title).toBe('Plugin Test');
      expect(created.id).toBeDefined();

      const found = await tasksService.findOneById({ id: created.id });
      expect(found.title).toBe('Plugin Test');
    });

    it('should provide extension methods on collections', async () => {
      const tasksService = (payload as any).services.tasks;

      const created = await tasksService.createOne({
        data: { completed: false, title: 'Complete Me' },
      });

      expect(created.completed).toBe(false);

      const completed = await tasksService.markComplete({ id: String(created.id) });
      expect(completed.completed).toBe(true);
    });

    it('should provide default methods on collections without service config', () => {
      const productsService = (payload as any).services.products;

      expect(productsService.createOne).toBeTypeOf('function');
      expect(productsService.findMany).toBeTypeOf('function');
      expect(productsService.findOneById).toBeTypeOf('function');
      expect(productsService.updateOneById).toBeTypeOf('function');
      expect(productsService.deleteOneById).toBeTypeOf('function');
    });
  });

  describe('Global Services', () => {
    it('should provide default global methods', async () => {
      const settingsService = (payload as any).services['site-settings'];

      const result = await settingsService.findOne();
      expect(result.siteName).toBe('My App');
    });

    it('should provide extension methods on globals', async () => {
      const settingsService = (payload as any).services['site-settings'];

      const initial = await settingsService.findOne();
      expect(initial.maintenanceMode).toBe(false);

      const updated = await settingsService.enableMaintenance();
      expect(updated.maintenanceMode).toBe(true);
    });

    it('should provide default methods on globals without service config', () => {
      const storeService = (payload as any).services['store-config'];

      expect(storeService.findOne).toBeTypeOf('function');
      expect(storeService.updateOne).toBeTypeOf('function');
    });
  });

  describe('Dual Access Pattern', () => {
    it('should support property access: payload.services.tasks', () => {
      expect((payload as any).services.tasks).toBeDefined();
    });

    it('should support function call: payload.services("tasks")', () => {
      const tasksService = (payload as any).services('tasks');
      expect(tasksService).toBeDefined();
      expect(tasksService.createOne).toBeTypeOf('function');
    });

    it('should return same service for both access patterns', () => {
      const propertyAccess = (payload as any).services.tasks;
      const functionCall = (payload as any).services('tasks');
      expect(propertyAccess).toBe(functionCall);
    });
  });
});
