
import type { Payload } from 'payload';
import { getPayload } from 'payload';
import { afterAll, beforeAll, describe, it } from 'vitest';
import { createTestConfig } from '../test/test-config.js';

describe('existsById Benchmark', () => {
  let payload: Payload;
  const idToFind = '1';

  beforeAll(async () => {
    const config = await createTestConfig();
    // Add a collection with a large text field to make findByID heavier
    config.collections.push({
      slug: 'heavy',
      fields: [
        { name: 'largeText', type: 'text' },
      ],
    });
    payload = await getPayload({ config });

    // Create a document with a large text field
    await payload.create({
      collection: 'heavy',
      data: {
        id: idToFind,
        largeText: 'a'.repeat(1024 * 1024), // 1MB of text
      },
    });
  });

  afterAll(async () => {
    if (payload?.db?.destroy) {
      await payload.db.destroy();
    }
  });

  it('benchmark findByID vs count', async () => {
    const iterations = 1000;

    console.log(`Running benchmark with ${iterations} iterations...`);

    // Warm up
    for (let i = 0; i < 100; i++) {
        await payload.findByID({ collection: 'heavy', id: idToFind });
        await payload.count({ collection: 'heavy', where: { id: { equals: idToFind } } });
    }

    const startFindByID = performance.now();
    for (let i = 0; i < iterations; i++) {
      await payload.findByID({
        id: idToFind,
        collection: 'heavy',
      });
    }
    const endFindByID = performance.now();
    const findByIDTime = endFindByID - startFindByID;

    const startCount = performance.now();
    for (let i = 0; i < iterations; i++) {
      await payload.count({
        collection: 'heavy',
        where: { id: { equals: idToFind } },
      });
    }
    const endCount = performance.now();
    const countTime = endCount - startCount;

    console.log(`findByID total time: ${findByIDTime.toFixed(2)}ms (avg: ${(findByIDTime / iterations).toFixed(4)}ms)`);
    console.log(`count total time: ${countTime.toFixed(2)}ms (avg: ${(countTime / iterations).toFixed(4)}ms)`);
    console.log(`Improvement: ${(((findByIDTime - countTime) / findByIDTime) * 100).toFixed(2)}%`);
  });
});
