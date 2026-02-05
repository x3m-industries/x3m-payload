# @x3m-industries/lib-services

[![npm version](https://img.shields.io/npm/v/@x3m-industries/lib-services.svg)](https://www.npmjs.com/package/@x3m-industries/lib-services)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Payload CMS](https://img.shields.io/badge/Payload%20CMS-3.x-purple.svg)](https://payloadcms.com/)

Type-safe service factory for interacting with Payload CMS collections and globals.

> **Need better fields?** Check out [@x3m-industries/lib-fields](../lib-fields/README.md) for production-ready phone, VAT, and ID fields.

## Features

- **Type-safe Wrappers**: Wraps Payload's Local API with strict typing for specific collections and globals.
- **Lazy Initialization**: Delays database connection until method calls, preventing cold-start issues.
- **Extensible**: Easily add custom methods (e.g., `findVerifiedUsers`) while keeping access to the typed `payload` instance.
- **Standardized CRUD**: Comes with typed default methods out of the box.
- **Disable Methods**: Create read-only services by disabling specific methods.
- **Plugin Mode**: Define services directly on collections and globals, access via `payload.services`.

## Installation

```bash
yarn add @x3m-industries/lib-services
```

## Usage

### Option 1: Plugin Mode (Recommended)

Define services directly on collections and globals and access them via `payload.services`:

#### 1. Add Plugin to Config

```typescript
// payload.config.ts
import { buildConfig } from 'payload';

import { servicesPlugin } from '@x3m-industries/lib-services';

export default buildConfig({
  plugins: [servicesPlugin()],
  collections: [Orders, Customers],
  globals: [Settings],
});
```

#### 2. Define Service on Collection

```typescript
// collections/Orders.ts
import type { CollectionConfig } from 'payload';

export const Orders: CollectionConfig = {
  slug: 'orders',
  fields: [
    /* ... */
  ],
  service: {
    extensions: ({ getPayload, collection }) => ({
      async markShipped({ id }: { id: string }) {
        const payload = await getPayload();
        return payload.update({
          collection,
          id,
          data: { status: 'shipped', shippedAt: new Date() },
        });
      },
    }),
    disable: ['deleteOneById'], // Optional: create read-only service
  },
};
```

#### 3. Define Service on Global

```typescript
// globals/Settings.ts
import type { GlobalConfig } from 'payload';

export const Settings: GlobalConfig = {
  slug: 'settings',
  fields: [
    /* ... */
  ],
  service: {
    extensions: ({ getPayload, global }) => ({
      async reset() {
        const payload = await getPayload();
        return payload.updateGlobal({
          slug: global,
          data: { theme: 'light', notifications: true },
        });
      },
    }),
    disable: ['updateOne'], // Optional: create read-only service
  },
};
```

#### 4. Use Services

```typescript
import config from '@payload-config';

import { getPayloadWithServices } from '@x3m-industries/lib-services';

const payload = await getPayloadWithServices(config);

// Collection services
await payload.services.orders.findMany();
await payload.services.orders.markShipped({ id: '123' });

// Global services
const settings = await payload.services.settings.findOne();
await payload.services.settings.reset();

// Function call (useful for dynamic slugs)
const slug = 'orders';
await payload.services(slug).findOneById({ id: '123' });
```

### Option 2: Standalone Services

Create services independently without the plugin:

```typescript
import { createCollectionService } from '@x3m-industries/lib-services';

import { getPayload } from '../utils/get-payload';

export const todoService = createCollectionService({
  collection: 'todos',
  getPayload,
  extensions: (context) => ({
    async findCompleted() {
      const payload = await context.getPayload();
      return payload.find({
        collection: context.collection,
        where: { completed: { equals: true } },
      });
    },
  }),
});

// Usage
await todoService.findMany();
await todoService.findCompleted();
```

### Standalone Global Service

For Payload globals (site settings, configuration, etc.):

```typescript
import { createGlobalService } from '@x3m-industries/lib-services';

export const settingsService = createGlobalService({
  global: 'settings',
  getPayload,
  extensions: (context) => ({
    async reset() {
      const payload = await context.getPayload();
      return payload.updateGlobal({
        slug: context.global,
        data: { theme: 'light' },
      });
    },
  }),
});

// Usage
const settings = await settingsService.findOne();
await settingsService.updateOne({ data: { theme: 'dark' } });
```

## Caching

Services support Next.js `"use cache"` directive for read methods. **Requires** `cacheComponents: true` in `next.config.mjs`.

### Enable Caching (Plugin Mode)

```typescript
// collections/Orders.ts
export const Orders: CollectionConfig = {
  slug: 'orders',
  fields: [
    /* ... */
  ],
  service: {
    cache: true, // Cache all read methods
  },
};
```

### Granular Control

Configure caching per method with lifecycle and tags:

```typescript
service: {
  cache: {
    findMany: { life: 'hours', tags: ['orders', 'list'] },
    findOneById: { life: 'days', tags: ['orders'] },
    countMany: true, // Default cache settings
  },
},
```

**Cacheable methods:**

- Collections: `findMany`, `findOneById`, `countMany`, `existsById`
- Globals: `findOne`

### Bypass Cache Per-Request

```typescript
// Skip cache for this specific call
await payload.services.orders.findMany({ cache: false });
```

### Invalidate Cache

Use Next.js `revalidateTag` to bust cached data:

```typescript
import { revalidateTag } from 'next/cache';

// After updating an order
await payload.services.orders.updateOneById({ id, data });
revalidateTag('orders'); // Invalidates all 'orders' tagged cache
```

### Standalone Services

```typescript
import { createCollectionService } from '@x3m-industries/lib-services';

export const orderService = createCollectionService({
  collection: 'orders',
  getPayload,
  cache: { findMany: { life: 'minutes', tags: ['orders'] } },
});
```

## API Reference

### `servicesPlugin()`

Payload plugin that attaches collection and global services to the payload instance.

- Scans all collections and globals for `service` config
- Creates services with default methods + extensions
- Attaches to `payload.services` in `onInit`

### `getPayloadWithServices<TServices>(config)`

Type-safe wrapper around `getPayload()` that includes the `.services` property.

```typescript
const payload = await getPayloadWithServices<AppServices>(config);
```

### `createCollectionService(props)`

Creates a typed service instance for collections.

| Property     | Type                     | Description                                 |
| ------------ | ------------------------ | ------------------------------------------- |
| `collection` | `CollectionSlug`         | The slug of the collection                  |
| `getPayload` | `() => Promise<Payload>` | A function returning the Payload instance   |
| `extensions` | `(ctx) => Methods`       | (Optional) Extend with custom methods       |
| `disable`    | `MethodName[]`           | (Optional) Methods to omit from the service |
| `cache`      | `boolean \| CacheConfig` | (Optional) Enable caching for read methods  |

#### Default Collection Methods

| Method          | Returns                  | Description                      |
| --------------- | ------------------------ | -------------------------------- |
| `createOne`     | `Promise<Document>`      | Create a document                |
| `countMany`     | `Promise<{totalDocs}>`   | Count documents matching a query |
| `findMany`      | `Promise<PaginatedDocs>` | Find documents with pagination   |
| `findOneById`   | `Promise<Document>`      | Find a document by ID            |
| `existsById`    | `Promise<boolean>`       | Check if a document exists by ID |
| `updateOneById` | `Promise<Document>`      | Update a document by ID          |
| `deleteOneById` | `Promise<Document>`      | Delete a document by ID          |

### `createGlobalService(props)`

Creates a typed service instance for globals.

| Property     | Type                     | Description                                 |
| ------------ | ------------------------ | ------------------------------------------- |
| `global`     | `GlobalSlug`             | The slug of the global                      |
| `getPayload` | `() => Promise<Payload>` | A function returning the Payload instance   |
| `extensions` | `(ctx) => Methods`       | (Optional) Extend with custom methods       |
| `disable`    | `MethodName[]`           | (Optional) Methods to omit from the service |
| `cache`      | `boolean \| CacheConfig` | (Optional) Enable caching for read methods  |

#### Default Global Methods

| Method      | Returns             | Description       |
| ----------- | ------------------- | ----------------- |
| `findOne`   | `Promise<Document>` | Get the global    |
| `updateOne` | `Promise<Document>` | Update the global |

## Type Safety

For full type safety with the plugin, define an `AppServices` type:

```typescript
import type { DefaultCollectionService, DefaultGlobalService } from '@x3m-industries/lib-services';

type AppServices = {
  // Collections
  orders: DefaultCollectionService<'orders'> & {
    markShipped: (params: { id: string }) => Promise<Order>;
  };
  customers: DefaultCollectionService<'customers'>;
  // Globals
  settings: DefaultGlobalService<'settings'> & {
    reset: () => Promise<Settings>;
  };
};

const payload = await getPayloadWithServices<AppServices>(config);
// payload.services.orders.markShipped is fully typed!
// payload.services.settings.reset is fully typed!
```

## License

MIT
