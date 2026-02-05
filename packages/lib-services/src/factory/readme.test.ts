/* eslint-disable @typescript-eslint/unbound-method */
import type { Payload } from 'payload';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createCollectionService } from './collection-service.js';

describe('README Examples', () => {
  const mockPayload = {
    count: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    find: vi.fn(),
    findByID: vi.fn(),
    update: vi.fn(),
  } as unknown as Payload;

  const getPayload = vi.fn().mockResolvedValue(mockPayload);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('CustomerService: should find customers by billing address', async () => {
    const customerService = createCollectionService({
      collection: 'customers',
      getPayload,
    });

    const mockResult = {
      docs: [{ id: '1', name: 'US Customer' }],
      hasNextPage: false,
      hasPrevPage: false,
      limit: 10,
      nextPage: null,
      page: 1,
      pagingCounter: 1,
      prevPage: null,
      totalDocs: 1,
      totalPages: 1,
    };

    vi.mocked(mockPayload.find).mockResolvedValue(mockResult);

    const result = await customerService.findMany({
      where: {
        'billingAddress.country': { equals: 'US' },
      },
    });

    expect(result).toEqual(mockResult);
    expect(mockPayload.find).toHaveBeenCalledWith({
      collection: 'customers',
      where: {
        'billingAddress.country': { equals: 'US' },
      },
    });
  });

  it('TodoService: should toggle finished status via custom extension', async () => {
    const todoService = createCollectionService({
      collection: 'todos',
      extensions: ({ collection, getPayload }) => ({
        async toggleFinished({ id }: { id: string }) {
          const payload = await getPayload();

          // 1. Get the current todo
          const todo = await payload.findByID({
            id,
            collection,
          });

          if (!todo) {
            throw new Error(`Todo with ID ${id} not found`);
          }

          // 2. Toggle the finished status
          return payload.update({
            id,
            collection,
            data: {
              finished: !todo.finished,
            },
          });
        },
      }),
      getPayload,
    });

    // Mock finding the todo (currently unfinished)
    vi.mocked(mockPayload.findByID).mockResolvedValue({ id: '123', finished: false });
    // Mock updating the todo
    vi.mocked(mockPayload.update).mockResolvedValue({ id: '123', finished: true });

    const result = await todoService.toggleFinished({ id: '123' });

    expect(result).toEqual({ id: '123', finished: true });
    expect(mockPayload.findByID).toHaveBeenCalledWith({ id: '123', collection: 'todos' });
    expect(mockPayload.update).toHaveBeenCalledWith({
      id: '123',
      collection: 'todos',
      data: { finished: true },
    });
  });

  it('UserService: should override deleteOneById with soft delete logic', async () => {
    const userService = createCollectionService({
      collection: 'users',
      extensions: ({ collection, getPayload }) => ({
        // Override the default deleteOneById method
        async deleteOneById({ id }: { id: string }) {
          const payload = await getPayload();

          // Perform a soft delete instead
          return payload.update({
            id,
            collection,
            data: {
              deletedAt: new Date(),
            },
          });
        },
      }),
      getPayload,
    });

    const mockDate = new Date('2024-01-01T00:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    vi.mocked(mockPayload.update).mockResolvedValue({ id: 'user-1', deletedAt: mockDate });

    await userService.deleteOneById({ id: 'user-1' });

    expect(mockPayload.update).toHaveBeenCalledWith({
      id: 'user-1',
      collection: 'users',
      data: {
        deletedAt: mockDate,
      },
    });
    // Important: Ensure the original payload.delete was NOT called
    expect(mockPayload.delete).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('ReadOnlyService: should disable creation and modification methods', () => {
    const readOnlyService = createCollectionService({
      collection: 'audit-logs',
      getPayload,
      // Disable modification methods
      disable: ['createOne', 'updateOneById', 'deleteOneById'],
    });

    expect(readOnlyService).not.toHaveProperty('createOne');
    expect(readOnlyService).not.toHaveProperty('updateOneById');
    expect(readOnlyService).not.toHaveProperty('deleteOneById');
    expect(readOnlyService.findMany).toBeDefined();
    expect(readOnlyService.findOneById).toBeDefined();
  });

  it('CountService: should count documents with countMany', async () => {
    const orderService = createCollectionService({
      collection: 'orders',
      getPayload,
    });

    vi.mocked(mockPayload.count).mockResolvedValue({ totalDocs: 42 });

    const result = await orderService.countMany({
      where: { status: { equals: 'pending' } },
    });

    expect(result).toEqual({ totalDocs: 42 });
    expect(mockPayload.count).toHaveBeenCalledWith({
      collection: 'orders',
      where: { status: { equals: 'pending' } },
    });
  });

  it('ExistsService: should check if document exists with existsById', async () => {
    const productService = createCollectionService({
      collection: 'products',
      getPayload,
    });

    // Test when document exists
    vi.mocked(mockPayload.findByID).mockResolvedValue({ id: 'product-1' });
    const exists = await productService.existsById({ id: 'product-1' });
    expect(exists).toBe(true);

    // Test when document does not exist
    vi.mocked(mockPayload.findByID).mockRejectedValue(new Error('Not found'));
    const notExists = await productService.existsById({ id: 'nonexistent' });
    expect(notExists).toBe(false);
  });
});
