/**
 * Integration tests for global services using real Payload.
 *
 * These tests run against a real SQLite in-memory database,
 * ensuring the global service layer works correctly with Payload.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Payload } from 'payload';
import { getPayload } from 'payload';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createTestConfig } from '../test/test-config.js';
import { createGlobalService } from './global-service.js';

describe('createGlobalService (Integration)', () => {
  let payload: Payload;

  beforeAll(async () => {
    const config = await createTestConfig();
    payload = await getPayload({ config });
  });

  afterAll(async () => {
    if (payload?.db?.destroy) {
      await payload.db.destroy();
    }
  });

  beforeEach(async () => {
    // Reset settings to defaults between tests
    await payload.updateGlobal({
      slug: 'settings',
      data: { notifications: true, theme: 'light' },
    });
  });

  describe('Default Methods', () => {
    const settingsService = () =>
      createGlobalService({
        getPayload: () => Promise.resolve(payload),
        global: 'settings' as any,
      });

    it('should find global document', async () => {
      const service = settingsService();

      const result = await service.findOne();

      expect(result.theme).toBe('light');
      expect(result.notifications).toBe(true);
    });

    it('should update global document', async () => {
      const service = settingsService();

      const updated = await service.updateOne({
        data: { theme: 'dark' } as any,
      });

      expect(updated.theme).toBe('dark');
      expect(updated.notifications).toBe(true); // Should preserve other fields
    });

    it('should persist updates across calls', async () => {
      const service = settingsService();

      await service.updateOne({
        data: { notifications: false, theme: 'dark' } as any,
      });

      const found = await service.findOne();

      expect(found.theme).toBe('dark');
      expect(found.notifications).toBe(false);
    });
  });

  describe('Extensions', () => {
    it('should execute custom extension methods', async () => {
      const service = createGlobalService({
        extensions: ({ getPayload, global }) => ({
          async toggleNotifications() {
            const p = await getPayload();
            const current = await p.findGlobal({ slug: global });
            return p.updateGlobal({
              slug: global,
              data: { notifications: !current.notifications },
            });
          },
        }),
        getPayload: () => Promise.resolve(payload),
        global: 'settings' as any,
      });

      const initial = await service.findOne();
      expect(initial.notifications).toBe(true);

      const toggled = await service.toggleNotifications();
      expect(toggled.notifications).toBe(false);

      const toggledAgain = await service.toggleNotifications();
      expect(toggledAgain.notifications).toBe(true);
    });
  });

  describe('Disable Methods', () => {
    it('should omit disabled methods', () => {
      const service = createGlobalService({
        disable: ['updateOne'],
        getPayload: () => Promise.resolve(payload),
        global: 'settings' as any,
      });

      expect(service.findOne).toBeTypeOf('function');
      expect((service as any).updateOne).toBeUndefined();
    });
  });
});
