import type { GlobalSlug, Payload } from 'payload';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { cachedFn } from '../cache/cache-wrapper.js';
import { createGlobalService } from './global-service.js';

vi.mock('../cache/cache-wrapper.js', () => ({
  cachedFn: vi.fn((fn) => fn()),
}));

describe('createGlobalService', () => {
  const mockPayload = {
    findGlobal: vi.fn(),
    updateGlobal: vi.fn(),
  } as unknown as Payload;

  const getPayload = vi.fn().mockResolvedValue(mockPayload);
  const global: GlobalSlug = 'settings';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Default Methods', () => {
    const service = createGlobalService({
      getPayload,
      global,
    });

    describe('findOne', () => {
      const testCases = [
        {
          name: 'happy path',
          expectedArgs: {
            slug: global,
            locale: 'en',
          },
          expectedResult: { theme: 'dark' },
          mockResponse: { theme: 'dark' },
          params: { locale: 'en' },
        },
        {
          name: 'no params',
          expectedArgs: {
            slug: global,
          },
          expectedResult: { theme: 'light' },
          mockResponse: { theme: 'light' },
          params: undefined,
        },
      ];

      it.each(testCases)(
        '$name',
        async ({ expectedArgs, expectedResult, mockResponse, params }) => {
          vi.mocked(mockPayload.findGlobal).mockResolvedValue(mockResponse);

          const result = await service.findOne(params);

          expect(result).toEqual(expectedResult);
          expect(mockPayload.findGlobal).toHaveBeenCalledWith(expectedArgs);
        }
      );

      it('should fail if getPayload fails', async () => {
        const error = new Error('Payload error');
        getPayload.mockRejectedValueOnce(error);

        await expect(service.findOne()).rejects.toThrow(error);
      });
    });

    describe('updateOne', () => {
      const testCases = [
        {
          name: 'happy path',
          expectedArgs: {
            slug: global,
            data: { theme: 'dark' },
          },
          expectedResult: { theme: 'dark' },
          mockResponse: { theme: 'dark' },
          params: { data: { theme: 'dark' } },
        },
      ];

      it.each(testCases)(
        '$name',
        async ({ expectedArgs, expectedResult, mockResponse, params }) => {
          vi.mocked(mockPayload.updateGlobal).mockResolvedValue(mockResponse);

          const result = await service.updateOne(params);

          expect(result).toEqual(expectedResult);
          expect(mockPayload.updateGlobal).toHaveBeenCalledWith(expectedArgs);
        }
      );

      it('should fail if getPayload fails', async () => {
        const error = new Error('Payload error');
        getPayload.mockRejectedValueOnce(error);

        await expect(
          service.updateOne({ data: { theme: 'dark' } } as Parameters<typeof service.updateOne>[0])
        ).rejects.toThrow(error);
      });

      it('should fail if payload.updateGlobal fails', async () => {
        const error = new Error('UpdateGlobal error');
        vi.mocked(mockPayload.updateGlobal).mockRejectedValueOnce(error);

        await expect(
          service.updateOne({ data: { theme: 'dark' } } as Parameters<typeof service.updateOne>[0])
        ).rejects.toThrow(error);
      });
    });
  });

  describe('Extensions', () => {
    it('should correctly extend the service', async () => {
      const extensionFn = vi.fn().mockReturnValue({
        customMethod: vi.fn().mockResolvedValue('custom'),
      });

      const service = createGlobalService({
        extensions: extensionFn,
        getPayload,
        global,
      });

      expect(extensionFn).toHaveBeenCalledWith({
        getPayload,
        global,
      });

      const result = await service.customMethod();
      expect(result).toBe('custom');
      expect(extensionFn.mock.results[0].value.customMethod).toHaveBeenCalled();
    });

    it('should provide default methods and extensions', () => {
      const service = createGlobalService({
        extensions: () => ({ customMethod: () => {} }),
        getPayload,
        global,
      });

      expect(service.findOne).toBeDefined();
      expect(service.updateOne).toBeDefined();
      expect((service as Record<string, unknown>).customMethod).toBeDefined();
    });
  });

  describe('Disable Default Methods', () => {
    it('should not expose disabled methods', () => {
      const service = createGlobalService({
        disable: ['findOne'],
        getPayload,
        global,
      });

      expect((service as Record<string, unknown>).findOne).toBeUndefined();
      expect(service.updateOne).toBeDefined();
    });
  });

  describe('Caching', () => {
    it('should use cachedFn when caching is enabled', async () => {
      const service = createGlobalService({
        cache: { findOne: { life: 'minutes' } },
        getPayload,
        global,
      });

      vi.mocked(mockPayload.findGlobal).mockResolvedValue(
        {} as Awaited<ReturnType<Payload['findGlobal']>>
      );

      await service.findOne();

      expect(cachedFn).toHaveBeenCalledWith(expect.any(Function), { life: 'minutes' });
    });

    it('should bypass cache when configured', async () => {
      const service = createGlobalService({
        cache: { findOne: true },
        getPayload,
        global,
      });

      vi.mocked(mockPayload.findGlobal).mockResolvedValue(
        {} as Awaited<ReturnType<Payload['findGlobal']>>
      );

      vi.clearAllMocks();
      await service.findOne({ cache: false });
      expect(cachedFn).not.toHaveBeenCalled();
    });
  });
});
