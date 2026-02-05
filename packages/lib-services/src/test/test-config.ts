/**
 * Minimal Payload config for integration testing.
 * Uses SQLite in-memory database for fast, isolated tests.
 */
import type { CollectionConfig, GlobalConfig } from 'payload';
import { buildConfig } from 'payload';

import { sqliteAdapter } from '@payloadcms/db-sqlite';

/**
 * Test collection for CRUD operations
 */
const Todos: CollectionConfig = {
  slug: 'todos',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'completed', type: 'checkbox', defaultValue: false },
    { name: 'priority', type: 'number' },
  ],
};

/**
 * Test global for global service operations
 */
const Settings: GlobalConfig = {
  slug: 'settings',
  fields: [
    { name: 'theme', type: 'text', defaultValue: 'light' },
    { name: 'notifications', type: 'checkbox', defaultValue: true },
  ],
};

/**
 * Create a test Payload config with SQLite in-memory database.
 * Each test run gets a fresh, isolated database.
 */
export function createTestConfig() {
  return buildConfig({
    // Minimal admin config
    admin: { autoLogin: false, user: 'users' },
    // Disable secret requirement for tests
    secret: 'test-secret-do-not-use-in-production',
    // SQLite in-memory database - no file cleanup needed!
    collections: [
      {
        slug: 'users',
        auth: true,
        fields: [],
      },
      Todos,
    ],
    db: sqliteAdapter({
      client: {
        url: 'file::memory:?cache=shared',
      },
    }),
    globals: [Settings],
    // Disable telemetry in tests
    telemetry: false,
    // Disable TypeScript generation in tests
    typescript: { autoGenerate: false },
  });
}
