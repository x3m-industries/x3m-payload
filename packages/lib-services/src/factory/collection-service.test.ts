import type { CollectionSlug, Payload } from 'payload';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createCollectionService } from './collection-service.js';

describe('createCollectionService', () => {
  const mockPayload = {
    create: vi.fn(),
    find: vi.fn(),
    findByID: vi.fn(),
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

    describe('findOneByID', () => {
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

          const result = await service.findOneByID(params as never);

          expect(result).toEqual(expectedResult);
          expect(mockPayload.findByID).toHaveBeenCalledWith(expectedArgs);
        }
      );
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
      expect(service.findOneByID).toBeDefined();
      expect((service as Record<string, unknown>).customMethod).toBeDefined();
    });
  });
});
