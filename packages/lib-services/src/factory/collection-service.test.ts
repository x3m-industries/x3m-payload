/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
import type { CollectionSlug, Payload } from 'payload';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { cachedFn } from '../cache/cache-wrapper.js';
import { createCollectionService } from './collection-service.js';

vi.mock('../cache/cache-wrapper.js', () => ({
  cachedFn: vi.fn((fn) => fn()),
}));

describe('createCollectionService', () => {
  const mockPayload = {
    count: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    find: vi.fn(),
    findByID: vi.fn(),
    update: vi.fn(),
  } as unknown as Payload;

  const getPayload = vi.fn().mockResolvedValue(mockPayload);
  const collection: CollectionSlug = 'users';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Default Methods', () => {
    const service = createCollectionService({
      collection,
      getPayload,
    });

    describe('createOne', () => {
      const testCases = [
        {
          name: 'happy path',
          expectedArgs: {
            collection,
            data: { email: 'test@example.com' },
          },
          expectedResult: { id: '1', email: 'test@example.com' },
          mockResponse: { id: '1', email: 'test@example.com' },
          params: { data: { email: 'test@example.com' } },
        },
        {
          name: 'with additional params',
          expectedArgs: {
            collection,
            data: { email: 'test@example.com' },
            locale: 'en',
          },
          expectedResult: { id: '1', email: 'test@example.com' },
          mockResponse: { id: '1', email: 'test@example.com' },
          params: { data: { email: 'test@example.com' }, locale: 'en' },
        },
      ];

      it.each(testCases)(
        '$name',
        async ({ expectedArgs, expectedResult, mockResponse, params }) => {
          vi.mocked(mockPayload.create).mockResolvedValue(mockResponse as never);

          const result = await service.createOne(params as never);

          expect(result).toEqual(expectedResult);
          expect(mockPayload.create).toHaveBeenCalledWith(expectedArgs);
        }
      );

      it('should fail if getPayload fails', async () => {
        const error = new Error('Payload error');
        getPayload.mockRejectedValueOnce(error);

        await expect(
          service.createOne({ data: {} } as Parameters<typeof service.createOne>[0])
        ).rejects.toThrow(error);
      });

      it('should fail if payload.create fails', async () => {
        const error = new Error('Create error');
        vi.mocked(mockPayload.create).mockRejectedValueOnce(error);

        await expect(
          service.createOne({ data: {} } as Parameters<typeof service.createOne>[0])
        ).rejects.toThrow(error);
      });
    });

    describe('countMany', () => {
      it('should count documents without params', async () => {
        vi.mocked(mockPayload.count).mockResolvedValue({ totalDocs: 5 });

        const result = await service.countMany();

        expect(result).toEqual({ totalDocs: 5 });
        expect(mockPayload.count).toHaveBeenCalledWith({ collection });
      });

      it('should count documents with where clause', async () => {
        vi.mocked(mockPayload.count).mockResolvedValue({ totalDocs: 2 });

        const result = await service.countMany({
          where: { email: { equals: 'test@example.com' } },
        });

        expect(result).toEqual({ totalDocs: 2 });
        expect(mockPayload.count).toHaveBeenCalledWith({
          collection,
          where: { email: { equals: 'test@example.com' } },
        });
      });

      it('should fail if getPayload fails', async () => {
        const error = new Error('Payload error');
        getPayload.mockRejectedValueOnce(error);

        await expect(service.countMany()).rejects.toThrow(error);
      });
    });

    describe('findMany', () => {
      const testCases = [
        {
          name: 'happy path',
          expectedArgs: {
            collection,
            where: { email: { equals: 'test@example.com' } },
          },
          expectedResult: {
            docs: [{ id: '1' }],
            hasNextPage: false,
            hasPrevPage: false,
            limit: 10,
            pagingCounter: 1,
            totalDocs: 1,
            totalPages: 1,
          },
          mockResponse: {
            docs: [{ id: '1' }],
            hasNextPage: false,
            hasPrevPage: false,
            limit: 10,
            pagingCounter: 1,
            totalDocs: 1,
            totalPages: 1,
          },
          params: { where: { email: { equals: 'test@example.com' } } },
        },
        {
          name: 'no params',
          expectedArgs: {
            collection,
          },
          expectedResult: {
            docs: [],
            hasNextPage: false,
            hasPrevPage: false,
            limit: 10,
            pagingCounter: 1,
            totalDocs: 0,
            totalPages: 1,
          },
          mockResponse: {
            docs: [],
            hasNextPage: false,
            hasPrevPage: false,
            limit: 10,
            pagingCounter: 1,
            totalDocs: 0,
            totalPages: 1,
          },
          params: {},
        },
      ];

      it.each(testCases)(
        '$name',
        async ({ expectedArgs, expectedResult, mockResponse, params }) => {
          vi.mocked(mockPayload.find).mockResolvedValue(mockResponse);

          const result = await service.findMany(params as never);

          expect(result).toEqual(expectedResult);
          expect(mockPayload.find).toHaveBeenCalledWith(expectedArgs);
        }
      );
    });

    describe('findOneById', () => {
      const testCases = [
        {
          name: 'happy path',
          expectedArgs: {
            id: '1',
            collection,
          },
          expectedResult: { id: '1' },
          mockResponse: { id: '1' },
          params: { id: '1' },
        },
      ];

      it.each(testCases)(
        '$name',
        async ({ expectedArgs, expectedResult, mockResponse, params }) => {
          vi.mocked(mockPayload.findByID).mockResolvedValue(mockResponse);

          const result = await service.findOneById(params as never);

          expect(result).toEqual(expectedResult);
          expect(mockPayload.findByID).toHaveBeenCalledWith(expectedArgs);
        }
      );

      it('should fail if getPayload fails', async () => {
        const error = new Error('Payload error');
        getPayload.mockRejectedValueOnce(error);

        await expect(service.findOneById({ id: '1' })).rejects.toThrow(error);
      });

      it('should fail if payload.findByID fails', async () => {
        const error = new Error('FindByID error');
        vi.mocked(mockPayload.findByID).mockRejectedValueOnce(error);

        await expect(service.findOneById({ id: '1' })).rejects.toThrow(error);
      });
    });

    describe('existsById', () => {
      it('should return true when document exists', async () => {
        vi.mocked(mockPayload.findByID).mockResolvedValue({ id: '1' });

        const result = await service.existsById({ id: '1' });

        expect(result).toBe(true);
        expect(mockPayload.findByID).toHaveBeenCalledWith({ id: '1', collection });
      });

      it('should return false when document does not exist', async () => {
        vi.mocked(mockPayload.findByID).mockRejectedValue(new Error('Not found'));

        const result = await service.existsById({ id: 'nonexistent' });

        expect(result).toBe(false);
      });

      it('should fail if getPayload fails', async () => {
        const error = new Error('Payload error');
        getPayload.mockRejectedValueOnce(error);

        await expect(service.existsById({ id: '1' })).rejects.toThrow(error);
      });
    });

    describe('updateOneById', () => {
      const testCases = [
        {
          name: 'happy path',
          expectedArgs: {
            id: '1',
            collection,
            data: { email: 'updated@example.com' },
          },
          expectedResult: { id: '1', email: 'updated@example.com' },
          mockResponse: { id: '1', email: 'updated@example.com' },
          params: { id: '1', data: { email: 'updated@example.com' } },
        },
      ];

      it.each(testCases)(
        '$name',
        async ({ expectedArgs, expectedResult, mockResponse, params }) => {
          vi.mocked(mockPayload.update).mockResolvedValue(mockResponse);

          const result = await service.updateOneById(params as never);

          expect(result).toEqual(expectedResult);
          expect(mockPayload.update).toHaveBeenCalledWith(expectedArgs);
        }
      );

      it('should fail if getPayload fails', async () => {
        const error = new Error('Payload error');
        getPayload.mockRejectedValueOnce(error);

        await expect(
          service.updateOneById({ id: '1', data: {} } as Parameters<
            typeof service.updateOneById
          >[0])
        ).rejects.toThrow(error);
      });

      it('should fail if payload.update fails', async () => {
        const error = new Error('Update error');
        vi.mocked(mockPayload.update).mockRejectedValueOnce(error);

        await expect(
          service.updateOneById({ id: '1', data: {} } as Parameters<
            typeof service.updateOneById
          >[0])
        ).rejects.toThrow(error);
      });
    });

    describe('deleteOneById', () => {
      const testCases = [
        {
          name: 'happy path',
          expectedArgs: {
            id: '1',
            collection,
          },
          expectedResult: { id: '1' },
          mockResponse: { id: '1' },
          params: { id: '1' },
        },
      ];

      it.each(testCases)(
        '$name',
        async ({ expectedArgs, expectedResult, mockResponse, params }) => {
          vi.mocked(mockPayload.delete).mockResolvedValue(mockResponse as never);

          const result = await service.deleteOneById(params as never);

          expect(result).toEqual(expectedResult);
          expect(mockPayload.delete).toHaveBeenCalledWith(expectedArgs);
        }
      );

      it('should fail if getPayload fails', async () => {
        const error = new Error('Payload error');
        getPayload.mockRejectedValueOnce(error);

        await expect(service.deleteOneById({ id: '1' })).rejects.toThrow(error);
      });

      it('should fail if payload.delete fails', async () => {
        const error = new Error('Delete error');
        vi.mocked(mockPayload.delete).mockRejectedValueOnce(error);

        await expect(service.deleteOneById({ id: '1' })).rejects.toThrow(error);
      });
    });
  });

  describe('Extensions', () => {
    it('should correctly extend the service', async () => {
      const extensionFn = vi.fn().mockReturnValue({
        customMethod: vi.fn().mockResolvedValue('custom'),
      });

      const service = createCollectionService({
        collection,
        extensions: extensionFn,
        getPayload,
      });

      expect(extensionFn).toHaveBeenCalledWith({
        collection,
        getPayload,
      });

      const result = await service.customMethod();
      expect(result).toBe('custom');
      expect(extensionFn.mock.results[0].value.customMethod).toHaveBeenCalled();
    });

    it('should provide default methods and extensions', () => {
      const service = createCollectionService({
        collection,
        extensions: () => ({ customMethod: () => {} }),
        getPayload,
      });

      expect(service.createOne).toBeDefined();
      expect(service.findMany).toBeDefined();
      expect(service.findOneById).toBeDefined();
      expect(service.existsById).toBeDefined();
      expect(service.countMany).toBeDefined();
      expect((service as Record<string, unknown>).customMethod).toBeDefined();
    });

    it('should allow extensions to override default methods', async () => {
      const customFindMany = vi.fn().mockResolvedValue({ custom: true, docs: [] });

      const service = createCollectionService({
        collection,
        extensions: () => ({
          findMany: customFindMany,
        }),
        getPayload,
      });

      const result = await service.findMany({});

      expect(result).toEqual({ custom: true, docs: [] });
      expect(customFindMany).toHaveBeenCalled();
      // Default payload.find should NOT be called since we overrode it
      expect(mockPayload.find).not.toHaveBeenCalled();
    });
  });

  describe('Disable Default Methods', () => {
    it('should not expose disabled methods', () => {
      const service = createCollectionService({
        collection,
        disable: ['createOne', 'deleteOneById'],
        getPayload,
      });

      expect((service as any).createOne).toBeUndefined();
      expect((service as any).deleteOneById).toBeUndefined();
      expect(service.findMany).toBeDefined();
      expect(service.findOneById).toBeDefined();
      expect(service.updateOneById).toBeDefined();
    });
  });

  describe('Caching', () => {
    it('should use cachedFn when caching is enabled', async () => {
      const service = createCollectionService({
        cache: { findMany: { life: 'seconds' } },
        collection,
        getPayload,
      });

      vi.mocked(mockPayload.find).mockResolvedValue({ docs: [] } as any);

      await service.findMany();

      expect(cachedFn).toHaveBeenCalledWith(expect.any(Function), { life: 'seconds' });
    });

    it('should bypass cache when configured', async () => {
      const service = createCollectionService({
        cache: { findMany: true },
        collection,
        getPayload,
      });

      vi.mocked(mockPayload.find).mockResolvedValue({ docs: [] } as any);

      await service.findMany({ cache: false });

      // Should call function directly, not via cachedFn
      // Since our mock implementation of cachedFn calls the function immediately,
      // we need to rely on checking if cachedFn was called 2nd time (it shouldn't be for this test)
      // A better way is to clear mocks before this test
      vi.clearAllMocks();
      await service.findMany({ cache: false });
      expect(cachedFn).not.toHaveBeenCalled();
    });
  });
});
