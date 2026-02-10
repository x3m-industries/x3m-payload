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

### 1. Add Plugin to Config

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

### 2. Define Service on Collection

Use `satisfies CollectionConfig` and export the config. Ensure strict typing for slugs using `as const` or similar.

```typescript
// collections/Orders.ts
import type { CollectionConfig } from '@x3m-industries/lib-services';

export const ordersExtensions = ({ getPayload, collection }) => ({
  async markShipped({ id }: { id: string }) {
    const payload = await getPayload();
    return payload.update({
      collection,
      id,
      data: { status: 'shipped', shippedAt: new Date() },
    });
  },
});

export const Orders = {
  slug: 'orders' as const,
  fields: [
    /* ... */
  ],
  service: {
    extensions: ordersExtensions,
    disable: ['deleteOneById'], // Optional: create read-only service
  },
} satisfies CollectionConfig;
```

### 3. Define Service on Global

```typescript
// globals/Settings.ts
import type { GlobalConfig } from '@x3m-industries/lib-services';

export const settingsExtensions = ({ getPayload, global }) => ({
  async reset() {
    const payload = await getPayload();
    return payload.updateGlobal({
      slug: global,
      data: { theme: 'light', notifications: true },
    });
  },
});

export const Settings = {
  slug: 'settings' as const,
  fields: [
    /* ... */
  ],
  service: {
    extensions: settingsExtensions,
  },
} satisfies GlobalConfig;
```

### 4. Create Central Services Definition

Create a `src/services.ts` file to aggregate your services and export a typed `getPayload` helper.

```typescript
// src/services.ts
import configPromise from '@payload-config';

import {
  InferGlobalServiceFromConfig,
  // Import for globals
  InferServiceFromConfig,
  getPayloadWithServices,
} from '@x3m-industries/lib-services';

import { Orders } from './collections/Orders';
import { Settings } from './globals/Settings';

export type AppServices = {
  // Collections
  [Orders.slug]: InferServiceFromConfig<typeof Orders>;
  // Globals
  [Settings.slug]: InferGlobalServiceFromConfig<typeof Settings>;
};

export const getPayload = () => getPayloadWithServices<AppServices>(configPromise);
```

### 5. Use Services

Import `getPayload` and enjoy full autocompletion.

```typescript
import { getPayload } from '../services';

const payload = await getPayload();

// Collection services (fully typed!)
await payload.services.orders.findMany();
await payload.services.orders.markShipped({ id: '123' });

// Global services (fully typed!)
const settings = await payload.services.settings.findOne();
await payload.services.settings.reset();

// Function call (useful for dynamic slugs)
const slug = 'orders';
await payload.services(slug).findOneById({ id: '123' });
```

## Caching

Services support Next.js `"use cache"` directive for read methods. **Requires** `cacheComponents: true` in `next.config.mjs`.

### Enable Caching (Plugin Mode)

```typescript
// collections/Orders.ts
export const Orders = {
  slug: 'orders' as const,
  // ...
  service: {
    cache: true, // Cache all read methods
  },
} satisfies CollectionConfig;
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

## API Reference

### `servicesPlugin()`

Payload plugin that attaches collection and global services to the payload instance.

### `getPayloadWithServices<TServices>(config)`

Type-safe wrapper around `getPayload()` that includes the `.services` property.

### `createCollectionService(props)` & `createGlobalService(props)`

Low-level factories for creating standalone services relative to the plugin. See "Standalone Services" section (legacy usage).

## License

MIT
