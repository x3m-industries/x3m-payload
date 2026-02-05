/**
 * Integration tests for collection services using real Payload.
 *
 * These tests run against a real SQLite in-memory database,
 * ensuring the service layer works correctly with Payload.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Payload } from 'payload';
import { getPayload } from 'payload';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createTestConfig } from '../test/test-config.js';
import { createCollectionService } from './collection-service.js';

describe('createCollectionService (Integration)', () => {
  let payload: Payload;

  beforeAll(async () => {
    const config = await createTestConfig();
    payload = await getPayload({ config });
  });

  afterAll(async () => {
    // Properly close database connection
    if (payload?.db?.destroy) {
      await payload.db.destroy();
    }
  });

  beforeEach(async () => {
    // Clean up todos between tests
    const existing = await payload.find({
      collection: 'todos',
      limit: 1000,
    });
    for (const doc of existing.docs) {
      await payload.delete({
        id: doc.id,
        collection: 'todos',
      });
    }
  });

  describe('CRUD Operations', () => {
    const todoService = () =>
      createCollectionService({
        collection: 'todos' as any,
        getPayload: () => Promise.resolve(payload),
      });

    it('should create a document', async () => {
      const service = todoService();

      const result = await service.createOne({
        data: { priority: 1, title: 'Test Todo' } as any,
      });

      expect(result.title).toBe('Test Todo');
      expect(result.priority).toBe(1);
      expect(result.id).toBeDefined();
    });

    it('should find all documents', async () => {
      const service = todoService();

      // Create test data
      await service.createOne({ data: { title: 'Todo 1' } as any });
      await service.createOne({ data: { title: 'Todo 2' } as any });

      const result = await service.findMany();

      expect(result.docs).toHaveLength(2);
      expect(result.totalDocs).toBe(2);
    });

    it('should find document by ID', async () => {
      const service = todoService();

      const created = await service.createOne({
        data: { title: 'Find Me' } as any,
      });

      const found = await service.findOneById({ id: created.id });

      expect(found.title).toBe('Find Me');
      expect(found.id).toBe(created.id);
    });

    it('should check if document exists by ID', async () => {
      const service = todoService();

      const created = await service.createOne({
        data: { title: 'Exists Test' } as any,
      });

      const exists = await service.existsById({ id: created.id });
      const notExists = await service.existsById({ id: 'nonexistent-id' });

      expect(exists).toBe(true);
      expect(notExists).toBe(false);
    });

    it('should update document by ID', async () => {
      const service = todoService();

      const created = await service.createOne({
        data: { completed: false, title: 'Original' } as any,
      });

      const updated = await service.updateOneById({
        id: created.id,
        data: { completed: true } as any,
      });

      expect(updated.completed).toBe(true);
      expect(updated.title).toBe('Original');
    });

    it('should delete document by ID', async () => {
      const service = todoService();

      const created = await service.createOne({
        data: { title: 'Delete Me' } as any,
      });

      const deleted = await service.deleteOneById({ id: created.id });

      expect(deleted.id).toBe(created.id);

      // Verify it's actually deleted
      const remaining = await service.findMany();
      expect(remaining.docs).toHaveLength(0);
    });

    it('should count documents', async () => {
      const service = todoService();

      await service.createOne({ data: { title: 'Count 1' } as any });
      await service.createOne({ data: { title: 'Count 2' } as any });
      await service.createOne({ data: { title: 'Count 3' } as any });

      const result = await service.countMany();

      expect(result.totalDocs).toBe(3);
    });

    it('should filter with where clause', async () => {
      const service = todoService();

      await service.createOne({ data: { priority: 10, title: 'High' } as any });
      await service.createOne({ data: { priority: 1, title: 'Low' } as any });
      await service.createOne({ data: { priority: 5, title: 'Medium' } as any });

      const highPriority = await service.findMany({
        where: { priority: { greater_than: 4 } } as any,
      });

      expect(highPriority.docs).toHaveLength(2);
    });
  });

  describe('Extensions', () => {
    it('should execute custom extension methods', async () => {
      const service = createCollectionService({
        collection: 'todos' as any,
        extensions: ({ collection, getPayload }) => ({
          async toggleCompleted({ id }: { id: string }) {
            const p = await getPayload();
            const todo = await p.findByID({ id, collection });
            return p.update({
              id,
              collection,
              data: { completed: !todo.completed },
            });
          },
        }),
        getPayload: () => Promise.resolve(payload),
      });

      const created = await service.createOne({
        data: { completed: false, title: 'Toggle Me' } as any,
      });

      expect(created.completed).toBe(false);

      const toggled = await service.toggleCompleted({ id: String(created.id) });

      expect(toggled.completed).toBe(true);
    });
  });

  describe('Disable Methods', () => {
    it('should omit disabled methods', () => {
      const service = createCollectionService({
        collection: 'todos' as any,
        disable: ['deleteOneById', 'createOne'],
        getPayload: () => Promise.resolve(payload),
      });

      expect(service.findMany).toBeTypeOf('function');
      expect(service.findOneById).toBeTypeOf('function');
      expect((service as any).deleteOneById).toBeUndefined();
      expect((service as any).createOne).toBeUndefined();
    });
  });
});
